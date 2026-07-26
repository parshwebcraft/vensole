'use client';

import { useState, useEffect } from 'react';
import { Feather, ChevronRight, ChevronLeft, Sparkles, Check } from 'lucide-react';
import { supabase } from '@/lib/supabase';

const GENRES = [
  'Romance', 'Fantasy', 'Mystery', 'Poetry', 'Thriller',
  'Historical', 'Science Fiction', 'Horror', 'Drama',
  'Spiritual', 'Adventure', 'Literary Fiction'
];

const READING_MOODS = [
  'I like to cry 😢', 'I want to laugh 😂', 'I crave suspense 😰',
  'I seek inspiration 🌟', 'I want to escape 🌙', 'I love plot twists 🔀',
  'Romance always ❤️', 'Deep philosophical reads 🧠'
];

const READING_FREQUENCY = [
  'Every day', 'A few times a week', 'Weekends only', 'Whenever I find time'
];

interface OnboardingModalProps {
  userId: string;
  onComplete: () => void;
}

export function OnboardingModal({ userId, onComplete }: OnboardingModalProps) {
  const [step, setStep] = useState(0);
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [selectedMoods, setSelectedMoods] = useState<string[]>([]);
  const [readingFrequency, setReadingFrequency] = useState('');
  const [favoriteBook, setFavoriteBook] = useState('');
  const [bio, setBio] = useState('');
  const [adminQuestions, setAdminQuestions] = useState<any[]>([]);
  const [adminAnswers, setAdminAnswers] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await supabase
          .from('admin_questions')
          .select('*')
          .eq('is_active', true)
          .order('created_at');
        if (data) setAdminQuestions(data);
      } catch {}
    })();
  }, []);

  const totalSteps = 4 + (adminQuestions.length > 0 ? 1 : 0);

  const toggleGenre = (g: string) => {
    setSelectedGenres(prev =>
      prev.includes(g) ? prev.filter(x => x !== g) : prev.length < 5 ? [...prev, g] : prev
    );
  };

  const toggleMood = (m: string) => {
    setSelectedMoods(prev =>
      prev.includes(m) ? prev.filter(x => x !== m) : [...prev, m]
    );
  };

  const handleFinish = async () => {
    setSaving(true);
    try {
      await supabase
        .from('profiles')
        .update({
          bio: bio || null,
          preferences: {
            favorite_genres: selectedGenres,
            reading_moods: selectedMoods,
            reading_frequency: readingFrequency,
            favorite_book: favoriteBook,
            admin_answers: adminAnswers,
          },
          onboarding_completed: true,
        })
        .eq('id', userId);
    } catch {}
    setSaving(false);
    onComplete();
  };

  return (
    <div className="fixed inset-0 z-[100] bg-midnight/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-ivory rounded-3xl shadow-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-8 pb-0">
          <div className="flex items-center gap-2 mb-6">
            <Feather className="w-5 h-5 text-gold" />
            <span className="text-xs tracking-widest uppercase text-gold font-sans">Welcome to VENSOUL</span>
          </div>
          <div className="flex gap-2 mb-8">
            {Array.from({ length: totalSteps }).map((_, i) => (
              <div key={i} className={`h-1 flex-1 rounded-full transition-all duration-300 ${i <= step ? 'bg-gold' : 'bg-gold/20'}`} />
            ))}
          </div>
        </div>

        <div className="px-8 pb-8">
          {step === 0 && (
            <div>
              <h2 className="font-serif text-3xl text-midnight mb-2">Hello, Reader! 👋</h2>
              <p className="text-midnight/50 font-serif italic mb-6">Let us get to know you a little better to personalize your experience.</p>
              <label className="text-xs tracking-wider uppercase text-midnight/40 mb-2 block">Tell us about yourself (optional)</label>
              <textarea
                value={bio}
                onChange={e => setBio(e.target.value)}
                placeholder="I am a night owl who loves stories with unexpected endings..."
                rows={4}
                className="w-full bg-ivory/50 border border-gold/20 rounded-xl px-4 py-3 text-midnight placeholder:text-midnight/30 outline-none focus:border-gold transition-all font-serif resize-none"
              />
            </div>
          )}

          {step === 1 && (
            <div>
              <h2 className="font-serif text-3xl text-midnight mb-2">What genres do you love?</h2>
              <p className="text-midnight/50 text-sm mb-6">Pick up to 5 genres that excite you.</p>
              <div className="flex flex-wrap gap-2">
                {GENRES.map(g => (
                  <button key={g} onClick={() => toggleGenre(g)}
                    className={`px-4 py-2 rounded-full text-sm font-sans transition-all ${selectedGenres.includes(g) ? 'bg-gold text-white shadow-lg scale-105' : 'glass text-midnight/60 hover:text-gold border border-gold/20'}`}>
                    {selectedGenres.includes(g) && <Check className="w-3 h-3 inline mr-1" />}{g}
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 2 && (
            <div>
              <h2 className="font-serif text-3xl text-midnight mb-2">What mood do you read in?</h2>
              <p className="text-midnight/50 text-sm mb-6">Select all that apply.</p>
              <div className="flex flex-wrap gap-2">
                {READING_MOODS.map(m => (
                  <button key={m} onClick={() => toggleMood(m)}
                    className={`px-4 py-2 rounded-full text-sm font-sans transition-all ${selectedMoods.includes(m) ? 'bg-midnight text-ivory shadow-lg' : 'glass text-midnight/60 hover:text-midnight border border-gold/20'}`}>
                    {m}
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <div>
                <h2 className="font-serif text-3xl text-midnight mb-2">Your reading habits</h2>
                <p className="text-midnight/50 text-sm mb-4">How often do you read?</p>
                <div className="grid grid-cols-2 gap-3">
                  {READING_FREQUENCY.map(f => (
                    <button key={f} onClick={() => setReadingFrequency(f)}
                      className={`p-3 rounded-xl text-sm font-sans text-left transition-all border ${readingFrequency === f ? 'border-gold bg-gold/10 text-midnight' : 'border-gold/20 glass text-midnight/60'}`}>
                      {readingFrequency === f && <Check className="w-3 h-3 inline mr-1 text-gold" />}{f}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-xs tracking-wider uppercase text-midnight/40 mb-2 block">What is your all-time favorite book? (optional)</label>
                <input type="text" value={favoriteBook} onChange={e => setFavoriteBook(e.target.value)}
                  placeholder="e.g. Pride and Prejudice..."
                  className="w-full bg-ivory/50 border border-gold/20 rounded-xl px-4 py-3 text-midnight placeholder:text-midnight/30 outline-none focus:border-gold transition-all font-sans" />
              </div>
            </div>
          )}

          {step === 4 && adminQuestions.length > 0 && (
            <div className="space-y-6">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-5 h-5 text-gold" />
                <h2 className="font-serif text-3xl text-midnight">A few more questions</h2>
              </div>
              {adminQuestions.map(q => (
                <div key={q.id}>
                  <label className="text-sm font-medium text-midnight mb-2 block">{q.question}</label>
                  {q.type === 'text' && (
                    <input type="text" value={adminAnswers[q.id] || ''}
                      onChange={e => setAdminAnswers(prev => ({ ...prev, [q.id]: e.target.value }))}
                      placeholder="Your answer..."
                      className="w-full bg-ivory/50 border border-gold/20 rounded-xl px-4 py-3 text-midnight placeholder:text-midnight/30 outline-none focus:border-gold transition-all font-sans" />
                  )}
                  {q.type === 'textarea' && (
                    <textarea value={adminAnswers[q.id] || ''}
                      onChange={e => setAdminAnswers(prev => ({ ...prev, [q.id]: e.target.value }))}
                      placeholder="Your answer..." rows={3}
                      className="w-full bg-ivory/50 border border-gold/20 rounded-xl px-4 py-3 text-midnight placeholder:text-midnight/30 outline-none focus:border-gold transition-all font-serif resize-none" />
                  )}
                  {q.type === 'choice' && q.options && (
                    <div className="flex flex-wrap gap-2">
                      {q.options.map((opt: string) => (
                        <button key={opt} onClick={() => setAdminAnswers(prev => ({ ...prev, [q.id]: opt }))}
                          className={`px-4 py-2 rounded-full text-sm font-sans transition-all border ${adminAnswers[q.id] === opt ? 'border-gold bg-gold/10 text-midnight' : 'border-gold/20 glass text-midnight/60'}`}>
                          {adminAnswers[q.id] === opt && <Check className="w-3 h-3 inline mr-1 text-gold" />}{opt}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          <div className="flex items-center justify-between mt-8 pt-6 border-t border-gold/15">
            <button onClick={() => step > 0 && setStep(s => s - 1)}
              className={`flex items-center gap-2 text-sm text-midnight/40 hover:text-midnight transition-colors ${step === 0 ? 'invisible' : ''}`}>
              <ChevronLeft className="w-4 h-4" /> Back
            </button>
            {step < totalSteps - 1 ? (
              <button onClick={() => setStep(s => s + 1)} className="btn-gold px-6 py-2.5 rounded-xl flex items-center gap-2 relative text-sm">
                <span className="relative z-10">Continue</span>
                <ChevronRight className="w-4 h-4 relative z-10" />
              </button>
            ) : (
              <button onClick={handleFinish} disabled={saving} className="btn-gold px-6 py-2.5 rounded-xl text-sm relative disabled:opacity-60">
                <span className="relative z-10">{saving ? 'Saving...' : 'Start Reading ✨'}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
