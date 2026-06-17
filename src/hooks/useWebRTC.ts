'use client'

import { useEffect, useRef, useCallback, useState } from 'react'
import { WebRTCService } from '@/features/connection/WebRTCService'
import { signalingService } from '@/features/connection/SignalingService'
import { useBibleCastStore } from '@/store/useBibleCastStore'
import type { BibleCastEvent } from '@/types/events'
import type { SessionRole } from '@/types/session'

// Cada cuánto el controlador manda PING, y cuánto silencio toleramos antes de
// declarar la conexión muerta (latido perdido ≈ 3 PINGs).
const HEARTBEAT_INTERVAL = 3000
const HEARTBEAT_TIMEOUT = 9000

export function useWebRTC(serverUrl: string) {
  const webrtcRef = useRef<WebRTCService | null>(null)
  const [isReady, setIsReady] = useState(false)
  const { setConnectionStatus, showVerse, hideVerse, updateProjectionStyle } = useBibleCastStore()

  // Estado del heartbeat. lastBeatRef guarda el timestamp del último latido
  // (PING o PONG) recibido; el watchdog lo compara para detectar caídas
  // silenciosas (peer muerto sin que el DataChannel llegue a cerrarse).
  const roleRef = useRef<SessionRole | null>(null)
  const lastBeatRef = useRef<number>(0)
  const pingTimer = useRef<ReturnType<typeof setInterval> | null>(null)
  const watchTimer = useRef<ReturnType<typeof setInterval> | null>(null)

  const stopHeartbeat = useCallback(() => {
    if (pingTimer.current) {
      clearInterval(pingTimer.current)
      pingTimer.current = null
    }
    if (watchTimer.current) {
      clearInterval(watchTimer.current)
      watchTimer.current = null
    }
  }, [])

  const startHeartbeat = useCallback(() => {
    stopHeartbeat()
    lastBeatRef.current = Date.now()
    // Solo el controlador emite PING; la pantalla responde PONG.
    if (roleRef.current === 'controller') {
      pingTimer.current = setInterval(() => {
        console.log('[Connection] Heartbeat sent (PING)')
        webrtcRef.current?.send({ type: 'PING', timestamp: Date.now() })
      }, HEARTBEAT_INTERVAL)
    }
    // Ambos lados vigilan: sin latido en HEARTBEAT_TIMEOUT → desconectado.
    watchTimer.current = setInterval(() => {
      if (Date.now() - lastBeatRef.current > HEARTBEAT_TIMEOUT) {
        console.warn('[Connection] Heartbeat timeout → desconectado')
        setConnectionStatus('disconnected')
        setIsReady(false)
        stopHeartbeat()
      }
    }, 2000)
  }, [stopHeartbeat, setConnectionStatus])

  const handleIncomingMessage = useCallback(
    (event: BibleCastEvent) => {
      // Heartbeat: se procesa aparte para no inundar el log general.
      if (event.type === 'PING') {
        lastBeatRef.current = Date.now()
        webrtcRef.current?.send({ type: 'PONG', timestamp: Date.now() })
        console.log('[Connection] Heartbeat received (PING) → PONG')
        setConnectionStatus('connected')
        return
      }
      if (event.type === 'PONG') {
        lastBeatRef.current = Date.now()
        console.log('[Connection] Heartbeat received (PONG)')
        setConnectionStatus('connected')
        return
      }

      console.log('[Screen] Mensaje recibido:', event.type)
      switch (event.type) {
        case 'SHOW_VERSE':
          if (event.payload?.text && event.payload?.reference) {
            console.log('[Verse] Received', event.payload.reference)
            showVerse({
              book: event.payload.book ?? '',
              chapter: event.payload.chapter ?? 0,
              verse: event.payload.verse ?? 0,
              text: event.payload.text,
              reference: event.payload.reference,
              version: 'RVR1960',
            })
            console.log('[Verse] Applied →', event.payload.reference)
          } else {
            console.warn('[Screen] SHOW_VERSE con payload incompleto:', event.payload)
          }
          break
        case 'HIDE_VERSE':
          hideVerse()
          console.log('[Verse] Applied → oculto')
          break
        case 'UPDATE_STYLE':
          if (event.payload?.style) {
            const prevStyle = useBibleCastStore.getState().projectionStyle
            const s = event.payload.style
            if (prevStyle.fontFamily !== s.fontFamily) console.log('[Font] Received/Applied', s.fontFamily)
            if (prevStyle.accentColor !== s.accentColor) console.log('[Color] Received/Applied', s.accentColor)
            if (prevStyle.background !== s.background) console.log('[Theme] Received/Applied', s.background)
            if (prevStyle.textAlign !== s.textAlign) console.log('[Align] Received/Applied', s.textAlign)
            if (prevStyle.fontSize !== s.fontSize) console.log('[Size] Received/Applied', s.fontSize)
            updateProjectionStyle(s)
            console.log('[Screen] Estado actualizado: projectionStyle')
          }
          break
        case 'CONNECTED':
          console.log('[Connection] Screen connected → confirmación de conexión')
          setConnectionStatus('connected')
          setIsReady(true)
          startHeartbeat()
          break
        case 'DISCONNECTED':
          console.log('[Connection] Disconnected')
          setConnectionStatus('disconnected')
          setIsReady(false)
          stopHeartbeat()
          break
      }
    },
    [showVerse, hideVerse, updateProjectionStyle, setConnectionStatus, startHeartbeat, stopHeartbeat],
  )

  const connect = useCallback(
    (code: string, role: SessionRole) => {
      roleRef.current = role
      const webrtc = new WebRTCService()
      webrtcRef.current = webrtc
      webrtc.onMessage(handleIncomingMessage)

      // Toda la configuración es asíncrona porque primero pedimos los servidores
      // ICE (STUN + TURN) al backend. La conexión peer debe existir antes de que
      // lleguen los eventos de señalización, por eso createConnection va primero.
      void (async () => {
      let iceServers: RTCIceServer[] | undefined
      try {
        // Timeout para que un cold-start de Render (free plan puede tardar ~50s)
        // no deje colgada toda la conexión. Si /ice no responde a tiempo se
        // continúa con los servidores por defecto (solo STUN).
        const ctrl = new AbortController()
        const timeout = setTimeout(() => ctrl.abort(), 5000)
        const res = await fetch(`${serverUrl}/ice`, { signal: ctrl.signal })
        clearTimeout(timeout)
        if (res.ok) {
          const data = await res.json()
          // /ice puede devolver un array de servidores o un objeto { iceServers }.
          // Si la respuesta no es válida (p. ej. un error de Metered), se ignora
          // y se cae a STUN por defecto, sin romper la conexión.
          const list = Array.isArray(data) ? data : data?.iceServers
          if (Array.isArray(list)) iceServers = list
        }
      } catch {
        console.warn('[WebRTC] /ice no disponible → usando solo STUN. El casting entre redes distintas puede fallar.')
      }

      const hasTurn =
        Array.isArray(iceServers) &&
        iceServers.some((s) => {
          const urls = Array.isArray(s.urls) ? s.urls : [s.urls]
          return urls.some(
            (u) => typeof u === 'string' && (u.startsWith('turn:') || u.startsWith('turns:')),
          )
        })
      if (!hasTurn) {
        console.warn('[WebRTC] Sin servidores TURN. Solo conectará si ambos dispositivos están en la misma red local.')
      }

      webrtc.createConnection((candidate) => {
        signalingService.sendIceCandidate(candidate, code)
      }, iceServers)

      signalingService.connect(serverUrl)

      // Ejecuta la acción una vez por conexión: si el socket ya está conectado,
      // ahora mismo; si no, en el evento 'connected'. Así se cubre la primera
      // conexión y las reconexiones sin disparar la acción dos veces.
      const onConnected = (action: () => void) => {
        signalingService.on('connected', action)
        if (signalingService.isConnected) action()
      }

      if (role === 'display') {
        // (Re)crea la sesión en cada (re)conexión del socket. Render puede
        // cortar conexiones inactivas, y su handler de disconnect borra la
        // sesión; al reconectar hay que volver a registrarla.
        onConnected(() => {
          console.log('[Signaling] Creando sesión', code)
          signalingService.createSession(code)
        })

        signalingService.on('session:joined', async () => {
          console.log('[Signaling] Control unido → enviando offer')
          const channel = webrtc.createDataChannel()
          const offer = await webrtc.createOffer()
          signalingService.sendOffer(offer, code)
          void channel
        })
      } else {
        // El control reintenta unirse: la pantalla puede no haber registrado
        // la sesión todavía (arranque en frío de Render) o el servidor haberse
        // reiniciado. Reintenta cada 2 s hasta conectar.
        let joinAttempts = 0
        const join = () => {
          console.log('[Signaling] Uniéndose a la sesión', code)
          signalingService.joinSession(code)
        }
        onConnected(join)
        signalingService.on('session:not-found', () => {
          joinAttempts += 1
          if (joinAttempts > 30) {
            console.warn('[Signaling] Sesión no encontrada tras varios intentos', code)
            return
          }
          console.warn('[Signaling] Sesión no encontrada, reintentando…', code)
          setTimeout(join, 2000)
        })
      }

      signalingService.on('webrtc:offer', async ({ sdp }) => {
        // Ignora offers duplicados: si la conexión ya está negociada (estado
        // 'stable'), procesar otro offer rompería el RTCPeerConnection.
        if (!webrtc.canHandleOffer()) {
          console.warn('[Signaling] Offer duplicado ignorado')
          return
        }
        console.log('[Signaling] Offer recibida → enviando answer')
        try {
          const answer = await webrtc.handleOffer(sdp)
          signalingService.sendAnswer(answer, code)
        } catch (err) {
          console.warn('[Signaling] Error procesando offer', err)
        }
      })

      signalingService.on('webrtc:answer', async ({ sdp }) => {
        console.log('[Signaling] Answer recibida')
        await webrtc.handleAnswer(sdp)
      })

      signalingService.on('webrtc:ice-candidate', async ({ candidate }) => {
        console.log('[Signaling] Candidato remoto recibido')
        try {
          await webrtc.addIceCandidate(candidate)
        } catch (err) {
          console.warn('[Signaling] No se pudo añadir ICE candidate', err)
        }
      })
      })()
    },
    [serverUrl, handleIncomingMessage],
  )

  const sendEvent = useCallback((event: BibleCastEvent) => {
    webrtcRef.current?.send(event)
  }, [])

  const disconnect = useCallback(() => {
    stopHeartbeat()
    webrtcRef.current?.close()
    signalingService.disconnect()
    setConnectionStatus('idle')
    setIsReady(false)
  }, [setConnectionStatus, stopHeartbeat])

  useEffect(() => {
    return () => {
      stopHeartbeat()
      webrtcRef.current?.close()
      signalingService.disconnect()
    }
  }, [stopHeartbeat])

  return { connect, disconnect, sendEvent, isReady }
}
