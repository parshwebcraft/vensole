'use client'

import { useEffect, useRef, useState } from 'react'

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  alpha: number
  size: number
  color: string
  decay: number
}

export function CustomCursor() {
  const cursorRef = useRef<HTMLDivElement>(null)
  const dotRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  
  const [hoverType, setHoverType] = useState<'none' | 'feather' | 'ink'>('none')
  const [visible, setVisible] = useState(false)

  // Track mouse positions using refs to avoid React re-renders on mousemove
  const mouseCoords = useRef({ x: 0, y: 0 })
  const cursorCoords = useRef({ x: 0, y: 0 })
  const lastSpawnCoords = useRef({ x: 0, y: 0 })
  const particles = useRef<Particle[]>([])
  
  useEffect(() => {
    // Check if the user is on a touch device (no custom cursor needed)
    const isTouch = window.matchMedia('(pointer: coarse)').matches
    if (isTouch) return

    setVisible(true)

    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    
    // Resize handler to fit screen coordinates
    const resizeCanvas = () => {
      if (canvas) {
        canvas.width = window.innerWidth
        canvas.height = window.innerHeight
      }
    }
    resizeCanvas()
    window.addEventListener('resize', resizeCanvas, { passive: true })

    const colors = [
      'rgba(245, 158, 11, 0.7)', // Amber/Gold
      'rgba(234, 88, 12, 0.7)',  // Orange
      'rgba(236, 72, 153, 0.7)',  // Pink
      'rgba(139, 92, 246, 0.7)'   // Purple
    ]

    const handleMouseMove = (e: MouseEvent) => {
      mouseCoords.current.x = e.clientX
      mouseCoords.current.y = e.clientY

      // Calculate travel distance to spawn trail particles
      const dx = e.clientX - lastSpawnCoords.current.x
      const dy = e.clientY - lastSpawnCoords.current.y
      const dist = Math.hypot(dx, dy)

      if (dist > 18) { // spawn every 18px of movement
        lastSpawnCoords.current.x = e.clientX
        lastSpawnCoords.current.y = e.clientY

        const count = Math.min(2, Math.floor(dist / 18))
        for (let i = 0; i < count; i++) {
          const angle = Math.random() * Math.PI * 2
          const speed = Math.random() * 0.8 + 0.2
          particles.current.push({
            x: e.clientX,
            y: e.clientY,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed - 0.2, // slight upward float
            alpha: 1.0,
            size: Math.random() * 4 + 2.5,
            color: colors[Math.floor(Math.random() * colors.length)],
            decay: Math.random() * 0.02 + 0.015
          })
        }
      }
    }

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

    const handleMouseLeave = () => {
      if (cursorRef.current) cursorRef.current.style.opacity = '0'
    }

    const handleMouseEnter = () => {
      if (cursorRef.current) cursorRef.current.style.opacity = '1'
    }

    document.addEventListener('mousemove', handleMouseMove, { passive: true })
    document.addEventListener('mouseover', handleMouseOver, { passive: true })
    document.addEventListener('mouseleave', handleMouseLeave, { passive: true })
    document.addEventListener('mouseenter', handleMouseEnter, { passive: true })

    // Animation Loop
    let animationFrameId: number

    const tick = () => {
      // 1. Smooth cursor lerp (snappy trailing effect)
      const targetX = mouseCoords.current.x
      const targetY = mouseCoords.current.y

      cursorCoords.current.x += (targetX - cursorCoords.current.x) * 0.18
      cursorCoords.current.y += (targetY - cursorCoords.current.y) * 0.18

      // Update position of the outer ring directly via transform (bypasses layout reflows)
      if (cursorRef.current) {
        cursorRef.current.style.transform = `translate3d(${cursorCoords.current.x}px, ${cursorCoords.current.y}px, 0)`
      }

      // 2. Draw high-performance particles on Canvas
      if (canvas && ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height)

        const activeParticles = particles.current
        for (let i = activeParticles.length - 1; i >= 0; i--) {
          const p = activeParticles[i]
          p.x += p.vx
          p.y += p.vy
          p.alpha -= p.decay
          
          if (p.alpha <= 0) {
            activeParticles.splice(i, 1)
            continue
          }

          ctx.save()
          ctx.globalAlpha = p.alpha
          ctx.shadowBlur = 4
          ctx.shadowColor = p.color
          ctx.fillStyle = p.color
          
          ctx.beginPath()
          ctx.arc(p.x, p.y, p.size * p.alpha, 0, Math.PI * 2)
          ctx.fill()
          ctx.restore()
        }
      }

      animationFrameId = requestAnimationFrame(tick)
    }
    
    animationFrameId = requestAnimationFrame(tick)

    return () => {
      window.removeEventListener('resize', resizeCanvas)
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseover', handleMouseOver)
      document.removeEventListener('mouseleave', handleMouseLeave)
      document.removeEventListener('mouseenter', handleMouseEnter)
      cancelAnimationFrame(animationFrameId)
    }
  }, [])

  if (!visible) return null

  return (
    <>
      {/* High-Performance Canvas for trails (isolated GPU layer) */}
      <canvas
        ref={canvasRef}
        className="fixed inset-0 pointer-events-none z-[99998]"
        style={{ willChange: 'transform' }}
      />

      {/* Main outer ring element */}
      <div
        ref={cursorRef}
        className={`fixed top-0 left-0 w-6 h-6 rounded-full pointer-events-none z-[99999] -ml-3 -mt-3 transition-all duration-300 ease-out will-change-transform hidden md:block ${
          hoverType === 'feather'
            ? 'bg-amber-500/20 scale-150 border border-amber-500/30'
            : hoverType === 'ink'
            ? 'bg-primary/20 scale-125 border border-primary/30'
            : 'bg-primary/10 border border-primary/20'
        }`}
      >
        {/* Inner center dot */}
        <div
          ref={dotRef}
          className={`w-1.5 h-1.5 rounded-full absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 transition-transform duration-200 ${
            hoverType !== 'none' ? 'bg-primary scale-125' : 'bg-primary'
          }`}
        />
      </div>
    </>
  )
}
