import type { Session, SessionRole } from '@/types/session'

const CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
const CODE_LENGTH = 5

export function generateSessionCode(): string {
  let code = ''
  for (let i = 0; i < CODE_LENGTH; i++) {
    code += CHARS[Math.floor(Math.random() * CHARS.length)]
  }
  return code
}

export function validateSessionCode(code: string): boolean {
  if (code.length !== CODE_LENGTH) return false
  return /^[A-Z2-9]{5}$/.test(code)
}

export function createSession(role: SessionRole): Session {
  return {
    code: generateSessionCode(),
    role,
    status: 'waiting',
    createdAt: Date.now(),
  }
}

export function formatSessionCode(code: string): string {
  return code.toUpperCase().replace(/[^A-Z2-9]/g, '').slice(0, CODE_LENGTH)
}
