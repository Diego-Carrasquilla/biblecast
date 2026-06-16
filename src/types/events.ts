export type BibleCastEventType =
  | 'SHOW_VERSE'
  | 'NEXT_VERSE'
  | 'PREVIOUS_VERSE'
  | 'HIDE_VERSE'
  | 'UPDATE_STYLE'
  | 'CONNECTED'
  | 'DISCONNECTED'

export interface BibleCastEvent {
  type: BibleCastEventType
  payload?: {
    reference?: string
    book?: string
    chapter?: number
    verse?: number
    text?: string
    style?: ProjectionStyle
  }
  timestamp: number
}

export interface ProjectionStyle {
  background: 'solid-navy' | 'deep-slate' | 'atmospheric'
  accentColor: string
  fontFamily: string
  fontSize: number
  textAlign: 'left' | 'center' | 'justify'
  verticalPosition: number
  sanctuaryMargin: number
}
