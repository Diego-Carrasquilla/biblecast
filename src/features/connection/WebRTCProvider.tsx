'use client'

import { createContext, useContext, useRef, useState, useEffect, useCallback } from 'react'
import { useWebRTC } from '@/hooks/useWebRTC'
import { useBibleCastStore } from '@/store/useBibleCastStore'
import type { BibleVerse } from '@/types/bible'
import type { BibleCastEvent, ProjectionStyle } from '@/types/events'
import type { SessionRole } from '@/types/session'

const SIGNALING_URL = process.env.NEXT_PUBLIC_SIGNALING_URL ?? 'http://localhost:3001'

function showVerseEvent(verse: BibleVerse): BibleCastEvent {
  return {
    type: 'SHOW_VERSE',
    payload: {
      book: verse.book,
      chapter: verse.chapter,
      verse: verse.verse,
      text: verse.text,
      reference: verse.reference,
    },
    timestamp: Date.now(),
  }
}

function updateStyleEvent(style: ProjectionStyle): BibleCastEvent {
  return { type: 'UPDATE_STYLE', payload: { style }, timestamp: Date.now() }
}

type WebRTCContextValue = ReturnType<typeof useWebRTC> & {
  /**
   * Conecta una sola vez por sesión (code + role). Es idempotente: si ya hay
   * una conexión activa para esa sesión, no hace nada. Pensado para llamarse
   * desde el useEffect de cada página sin que un remount (al navegar de vuelta)
   * vuelva a abrir otra conexión.
   */
  ensureConnected: (code: string, role: SessionRole) => void
}

const WebRTCContext = createContext<WebRTCContextValue | null>(null)

/**
 * Provee la conexión WebRTC a TODA la app desde el layout raíz. Al vivir aquí
 * (y no en una página), la conexión sobrevive a la navegación entre rutas
 * —p. ej. del control al panel de administración— sin desconectarse. Solo se
 * cierra cuando se cierra la pestaña (desmontaje del layout raíz) o si se llama
 * explícitamente a disconnect().
 */
export function WebRTCProvider({ children }: { children: React.ReactNode }) {
  const webrtc = useWebRTC(SIGNALING_URL)
  const { connect, sendEvent, isReady } = webrtc
  const startedRef = useRef<string | null>(null)
  const [role, setRole] = useState<SessionRole | null>(null)

  const ensureConnected = useCallback(
    (code: string, r: SessionRole) => {
      const key = `${r}:${code}`
      if (startedRef.current === key) return
      startedRef.current = key
      setRole(r)
      connect(code, r)
    },
    [connect],
  )

  // Difusor de estado → pantalla. SOLO el lado controlador publica los cambios
  // del store por el DataChannel. La pantalla solo recibe (no reemite), así que
  // no hay ecos ni bucles. Cubre proyectar versículo, navegar la lista y todos
  // los ajustes de estilo: cualquier cosa que cambie currentVerse o
  // projectionStyle se sincroniza automáticamente.
  useEffect(() => {
    if (role !== 'controller') return
    const unsub = useBibleCastStore.subscribe((state, prev) => {
      if (state.currentVerse !== prev.currentVerse) {
        if (state.currentVerse) {
          console.log('[Broadcast] currentVerse → SHOW_VERSE', state.currentVerse.reference)
          sendEvent(showVerseEvent(state.currentVerse))
        } else {
          console.log('[Broadcast] currentVerse vacío → HIDE_VERSE')
          sendEvent({ type: 'HIDE_VERSE', timestamp: Date.now() })
        }
      }
      if (state.projectionStyle !== prev.projectionStyle) {
        console.log('[Broadcast] projectionStyle → UPDATE_STYLE', state.projectionStyle)
        sendEvent(updateStyleEvent(state.projectionStyle))
      }
    })
    return unsub
  }, [role, sendEvent])

  // Handshake de sincronización inicial: en cuanto el canal abre, empuja el
  // estado actual completo (estilo + versículo) para que una pantalla recién
  // conectada quede al día, aunque los cambios se hayan hecho antes de conectar.
  useEffect(() => {
    if (role !== 'controller' || !isReady) return
    const { currentVerse, projectionStyle } = useBibleCastStore.getState()
    console.log('[Broadcast] Canal abierto → sincronización inicial de estado')
    sendEvent(updateStyleEvent(projectionStyle))
    if (currentVerse) sendEvent(showVerseEvent(currentVerse))
  }, [role, isReady, sendEvent])

  return (
    <WebRTCContext.Provider value={{ ...webrtc, ensureConnected }}>
      {children}
    </WebRTCContext.Provider>
  )
}

export function useWebRTCConnection(): WebRTCContextValue {
  const ctx = useContext(WebRTCContext)
  if (!ctx) {
    throw new Error('useWebRTCConnection debe usarse dentro de <WebRTCProvider>')
  }
  return ctx
}
