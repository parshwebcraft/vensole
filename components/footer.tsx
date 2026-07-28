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
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          
          {/* Column 1: Author Rhythm */}
          <div className="flex flex-col space-y-4">
            <div>
              <h3 className="font-serif text-3xl tracking-wide text-ivory mb-2">Rhythm</h3>
              <p className="text-gold text-xs tracking-wider uppercase font-sans mb-3">Principal Author & Creator</p>
              <p className="text-ivory/50 text-sm leading-relaxed font-serif italic max-w-xs">
                Writer of VENSOUL's featured emotional storytelling collection, including the romance novel "I Moved On. My Heart Didn't."
              </p>
            </div>
            <p className="text-ivory/30 text-[10px] font-sans">
              © {new Date().getFullYear()} Rhythm. All rights reserved.
            </p>
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <h4 className="text-xs tracking-[0.2em] uppercase text-gold mb-4 font-sans font-semibold">Quick Links</h4>
            <ul className="space-y-2.5">
              {[
                { href: '/discover', label: 'Discover Library' },
                { href: '/discover?sort=trending', label: 'Trending Books' },
                { href: '/faq', label: 'Help & FAQ' },
              ].map((l) => (
                <li key={l.label}>
                  <Link href={l.href} className="text-ivory/50 hover:text-gold transition-colors text-sm font-sans">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Legal Policies */}
          <div>
            <h4 className="text-xs tracking-[0.2em] uppercase text-gold mb-4 font-sans font-semibold">Legal & Trust</h4>
            <ul className="space-y-2.5">
              {[
                { href: '/privacy', label: 'Privacy Policy' },
                { href: '/terms', label: 'Terms & Conditions' },
                { href: '/disclaimer', label: 'Disclaimer' },
              ].map((l) => (
                <li key={l.label}>
                  <Link href={l.href} className="text-ivory/50 hover:text-gold transition-colors text-sm font-sans">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: Contact & Newsletter */}
          <div className="space-y-6">
            <div>
              <h4 className="text-xs tracking-[0.2em] uppercase text-gold mb-3 font-sans font-semibold">Contact Support</h4>
              <ul className="space-y-2">
                <li>
                  <Link href="/contact" className="text-ivory/50 hover:text-gold transition-colors text-sm font-sans block">
                    Contact Form
                  </Link>
                </li>
                <li>
                  <a href="mailto:support@vensoul.com" className="text-ivory/50 hover:text-gold transition-colors text-sm font-sans block">
                    support@vensoul.com
                  </a>
                </li>
              </ul>
            </div>

            {/* Newsletter Input */}
            <div className="space-y-3">
              <h4 className="text-xs tracking-[0.2em] uppercase text-gold font-sans font-semibold">Newsletter</h4>
              <form onSubmit={handleSubscribe} className="flex gap-2">
                <input
                  type="email"
                  required
                  placeholder="Your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-white/5 border border-gold/20 rounded-xl px-4 py-2 text-xs text-ivory placeholder:text-ivory/30 outline-none focus:border-gold transition-all w-full font-sans"
                />
                <button
                  type="submit"
                  className="btn-gold px-3.5 py-2 rounded-xl flex items-center justify-center text-midnight transition-all shrink-0"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </form>
            </div>
          </div>

        </div>

        {/* Bottom Accent Bar: Logo, Slogan, and Social Links */}
        <div className="border-t border-gold/10 pt-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <img src="/images/image.png" alt="VENSOUL" className="w-8 h-8 object-contain" />
            <div>
              <div className="font-serif text-lg tracking-wide">VENSOUL</div>
              <div className="text-[0.5rem] tracking-[0.25em] uppercase text-gold">Write • Feel • Connect</div>
            </div>
          </div>
          
          {/* Social Links */}
          <div className="flex items-center gap-4">
            <Link href="/discover" className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-ivory/50 hover:text-gold hover:bg-gold/10 transition-all duration-300">
              <BookOpen className="w-4 h-4" />
            </Link>
            <a href="mailto:support@vensoul.com" className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-ivory/50 hover:text-gold hover:bg-gold/10 transition-all duration-300">
              <Mail className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
