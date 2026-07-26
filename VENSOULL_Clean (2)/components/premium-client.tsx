'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Crown, Check, Sparkles, Heart, BookOpen, Coins, Zap, Star } from 'lucide-react';

const plans = [
  {
    name: 'Reader',
    price: '$0',
    period: 'forever',
    description: 'For those beginning their journey',
    features: [
      'Read all public stories',
      'Bookmark & highlight',
      'Join book clubs',
      'Comment & like',
      'Basic reading themes',
    ],
    cta: 'Current Plan',
    isCurrent: true,
    accent: false,
  },
  {
    name: 'Premium',
    price: '$7.99',
    period: 'per month',
    description: 'For devoted readers & writers',
    features: [
      'Everything in Reader',
      'Exclusive premium stories',
      'Offline reading & downloads',
      'Text-to-speech narration',
      'Advanced AI writing tools',
      'Custom reading themes & fonts',
      'Reading analytics & goals',
      'No advertisements',
    ],
    cta: 'Go Premium',
    isCurrent: false,
    accent: true,
  },
  {
    name: 'Premium+',
    price: '$14.99',
    period: 'per month',
    description: 'For authors & connoisseurs',
    features: [
      'Everything in Premium',
      'AI character & world builder',
      'AI plot generator',
      'Priority publishing queue',
      'Author support & tips',
      'Premium chapter monetization',
      'Advanced writing analytics',
      'Early access to new features',
    ],
    cta: 'Go Premium+',
    isCurrent: false,
    accent: false,
  },
];

export function PremiumClient() {
  const [billing, setBilling] = useState<'monthly' | 'yearly'>('monthly');

  return (
    <div className="pt-24 pb-16">
      {/* Hero */}
      <div className="max-w-4xl mx-auto px-6 text-center mb-16">
        <div className="relative w-24 h-24 mx-auto mb-8">
          <div className="absolute inset-0 blur-2xl bg-gold/30 rounded-full animate-golden-pulse" />
          <div className="relative w-24 h-24 rounded-full bg-gradient-to-br from-gold-light via-gold to-bronze flex items-center justify-center animate-float">
            <Crown className="w-12 h-12 text-midnight" />
          </div>
        </div>

        <div className="section-label mb-4">VENSOUL Premium</div>
        <h1 className="font-serif text-5xl md:text-7xl text-midnight mb-4">
          Unlock the <span className="text-gradient-gold italic">Full Library</span>
        </h1>
        <p className="text-midnight/50 font-serif text-xl italic max-w-2xl mx-auto">
          Premium stories. Premium tools. A premium experience for those who live for the written word.
        </p>

        {/* Billing toggle */}
        <div className="inline-flex glass rounded-full p-1 mt-8">
          <button
            onClick={() => setBilling('monthly')}
            className={`px-6 py-2 rounded-full text-sm font-sans transition-all ${
              billing === 'monthly' ? 'bg-gold text-midnight' : 'text-midnight/50'
            }`}
          >
            Monthly
          </button>
          <button
            onClick={() => setBilling('yearly')}
            className={`px-6 py-2 rounded-full text-sm font-sans transition-all ${
              billing === 'yearly' ? 'bg-gold text-midnight' : 'text-midnight/50'
            }`}
          >
            Yearly <span className="text-xs text-peacock-green ml-1">Save 20%</span>
          </button>
        </div>
      </div>

      {/* Plans */}
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid md:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative rounded-2xl p-8 transition-all duration-500 ${
                plan.accent
                  ? 'glass border-2 border-gold/40 glow-gold scale-105'
                  : 'glass border border-gold/15'
              }`}
            >
              {plan.accent && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 btn-gold px-4 py-1.5 rounded-full text-xs">
                  <span className="relative z-10 flex items-center gap-1">
                    <Sparkles className="w-3 h-3" /> Most Popular
                  </span>
                </div>
              )}

              <div className="text-center mb-6">
                <h3 className="font-serif text-3xl text-midnight mb-2">{plan.name}</h3>
                <p className="text-sm text-midnight/40">{plan.description}</p>
              </div>

              <div className="text-center mb-6">
                <span className="font-serif text-5xl text-midnight">
                  {plan.price === '$0' ? plan.price : billing === 'yearly' ? `$${(parseFloat(plan.price.slice(1)) * 12 * 0.8).toFixed(0)}` : plan.price}
                </span>
                <span className="text-midnight/40 text-sm ml-2">
                  {plan.price === '$0' ? plan.period : billing === 'yearly' ? 'per year' : plan.period}
                </span>
              </div>

              <div className="space-y-3 mb-8">
                {plan.features.map((f) => (
                  <div key={f} className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-gold/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Check className="w-3 h-3 text-gold" />
                    </div>
                    <span className="text-sm text-midnight/70 font-sans">{f}</span>
                  </div>
                ))}
              </div>

              <button
                disabled={plan.isCurrent}
                className={`w-full py-3.5 rounded-xl transition-all relative ${
                  plan.isCurrent
                    ? 'bg-midnight/5 text-midnight/30 cursor-default'
                    : plan.accent
                    ? 'btn-gold'
                    : 'btn-outline-gold'
                }`}
              >
                {plan.isCurrent ? (
                  <span>Current Plan</span>
                ) : (
                  <span className="relative z-10">{plan.cta}</span>
                )}
              </button>
            </div>
          ))}
        </div>

        {/* Premium features showcase */}
        <div className="mt-20">
          <div className="text-center mb-12">
            <div className="section-label mb-3">Premium Perks</div>
            <h2 className="font-serif text-4xl text-midnight">What you get with Premium</h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: BookOpen, title: 'Exclusive Stories', desc: 'Access premium-only stories from top authors' },
              { icon: Crown, title: 'Author Support', desc: 'Tip your favorite writers directly' },
              { icon: Coins, title: 'Coin System', desc: 'Earn coins and unlock premium chapters' },
              { icon: Zap, title: 'AI Writing Tools', desc: 'Advanced AI for grammar, rewriting & more' },
              { icon: Star, title: 'Priority Features', desc: 'Early access to new features & tools' },
              { icon: Heart, title: 'Ad-Free Reading', desc: 'Pure, uninterrupted reading experience' },
              { icon: Sparkles, title: 'Custom Themes', desc: 'Premium reading themes & custom fonts' },
              { icon: BookOpen, title: 'Offline Reading', desc: 'Download stories and read anywhere' },
            ].map((perk) => (
              <div key={perk.title} className="glass rounded-xl p-6 hover:glow-gold transition-all duration-400 group">
                <div className="w-12 h-12 rounded-xl bg-gold/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <perk.icon className="w-6 h-6 text-gold" />
                </div>
                <h4 className="font-serif text-lg text-midnight mb-2">{perk.title}</h4>
                <p className="text-sm text-midnight/50">{perk.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="text-center mt-20">
          <div className="glass rounded-3xl p-12 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-gold/5 via-transparent to-peacock-blue/5" />
            <div className="relative z-10">
              <Crown className="w-12 h-12 text-gold mx-auto mb-6 animate-float" />
              <h2 className="font-serif text-4xl text-midnight mb-4">Ready to unlock every story?</h2>
              <p className="text-midnight/50 font-serif italic text-lg mb-8 max-w-xl mx-auto">
                Join thousands of readers and writers who have elevated their VENSOUL experience.
              </p>
              <Link href="/signup" className="btn-gold px-8 py-4 rounded-xl inline-flex items-center gap-2 relative">
                <Crown className="w-5 h-5 relative z-10" />
                <span className="relative z-10">Begin Premium</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
