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

// Servidores ICE (STUN + TURN). El SECRET KEY de Metered vive solo aquí, en el
// backend, nunca en el frontend. El navegador pide /ice y recibe las
// credenciales TURN ya listas (rotan solas). Si no hay clave configurada,
// devuelve solo STUN (funciona en la misma red).
const METERED_DOMAIN = process.env.METERED_DOMAIN ?? 'biblechat.metered.live'
const METERED_SECRET_KEY = process.env.METERED_SECRET_KEY

const DEFAULT_ICE_SERVERS = [
  { urls: ['stun:stun.l.google.com:19302', 'stun:stun1.l.google.com:19302'] },
]

app.get('/ice', async (_req, res) => {
  // El header CORS lo aplica el middleware global de arriba.
  if (!METERED_SECRET_KEY) {
    console.warn('[ICE] METERED_SECRET_KEY no configurada → solo STUN (sin TURN). El casting entre redes distintas NO funcionará.')
    res.json(DEFAULT_ICE_SERVERS)
    return
  }

  try {
    const response = await fetch(
      `https://${METERED_DOMAIN}/api/v1/turn/credentials?apiKey=${METERED_SECRET_KEY}`,
    )
    const data = await response.json()
    // Metered responde 200 con { error: "Invalid API Key" } cuando la clave o el
    // dominio están mal. No reenviar esa basura al navegador: solo servir la
    // respuesta si es un array de servidores válido; si no, caer a STUN y avisar.
    if (Array.isArray(data) && data.length > 0) {
      res.json(data)
    } else {
      console.error('[ICE] Metered no devolvió servidores TURN válidos:', data, '→ usando solo STUN. Revisa METERED_SECRET_KEY y METERED_DOMAIN.')
      res.json(DEFAULT_ICE_SERVERS)
    }
  } catch (err) {
    console.error('[ICE] No se pudieron obtener credenciales TURN:', err)
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
