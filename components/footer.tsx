'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Feather, Heart, BookOpen, Mail, Send } from 'lucide-react';

export function Footer() {
  const [email, setEmail] = useState('');

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    alert('Thank you for subscribing!');
    setEmail('');
  };

  return (
    <footer className="relative bg-midnight text-ivory py-16 px-6 overflow-hidden">
      {/* Top gold line accent */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/40 to-transparent" />
      <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full bg-gold/5 blur-[100px]" />

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
          
          {/* Left Column: Author Rhythm & Copyright */}
          <div className="flex flex-col justify-between h-full space-y-6">
            <div>
              <h3 className="font-serif text-3xl tracking-wide text-ivory mb-2">Rhythm</h3>
              <p className="text-gold text-xs tracking-wider uppercase font-sans mb-3">Principal Author & Creator</p>
              <p className="text-ivory/50 text-sm leading-relaxed font-serif italic max-w-sm">
                Writer of VENSOUL's featured emotional storytelling collection, including the romance novel "I Moved On. My Heart Didn't."
              </p>
            </div>
            <p className="text-ivory/30 text-xs font-sans">
              © {new Date().getFullYear()} Rhythm. All rights reserved.
            </p>
          </div>

          {/* Center Column: Links (Support, Contact, Quick Links) */}
          <div className="grid grid-cols-2 gap-8">
            <div>
              <h4 className="text-xs tracking-[0.2em] uppercase text-gold mb-4 font-sans font-semibold">Quick Links</h4>
              <ul className="space-y-2.5">
                {[
                  { href: '/discover', label: 'Discover' },
                  { href: '/discover?sort=trending', label: 'Trending' },
                  { href: '/discover?sort=new', label: 'New Releases' },
                  { href: '/premium', label: 'Premium' },
                ].map((l) => (
                  <li key={l.label}>
                    <Link href={l.href} className="text-ivory/50 hover:text-gold transition-colors text-sm font-sans">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-xs tracking-[0.2em] uppercase text-gold mb-4 font-sans font-semibold">Support & Contact</h4>
              <ul className="space-y-2.5">
                {[
                  { href: '/discover', label: 'Help & Support' },
                  { href: '/discover', label: 'Contact Us' },
                  { href: 'mailto:support@vensoul.com', label: 'support@vensoul.com' },
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

          {/* Right Column: Social Links, Logo, Newsletter */}
          <div className="space-y-6">
            {/* Logo and Brand */}
            <div className="flex items-center gap-3">
              <img src="/images/image.png" alt="VENSOUL" className="w-9 h-9 object-contain" />
              <div>
                <div className="font-serif text-xl tracking-wide">VENSOUL</div>
                <div className="text-[0.55rem] tracking-[0.25em] uppercase text-gold">Write • Feel • Connect</div>
              </div>
            </div>

            {/* Social Links */}
            <div className="flex items-center gap-5">
              <Link href="/discover" className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-ivory/50 hover:text-gold hover:bg-gold/10 transition-all duration-300">
                <BookOpen className="w-4 h-4" />
              </Link>
              <Link href="/studio" className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-ivory/50 hover:text-gold hover:bg-gold/10 transition-all duration-300">
                <Feather className="w-4 h-4" />
              </Link>
              <Link href="/premium" className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-ivory/50 hover:text-gold hover:bg-gold/10 transition-all duration-300">
                <Heart className="w-4 h-4" />
              </Link>
              <Link href="/login" className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-ivory/50 hover:text-gold hover:bg-gold/10 transition-all duration-300">
                <Mail className="w-4 h-4" />
              </Link>
            </div>

            {/* Newsletter Input */}
            <div className="space-y-3">
              <h4 className="text-xs tracking-[0.2em] uppercase text-gold font-sans font-semibold">Join the Newsletter</h4>
              <form onSubmit={handleSubscribe} className="flex gap-2">
                <input
                  type="email"
                  required
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-white/5 border border-gold/20 rounded-xl px-4 py-2.5 text-sm text-ivory placeholder:text-ivory/30 outline-none focus:border-gold transition-all w-full font-sans"
                />
                <button
                  type="submit"
                  className="btn-gold px-4 py-2.5 rounded-xl flex items-center justify-center text-midnight transition-all shrink-0"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
              <p className="text-[0.65rem] text-ivory/30 leading-relaxed font-sans">
                Subscribe to get notified about new chapters and stories.
              </p>
            </div>
          </div>

        </div>
      </div>
    </footer>
  );
}
