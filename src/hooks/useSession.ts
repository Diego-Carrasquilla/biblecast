'use client'

import { useCallback } from 'react'
import { useBibleCastStore } from '@/store/useBibleCastStore'
import { createSession, validateSessionCode } from '@/features/session/SessionService'
import type { SessionRole } from '@/types/session'

export function useSession() {
  const { session, connectionStatus, setSession, setConnectionStatus } = useBibleCastStore()

  const startSession = useCallback(
    (role: SessionRole) => {
      const newSession = createSession(role)
      setSession(newSession)
      setConnectionStatus('waiting')
      return newSession
    },
    [setSession, setConnectionStatus],
  )

  const joinSession = useCallback(
    (code: string) => {
      if (!validateSessionCode(code)) return null
      const newSession = {
        code: code.toUpperCase(),
        role: 'controller' as SessionRole,
        status: 'connecting' as const,
        createdAt: Date.now(),
      }
      setSession(newSession)
      setConnectionStatus('connecting')
      return newSession
    },
    [setSession, setConnectionStatus],
  )

  const endSession = useCallback(() => {
    setSession(null)
    setConnectionStatus('idle')
  }, [setSession, setConnectionStatus])

  return {
    session,
    connectionStatus,
    startSession,
    joinSession,
    endSession,
  }
}
