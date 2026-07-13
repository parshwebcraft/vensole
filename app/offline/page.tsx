'use client'

import React from 'react'
import Link from 'next/link'
import { WifiOff, BookOpen, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function OfflinePage() {
  const handleRetry = () => {
    window.location.reload()
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4 text-center relative overflow-hidden">
      {/* Background ambient glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[300px] sm:w-[500px] h-[300px] bg-gradient-to-br from-primary/10 to-amber-500/5 rounded-full blur-[100px] opacity-40 pointer-events-none z-0" />
      
      {/* Paper texture overlay (similar to global design) */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-repeat bg-center" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }} />

      <div className="relative z-10 max-w-md flex flex-col items-center">
        {/* Cozy Lantern/Book Emblem */}
        <div className="h-24 w-24 rounded-full bg-secondary/80 border border-primary/20 flex items-center justify-center mb-8 relative shadow-inner animate-pulse-soft">
          <BookOpen className="h-10 w-10 text-primary" />
          <WifiOff className="h-5 w-5 text-amber-500 absolute bottom-4 right-4 bg-background rounded-full p-1 border border-border" />
        </div>

        <h1 className="font-serif text-3xl md:text-4xl font-bold tracking-tight mb-4 text-foreground">
          Lost in the Library Shadows
        </h1>
        
        <p className="text-muted-foreground text-base mb-8 leading-relaxed">
          It seems you are currently offline. Your stories and writing sanctuary are temporarily resting. Check your connection to return to the library.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
          <Button size="lg" onClick={handleRetry} className="gap-2 px-8">
            <RefreshCw className="h-4 w-4" />
            Retry Connection
          </Button>
          <Button size="lg" variant="outline" asChild className="px-8 border-border bg-background/50 backdrop-blur-sm">
            <Link href="/">
              Return Home
            </Link>
          </Button>
        </div>
      </div>

      <style jsx global>{`
        @keyframes pulseSoft {
          0%, 100% { transform: scale(1); opacity: 0.95; }
          50% { transform: scale(1.02); opacity: 0.85; }
        }
        .animate-pulse-soft {
          animation: pulseSoft 4s ease-in-out infinite;
        }
      `}</style>
    </div>
  )
}
