'use client';

import Link from 'next/link';
import { Sparkles, TrendingUp, Clock, Star, Users, Quote, BookOpen, Feather, Award, PenLine } from 'lucide-react';
import { StoryCard } from '@/components/story-card';
import type { Story, Genre } from '@/lib/supabase';

const featuredQuotes = [
  { text: 'She was the kind of poem you read once and spend a lifetime trying to understand.', author: 'Elena Voss', story: 'The Moonlit Garden' },
  { text: 'Some souls are not meant to be understood, only felt.', author: 'Marcus Hale', story: 'Whispers in the Dark' },
  { text: 'The night does not ask why you are awake. It simply keeps you company.', author: 'Aria Chen', story: 'Midnight Letters' },
];

const challenges = [
  { title: 'Write a 100-word story about loss', participants: 1240, daysLeft: 5 },
  { title: 'Create a character who fears silence', participants: 876, daysLeft: 3 },
  { title: 'Begin a story with: "The letter arrived twelve years late."', participants: 2100, daysLeft: 7 },
];

export function HomeSections({
  trending,
  newReleases,
  continueReading,
  featuredAuthors,
  genres,
}: {
  trending: Story[];
  newReleases: Story[];
  continueReading: Story[];
  featuredAuthors: any[];
  genres: Genre[];
}) {
  return (
    <div className="relative z-10">
      {/* Trending */}
      <Section
        icon={<TrendingUp className="w-4 h-4" />}
        label="Trending Now"
        title="Stories the world is reading"
        href="/discover?sort=trending"
      >
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {trending.map((s, i) => (
            <StoryCard key={s.id} story={s} index={i} />
          ))}
        </div>
      </Section>

      {/* Genres */}
      <Section
        icon={<BookOpen className="w-4 h-4" />}
        label="Explore by Genre"
        title="Find your next obsession"
        href="/discover"
        bg="bg-gradient-to-b from-ivory-dark to-ivory"
      >
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {genres.map((g) => (
            <Link
              key={g.id}
              href={`/discover?genre=${g.slug}`}
              className="glass rounded-xl p-5 text-center hover:glow-gold transition-all duration-400 hover:scale-105 group"
            >
              <div
                className="w-12 h-12 rounded-full mx-auto mb-3 flex items-center justify-center transition-transform group-hover:scale-110"
                style={{ background: `${g.color}15` }}
              >
                <BookOpen className="w-5 h-5" style={{ color: g.color || '#C8A46A' }} />
              </div>
              <div className="font-serif text-lg text-midnight">{g.name}</div>
              <div className="text-xs text-midnight/40 mt-1 line-clamp-1">{g.description}</div>
            </Link>
          ))}
        </div>
      </Section>

      {/* Continue Reading */}
      {continueReading.length > 0 && (
        <Section
          icon={<Clock className="w-4 h-4" />}
          label="Continue Reading"
          title="Pick up where you left off"
          href="/discover"
        >
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {continueReading.map((s, i) => (
              <StoryCard key={s.id} story={s} index={i} />
            ))}
          </div>
        </Section>
      )}

      {/* New Releases */}
      <Section
        icon={<Sparkles className="w-4 h-4" />}
        label="Fresh Ink"
        title="Newly published stories"
        href="/discover?sort=new"
        bg="bg-gradient-to-b from-ivory to-ivory-dark"
      >
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {newReleases.map((s, i) => (
            <StoryCard key={s.id} story={s} index={i} />
          ))}
        </div>
      </Section>



    </div>
  );
}

function Section({
  icon,
  label,
  title,
  href,
  children,
  bg = 'bg-ivory',
}: {
  icon: React.ReactNode;
  label: string;
  title: string;
  href: string;
  children: React.ReactNode;
  bg?: string;
}) {
  return (
    <section className={`py-16 md:py-24 ${bg}`}>
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-end justify-between mb-10">
          <div>
            <div className="section-label flex items-center gap-2 mb-3">
              {icon}
              {label}
            </div>
            <h2 className="font-serif text-3xl md:text-5xl text-midnight">{title}</h2>
          </div>
          <Link
            href={href}
            className="hidden md:flex items-center gap-1 text-sm text-gold hover:translate-x-1 transition-transform font-sans"
          >
            View all →
          </Link>
        </div>
        {children}
      </div>
    </section>
  );
}
