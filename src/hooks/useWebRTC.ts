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
        signalingService.createSession(code)

        signalingService.on('session:joined', async () => {
          const channel = webrtc.createDataChannel()
          const offer = await webrtc.createOffer()
          signalingService.sendOffer(offer, code)
          void channel
        })
      } else {
        signalingService.joinSession(code)
      }

      signalingService.on('webrtc:offer', async ({ sdp }) => {
        const answer = await webrtc.handleOffer(sdp)
        signalingService.sendAnswer(answer, code)
      })

      signalingService.on('webrtc:answer', async ({ sdp }) => {
        await webrtc.handleAnswer(sdp)
      })

      signalingService.on('webrtc:ice-candidate', async ({ candidate }) => {
        await webrtc.addIceCandidate(candidate)
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
