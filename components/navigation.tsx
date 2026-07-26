'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, Feather, BookOpen, Compass, PenLine, User, Crown, Search } from 'lucide-react';
import { supabase } from '@/lib/supabase';

const navLinks = [
  { href: '/', label: 'Home', icon: BookOpen },
  { href: '/discover', label: 'Discover', icon: Compass },
  { href: '/studio', label: 'Studio', icon: PenLine },
  { href: '/premium', label: 'Premium', icon: Crown },
];

export function Navigation() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getUser();
      setUser(data.user);
    })();
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled ? 'glass shadow-soft py-2' : 'bg-transparent py-4'
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative w-10 h-10 flex items-center justify-center">
              <img src="/images/image.png" alt="VENSOUL" className="w-10 h-10 object-contain transition-transform duration-500 group-hover:scale-110" />
            </div>
            <div className="flex flex-col leading-none">
              <span className="font-serif text-2xl font-semibold tracking-wide text-midnight">VENSOUL</span>
              <span className="text-[0.55rem] tracking-[0.3em] uppercase text-gold font-sans">Write • Feel • Connect</span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const active = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-4 py-2 rounded-lg text-sm font-sans font-medium transition-all duration-300 flex items-center gap-2 ${
                    active
                      ? 'text-gold bg-gold/5'
                      : 'text-midnight/70 hover:text-gold hover:bg-gold/5'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {link.label}
                </Link>
              );
            })}
          </div>

          {/* Right Actions */}
          <div className="hidden md:flex items-center gap-3">
            <Link
              href="/discover"
              className="w-9 h-9 rounded-full flex items-center justify-center text-midnight/60 hover:text-gold hover:bg-gold/5 transition-all duration-300"
            >
              <Search className="w-4 h-4" />
            </Link>
            {user ? (
              <Link
                href="/profile"
                className="w-9 h-9 rounded-full bg-gold/10 border border-gold/30 flex items-center justify-center text-gold hover:bg-gold/20 transition-all duration-300"
              >
                <User className="w-4 h-4" />
              </Link>
            ) : (
              <>
                <Link href="/login" className="btn-outline-gold px-5 py-2 rounded-lg">
                  Sign In
                </Link>
                <Link href="/signup" className="btn-gold px-5 py-2 rounded-lg relative z-10">
                  <span className="relative z-10">Begin</span>
                </Link>
              </>
            )}
          </div>

          {/* Mobile toggle */}
          <button
            className="md:hidden w-10 h-10 flex items-center justify-center text-midnight"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="md:hidden glass mt-2 mx-4 rounded-2xl p-4 animate-scale-in">
            {navLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-lg text-midnight hover:bg-gold/5 hover:text-gold transition-colors"
                >
                  <Icon className="w-4 h-4" />
                  <span className="font-sans text-sm">{link.label}</span>
                </Link>
              );
            })}
            <div className="ink-divider my-3" />
            {!user && (
              <div className="flex gap-2">
                <Link href="/login" onClick={() => setMobileOpen(false)} className="flex-1 btn-outline-gold px-4 py-2.5 rounded-lg text-center">
                  Sign In
                </Link>
                <Link href="/signup" onClick={() => setMobileOpen(false)} className="flex-1 btn-gold px-4 py-2.5 rounded-lg text-center">
                  <span className="relative z-10">Begin</span>
                </Link>
              </div>
            )}
          </div>
        )}
      </nav>
    </>
  );
}
