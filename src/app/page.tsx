'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { generateSessionCode } from '@/lib/utils'

export default function HomePage() {
  const router = useRouter()
  const [sessionCode, setSessionCode] = useState('')

  function handleStartDisplay() {
    const code = generateSessionCode()
    router.push(`/display?code=${code}`)
  }

  function handleJoinAsController() {
    if (sessionCode.trim().length === 5) {
      router.push(`/control?code=${sessionCode.trim().toUpperCase()}`)
    }
  }

  return (
    <main className="min-h-screen bg-surface flex items-center justify-center px-md">
      <div className="w-full max-w-md">
        <div className="text-center mb-xl">
          <h1 className="font-headline text-headline-lg text-on-surface">
            BibleCast
          </h1>
          <p className="font-body text-body-lg text-on-surface-variant mt-sm">
            Proyección bíblica en tiempo real
          </p>
        </div>

        <div className="space-y-md">
          <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-lg">
            <div className="flex items-center gap-3 mb-md">
              <div className="w-10 h-10 bg-primary-container rounded-lg flex items-center justify-center">
                <ScreenIcon className="w-5 h-5 text-inverse-on-surface" />
              </div>
              <div>
                <h2 className="font-body text-body-lg font-semibold text-on-surface">Pantalla</h2>
                <p className="font-body text-sm text-on-surface-variant">TV o proyector</p>
              </div>
            </div>
            <p className="font-body text-body-md text-on-surface-variant mb-md">
              Genera una sesión para proyectar versículos en pantalla grande.
            </p>
            <Button variant="primary" fullWidth onClick={handleStartDisplay}>
              Iniciar como Pantalla
            </Button>
          </div>

          <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-lg">
            <div className="flex items-center gap-3 mb-md">
              <div className="w-10 h-10 bg-secondary-container rounded-lg flex items-center justify-center">
                <PhoneIcon className="w-5 h-5 text-on-secondary-container" />
              </div>
              <div>
                <h2 className="font-body text-body-lg font-semibold text-on-surface">Control</h2>
                <p className="font-body text-sm text-on-surface-variant">Desde tu celular</p>
              </div>
            </div>
            <p className="font-body text-body-md text-on-surface-variant mb-md">
              Conecta con un código para controlar la proyección.
            </p>
            <div className="flex gap-2">
              <Input
                placeholder="Ej: A7KD9"
                value={sessionCode}
                onChange={(e) => setSessionCode(e.target.value.toUpperCase().slice(0, 5))}
                className="text-center font-label tracking-widest text-lg"
              />
              <Button
                variant="secondary"
                onClick={handleJoinAsController}
                disabled={sessionCode.trim().length !== 5}
              >
                Conectar
              </Button>
            </div>
          </div>
        </div>

        <p className="text-center font-label text-label-sm text-outline mt-xl">
          Sin registro · Sin cuentas · Sin suscripciones
        </p>
      </div>
    </main>
  )
}

function ScreenIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" xmlns="http://www.w3.org/2000/svg">
      <rect x="2" y="3" width="16" height="11" rx="1" />
      <path d="M7 17h6M10 14v3" />
    </svg>
  )
}

function PhoneIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" xmlns="http://www.w3.org/2000/svg">
      <rect x="5" y="1" width="10" height="18" rx="2" />
      <path d="M9 16h2" />
    </svg>
  )
}
