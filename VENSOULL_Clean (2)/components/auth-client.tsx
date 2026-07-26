'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Feather, Mail, Lock, User, Eye, EyeOff, ArrowRight, AlertCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { OnboardingModal } from '@/components/onboarding-modal';

export function AuthClient({ mode }: { mode: 'login' | 'signup' }) {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newUserId, setNewUserId] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getUser();
      if (data.user) router.push('/profile');
    })();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (mode === 'signup') {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
        });
        if (error) throw error;

        if (data.user) {
          await supabase.from('profiles').upsert({
            id: data.user.id,
            username: username || email.split('@')[0],
            display_name: username || email.split('@')[0],
          });
          // Show onboarding modal instead of redirecting
          setNewUserId(data.user.id);
          return;
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        router.push('/profile');
      }
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {newUserId && (
        <OnboardingModal userId={newUserId} onComplete={() => router.push('/profile')} />
      )}
      <div className="pt-24 pb-16 min-h-screen flex items-center">
      <div className="max-w-md mx-auto w-full px-6">
        {/* Logo */}
        <div className="text-center mb-10">
          <div className="relative w-20 h-20 mx-auto mb-6">
            <div className="absolute inset-0 blur-2xl bg-gold/20 rounded-full" />
            <img src="/images/image.png" alt="VENSOUL" className="w-20 h-20 object-contain relative z-10 animate-float" />
          </div>
          <h1 className="font-serif text-4xl text-midnight mb-2">
            {mode === 'login' ? 'Welcome Back' : 'Begin Your Journey'}
          </h1>
          <p className="text-midnight/50 font-serif italic">
            {mode === 'login' ? 'The library has missed you.' : 'Every story begins with a single page.'}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="glass rounded-2xl p-8 space-y-5">
          {mode === 'signup' && (
            <div>
              <label className="text-xs tracking-wider uppercase text-midnight/40 mb-2 block">Username</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-midnight/30" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="yourname"
                  required
                  className="w-full bg-ivory/50 border border-gold/20 rounded-xl pl-10 pr-4 py-3 text-midnight placeholder:text-midnight/30 outline-none focus:border-gold focus:glow-gold transition-all font-sans"
                />
              </div>
            </div>
          )}

          <div>
            <label className="text-xs tracking-wider uppercase text-midnight/40 mb-2 block">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-midnight/30" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="w-full bg-ivory/50 border border-gold/20 rounded-xl pl-10 pr-4 py-3 text-midnight placeholder:text-midnight/30 outline-none focus:border-gold focus:glow-gold transition-all font-sans"
              />
            </div>
          </div>

          <div>
            <label className="text-xs tracking-wider uppercase text-midnight/40 mb-2 block">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-midnight/30" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                minLength={6}
                className="w-full bg-ivory/50 border border-gold/20 rounded-xl pl-10 pr-10 py-3 text-midnight placeholder:text-midnight/30 outline-none focus:border-gold focus:glow-gold transition-all font-sans"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-midnight/30 hover:text-gold transition-colors"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 rounded-lg p-3">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full btn-gold py-3.5 rounded-xl flex items-center justify-center gap-2 disabled:opacity-50 relative"
          >
            {loading ? (
              <span className="relative z-10">Loading...</span>
            ) : (
              <>
                <span className="relative z-10">{mode === 'login' ? 'Sign In' : 'Create Account'}</span>
                <ArrowRight className="w-4 h-4 relative z-10" />
              </>
            )}
          </button>

          {mode === 'login' && (
            <div className="text-center">
              <button type="button" className="text-xs text-gold hover:underline">
                Forgot your password?
              </button>
            </div>
          )}
        </form>

        {/* Switch */}
        <div className="text-center mt-6">
          <p className="text-sm text-midnight/50 font-sans">
            {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
            <Link
              href={mode === 'login' ? '/signup' : '/login'}
              className="text-gold hover:underline font-medium"
            >
              {mode === 'login' ? 'Sign up' : 'Sign in'}
            </Link>
          </p>
        </div>

        {/* Decorative */}
        <div className="flex items-center justify-center gap-3 mt-8 text-midnight/20">
          <div className="h-px w-12 bg-gold/20" />
          <Feather className="w-4 h-4 text-gold/30" />
          <div className="h-px w-12 bg-gold/20" />
        </div>
      </div>
      </div>
    </>
  );
}
