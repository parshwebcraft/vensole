'use client';

import Link from 'next/link';
import { Feather, Heart, BookOpen, Mail } from 'lucide-react';

export function Footer() {
  return (
    <footer className="relative bg-midnight text-ivory py-16 px-6 overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold to-transparent" />
      <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full bg-gold/5 blur-[100px]" />

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="grid md:grid-cols-4 gap-12 mb-12">
          {/* Brand */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-3 mb-4">
              <img src="/images/image.png" alt="VENSOUL" className="w-10 h-10 object-contain" />
              <div>
                <div className="font-serif text-2xl">VENSOUL</div>
                <div className="text-[0.55rem] tracking-[0.3em] uppercase text-gold">Write • Feel • Connect</div>
              </div>
            </div>
            <p className="text-ivory/40 text-sm leading-relaxed font-serif italic">
              An emotional storytelling ecosystem where stories have souls.
            </p>
          </div>

          {/* Explore */}
          <div>
            <h4 className="text-xs tracking-[0.2em] uppercase text-gold mb-4 font-sans">Explore</h4>
            <ul className="space-y-2">
              {[
                { href: '/discover', label: 'Discover' },
                { href: '/discover?sort=trending', label: 'Trending' },
                { href: '/discover?sort=new', label: 'New Releases' },
                { href: '/premium', label: 'Premium' },
              ].map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-ivory/50 hover:text-gold transition-colors text-sm font-sans">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Create */}
          <div>
            <h4 className="text-xs tracking-[0.2em] uppercase text-gold mb-4 font-sans">Create</h4>
            <ul className="space-y-2">
              {[
                { href: '/studio', label: 'Writing Studio' },
                { href: '/studio', label: 'Drafts' },
                { href: '/studio', label: 'Publish' },
                { href: '/profile', label: 'My Profile' },
              ].map((l) => (
                <li key={l.label}>
                  <Link href={l.href} className="text-ivory/50 hover:text-gold transition-colors text-sm font-sans">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* About */}
          <div>
            <h4 className="text-xs tracking-[0.2em] uppercase text-gold mb-4 font-sans">About</h4>
            <ul className="space-y-2">
              {[
                { href: '/discover', label: 'Our Mission' },
                { href: '/discover', label: 'Community' },
                { href: '/discover', label: 'Book Clubs' },
                { href: '/discover', label: 'Contact' },
              ].map((l) => (
                <li key={l.label}>
                  <Link href={l.href} className="text-ivory/50 hover:text-gold transition-colors text-sm font-sans">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="ink-divider mb-8" />

        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-ivory/30 text-xs font-sans">
            © {new Date().getFullYear()} VENSOUL. Every story has a soul.
          </p>
          <div className="flex items-center gap-6">
            <Link href="/discover" className="text-ivory/40 hover:text-gold transition-colors">
              <BookOpen className="w-4 h-4" />
            </Link>
            <Link href="/studio" className="text-ivory/40 hover:text-gold transition-colors">
              <Feather className="w-4 h-4" />
            </Link>
            <Link href="/premium" className="text-ivory/40 hover:text-gold transition-colors">
              <Heart className="w-4 h-4" />
            </Link>
            <Link href="/login" className="text-ivory/40 hover:text-gold transition-colors">
              <Mail className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
