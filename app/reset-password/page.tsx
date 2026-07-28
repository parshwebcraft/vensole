'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Navigation } from '@/components/navigation';
import { GoldenParticles } from '@/components/golden-particles';
import { Footer } from '@/components/footer';
import { Lock, Eye, EyeOff, ArrowRight, AlertCircle, CheckCircle, Feather } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    // Verify that we actually have a session (user clicked reset link)
    (async () => {
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        toast.error('Session expired or invalid link. Please request a new link.');
        router.push('/login');
      }
    })();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      setLoading(false);
      return;
    }

    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      setSuccess(true);
      toast.success('Password updated successfully');
      setTimeout(() => {
        router.push('/profile');
      }, 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to update password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="relative min-h-screen bg-ivory paper-texture flex flex-col justify-between">
      <GoldenParticles count={15} />
      <Navigation />

      <div className="pt-32 pb-20 flex-1 flex items-center">
        <div className="max-w-md mx-auto w-full px-6">
          {/* Logo & Title */}
          <div className="text-center mb-10">
            <div className="relative w-20 h-20 mx-auto mb-6">
              <div className="absolute inset-0 blur-2xl bg-gold/20 rounded-full" />
              <img src="/images/image.png" alt="VENSOUL" className="w-20 h-20 object-contain relative z-10 animate-float" />
            </div>
            <h1 className="font-serif text-4xl text-midnight mb-2">Create New Password</h1>
            <p className="text-midnight/50 font-serif italic">Enter your new secure password below.</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="glass rounded-2xl p-8 space-y-5 shadow-soft border border-gold/15">
            {success ? (
              <div className="space-y-4 text-center py-4">
                <div className="w-12 h-12 bg-green-50 border border-green-200 rounded-full flex items-center justify-center mx-auto text-green-600">
                  <CheckCircle className="w-6 h-6" />
                </div>
                <h3 className="font-serif text-xl text-midnight font-medium">Password Updated!</h3>
                <p className="text-sm text-midnight/50 font-sans">
                  Your password has been changed successfully. You will be redirected to your profile shortly.
                </p>
              </div>
            ) : (
              <>
                <div>
                  <label className="text-xs tracking-wider uppercase text-midnight/40 mb-2 block">New Password</label>
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

                <div>
                  <label className="text-xs tracking-wider uppercase text-midnight/40 mb-2 block">Confirm Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-midnight/30" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      minLength={6}
                      className="w-full bg-ivory/50 border border-gold/20 rounded-xl pl-10 pr-10 py-3 text-midnight placeholder:text-midnight/30 outline-none focus:border-gold focus:glow-gold transition-all font-sans"
                    />
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
                  className="w-full btn-gold py-3.5 rounded-xl flex items-center justify-center gap-2 disabled:opacity-50 relative font-sans font-semibold text-xs tracking-wider uppercase"
                >
                  {loading ? (
                    <span className="relative z-10">Updating...</span>
                  ) : (
                    <>
                      <span className="relative z-10">Update Password</span>
                      <ArrowRight className="w-4 h-4 relative z-10" />
                    </>
                  )}
                </button>
              </>
            )}
          </form>

          {/* Decorative */}
          <div className="flex items-center justify-center gap-3 mt-8 text-midnight/20">
            <div className="h-px w-12 bg-gold/20" />
            <Feather className="w-4 h-4 text-gold/30" />
            <div className="h-px w-12 bg-gold/20" />
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}
