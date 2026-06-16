import { io, type Socket } from 'socket.io-client'

type SignalingEventMap = {
  'connected': (data: Record<string, never>) => void
  'disconnected': (data: Record<string, never>) => void
  'session:created': (data: { code: string }) => void
  'session:joined': (data: { code: string }) => void
  'session:not-found': (data: { code: string }) => void
  'session:connected': (data: { message: string }) => void
  'webrtc:offer': (data: { sdp: RTCSessionDescriptionInit; from: string }) => void
  'webrtc:answer': (data: { sdp: RTCSessionDescriptionInit; from: string }) => void
  'webrtc:ice-candidate': (data: { candidate: RTCIceCandidateInit; from: string }) => void
}

export class SignalingService {
  private socket: Socket | null = null
  private listeners = new Map<string, Set<(...args: unknown[]) => void>>()

  connect(serverUrl: string): void {
    if (this.socket?.connected) return

    this.socket = io(serverUrl, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    })

    this.socket.on('connect', () => {
      this.emit('connected', {})
    })

    this.socket.on('disconnect', () => {
      this.emit('disconnected', {})
    })

    const events: (keyof SignalingEventMap)[] = [
      'session:created',
      'session:joined',
      'session:not-found',
      'session:connected',
      'webrtc:offer',
      'webrtc:answer',
      'webrtc:ice-candidate',
    ]

    events.forEach((event) => {
      this.socket?.on(event, (data: unknown) => {
        this.emit(event, data)
      })
    })
  }

  disconnect(): void {
    this.socket?.disconnect()
    this.socket = null
  }

  createSession(code: string): void {
    this.socket?.emit('display:create-session', { code })
  }

  joinSession(code: string): void {
    this.socket?.emit('controller:join-session', { code })
  }

  sendOffer(sdp: RTCSessionDescriptionInit, targetId: string): void {
    this.socket?.emit('webrtc:offer', { sdp, targetId })
  }

  sendAnswer(sdp: RTCSessionDescriptionInit, targetId: string): void {
    this.socket?.emit('webrtc:answer', { sdp, targetId })
  }

  sendIceCandidate(candidate: RTCIceCandidateInit, targetId: string): void {
    this.socket?.emit('webrtc:ice-candidate', { candidate, targetId })
  }

  on<K extends keyof SignalingEventMap>(event: K, handler: SignalingEventMap[K]): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set())
    }
    this.listeners.get(event)!.add(handler as (...args: unknown[]) => void)
  }

  off<K extends keyof SignalingEventMap>(event: K, handler: SignalingEventMap[K]): void {
    this.listeners.get(event)?.delete(handler as (...args: unknown[]) => void)
  }

  private emit(event: string, data: unknown): void {
    this.listeners.get(event)?.forEach((handler) => handler(data))
  }

  get isConnected(): boolean {
    return this.socket?.connected ?? false
  }

  get socketId(): string | undefined {
    return this.socket?.id
  }
}

export const signalingService = new SignalingService()
