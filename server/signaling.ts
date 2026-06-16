import express from 'express'
import { createServer } from 'http'
import { Server } from 'socket.io'

const app = express()
const httpServer = createServer(app)

// Endpoint de salud para el health check de Render
app.get('/', (_req, res) => {
  res.status(200).json({ status: 'ok', service: 'biblecast-signaling' })
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
