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

  // TURN opcional vía variables de entorno. Necesario para conectar cuando
  // pantalla y control están en redes distintas o con NAT restrictivo. Obtén
  // credenciales gratuitas (p. ej. metered.ca) y configúralas en Vercel.
  const turnUrl = process.env.NEXT_PUBLIC_TURN_URL
  const turnUser = process.env.NEXT_PUBLIC_TURN_USERNAME
  const turnCred = process.env.NEXT_PUBLIC_TURN_CREDENTIAL

  if (turnUrl && turnUser && turnCred) {
    servers.push({ urls: turnUrl.split(','), username: turnUser, credential: turnCred })
  }

  return servers
}

export class WebRTCService {
  private peerConnection: RTCPeerConnection | null = null
  private dataChannel: RTCDataChannel | null = null
  private messageHandlers = new Set<MessageHandler>()
  private onIceCandidate: ((candidate: RTCIceCandidateInit) => void) | null = null
  // Candidatos ICE que llegan antes de fijar la descripción remota; se aplican
  // en cuanto esté lista (flushPendingCandidates).
  private pendingCandidates: RTCIceCandidateInit[] = []

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
        console.log('[WebRTC] Candidato local →', event.candidate.type)
        this.onIceCandidate?.(event.candidate.toJSON())
      } else {
        console.log('[WebRTC] Recolección de candidatos completa')
      }
    }

    this.peerConnection.onicegatheringstatechange = () => {
      console.log('[WebRTC] ICE gathering:', this.peerConnection?.iceGatheringState)
    }

    this.peerConnection.onicecandidateerror = (event) => {
      const e = event as RTCPeerConnectionIceErrorEvent
      console.warn('[WebRTC] Error de candidato ICE:', e.errorCode, e.errorText, e.url)
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
    await this.flushPendingCandidates()
    const answer = await this.peerConnection.createAnswer()
    await this.peerConnection.setLocalDescription(answer)
    return answer
  }

  async handleAnswer(answer: RTCSessionDescriptionInit): Promise<void> {
    if (!this.peerConnection) throw new Error('No peer connection')
    await this.peerConnection.setRemoteDescription(new RTCSessionDescription(answer))
    await this.flushPendingCandidates()
  }

  async addIceCandidate(candidate: RTCIceCandidateInit): Promise<void> {
    if (!this.peerConnection) throw new Error('No peer connection')
    // Si la descripción remota aún no está fijada, encola el candidato.
    if (!this.peerConnection.remoteDescription) {
      this.pendingCandidates.push(candidate)
      return
    }
    await this.peerConnection.addIceCandidate(new RTCIceCandidate(candidate))
  }

  private async flushPendingCandidates(): Promise<void> {
    if (!this.peerConnection || this.pendingCandidates.length === 0) return
    console.log('[WebRTC] Aplicando', this.pendingCandidates.length, 'candidatos en cola')
    const queued = this.pendingCandidates
    this.pendingCandidates = []
    for (const candidate of queued) {
      try {
        await this.peerConnection.addIceCandidate(new RTCIceCandidate(candidate))
      } catch (err) {
        console.warn('[WebRTC] Candidato en cola falló', err)
      }
    }
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
    this.pendingCandidates = []
    this.messageHandlers.clear()
  }

  get isConnected(): boolean {
    return this.dataChannel?.readyState === 'open'
  }
}
