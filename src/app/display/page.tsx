'use client'

import { ProjectionCanvas } from '@/components/display/ProjectionCanvas'
import { useBibleCastStore } from '@/store/useBibleCastStore'

export default function DisplayPage() {
  const currentVerse = useBibleCastStore((s) => s.currentVerse)

  return (
    <ProjectionCanvas
      text={currentVerse?.text ?? 'Porque tanto amó Dios al mundo, que dio a su Hijo unigénito, para que todo el que cree en él no se pierda, sino que tenga vida eterna.'}
      reference={currentVerse?.reference ?? 'Juan 3:16'}
    />
  )
}
