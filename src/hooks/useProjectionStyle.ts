'use client'

import { useBibleCastStore } from '@/store/useBibleCastStore'
import type { ProjectionStyle } from '@/types/events'

export function useProjectionStyle() {
  const { projectionStyle, updateProjectionStyle } = useBibleCastStore()

  function resetToDefaults() {
    updateProjectionStyle({
      background: 'solid-navy',
      accentColor: '#fed488',
      fontFamily: 'Playfair Display',
      fontSize: 72,
      textAlign: 'center',
      verticalPosition: 50,
      sanctuaryMargin: 10,
    })
  }

  function getBackgroundColor(bg: ProjectionStyle['background']): string {
    switch (bg) {
      case 'solid-navy': return '#131b2e'
      case 'deep-slate': return '#1e293b'
      case 'atmospheric': return '#0f172a'
    }
  }

  return {
    style: projectionStyle,
    update: updateProjectionStyle,
    reset: resetToDefaults,
    getBackgroundColor,
  }
}
