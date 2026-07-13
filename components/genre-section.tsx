'use client'

import Link from 'next/link'
import { supabase } from '@/lib/supabase/client'
import {
  Wand2,
  Heart,
  Rocket,
  Search,
  Ghost,
  Zap,
  Compass,
  Castle,
  Star,
  Smartphone,
  Moon,
  Users,
  Sparkles,
  BookOpen,
  Smile,
  Drama,
  Flame,
  Feather,
  FileText,
  Pen,
  BookMarked,
} from 'lucide-react'

const genreIcons: Record<string, any> = {
  'fantasy': Wand2,
  'romance': Heart,
  'science-fiction': Rocket,
  'mystery': Search,
  'horror': Ghost,
  'thriller': Zap,
  'adventure': Compass,
  'historical-fiction': Castle,
  'young-adult': Star,
  'contemporary': Smartphone,
  'paranormal': Moon,
  'fan-fiction': Users,
  'poetry': Feather,
  'non-fiction': BookOpen,
  'humor': Smile,
  'drama': Drama,
  'action': Flame,
  'spiritual': Sparkles,
  'short-story': FileText,
  'essay': Pen,
  'memoir': BookMarked,
}

export async function GenreSection() {
  const { data: genres } = await supabase
    .from('genres')
    .select('*')
    .order('name')
    .limit(12)

  if (!genres || genres.length === 0) return null

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-serif font-bold">Browse by Genre</h2>
          <p className="text-muted-foreground mt-1">Find stories that match your interests</p>
        </div>
        <Link href="/genres" className="text-primary hover:underline text-sm font-medium">
          View all genres
        </Link>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
        {genres.map((genre) => {
          const Icon = genreIcons[genre.slug] || BookOpen
          const bgColor = genre.color || '#8B5CF6'
          
          let iconAnimClass = "transition-transform duration-500 ease-out"
          if (genre.slug === 'adventure') {
            iconAnimClass += " group-hover:rotate-[360deg] duration-[1000ms]"
          } else if (genre.slug === 'humor') {
            iconAnimClass += " group-hover:animate-bounce"
          } else {
            iconAnimClass += " group-hover:scale-110"
          }

          return (
            <Link
              key={genre.id}
              href={`/stories?genre=${genre.slug}`}
              className="group relative rounded-lg overflow-hidden border border-border/10 shadow-sm"
              onMouseEnter={() => {
                window.dispatchEvent(
                  new CustomEvent('vensoul-theme-change', {
                    detail: { theme: genre.slug }
                  })
                )
              }}
              onMouseLeave={() => {
                window.dispatchEvent(
                  new CustomEvent('vensoul-theme-change', {
                    detail: { theme: 'default' }
                  })
                )
              }}
            >
              {/* Interactive genre overlays */}
              {genre.slug === 'fantasy' && (
                <div className="genre-sparkles">
                  <span></span><span></span><span></span>
                </div>
              )}
              {genre.slug === 'action' && <div className="genre-flame" />}
              {genre.slug === 'romance' && (
                <div className="genre-petals">
                  <span></span><span></span>
                </div>
              )}
              {genre.slug === 'mystery' && <div className="genre-fog" />}
              {genre.slug === 'horror' && <div className="genre-smoke" />}

              <div
                className="aspect-square flex flex-col items-center justify-center p-4 text-center transition-all duration-300 group-hover:scale-[1.02]"
                style={{ backgroundColor: bgColor + '10' }}
              >
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center mb-3 transition-colors duration-300"
                  style={{ backgroundColor: bgColor + '25' }}
                >
                  <div className={iconAnimClass}>
                    <Icon className="h-6 w-6" style={{ color: bgColor }} />
                  </div>
                </div>
                <span className="font-medium text-sm line-clamp-2 text-foreground/90 font-serif">{genre.name}</span>
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
