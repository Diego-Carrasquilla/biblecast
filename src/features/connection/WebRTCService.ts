import type { BibleCastEvent } from '@/types/events'

type MessageHandler = (event: BibleCastEvent) => void

/**
 * Construye la lista de servidores ICE. Siempre incluye STUN (suficiente cuando
 * ambos dispositivos están en la misma red), y añade un TURN como relevo para
 * cuando pantalla y control están en redes distintas (datos móviles, NAT
 * restrictivo). El TURN se puede sobreescribir con variables de entorno.
 */
function buildIceServers(): RTCIceServer[] {
  const servers: RTCIceServer[] = [
    { urls: ['stun:stun.l.google.com:19302', 'stun:stun1.l.google.com:19302'] },
  ]

  const turnUrl = process.env.NEXT_PUBLIC_TURN_URL
  const turnUser = process.env.NEXT_PUBLIC_TURN_USERNAME
  const turnCred = process.env.NEXT_PUBLIC_TURN_CREDENTIAL

  if (turnUrl && turnUser && turnCred) {
    servers.push({ urls: turnUrl.split(','), username: turnUser, credential: turnCred })
  } else {
    // TURN público gratuito de Open Relay (Metered) como valor por defecto.
    servers.push({
      urls: [
        'turn:openrelay.metered.ca:80',
        'turn:openrelay.metered.ca:443',
        'turn:openrelay.metered.ca:443?transport=tcp',
      ],
      username: 'openrelayproject',
      credential: 'openrelayproject',
    })
  }

  return servers
}

export class WebRTCService {
  private peerConnection: RTCPeerConnection | null = null
  private dataChannel: RTCDataChannel | null = null
  private messageHandlers = new Set<MessageHandler>()
  private onIceCandidate: ((candidate: RTCIceCandidateInit) => void) | null = null

  constructor() {
    this.handleMessage = this.handleMessage.bind(this)
  }

  createConnection(onIceCandidate: (candidate: RTCIceCandidateInit) => void): RTCPeerConnection {
    this.onIceCandidate = onIceCandidate

    this.peerConnection = new RTCPeerConnection({
      iceServers: buildIceServers(),
    })

    this.peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        this.onIceCandidate?.(event.candidate.toJSON())
      }
    }

    this.peerConnection.ondatachannel = (event) => {
      console.log('[WebRTC] Canal de datos recibido')
      this.setupDataChannel(event.channel)
    }

    this.peerConnection.oniceconnectionstatechange = () => {
      console.log('[WebRTC] ICE:', this.peerConnection?.iceConnectionState)
    }

    this.peerConnection.onconnectionstatechange = () => {
      const state = this.peerConnection?.connectionState
      console.log('[WebRTC] Conexión:', state)
      if (state === 'failed') {
        this.handleMessage({ type: 'DISCONNECTED', timestamp: Date.now() })
      }
    }

    return this.peerConnection
  }

  createDataChannel(label = 'biblecast'): RTCDataChannel {
    if (!this.peerConnection) throw new Error('No peer connection')

    const channel = this.peerConnection.createDataChannel(label, {
      ordered: true,
    })

    this.setupDataChannel(channel)
    return channel
  }

  private setupDataChannel(channel: RTCDataChannel): void {
    this.dataChannel = channel

    channel.onopen = () => {
      this.handleMessage({
        type: 'CONNECTED',
        timestamp: Date.now(),
      } satisfies BibleCastEvent)
    }

    channel.onclose = () => {
      this.handleMessage({
        type: 'DISCONNECTED',
        timestamp: Date.now(),
      } satisfies BibleCastEvent)
    }

    channel.onmessage = (event) => {
      try {
        const parsed: BibleCastEvent = JSON.parse(event.data)
        this.handleMessage(parsed)
      } catch {
        // ignore malformed messages
      }
    }
  }

  private handleMessage(event: BibleCastEvent): void {
    this.messageHandlers.forEach((handler) => handler(event))
  }

  async createOffer(): Promise<RTCSessionDescriptionInit> {
    if (!this.peerConnection) throw new Error('No peer connection')

    const offer = await this.peerConnection.createOffer()
    await this.peerConnection.setLocalDescription(offer)
    return offer
  }

  /** True solo si aún no se ha procesado ningún offer (evita duplicados). */
  canHandleOffer(): boolean {
    return !!this.peerConnection && this.peerConnection.remoteDescription === null
  }

  async handleOffer(offer: RTCSessionDescriptionInit): Promise<RTCSessionDescriptionInit> {
    if (!this.peerConnection) throw new Error('No peer connection')

    await this.peerConnection.setRemoteDescription(new RTCSessionDescription(offer))
    const answer = await this.peerConnection.createAnswer()
    await this.peerConnection.setLocalDescription(answer)
    return answer
  }

  async handleAnswer(answer: RTCSessionDescriptionInit): Promise<void> {
    if (!this.peerConnection) throw new Error('No peer connection')
    await this.peerConnection.setRemoteDescription(new RTCSessionDescription(answer))
  }

  async addIceCandidate(candidate: RTCIceCandidateInit): Promise<void> {
    if (!this.peerConnection) throw new Error('No peer connection')
    await this.peerConnection.addIceCandidate(new RTCIceCandidate(candidate))
  }

  send(event: BibleCastEvent): void {
    if (this.dataChannel?.readyState === 'open') {
      this.dataChannel.send(JSON.stringify(event))
    }
  }

  onMessage(handler: MessageHandler): () => void {
    this.messageHandlers.add(handler)
    return () => this.messageHandlers.delete(handler)
  }

  close(): void {
    this.dataChannel?.close()
    this.peerConnection?.close()
    this.dataChannel = null
    this.peerConnection = null
    this.messageHandlers.clear()
  }

  get isConnected(): boolean {
    return this.dataChannel?.readyState === 'open'
  }
}
