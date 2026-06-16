export type SessionRole = 'display' | 'controller'

export type ConnectionStatus = 'idle' | 'waiting' | 'connecting' | 'connected' | 'disconnected'

export interface Session {
  code: string
  role: SessionRole
  status: ConnectionStatus
  createdAt: number
}
