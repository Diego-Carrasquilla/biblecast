import { create } from 'zustand'
import type { BibleVerse } from '@/types/bible'
import type { ProjectionStyle } from '@/types/events'
import type { Session, ConnectionStatus } from '@/types/session'

export interface HistoryEntry {
  verse: BibleVerse
  at: number
}

export interface Toast {
  id: number
  text: string
  type: 'success' | 'error' | 'info'
}

interface BibleCastState {
  session: Session | null
  connectionStatus: ConnectionStatus

  playlist: BibleVerse[]
  currentIndex: number

  currentVerse: BibleVerse | null
  isLive: boolean
  projectionStyle: ProjectionStyle

  history: HistoryEntry[]
  toast: Toast | null

  setSession: (session: Session | null) => void
  setConnectionStatus: (status: ConnectionStatus) => void
  addToPlaylist: (verse: BibleVerse) => boolean
  removeFromPlaylist: (index: number) => void
  setCurrentIndex: (index: number) => void
  nextVerse: () => void
  previousVerse: () => void
  showVerse: (verse: BibleVerse) => void
  hideVerse: () => void
  updateProjectionStyle: (style: Partial<ProjectionStyle>) => void
  toggleLive: () => void
  clearPlaylist: () => void
  clearHistory: () => void
  showToast: (text: string, type?: Toast['type']) => void
  dismissToast: () => void
}

const DEFAULT_STYLE: ProjectionStyle = {
  background: 'solid-navy',
  accentColor: '#fed488',
  // Variable CSS de next/font (no el nombre literal): se aplica siempre.
  fontFamily: 'var(--font-playfair), serif',
  fontSize: 72,
  textAlign: 'center',
  verticalPosition: 50,
  sanctuaryMargin: 10,
}

let toastSeq = 0

export const useBibleCastStore = create<BibleCastState>((set, get) => ({
  session: null,
  connectionStatus: 'idle',
  playlist: [],
  currentIndex: 0,
  currentVerse: null,
  isLive: false,
  projectionStyle: DEFAULT_STYLE,
  history: [],
  toast: null,

  setSession: (session) => set({ session }),
  setConnectionStatus: (status) => set({ connectionStatus: status }),

  addToPlaylist: (verse) => {
    const { playlist } = get()
    if (playlist.some((v) => v.reference === verse.reference)) return false
    set({ playlist: [...playlist, verse] })
    return true
  },

  removeFromPlaylist: (index) =>
    set((state) => ({
      playlist: state.playlist.filter((_, i) => i !== index),
      currentIndex:
        state.currentIndex >= index && state.currentIndex > 0
          ? state.currentIndex - 1
          : state.currentIndex,
    })),

  setCurrentIndex: (index) => {
    const { playlist } = get()
    if (index >= 0 && index < playlist.length) {
      set({ currentIndex: index, currentVerse: playlist[index] })
    }
  },

  nextVerse: () => {
    const { playlist, currentIndex } = get()
    if (currentIndex < playlist.length - 1) {
      set({
        currentIndex: currentIndex + 1,
        currentVerse: playlist[currentIndex + 1],
      })
    }
  },

  previousVerse: () => {
    const { currentIndex, playlist } = get()
    if (currentIndex > 0) {
      set({
        currentIndex: currentIndex - 1,
        currentVerse: playlist[currentIndex - 1],
      })
    }
  },

  showVerse: (verse) =>
    set((state) => {
      const last = state.history[0]
      const isDup = last && last.verse.reference === verse.reference
      return {
        currentVerse: verse,
        history: isDup
          ? state.history
          : [{ verse, at: Date.now() }, ...state.history].slice(0, 100),
      }
    }),
  hideVerse: () => set({ currentVerse: null }),

  updateProjectionStyle: (style) =>
    set((state) => ({
      projectionStyle: { ...state.projectionStyle, ...style },
    })),

  toggleLive: () => set((state) => ({ isLive: !state.isLive })),
  clearPlaylist: () =>
    set({ playlist: [], currentIndex: 0, currentVerse: null }),
  clearHistory: () => set({ history: [] }),

  showToast: (text, type = 'success') => {
    const id = ++toastSeq
    set({ toast: { id, text, type } })
    setTimeout(() => {
      if (get().toast?.id === id) set({ toast: null })
    }, 3000)
  },
  dismissToast: () => set({ toast: null }),
}))

export const SAMPLE_PLAYLIST: BibleVerse[] = [
  {
    book: 'Salmos',
    chapter: 23,
    verse: 1,
    text: 'El Señor es mi pastor; nada me faltará.',
    reference: 'Salmo 23:1-3',
    version: 'RVR1960',
  },
  {
    book: 'Juan',
    chapter: 10,
    verse: 11,
    text: 'Yo soy el buen pastor; el buen pastor su vida da por las ovejas.',
    reference: 'Juan 10:11',
    version: 'RVR1960',
  },
  {
    book: '1 Pedro',
    chapter: 5,
    verse: 4,
    text: 'Y cuando aparezca el Príncipe de los pastores, vosotros recibiréis la corona incorruptible de gloria.',
    reference: '1 Pedro 5:4',
    version: 'RVR1960',
  },
]
