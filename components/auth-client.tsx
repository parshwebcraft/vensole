'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Feather, Mail, Lock, User, Eye, EyeOff, ArrowRight, AlertCircle, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import { OnboardingModal } from '@/components/onboarding-modal';

function isDisposableEmail(email: string) {
  const disposableKeywords = [
    'tempmail', 'temp-mail', 'mailinator', 'yopmail', '10minutemail',
    'guerrillamail', 'dispostable', 'getairmail', 'throwawaymail',
    'tempmailaddress', 'sharklasers', 'guerillamail', 'guerrillamailblock',
    'pokemail', 'burnermail', 'trashmail', 'spambox', 'maildrop', 
    'tempail', 'fakeinbox', 'moakt', 'tuta', 'spamex', 'mailnesia', 
    'mytemp.email', 'disposable', 'anonymousemail', 'inboxkitten', 
    'generator', 'crazymailing', 'boun.cr', 'armyspy', 'cuvox', 
    'dayrep', 'fleckens', 'gustr', 'superrito', 'teleworm', 'trbvm',
    'jetable', 'disposable', 'zillamail', 'mailtemporaire', 'yopmail'
  ];
  const domain = email.split('@')[1]?.toLowerCase();
  if (!domain) return false;
  return disposableKeywords.some(keyword => domain.includes(keyword));
}

export function AuthClient({ mode }: { mode: 'login' | 'signup' }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams?.get('redirect') || '/profile';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [newUserId, setNewUserId] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getUser();
      if (data.user) router.push(redirectTo);
    })();
  }, [router, redirectTo]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);
    setLoading(true);

    if (isForgotPassword) {
      try {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/reset-password`,
        });
        if (error) throw error;
        setSuccessMessage('A password recovery link has been sent to your email address.');
        toast.success('Recovery link sent successfully');
      } catch (err: any) {
        setError(err.message || 'Failed to send recovery link.');
        toast.error(err.message || 'Failed to send link');
      } finally {
        setLoading(false);
      }
      return;
    }

    if (mode === 'signup' && isDisposableEmail(email)) {
      setError('Temporary/disposable email addresses are not allowed. Please use a valid personal email.');
      setLoading(false);
      return;
    }

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
        router.push(redirectTo);
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
              {isForgotPassword ? 'Reset Password' : mode === 'login' ? 'Welcome Back' : 'Begin Your Journey'}
            </h1>
            <p className="text-midnight/50 font-serif italic">
              {isForgotPassword ? 'Enter your email to retrieve your key.' : mode === 'login' ? 'The library has missed you.' : 'Every story begins with a single page.'}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="glass rounded-2xl p-8 space-y-5 shadow-soft border border-gold/15">
            
            {successMessage && (
              <div className="flex items-start gap-2 text-sm text-green-700 bg-green-50 rounded-xl p-4 border border-green-200">
                <CheckCircle className="w-4.5 h-4.5 flex-shrink-0 text-green-600 mt-0.5" />
                <span>{successMessage}</span>
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

            {!isForgotPassword && mode === 'signup' && (
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

            {!isForgotPassword && (
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
            )}

            {error && (
              <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 rounded-lg p-3">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-gold py-3.5 rounded-xl flex items-center justify-center gap-2 disabled:opacity-50 relative font-sans font-semibold text-xs tracking-wider uppercase"
            >
              {loading ? (
                <span className="relative z-10">Loading...</span>
              ) : (
                <>
                  <span className="relative z-10">
                    {isForgotPassword ? 'Send Recovery Link' : mode === 'login' ? 'Sign In' : 'Create Account'}
                  </span>
                  <ArrowRight className="w-4 h-4 relative z-10" />
                </>
              )}
            </button>

            {mode === 'login' && (
              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsForgotPassword(!isForgotPassword);
                    setError(null);
                    setSuccessMessage(null);
                  }}
                  className="text-xs text-gold hover:underline font-sans font-medium"
                >
                  {isForgotPassword ? 'Back to Sign In' : 'Forgot your password?'}
                </button>
              </div>
            )}
          </form>

          {/* Switch */}
          {!isForgotPassword && (
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
          )}

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
