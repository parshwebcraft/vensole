'use client'

import { supabase } from '@/lib/supabase/client'
import { Genre } from '@/lib/types/database'
import { Card, CardContent } from '@/components/ui/card'
import { BookOpen } from 'lucide-react'
import Link from 'next/link'

const genreIcons: Record<string, any> = {
  'fantasy': '\u2728',
  'romance': '\u2764',
  'science-fiction': '\uD83D\uDE80',
  'mystery': '\uD83D\uDD3A',
  'horror': '\uD83C\uDF7B',
  'thriller': '\u26A1',
  'adventure': '\uD83E\uDDEE',
  'historical-fiction': '\uD83C\uDFF0',
  'young-adult': '\u2B50',
  'contemporary': '\uD83D\uDCF1',
  'paranormal': '\uD83C\uDF19',
  'fan-fiction': '\uD83D\uDC65',
  'poetry': '\u2712',
  'non-fiction': '\uD83D\uDCD6',
  'humor': '\uD83D\uDE00',
  'drama': '\uD83D\uDCAB',
  'action': '\uD83D\uDD25',
  'spiritual': '\u2728',
  'short-story': '\uD83D\uDCDD',
  'essay': '\u270F',
  'memoir': '\uD83D\uDCDA',
}

export async function GenreGrid() {
  const { data: genres } = await supabase
    .from('genres')
    .select('*')
    .order('name')

  if (!genres || genres.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
        <p>No genres available</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
      {genres.map((genre) => (
        <Link
          key={genre.id}
          href={`/stories?genre=${genre.slug}`}
          className="group"
        >
          <Card className="h-full card-hover overflow-hidden">
            <CardContent className="p-6 text-center">
              <div
                className="h-14 w-14 mx-auto rounded-full flex items-center justify-center text-3xl mb-3"
                style={{ backgroundColor: (genre.color || '#8B5CF6') + '20' }}
              >
                {genreIcons[genre.slug] || '\uD83D\uDCD6'}
              </div>
              <h3 className="font-semibold group-hover:text-primary transition-colors">
                {genre.name}
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                {(genre.story_count || 0).toLocaleString()} stories
              </p>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  )
}
