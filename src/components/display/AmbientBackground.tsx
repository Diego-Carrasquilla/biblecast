'use client'

import { useEffect, useRef } from 'react'

export function AmbientBackground() {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let id: number
    let t = 0

    function animate() {
      t += 0.002
      if (ref.current) {
        const x = 50 + Math.sin(t) * 5
        const y = 50 + Math.cos(t * 0.7) * 5
        ref.current.style.background = `radial-gradient(circle at ${x}% ${y}%, rgba(119,90,25,0.12) 0%, rgba(0,0,0,0) 75%)`
      }
      id = requestAnimationFrame(animate)
    }

    animate()
    return () => cancelAnimationFrame(id)
  }, [])

  return <div ref={ref} className="absolute inset-0 pointer-events-none" aria-hidden="true" />
}
