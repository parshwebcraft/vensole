'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Feather, BookOpen, ChevronRight } from 'lucide-react';

export function Hero() {
  const [mounted, setMounted] = useState(false);
  const [birds, setBirds] = useState<number[]>([]);

  useEffect(() => {
    setMounted(true);
    const ids = Array.from({ length: 5 }, (_, i) => i);
    setBirds(ids);
  }, []);

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-b from-ivory via-ivory to-ivory-dark">
      {/* Ambient gradient orbs */}
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] rounded-full bg-gold/8 blur-[120px] animate-float-slow" />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full bg-peacock-blue/6 blur-[100px] animate-float" />
      {/* Ink flowing curves */}
      <svg className="absolute bottom-0 left-0 right-0 w-full h-[200px] pointer-events-none" viewBox="0 0 1440 200" preserveAspectRatio="none">
        <path
          d="M0,100 C320,180 480,20 720,80 C960,140 1120,40 1440,100 L1440,200 L0,200 Z"
          fill="rgba(200,164,106,0.06)"
        />
        <path
          d="M0,140 C240,80 560,180 840,120 C1120,60 1280,140 1440,100 L1440,200 L0,200 Z"
          fill="rgba(0,109,119,0.04)"
        />
      </svg>

      {/* Main content */}
      <div className="relative z-10 max-w-5xl mx-auto px-6 text-center pt-24 md:pt-32">


        {/* Tagline */}
        <p className={`section-label mb-6 transition-all duration-1000 delay-200 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          An Emotional Storytelling Ecosystem
        </p>

        {/* Title */}
        <h1 className={`font-serif text-6xl md:text-8xl lg:text-9xl font-medium text-midnight mb-4 leading-[0.95] transition-all duration-1000 delay-300 ${
          mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}>
          <span className="inline-block transition-all duration-500 ease-out hover:-translate-y-2 hover:scale-[1.02] cursor-default select-none active:scale-95">
            Where stories
          </span>
          <br />
          <span className="text-gradient-gold italic inline-block transition-all duration-500 ease-out hover:-translate-y-2 hover:scale-[1.02] hover:drop-shadow-[0_0_15px_rgba(200,164,106,0.4)] cursor-default select-none active:scale-95">
            find their soul
          </span>
        </h1>

        {/* Subtitle */}
        <p className={`font-serif text-xl md:text-2xl text-midnight/60 max-w-2xl mx-auto mb-10 leading-relaxed transition-all duration-1000 delay-500 ${
          mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
        }`}>
          Step into a magical library where every page breathes, every word lingers, and every story becomes a part of who you are.
        </p>

        {/* CTAs */}
        <div className={`flex flex-col sm:flex-row gap-4 justify-center items-center transition-all duration-1000 delay-700 ${
          mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
        }`}>
          <Link
            href="/discover"
            className="btn-gold px-8 py-4 rounded-xl flex items-center gap-2 group relative"
          >
            <span className="relative z-10 flex items-center gap-2">
              <BookOpen className="w-4 h-4" />
              Enter the Library
            </span>
            <ChevronRight className="w-4 h-4 relative z-10 transition-transform group-hover:translate-x-1" />
          </Link>
          <Link
            href="/signup"
            className="btn-outline-gold px-8 py-4 rounded-xl flex items-center gap-2"
          >
            <Feather className="w-4 h-4" />
            Begin Writing
          </Link>
        </div>


      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-float">
        <div className="w-px h-12 bg-gradient-to-b from-transparent via-gold to-transparent" />
        <span className="text-[0.6rem] tracking-[0.3em] uppercase text-midnight/30">Scroll</span>
      </div>
    </section>
  );
}
