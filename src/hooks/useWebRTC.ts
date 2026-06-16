'use client'

import { useEffect, useRef, useCallback, useState } from 'react'
import { WebRTCService } from '@/features/connection/WebRTCService'
import { signalingService } from '@/features/connection/SignalingService'
import { useBibleCastStore } from '@/store/useBibleCastStore'
import type { BibleCastEvent } from '@/types/events'
import type { SessionRole } from '@/types/session'

export function useWebRTC(serverUrl: string) {
  const webrtcRef = useRef<WebRTCService | null>(null)
  const [isReady, setIsReady] = useState(false)
  const { setConnectionStatus, showVerse, hideVerse, updateProjectionStyle } = useBibleCastStore()

  const handleIncomingMessage = useCallback(
    (event: BibleCastEvent) => {
      switch (event.type) {
        case 'SHOW_VERSE':
          if (event.payload?.text && event.payload?.reference) {
            showVerse({
              book: event.payload.book ?? '',
              chapter: event.payload.chapter ?? 0,
              verse: event.payload.verse ?? 0,
              text: event.payload.text,
              reference: event.payload.reference,
              version: 'RVR1960',
            })
          }
          break
        case 'HIDE_VERSE':
          hideVerse()
          break
        case 'UPDATE_STYLE':
          if (event.payload?.style) {
            updateProjectionStyle(event.payload.style)
          }
          break
        case 'CONNECTED':
          setConnectionStatus('connected')
          setIsReady(true)
          break
        case 'DISCONNECTED':
          setConnectionStatus('disconnected')
          setIsReady(false)
          break
      }
    },
    [showVerse, hideVerse, updateProjectionStyle, setConnectionStatus],
  )

  const connect = useCallback(
    (code: string, role: SessionRole) => {
      const webrtc = new WebRTCService()
      webrtcRef.current = webrtc

      webrtc.onMessage(handleIncomingMessage)
      signalingService.connect(serverUrl)

      webrtc.createConnection((candidate) => {
        signalingService.sendIceCandidate(candidate, code)
      })

      if (role === 'display') {
        // (Re)crea la sesión en cada (re)conexión del socket. Render puede
        // cortar conexiones inactivas, y su handler de disconnect borra la
        // sesión; al reconectar hay que volver a registrarla.
        const ensureSession = () => {
          console.log('[Signaling] Creando sesión', code)
          signalingService.createSession(code)
        }
        ensureSession()
        signalingService.on('connected', ensureSession)

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
        join()
        signalingService.on('connected', join)
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
        console.log('[Signaling] Offer recibida → enviando answer')
        const answer = await webrtc.handleOffer(sdp)
        signalingService.sendAnswer(answer, code)
      })

      signalingService.on('webrtc:answer', async ({ sdp }) => {
        console.log('[Signaling] Answer recibida')
        await webrtc.handleAnswer(sdp)
      })

      signalingService.on('webrtc:ice-candidate', async ({ candidate }) => {
        try {
          await webrtc.addIceCandidate(candidate)
        } catch (err) {
          console.warn('[Signaling] No se pudo añadir ICE candidate', err)
        }
      })
    },
    [serverUrl, handleIncomingMessage],
  )

  const sendEvent = useCallback((event: BibleCastEvent) => {
    webrtcRef.current?.send(event)
  }, [])

  const disconnect = useCallback(() => {
    webrtcRef.current?.close()
    signalingService.disconnect()
    setConnectionStatus('idle')
    setIsReady(false)
  }, [setConnectionStatus])

  useEffect(() => {
    return () => {
      webrtcRef.current?.close()
      signalingService.disconnect()
    }
  }, [])

  return { connect, disconnect, sendEvent, isReady }
}
