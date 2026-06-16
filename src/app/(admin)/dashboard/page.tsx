'use client'

import { useEffect } from 'react'
import { SermonPlaylist } from '@/components/dashboard/SermonPlaylist'
import { LiveOutputPreview } from '@/components/dashboard/LiveOutputPreview'
import { useBibleCastStore, SAMPLE_PLAYLIST } from '@/store/useBibleCastStore'

export default function DashboardPage() {
  const {
    playlist,
    currentIndex,
    currentVerse,
    setCurrentIndex,
    nextVerse,
    previousVerse,
    addToPlaylist,
    showVerse,
  } = useBibleCastStore()

  useEffect(() => {
    if (playlist.length === 0) {
      SAMPLE_PLAYLIST.forEach((v) => addToPlaylist(v))
      showVerse(SAMPLE_PLAYLIST[0])
    }
  }, [playlist.length, addToPlaylist, showVerse])

  function handleSelectItem(index: number) {
    setCurrentIndex(index)
  }

  return (
    <div className="grid grid-cols-12 gap-lg h-[calc(100vh-73px)]">
      <div className="col-span-4">
        <SermonPlaylist
          playlist={playlist}
          currentIndex={currentIndex}
          onSelectItem={handleSelectItem}
        />
      </div>
      <div className="col-span-8">
        <LiveOutputPreview
          currentVerse={currentVerse}
          playlist={playlist}
          currentIndex={currentIndex}
          onPrevious={previousVerse}
          onNext={nextVerse}
        />
      </div>
    </div>
  )
}
