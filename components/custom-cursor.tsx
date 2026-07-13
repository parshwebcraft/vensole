'use client'

import { useEffect, useState } from 'react'

interface TrailParticle {
  id: number
  x: number
  y: number
  size: number
  color: string
}

export function CustomCursor() {
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [hidden, setHidden] = useState(true)
  const [hoverType, setHoverType] = useState<'none' | 'feather' | 'ink'>('none')
  const [particles, setParticles] = useState<TrailParticle[]>([])

  useEffect(() => {
    // Check if the user is on a touch device
    const isTouch = window.matchMedia('(pointer: coarse)').matches
    if (isTouch) return

    let lastX = 0
    let lastY = 0

    const handleMouseMove = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY })
      if (hidden) setHidden(false)

      const dist = Math.hypot(e.clientX - lastX, e.clientY - lastY)
      if (dist > 25) { // spawn every 25px of movement
        lastX = e.clientX
        lastY = e.clientY
        
        const colors = [
          'rgba(245, 158, 11, 0.65)', // Amber/Gold
          'rgba(234, 88, 12, 0.65)',  // Orange
          'rgba(236, 72, 153, 0.65)',  // Pink
          'rgba(59, 130, 246, 0.65)'   // Blue
        ]
        const randomColor = colors[Math.floor(Math.random() * colors.length)]

        setParticles(prev => [
          ...prev.slice(-12), // Limit active particles to 12
          {
            id: Math.random(),
            x: e.clientX,
            y: e.clientY,
            size: Math.random() * 5 + 3,
            color: randomColor
          }
        ])
      }
    }

    const handleMouseEnter = () => setHidden(false)
    const handleMouseLeave = () => setHidden(true)

    // Track hovers
    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      if (!target) return

      const closestLink = target.closest('a, button, [role="button"]')
      if (closestLink) {
        if (
          closestLink.classList.contains('story-cover') ||
          closestLink.closest('.story-cover') ||
          closestLink.closest('.card-hover')
        ) {
          setHoverType('feather')
        } else {
          setHoverType('ink')
        }
      } else {
        setHoverType('none')
      }
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseenter', handleMouseEnter)
    document.addEventListener('mouseleave', handleMouseLeave)
    document.addEventListener('mouseover', handleMouseOver)

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseenter', handleMouseEnter)
      document.removeEventListener('mouseleave', handleMouseLeave)
      document.removeEventListener('mouseover', handleMouseOver)
    }
  }, [hidden])

  const isTouch = typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches
  if (hidden || isTouch) return null

  return (
    <>
      {/* Sparkle Particles Trail */}
      {particles.map((p) => (
        <div
          key={p.id}
          className="fixed pointer-events-none z-[99998] rounded-full -translate-x-1/2 -translate-y-1/2 animate-particle"
          style={{
            left: `${p.x}px`,
            top: `${p.y}px`,
            width: `${p.size}px`,
            height: `${p.size}px`,
            backgroundColor: p.color,
            boxShadow: `0 0 6px ${p.color}`,
          }}
        />
      ))}

      {/* Main Cursor Element */}
      <div
        className={`fixed top-0 left-0 w-6 h-6 rounded-full pointer-events-none z-[99999] -translate-x-1/2 -translate-y-1/2 transition-all duration-75 ease-out hidden md:block ${
          hoverType === 'feather'
            ? 'bg-amber-500/20 scale-150 border border-amber-500/30'
            : hoverType === 'ink'
            ? 'bg-primary/20 scale-125 border border-primary/30'
            : 'bg-primary/10 border border-primary/20'
        }`}
        style={{
          left: `${position.x}px`,
          top: `${position.y}px`,
        }}
      >
        <div
          className={`w-1.5 h-1.5 rounded-full absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 transition-transform duration-200 ${
            hoverType !== 'none' ? 'bg-primary scale-125' : 'bg-primary'
          }`}
        />
      </div>

      <style jsx>{`
        @keyframes particleFade {
          0% { transform: translate(-50%, -50%) scale(1); opacity: 0.8; }
          100% { transform: translate(-50%, -50%) scale(0); opacity: 0; }
        }
        .animate-particle {
          animation: particleFade 0.6s ease-out forwards;
        }
      `}</style>
    </>
  )
}
