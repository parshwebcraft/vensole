'use client'

import React, { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { ArrowRight, Sparkles, BookOpen } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { EmotionOrb } from '@/components/emotion-orb'

const quotes = [
  "Every story deserves a reader.",
  "Some stories change lives.",
  "Write what only you can tell.",
  "A reader lives a thousand lives before he dies.",
  "Books are a uniquely portable magic.",
  "A book is a dream that you hold in your hand."
]

interface HeroInteractiveProps {
  storiesCount: number
  readersCount: number
  writersCount: number
}

interface BookShowcaseProps {
  containerRef: React.RefObject<HTMLDivElement>
  bookRef: React.RefObject<HTMLDivElement>
  className?: string
}

function BookShowcase({ containerRef, bookRef, className }: BookShowcaseProps) {
  return (
    <div 
      ref={containerRef}
      className={`relative w-[280px] h-[360px] xs:w-[320px] xs:h-[400px] lg:w-[380px] lg:h-[500px] flex justify-center items-center cursor-pointer select-none perspective-[1200px] transition-all duration-300 ${className || ''}`}
      style={{
        // Set CSS variables for responsive book translations
        // Mobile uses smaller offsets, desktop gets full 3D depth
        '--spine-w': '24px',
        '--spine-z': '12px',
        '--pages-z': '6px',
        '--cover-z': '12px',
      } as React.CSSProperties}
    >
      {/* Floating shadow beneath the book */}
      <div className="absolute bottom-[-10px] lg:bottom-[-20px] w-[180px] lg:w-[240px] h-[15px] bg-black/15 dark:bg-black/35 rounded-full blur-[10px] animate-pulse-soft" />

      {/* WebGL Morphing Emotion Orb */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-0 pointer-events-none scale-[0.8] xs:scale-[0.9] lg:scale-[1.1]">
        <EmotionOrb />
      </div>

      {/* 3D Book wrapper */}
      <div 
        ref={bookRef}
        className="w-[180px] h-[260px] lg:w-[240px] lg:h-[350px] relative transition-transform duration-300 ease-out transform-style-preserve-3d drop-shadow-[0_15px_30px_rgba(0,0,0,0.2)] dark:drop-shadow-[0_20px_40px_rgba(0,0,0,0.5)]"
        style={{
          transform: 'rotateY(-20deg) rotateX(10deg)',
          animation: 'floatBook 5s ease-in-out infinite'
        }}
      >
        {/* Book Spine */}
        <div 
          className="absolute left-0 top-0 w-[24px] lg:w-[30px] h-full bg-gradient-to-r from-amber-950 via-stone-900 to-amber-950 transform-style-preserve-3d z-20"
          style={{
            transform: 'rotateY(-90deg) translateZ(12px)',
            transformOrigin: 'left center',
            borderLeft: '1px solid rgba(255,255,255,0.05)'
          }}
        >
          {/* Decorative gold foil lines on spine */}
          <div className="absolute inset-y-0 left-2 w-[1px] bg-amber-500/20" />
          <div className="absolute top-4 left-0 right-0 h-[1px] bg-amber-500/20" />
          <div className="absolute bottom-4 left-0 right-0 h-[1px] bg-amber-500/20" />
        </div>

        {/* Back Cover */}
        <div 
          className="absolute inset-0 w-full h-full bg-stone-950 rounded-r-md border-r border-stone-900 shadow-md transform-style-preserve-3d"
          style={{
            transform: 'translateZ(0px)'
          }}
        />

        {/* Inside Pages (layered borders effect) */}
        <div 
          className="absolute right-[2px] top-[4px] bottom-[4px] left-[2px] bg-amber-50/95 dark:bg-stone-800 border-l border-r-2 border-stone-200 dark:border-stone-700 rounded-r-sm z-10 transform-style-preserve-3d"
          style={{
            transform: 'translateZ(6px)',
            boxShadow: 'inset 4px 0 8px rgba(0,0,0,0.1)'
          }}
        >
          {/* Page leaf ridges lines */}
          <div className="absolute right-0 top-0 bottom-0 w-2 bg-[repeating-linear-gradient(to_bottom,transparent,transparent_1px,#f0ede4_1px,#f0ede4_2px)] opacity-50 dark:opacity-20" />
        </div>

        {/* Front Cover */}
        <div 
          className="absolute inset-0 w-full h-full bg-gradient-to-br from-amber-900 to-stone-950 rounded-r-md shadow-2xl z-30 transform-style-preserve-3d border-y border-r border-amber-900/30"
          style={{
            transform: 'translateZ(12px)'
          }}
        >
          {/* Spine simulation shade line */}
          <div className="absolute left-0 top-0 bottom-0 w-2.5 bg-gradient-to-r from-black/45 via-black/10 to-transparent z-40 border-r border-black/5" />
          <div className="absolute left-2.5 top-0 bottom-0 w-[0.5px] bg-white/5 z-40" />

          {/* Elegant Front Cover Graphics */}
          <div className="absolute inset-2 border border-amber-500/20 rounded-sm flex flex-col justify-between p-4 text-center">
            {/* Header line ornament */}
            <div className="flex flex-col items-center">
              <span className="text-[7px] lg:text-[8px] uppercase tracking-widest text-amber-500/60 font-bold">Vensoul Library</span>
              <div className="w-8 h-[1px] bg-amber-500/20 mt-1" />
            </div>

            {/* Book center Title */}
            <div className="flex flex-col items-center py-2">
              <h3 className="font-serif font-bold text-amber-100 text-xs lg:text-sm leading-snug tracking-wider">
                THE ART<br />
                <span className="text-[9px] lg:text-[10px] text-amber-500 font-sans tracking-[0.2em] block my-1">OF</span>
                STORY
              </h3>
              <div className="w-4 h-[1px] bg-amber-500/20 mt-2" />
            </div>

            {/* Footer emblem */}
            <div className="flex flex-col items-center opacity-65">
              <BookOpen className="h-3.5 w-3.5 text-amber-500" />
              <span className="text-[6px] tracking-widest uppercase font-bold text-amber-500 mt-1 font-serif">MCMXXVI</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export function HeroInteractive({ storiesCount, readersCount, writersCount }: HeroInteractiveProps) {
  const [currentQuoteIndex, setCurrentQuoteIndex] = useState(0)
  const [fade, setFade] = useState(true)
  
  // Split refs for mobile & desktop book showcase components
  const mobileBookRef = useRef<HTMLDivElement>(null)
  const mobileContainerRef = useRef<HTMLDivElement>(null)
  const desktopBookRef = useRef<HTMLDivElement>(null)
  const desktopContainerRef = useRef<HTMLDivElement>(null)
  
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const heroSectionRef = useRef<HTMLDivElement>(null)
  
  const [isHeroVisible, setIsHeroVisible] = useState(true)

  useEffect(() => {
    const section = heroSectionRef.current
    if (!section) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsHeroVisible(entry.isIntersecting)
      },
      { threshold: 0.05 }
    )

    observer.observe(section)
    return () => observer.disconnect()
  }, [])

  // Carousel timer for quotes
  useEffect(() => {
    const timer = setInterval(() => {
      setFade(false)
      setTimeout(() => {
        setCurrentQuoteIndex((prev) => (prev + 1) % quotes.length)
        setFade(true)
      }, 500)
    }, 6000)

    return () => clearInterval(timer)
  }, [])

  // 3D Parallax Tilt effect helper
  useEffect(() => {
    const attachTiltEffect = (container: HTMLDivElement | null, book: HTMLDivElement | null) => {
      if (!container || !book) return () => {}

      const handleMouseMove = (e: MouseEvent) => {
        const rect = container.getBoundingClientRect()
        const x = e.clientX - rect.left - rect.width / 2
        const y = e.clientY - rect.top - rect.height / 2
        
        // Calculate rotation angles
        const rotY = (x / (rect.width / 2)) * 25 // max 25 deg
        const rotX = -(y / (rect.height / 2)) * 18 // max 18 deg
        
        book.style.transform = `rotateY(${rotY - 20}deg) rotateX(${rotX + 10}deg)`
      }

      const handleMouseLeave = () => {
        book.style.transform = 'rotateY(-20deg) rotateX(10deg)'
      }

      container.addEventListener('mousemove', handleMouseMove)
      container.addEventListener('mouseleave', handleMouseLeave)

      return () => {
        container.removeEventListener('mousemove', handleMouseMove)
        container.removeEventListener('mouseleave', handleMouseLeave)
      }
    }

    const cleanMobile = attachTiltEffect(mobileContainerRef.current, mobileBookRef.current)
    const cleanDesktop = attachTiltEffect(desktopContainerRef.current, desktopBookRef.current)

    return () => {
      cleanMobile()
      cleanDesktop()
    }
  }, [isHeroVisible])

  // Canvas background ambient particles (dots, rotating pages, and sparkles)
  useEffect(() => {
    if (!isHeroVisible) return

    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animationFrameId: number
    let width = (canvas.width = canvas.offsetWidth)
    let height = (canvas.height = canvas.offsetHeight)

    // Handle resize
    const handleResize = () => {
      if (!canvas) return
      width = canvas.width = canvas.offsetWidth
      height = canvas.height = canvas.offsetHeight
    }
    window.addEventListener('resize', handleResize)

    // Advanced Particle class supporting multiple shapes
    class Particle {
      x!: number
      y!: number
      size!: number
      speedY!: number
      speedX!: number
      opacity!: number
      fadeSpeed!: number
      color!: string
      type!: 'dot' | 'sparkle' | 'page'
      angle!: number
      angleSpeed!: number
      width!: number
      height!: number

      constructor() {
        this.reset()
        // Randomly place coordinates on initialization
        this.y = Math.random() * height
      }


      reset() {
        this.x = Math.random() * width
        this.y = height + 10 // Start below bottom
        this.opacity = Math.random() * 0.35 + 0.1
        this.fadeSpeed = Math.random() * 0.002 + 0.001
        this.angle = Math.random() * Math.PI * 2
        this.angleSpeed = (Math.random() - 0.5) * 0.01

        const typeRand = Math.random()
        if (typeRand < 0.6) {
          // 60% Glowing Dots
          this.type = 'dot'
          this.size = Math.random() * 2 + 1
          this.speedY = -(Math.random() * 0.4 + 0.15)
          this.speedX = (Math.random() - 0.5) * 0.25
          const colors = ['rgba(245, 158, 11, ', 'rgba(217, 119, 6, ', 'rgba(234, 179, 8, ']
          this.color = colors[Math.floor(Math.random() * colors.length)]
        } else if (typeRand < 0.85) {
          // 25% Ink Sparkles (cross stars)
          this.type = 'sparkle'
          this.size = Math.random() * 5 + 3
          this.speedY = -(Math.random() * 0.3 + 0.1)
          this.speedX = (Math.random() - 0.5) * 0.15
          this.color = 'rgba(251, 191, 36, ' // gold
        } else {
          // 15% Floating Pages (subtle spinning rectangles)
          this.type = 'page'
          this.width = Math.random() * 10 + 6
          this.height = this.width * 1.3
          this.speedY = -(Math.random() * 0.25 + 0.1)
          this.speedX = (Math.random() - 0.5) * 0.3
          this.color = 'rgba(254, 253, 246, ' // soft white cream
        }
      }

      update() {
        this.y += this.speedY
        this.x += this.speedX
        this.angle += this.angleSpeed
        
        // Reset when out of boundary
        if (this.y < -20 || this.x < -20 || this.x > width + 20) {
          this.reset()
        }
      }

      draw() {
        if (!ctx) return
        
        if (this.type === 'dot') {
          ctx.beginPath()
          ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2)
          ctx.fillStyle = `${this.color}${this.opacity})`
          ctx.fill()
        } else if (this.type === 'sparkle') {
          ctx.save()
          ctx.translate(this.x, this.y)
          ctx.rotate(this.angle)
          ctx.beginPath()
          ctx.moveTo(-this.size, 0)
          ctx.lineTo(this.size, 0)
          ctx.moveTo(0, -this.size)
          ctx.lineTo(0, this.size)
          ctx.strokeStyle = `${this.color}${this.opacity})`
          ctx.lineWidth = 1.0
          ctx.stroke()
          ctx.restore()
        } else if (this.type === 'page') {
          ctx.save()
          ctx.translate(this.x, this.y)
          ctx.rotate(this.angle)
          
          // Draw page solid card
          ctx.fillStyle = `${this.color}${this.opacity * 0.25})`
          ctx.fillRect(-this.width / 2, -this.height / 2, this.width, this.height)
          
          // Draw page border outline
          ctx.strokeStyle = `rgba(217, 119, 6, ${this.opacity * 0.15})`
          ctx.lineWidth = 0.5
          ctx.strokeRect(-this.width / 2, -this.height / 2, this.width, this.height)
          ctx.restore()
        }
      }
    }

    // Set particle density based on width (less particles on mobile)
    const particleCount = width < 768 ? 20 : 50
    const particles: Particle[] = Array.from({ length: particleCount }, () => new Particle())

    // Animation render loop
    const render = () => {
      ctx.clearRect(0, 0, width, height)
      particles.forEach((p) => {
        p.update()
        p.draw()
      })
      animationFrameId = requestAnimationFrame(render)
    }

    render()

    return () => {
      window.removeEventListener('resize', handleResize)
      cancelAnimationFrame(animationFrameId)
    }
  }, [isHeroVisible])

  return (
    <section ref={heroSectionRef} className="relative overflow-hidden w-full min-h-[90vh] flex items-center justify-center py-10 md:py-16">
      {/* Background canvas particles */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none z-0 opacity-70" />
      
      {/* Ambient background light glows */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-500/10 via-background to-background dark:from-amber-950/20 z-0" />
      <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[600px] md:w-[800px] h-[400px] bg-gradient-to-br from-primary/10 to-amber-500/5 rounded-full blur-[120px] opacity-40 pointer-events-none z-0" />

      <div className="container relative px-4 py-8 lg:py-16 z-10">
        {/* Layout Order Handling:
            - Left Column holds text flow. On mobile, we place the Book Showcase right under the heading.
            - Right Column holds Book Showcase for larger screens (hidden on mobile).
        */}
        <div className="grid lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* Left Text Column */}
          <div className="lg:col-span-7 text-center lg:text-left flex flex-col items-center lg:items-start max-w-3xl mx-auto lg:mx-0">
            <Badge variant="outline" className="mb-5 px-4 py-1.5 border-amber-500/30 bg-amber-500/5 text-amber-700 dark:text-amber-400 font-medium tracking-wide shadow-sm select-none">
              <Sparkles className="w-3.5 h-3.5 mr-2 animate-pulse text-amber-500" />
              Where Stories Find Their Soul
            </Badge>
            
            <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-5 leading-[1.1] text-foreground select-none">
              Write Stories That<br />
              <span className="relative inline-block mt-2">
                <span className="text-gradient">Captivate</span>
                <svg className="absolute -bottom-2.5 left-0 w-full h-3 text-primary/70 animate-pulse-soft" viewBox="0 0 100 10" preserveAspectRatio="none">
                  <path d="M0,5 Q30,9 50,4 T100,5" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
                </svg>
              </span>
            </h1>

            {/* Mobile Book Showcase: Stacked below the heading on screens below desktop */}
            <div className="lg:hidden w-full flex justify-center py-4 my-2">
              <BookShowcase containerRef={mobileContainerRef} bookRef={mobileBookRef} />
            </div>
            
            <p className="text-base md:text-lg lg:text-xl text-muted-foreground max-w-xl mb-8 leading-relaxed font-sans">
              Vensoul is an elegant digital sanctuary where authors craft worlds and readers discover timeless stories. Join our cozy library of creators today.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 mb-10 w-full sm:w-auto">
              <Button size="lg" className="px-8 w-full sm:w-auto" asChild>
                <Link href="/stories">
                  Browse the Library
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="px-8 w-full sm:w-auto" asChild>
                <Link href="/signup">
                  Start Your Story
                </Link>
              </Button>
            </div>

            {/* Reading Quotes Carousel */}
            <div className="w-full max-w-md min-h-[50px] flex items-center justify-center lg:justify-start border-l-2 border-primary/20 pl-4 py-1">
              <p className={`font-serif italic text-base md:text-lg text-muted-foreground/85 transition-all duration-500 ease-in-out ${
                fade ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-2'
              }`}>
                "{quotes[currentQuoteIndex]}"
              </p>
            </div>
          </div>

          {/* Right Column: 3D Floating Book Showcase (Desktop only layout) */}
          <div className="hidden lg:col-span-5 lg:flex justify-center items-center h-[500px]">
            <BookShowcase containerRef={desktopContainerRef} bookRef={desktopBookRef} />
          </div>

        </div>
      </div>
      
      {/* Floating animations definitions */}
      <style jsx global>{`
        @keyframes floatBook {
          0%, 100% {
            transform: rotateY(-20deg) rotateX(10deg) translateY(0);
          }
          50% {
            transform: rotateY(-20deg) rotateX(10deg) translateY(-12px);
          }
        }
        @keyframes pulseSoft {
          0%, 100% {
            transform: scale(1);
            opacity: 0.25;
          }
          50% {
            transform: scale(1.05);
            opacity: 0.15;
          }
        }
        .animate-pulse-soft {
          animation: pulseSoft 6s ease-in-out infinite;
        }
      `}</style>
    </section>
  )
}
