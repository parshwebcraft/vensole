'use client';

import Link from 'next/link';
import { Heart, Eye, BookOpen, Crown } from 'lucide-react';
import type { Story } from '@/lib/supabase';

const fallbackCovers = [
  'https://images.pexels.com/photos/235985/pexels-photo-235985.jpeg',
  'https://images.pexels.com/photos/1033493/pexels-photo-1033493.jpeg',
  'https://images.pexels.com/photos/1232552/pexels-photo-1232552.jpeg',
  'https://images.pexels.com/photos/1907785/pexels-photo-1907785.jpeg',
  'https://images.pexels.com/photos/2901727/pexels-photo-2901727.jpeg',
  'https://images.pexels.com/photos/3752834/pexels-photo-3752834.jpeg',
  'https://images.pexels.com/photos/3251650/pexels-photo-3251650.jpeg',
  'https://images.pexels.com/photos/459657/pexels-photo-459657.jpeg',
];

export function StoryCard({ story, index = 0 }: { story: Story; index?: number }) {
  const cover = story.cover_url || fallbackCovers[index % fallbackCovers.length];

  return (
    <Link href={`/read/${story.slug}`} className="story-card group block overflow-hidden relative">
      {/* Cover */}
      <div className="relative aspect-[3/4] overflow-hidden rounded-t-xl bg-midnight flex items-center justify-center">
        {/* Blurred Background */}
        <img
          src={cover}
          alt=""
          className="absolute inset-0 w-full h-full object-cover blur-xl opacity-40 scale-125 select-none pointer-events-none"
        />
        {/* Contained Crisp Cover */}
        <img
          src={cover}
          alt={story.title}
          className="relative z-10 max-h-full max-w-full object-contain transition-transform duration-700 group-hover:scale-[1.03]"
        />
        <div className="absolute inset-0 z-20 bg-gradient-to-t from-midnight/90 via-midnight/10 to-transparent pointer-events-none" />

        {/* Premium badge */}
        {story.is_premium && (
          <div className="absolute top-3 left-3 glass-dark px-2 py-1 rounded-md flex items-center gap-1">
            <Crown className="w-3 h-3 text-gold" />
            <span className="text-[0.6rem] uppercase tracking-wider text-gold font-sans">Premium</span>
          </div>
        )}

        {/* Ribbon bookmark */}
        {story.is_featured && (
          <div className="ribbon h-12" />
        )}

        {/* Title overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-4 z-30">
          <h3 className="font-serif text-xl text-ivory leading-tight mb-1 line-clamp-2">{story.title}</h3>
          {story.profiles && (
            <p className="text-xs text-ivory/60 font-sans">by {story.profiles.display_name || story.profiles.username}</p>
          )}
        </div>
      </div>

      {/* Meta */}
      <div className="p-3 flex items-center justify-between text-xs text-midnight/50 font-sans">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1">
            <Eye className="w-3 h-3" />
            {story.views_count.toLocaleString()}
          </span>
          <span className="flex items-center gap-1">
            <Heart className="w-3 h-3" />
            {story.likes_count.toLocaleString()}
          </span>
          <span className="flex items-center gap-1">
            <BookOpen className="w-3 h-3" />
            {story.chapter_count}
          </span>
        </div>
        <span className="text-gold capitalize">{story.status}</span>
      </div>
    </Link>
  );
}
