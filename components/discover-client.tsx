'use client';

import { useState, useMemo } from 'react';
import { Search, SlidersHorizontal, Grid3x3, List, Heart, Eye, BookOpen } from 'lucide-react';
import { StoryCard } from '@/components/story-card';
import type { Story, Genre } from '@/lib/supabase';

const moods = [
  { label: 'Melancholic', emoji: '🌧' },
  { label: 'Hopeful', emoji: '✨' },
  { label: 'Romantic', emoji: '❤' },
  { label: 'Adventurous', emoji: '🗺' },
  { label: 'Mysterious', emoji: '🌙' },
  { label: 'Whimsical', emoji: '🦋' },
  { label: 'Dark', emoji: '🕯' },
  { label: 'Peaceful', emoji: '🍃' },
];

export function DiscoverClient({ stories, genres }: { stories: Story[]; genres: Genre[] }) {
  const [query, setQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'trending' | 'new' | 'likes'>('trending');
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [selectedMood, setSelectedMood] = useState<string | null>(null);

  const filtered = useMemo(() => {
    let result = [...stories];

    if (query) {
      const q = query.toLowerCase();
      result = result.filter(
        (s) =>
          s.title.toLowerCase().includes(q) ||
          s.description?.toLowerCase().includes(q) ||
          s.profiles?.username?.toLowerCase().includes(q)
      );
    }

    if (sortBy === 'trending') result.sort((a, b) => b.views_count - a.views_count);
    if (sortBy === 'new') result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    if (sortBy === 'likes') result.sort((a, b) => b.likes_count - a.likes_count);

    return result;
  }, [stories, query, sortBy]);

  return (
    <div className="pt-24 pb-16">
      {/* Hero header */}
      <div className="max-w-7xl mx-auto px-6 mb-12">
        <div className="text-center mb-12">
          <div className="section-label mb-3">Discover</div>
          <h1 className="font-serif text-5xl md:text-7xl text-midnight mb-4">
            Explore the <span className="text-gradient-gold italic">Library</span>
          </h1>
          <p className="text-midnight/50 font-serif text-xl italic max-w-2xl mx-auto">
            Thousands of stories, waiting to be felt.
          </p>
        </div>

        {/* Search bar */}
        <div className="max-w-2xl mx-auto mb-8">
          <div className="glass rounded-2xl p-2 flex items-center gap-2 focus-within:glow-gold transition-all duration-400">
            <Search className="w-5 h-5 text-midnight/30 ml-3" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by title, author, or keyword..."
              className="flex-1 bg-transparent outline-none px-3 py-3 text-midnight placeholder:text-midnight/30 font-sans"
            />
            <button className="btn-gold px-5 py-2.5 rounded-xl">
              <span className="relative z-10">Search</span>
            </button>
          </div>
        </div>

        {/* Mood filter */}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {moods.map((m) => (
            <button
              key={m.label}
              onClick={() => setSelectedMood(selectedMood === m.label ? null : m.label)}
              className={`px-4 py-2 rounded-full text-sm font-sans transition-all duration-300 ${
                selectedMood === m.label
                  ? 'bg-gold text-midnight glow-gold'
                  : 'glass text-midnight/60 hover:text-gold'
              }`}
            >
              {m.emoji} {m.label}
            </button>
          ))}
        </div>

        {/* Genre pills */}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          <button
            onClick={() => setSelectedGenre(null)}
            className={`px-4 py-1.5 rounded-full text-xs font-sans transition-all ${
              !selectedGenre ? 'bg-midnight text-ivory' : 'glass text-midnight/50 hover:text-gold'
            }`}
          >
            All Genres
          </button>
          {genres.map((g) => (
            <button
              key={g.id}
              onClick={() => setSelectedGenre(g.slug)}
              className={`px-4 py-1.5 rounded-full text-xs font-sans transition-all ${
                selectedGenre === g.slug ? 'bg-midnight text-ivory' : 'glass text-midnight/50 hover:text-gold'
              }`}
            >
              {g.name}
            </button>
          ))}
        </div>

        {/* Sort & View */}
        <div className="flex items-center justify-between flex-wrap gap-4 mb-8">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-midnight/40" />
            {(['trending', 'new', 'likes'] as const).map((s) => (
              <button
                key={s}
                onClick={() => setSortBy(s)}
                className={`px-3 py-1.5 rounded-lg text-xs font-sans capitalize transition-all ${
                  sortBy === s ? 'text-gold bg-gold/10' : 'text-midnight/40 hover:text-midnight'
                }`}
              >
                {s === 'likes' ? 'Most Loved' : s}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-1 glass rounded-lg p-1">
            <button
              onClick={() => setView('grid')}
              className={`p-1.5 rounded ${view === 'grid' ? 'bg-gold/20 text-gold' : 'text-midnight/30'}`}
            >
              <Grid3x3 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setView('list')}
              className={`p-1.5 rounded ${view === 'list' ? 'bg-gold/20 text-gold' : 'text-midnight/30'}`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="max-w-7xl mx-auto px-6">
        {filtered.length === 0 ? (
          <div className="text-center py-20">
            <div className="font-serif text-2xl text-midnight/40 italic">No stories found. Try a different search.</div>
          </div>
        ) : view === 'grid' ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filtered.map((s, i) => (
              <StoryCard key={s.id} story={s} index={i} />
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map((s) => (
              <div key={s.id} className="glass rounded-xl p-4 flex gap-4 hover:glow-gold transition-all duration-400">
                <div className="w-20 h-28 rounded-lg overflow-hidden flex-shrink-0">
                  <img src={s.cover_url || `https://picsum.photos/seed/${s.slug}/200/280`} alt={s.title} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-serif text-xl text-midnight truncate">{s.title}</h3>
                  <p className="text-sm text-midnight/50">by {s.profiles?.display_name || s.profiles?.username}</p>
                  <p className="text-sm text-midnight/40 mt-1 line-clamp-2">{s.description || 'No description available.'}</p>
                  <div className="flex items-center gap-4 mt-2 text-xs text-midnight/40">
                    <span className="flex items-center gap-1"><Eye className="w-3 h-3" />{s.views_count.toLocaleString()}</span>
                    <span className="flex items-center gap-1"><Heart className="w-3 h-3" />{s.likes_count.toLocaleString()}</span>
                    <span className="flex items-center gap-1"><BookOpen className="w-3 h-3" />{s.chapter_count} chapters</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
