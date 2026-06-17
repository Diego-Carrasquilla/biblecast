import express from 'express'
import { createServer } from 'http'
import { Server } from 'socket.io'

const app = express()
const httpServer = createServer(app)

// CORS global para TODAS las rutas HTTP (no solo /ice). Antes el header vivía
// inline dentro de /ice, así que cualquier respuesta que no entrara exactamente
// en ese handler (404 por deploy viejo, página de error de Render en cold-start)
// salía SIN Access-Control-Allow-Origin y el navegador la bloqueaba. Con un
// middleware el header se aplica siempre, incluido el preflight OPTIONS.
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.header('Access-Control-Allow-Headers', 'Content-Type')
  if (req.method === 'OPTIONS') {
    res.sendStatus(204)
    return
  }
  next()
})

// Endpoint de salud para el health check de Render
app.get('/', (_req, res) => {
  res.status(200).json({ status: 'ok', service: 'biblecast-signaling' })
})

// Servidores ICE (STUN + TURN). Las credenciales TURN se piden a Cloudflare
// (servicio gratuito, sin tarjeta). El token de Cloudflare vive solo aquí, en
// el backend, nunca en el frontend. El navegador pide /ice y recibe las
// credenciales TURN ya listas (rotan solas, TTL de 24 h). Si no hay token
// configurado, devuelve solo STUN (funciona en la misma red local).
const CF_TURN_KEY_ID = process.env.CLOUDFLARE_TURN_KEY_ID
const CF_TURN_API_TOKEN = process.env.CLOUDFLARE_TURN_API_TOKEN

const DEFAULT_ICE_SERVERS = [
  { urls: ['stun:stun.l.google.com:19302', 'stun:stun1.l.google.com:19302'] },
]

app.get('/ice', async (_req, res) => {
  // El header CORS lo aplica el middleware global de arriba.
  if (!CF_TURN_KEY_ID || !CF_TURN_API_TOKEN) {
    console.warn('[ICE] Cloudflare TURN no configurado (CLOUDFLARE_TURN_KEY_ID / CLOUDFLARE_TURN_API_TOKEN) → solo STUN. El casting entre redes distintas NO funcionará.')
    res.json(DEFAULT_ICE_SERVERS)
    return
  }

  try {
    const response = await fetch(
      `https://rtc.live.cloudflare.com/v1/turn/keys/${CF_TURN_KEY_ID}/credentials/generate-ice-servers`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${CF_TURN_API_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ttl: 86400 }),
      },
    )
    const data = await response.json()
    // Cloudflare responde 201 con { iceServers: [...] } (ya es un array STUN+TURN).
    // Solo reenviar al navegador si la respuesta es válida; si no, caer a STUN.
    if (response.ok && Array.isArray(data?.iceServers) && data.iceServers.length > 0) {
      res.json(data.iceServers)
    } else {
      console.error('[ICE] Cloudflare no devolvió servidores TURN válidos:', data, '→ usando solo STUN. Revisa CLOUDFLARE_TURN_KEY_ID y CLOUDFLARE_TURN_API_TOKEN.')
      res.json(DEFAULT_ICE_SERVERS)
    }
  } catch (err) {
    console.error('[ICE] No se pudieron obtener credenciales TURN de Cloudflare:', err)
    res.json(DEFAULT_ICE_SERVERS)
  }
})

const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL ?? 'http://localhost:3000',
    methods: ['GET', 'POST'],
  },
})

interface Session {
  code: string
  displaySocketId: string
  controllerSocketId?: string
  createdAt: number
}

const sessions = new Map<string, Session>()

io.on('connection', (socket) => {
  console.log(`[Conectado] ${socket.id}`)

  socket.on('display:create-session', ({ code }: { code: string }) => {
    const session: Session = {
      code,
      displaySocketId: socket.id,
      createdAt: Date.now(),
    }
    sessions.set(code, session)
    socket.join(code)
    socket.emit('session:created', { code })
    console.log(`[Sesión creada] ${code} por ${socket.id}`)
  })

  socket.on('controller:join-session', ({ code }: { code: string }) => {
    const session = sessions.get(code)
    if (!session) {
      socket.emit('session:not-found', { code })
      return
    }

    session.controllerSocketId = socket.id
    socket.join(code)

    io.to(code).emit('session:connected', {
      message: 'Controlador conectado',
    })

    io.to(session.displaySocketId).emit('session:joined', {
      code,
      controllerId: socket.id,
    })

    console.log(`[Controlador unido] ${code} — ${socket.id}`)
  })

  socket.on('webrtc:offer', ({ sdp, targetId }: { sdp: RTCSessionDescriptionInit; targetId: string }) => {
    const session = sessions.get(targetId)
    if (session?.controllerSocketId) {
      io.to(session.controllerSocketId).emit('webrtc:offer', {
        sdp,
        from: socket.id,
      })
    }
  })

  socket.on('webrtc:answer', ({ sdp, targetId }: { sdp: RTCSessionDescriptionInit; targetId: string }) => {
    const session = sessions.get(targetId)
    if (session) {
      io.to(session.displaySocketId).emit('webrtc:answer', {
        sdp,
        from: socket.id,
      })
    }
  })

  socket.on('webrtc:ice-candidate', ({ candidate, targetId }: { candidate: RTCIceCandidateInit; targetId: string }) => {
    const session = sessions.get(targetId)
    if (session) {
      const target = socket.id === session.displaySocketId
        ? session.controllerSocketId
        : session.displaySocketId
      if (target) {
        io.to(target).emit('webrtc:ice-candidate', {
          candidate,
          from: socket.id,
        })
      }
    }
  })

  socket.on('disconnect', () => {
    for (const [code, session] of sessions.entries()) {
      if (session.displaySocketId === socket.id) {
        io.to(code).emit('session:disconnected', { reason: 'Pantalla desconectada' })
        sessions.delete(code)
        console.log(`[Sesión eliminada] ${code}`)
      } else if (session.controllerSocketId === socket.id) {
        session.controllerSocketId = undefined
        io.to(code).emit('session:disconnected', { reason: 'Controlador desconectado' })
        console.log(`[Controlador desconectado] ${code}`)
      }
    }
  })
})

// Limpieza de sesiones expiradas (>2 horas)
setInterval(() => {
  const now = Date.now()
  for (const [code, session] of sessions.entries()) {
    if (now - session.createdAt > 2 * 60 * 60 * 1000) {
      sessions.delete(code)
      console.log(`[Sesión expirada] ${code}`)
    }
  }
}, 60 * 1000)

const PORT = parseInt(process.env.PORT ?? '3001', 10)

httpServer.listen(PORT, () => {
  console.log(`[BibleCast Signaling] Puerto ${PORT}`)
})
