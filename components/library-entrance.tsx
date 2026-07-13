'use client'

import React, { useEffect, useState } from 'react'
import { Sparkles, ArrowRight } from 'lucide-react'

export function LibraryEntrance() {
  const [phase, setPhase] = useState<'closed' | 'open' | 'flying' | 'hidden'>('closed')

  useEffect(() => {
    // Check if the user has already seen the intro during this session
    const seen = sessionStorage.getItem('vensoul-intro-seen') === 'true'
    if (seen) {
      setPhase('hidden')
      return
    }

    // Sequence the phases
    const openTimer = setTimeout(() => {
      setPhase('open')
    }, 800)

    const flyTimer = setTimeout(() => {
      setPhase('flying')
    }, 2500)

    const hideTimer = setTimeout(() => {
      setPhase('hidden')
      sessionStorage.setItem('vensoul-intro-seen', 'true')
    }, 4500)

    return () => {
      clearTimeout(openTimer)
      clearTimeout(flyTimer)
      clearTimeout(hideTimer)
    }
  }, [])

  const handleSkip = () => {
    setPhase('hidden')
    sessionStorage.setItem('vensoul-intro-seen', 'true')
  }

  if (phase === 'hidden') return null

  return (
    <div 
      className={`fixed inset-0 z-[100000] flex items-center justify-center bg-[#090705] overflow-hidden transition-opacity duration-1000 ease-out select-none ${
        phase === 'flying' ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      {/* Ambient background particles */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(245,158,11,0.06)_0%,transparent_70%)]" />

      {/* Skip Button */}
      <button 
        onClick={handleSkip}
        className="absolute top-6 right-6 z-[100002] flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-amber-500/70 hover:text-amber-400 border border-amber-500/20 hover:border-amber-500/40 rounded-full transition-all bg-black/40 backdrop-blur-sm tracking-wider uppercase font-sans"
      >
        Skip Intro
        <ArrowRight className="h-3 w-3" />
      </button>

      {/* Intro Title Header */}
      <div 
        className={`absolute top-1/4 z-[100002] text-center transition-all duration-1000 ease-in-out ${
          phase !== 'closed' ? 'opacity-0 -translate-y-8' : 'opacity-100'
        }`}
      >
        <span className="text-[10px] tracking-[0.4em] uppercase text-amber-500/50 block mb-3 font-sans">Vensoul Sanctuary</span>
        <h1 className="text-4xl md:text-5xl font-serif font-bold text-amber-100 tracking-widest select-none">
          THE LIBRARY
        </h1>
        <div className="w-12 h-[1px] bg-amber-500/20 mx-auto mt-4" />
      </div>

      {/* 3D Gate Room */}
      <div className="relative w-full h-full flex items-center justify-center perspective-[1200px] transform-style-preserve-3d">
        
        {/* Left Gate Door */}
        <div 
          className={`absolute left-0 w-1/2 h-full bg-gradient-to-l from-stone-900 via-[#18120d] to-stone-950 border-r-4 border-amber-950 shadow-2xl flex items-center justify-end pr-8 md:pr-16 z-40 transform-style-preserve-3d`}
          style={{
            transformOrigin: 'left center',
            transform: phase !== 'closed' ? 'rotateY(-110deg)' : 'rotateY(0deg)',
            transition: 'transform 2.2s cubic-bezier(0.7, 0, 0.3, 1)'
          }}
        >
          {/* Wooden panel details */}
          <div className="absolute inset-10 border-2 border-stone-800/40 rounded-sm pointer-events-none" />
          {/* Gate Ring Knocker */}
          <div className="relative w-12 h-12 md:w-16 md:h-16 rounded-full border-4 border-amber-500/20 flex items-center justify-center text-amber-500/30">
            <div className="w-6 h-6 rounded-full bg-amber-500/10 border-2 border-amber-500/30" />
          </div>
        </div>

        {/* Right Gate Door */}
        <div 
          className={`absolute right-0 w-1/2 h-full bg-gradient-to-r from-stone-900 via-[#18120d] to-stone-950 border-l-4 border-amber-950 shadow-2xl flex items-center justify-start pl-8 md:pl-16 z-40 transform-style-preserve-3d`}
          style={{
            transformOrigin: 'right center',
            transform: phase !== 'closed' ? 'rotateY(110deg)' : 'rotateY(0deg)',
            transition: 'transform 2.2s cubic-bezier(0.7, 0, 0.3, 1)'
          }}
        >
          {/* Wooden panel details */}
          <div className="absolute inset-10 border-2 border-stone-800/40 rounded-sm pointer-events-none" />
          {/* Gate Ring Knocker */}
          <div className="relative w-12 h-12 md:w-16 md:h-16 rounded-full border-4 border-amber-500/20 flex items-center justify-center text-amber-500/30">
            <div className="w-6 h-6 rounded-full bg-amber-500/10 border-2 border-amber-500/30" />
          </div>
        </div>

        {/* flying bookshelves on the sides */}
        <div 
          className={`absolute inset-0 flex items-center justify-between pointer-events-none z-10 transition-all duration-[2000ms] cubic-bezier(0.4, 0, 0.2, 1) ${
            phase === 'open' 
              ? 'opacity-80 scale-100' 
              : phase === 'flying' 
              ? 'scale-[1.8] opacity-0 translate-z-[400px]' 
              : 'opacity-0 scale-50'
          }`}
        >
          {/* Left flying shelf */}
          <div className="w-[140px] md:w-[220px] h-[80%] bg-[#1c140f] border-r border-y border-amber-900/10 shadow-2xl p-4 flex flex-col justify-around rounded-r-md">
            {Array.from({ length: 4 }).map((_, rIndex) => (
              <div key={rIndex} className="h-10 md:h-16 border-b border-amber-800/20 flex items-end gap-1.5 px-2">
                {Array.from({ length: 5 }).map((_, bIndex) => {
                  const h = 25 + (bIndex * 7) % 30
                  return (
                    <div 
                      key={bIndex} 
                      className="w-2.5 md:w-4 rounded-t-sm shadow-sm bg-gradient-to-t from-amber-900 to-amber-700/50" 
                      style={{ height: `${h}%` }}
                    />
                  )
                })}
              </div>
            ))}
          </div>

          {/* Right flying shelf */}
          <div className="w-[140px] md:w-[220px] h-[80%] bg-[#1c140f] border-l border-y border-amber-900/10 shadow-2xl p-4 flex flex-col justify-around rounded-l-md">
            {Array.from({ length: 4 }).map((_, rIndex) => (
              <div key={rIndex} className="h-10 md:h-16 border-b border-amber-800/20 flex items-end justify-end gap-1.5 px-2">
                {Array.from({ length: 5 }).map((_, bIndex) => {
                  const h = 30 + (bIndex * 9) % 35
                  return (
                    <div 
                      key={bIndex} 
                      className="w-2.5 md:w-4 rounded-t-sm shadow-sm bg-gradient-to-t from-amber-950 to-amber-800/60" 
                      style={{ height: `${h}%` }}
                    />
                  )
                })}
              </div>
            ))}
          </div>
        </div>

        {/* Central golden energy tunnel */}
        <div 
          className={`absolute w-[180px] h-[180px] md:w-[260px] md:h-[260px] rounded-full border border-amber-500/10 bg-radial-gradient flex items-center justify-center z-0 transition-all duration-[2200ms] ${
            phase === 'open' 
              ? 'scale-110 opacity-60' 
              : phase === 'flying' 
              ? 'scale-[2.5] opacity-0' 
              : 'scale-0 opacity-0'
          }`}
        >
          <Sparkles className="h-12 w-12 text-amber-500 animate-spin-slow opacity-30" />
        </div>
      </div>

      <style jsx>{`
        .perspective-[1200px] {
          perspective: 1200px;
        }
        .transform-style-preserve-3d {
          transform-style: preserve-3d;
        }
        .bg-radial-gradient {
          background: radial-gradient(circle, rgba(245,158,11,0.12) 0%, transparent 80%);
        }
        .animate-spin-slow {
          animation: spin 8s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}
