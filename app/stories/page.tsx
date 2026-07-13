'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import { SiteHeader } from '@/components/site-header'
import { StoryCard } from '@/components/story-card'
import { StoryWithRelations } from '@/lib/types/database'
import { getMockStories } from '@/lib/mock-stories'

import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Search, Filter, Grid3x3, List, Loader2 } from 'lucide-react'

const sortOptions = [
  { value: 'popular', label: 'Most Popular' },
  { value: 'recent', label: 'Recently Updated' },
  { value: 'new', label: 'Newly Published' },
  { value: 'likes', label: 'Most Liked' },
  { value: 'reads', label: 'Most Read' },
]

export default function StoriesPage() {
  const searchParams = useSearchParams()
  const [stories, setStories] = useState<StoryWithRelations[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  const genre = searchParams.get('genre')
  const sort = searchParams.get('sort') || 'popular'

  useEffect(() => {
    async function fetchStories() {
      setLoading(true)

      let query = supabase
        .from('stories')
        .select(`
          *,
          author:profiles!user_id(*),
          genres:story_genres(
            genre:genres(*)
          )
        `)
        .eq('status', 'published')

      // Apply genre filter
      if (genre) {
        const { data: genreData } = await supabase
          .from('genres')
          .select('id')
          .eq('slug', genre)
          .maybeSingle()

        if (genreData) {
          const { data: storyIds } = await supabase
            .from('story_genres')
            .select('story_id')
            .eq('genre_id', genreData.id)

          if (storyIds && storyIds.length > 0) {
            query = query.in('id', storyIds.map(s => s.story_id))
          }
        }
      }

      // Apply sorting
      switch (sort) {
        case 'recent':
          query = query.order('updated_at', { ascending: false })
          break
        case 'new':
          query = query.order('published_at', { ascending: false })
          break
        case 'likes':
          query = query.order('like_count', { ascending: false })
          break
        case 'reads':
          query = query.order('read_count', { ascending: false })
          break
        default:
          query = query.order('view_count', { ascending: false })
      }

      const { data } = await query.limit(50)

      if (data && data.length > 0) {
        const formatted = data.map(story => ({
          ...story,
          genres: story.genres?.map((sg: any) => sg.genre).filter(Boolean) || [],
        }))
        setStories(formatted)
      } else {
        let fallback = getMockStories(genre)
        // Sort the fallback data in memory to match selected sort order
        switch (sort) {
          case 'recent':
          case 'new':
            fallback = [...fallback].sort((a, b) => new Date(b.published_at || '').getTime() - new Date(a.published_at || '').getTime())
            break
          case 'likes':
            fallback = [...fallback].sort((a, b) => b.like_count - a.like_count)
            break
          case 'reads':
            fallback = [...fallback].sort((a, b) => b.read_count - a.read_count)
            break
          default:
            fallback = [...fallback].sort((a, b) => b.view_count - a.view_count)
        }
        setStories(fallback)
      }

      setLoading(false)
    }

    fetchStories()
  }, [genre, sort])

  const filteredStories = searchQuery
    ? stories.filter(s =>
        s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.author?.username.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : stories

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="container px-4 py-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-serif font-bold">
              {genre ? `${genre.charAt(0).toUpperCase() + genre.slice(1).replace('-', ' ')} Stories` : 'Browse Stories'}
            </h1>
            <p className="text-muted-foreground mt-1">
              {filteredStories.length} stories found
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search stories..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select defaultValue={sort}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                {sortOptions.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="flex border rounded-lg">
              <Button
                variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
                size="icon"
                onClick={() => setViewMode('grid')}
              >
                <Grid3x3 className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'secondary' : 'ghost'}
                size="icon"
                onClick={() => setViewMode('list')}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : filteredStories.length === 0 ? (
          <div className="text-center py-24 text-muted-foreground">
            <Filter className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium">No stories found</p>
            <p className="text-sm mt-1">Try adjusting your filters or search query</p>
          </div>
        ) : (
          <div className={viewMode === 'grid'
            ? "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6"
            : "space-y-4"
          }>
            {filteredStories.map((story) => (
              <StoryCard
                key={story.id}
                story={story}
                compact={viewMode === 'list'}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
