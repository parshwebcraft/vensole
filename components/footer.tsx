'use client';

import Link from 'next/link';
import { Feather, Heart, BookOpen, Mail } from 'lucide-react';

export function Footer() {
  return (
    <footer className="relative bg-midnight text-ivory py-12 px-6 overflow-hidden text-center">
      {/* Top gold line accent */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/40 to-transparent" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full bg-gold/5 blur-[100px]" />

      <div className="max-w-4xl mx-auto relative z-10 flex flex-col items-center gap-8">
        {/* Brand Logo & Name */}
        <div className="flex flex-col items-center gap-2">
          <img src="/images/image.png" alt="VENSOUL" className="w-12 h-12 object-contain" />
          <div>
            <div className="font-serif text-3xl tracking-wide text-ivory">VENSOUL</div>
            <div className="text-[0.6rem] tracking-[0.35em] uppercase text-gold mt-1">Write • Feel • Connect</div>
          </div>
        </div>

        {/* Tagline */}
        <p className="text-ivory/50 text-sm leading-relaxed font-serif italic max-w-md">
          An emotional storytelling ecosystem where stories have souls.
        </p>

        {/* Navigation Links */}
        <div className="flex flex-wrap justify-center gap-x-8 gap-y-2 text-sm font-sans my-2">
          {[
            { href: '/discover', label: 'Discover' },
            { href: '/discover?sort=trending', label: 'Trending' },
            { href: '/discover?sort=new', label: 'New Releases' },
            { href: '/premium', label: 'Premium' },
            { href: '/studio', label: 'Writing Studio' },
          ].map((l) => (
            <Link key={l.label} href={l.href} className="text-ivory/60 hover:text-gold transition-colors duration-300">
              {l.label}
            </Link>
          ))}
        </div>

        {/* Icons */}
        <div className="flex items-center justify-center gap-6">
          <Link href="/discover" className="text-ivory/40 hover:text-gold transition-colors duration-300">
            <BookOpen className="w-4 h-4" />
          </Link>
          <Link href="/studio" className="text-ivory/40 hover:text-gold transition-colors duration-300">
            <Feather className="w-4 h-4" />
          </Link>
          <Link href="/premium" className="text-ivory/40 hover:text-gold transition-colors duration-300">
            <Heart className="w-4 h-4" />
          </Link>
          <Link href="/login" className="text-ivory/40 hover:text-gold transition-colors duration-300">
            <Mail className="w-4 h-4" />
          </Link>
        </div>

        {/* Divider */}
        <div className="w-full max-w-md h-px bg-gradient-to-r from-transparent via-gold/20 to-transparent" />

        {/* Copyright */}
        <p className="text-ivory/30 text-[0.7rem] tracking-wider font-sans">
          © {new Date().getFullYear()} VENSOUL. Every story has a soul.
        </p>
      </div>
    </footer>
  );
}
