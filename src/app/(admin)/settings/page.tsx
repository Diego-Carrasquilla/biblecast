'use client'

import { VisualAtmosphere } from '@/components/settings/VisualAtmosphere'
import { TypographyControls } from '@/components/settings/TypographyControls'
import { ProjectionPreview } from '@/components/settings/ProjectionPreview'
import { Slider } from '@/components/ui/Slider'
import { Toggle } from '@/components/ui/Toggle'
import { Button } from '@/components/ui/Button'
import { useBibleCastStore } from '@/store/useBibleCastStore'
import { useState } from 'react'
import type { ProjectionStyle } from '@/types/events'

const DEFAULT_STYLE: ProjectionStyle = {
  background: 'solid-navy',
  accentColor: '#fed488',
  fontFamily: 'Playfair Display',
  fontSize: 72,
  textAlign: 'center',
  verticalPosition: 50,
  sanctuaryMargin: 10,
}

export default function SettingsPage() {
  const { projectionStyle, updateProjectionStyle } = useBibleCastStore()
  const [localStyle, setLocalStyle] = useState<ProjectionStyle>(projectionStyle)
  const [showGrid, setShowGrid] = useState(false)

  function handleChange(updates: Partial<ProjectionStyle>) {
    setLocalStyle((prev) => ({ ...prev, ...updates }))
  }

  function handleApply() {
    updateProjectionStyle(localStyle)
  }

  function handleReset() {
    setLocalStyle(DEFAULT_STYLE)
  }

  return (
    <div>
      <div className="mb-lg">
        <h1 className="font-body text-headline-md font-semibold text-on-surface">
          Ajustes de Proyección
        </h1>
        <p className="font-body text-body-md text-on-surface-variant mt-xs">
          Configura la experiencia visual de tu santuario
        </p>
      </div>

      <div className="grid grid-cols-12 gap-lg">
        <div className="col-span-5 space-y-md">
          <VisualAtmosphere style={localStyle} onChange={handleChange} />
          <TypographyControls style={localStyle} onChange={handleChange} />
        </div>

        <div className="col-span-7 space-y-md">
          <ProjectionPreview style={localStyle} />

          <section className="bg-surface-container-lowest border border-outline-variant rounded-xl p-lg">
            <div className="flex items-center justify-between mb-lg">
              <h2 className="font-body text-body-lg font-semibold text-on-surface">
                Área Segura y Posición
              </h2>
              <Toggle label="Cuadrícula" checked={showGrid} onChange={setShowGrid} />
            </div>

            <div className="grid grid-cols-2 gap-lg">
              <Slider
                label="Posición Vertical"
                value={localStyle.verticalPosition}
                min={0}
                max={100}
                onChange={(v) => handleChange({ verticalPosition: v })}
              />
              <Slider
                label={`Margen del Santuario (${localStyle.sanctuaryMargin}%)`}
                value={localStyle.sanctuaryMargin}
                min={0}
                max={20}
                onChange={(v) => handleChange({ sanctuaryMargin: v })}
              />
            </div>
          </section>

          <div className="flex gap-md justify-end">
            <Button variant="ghost" onClick={handleReset}>
              Restablecer
            </Button>
            <Button variant="primary" onClick={handleApply}>
              Aplicar Cambios
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
