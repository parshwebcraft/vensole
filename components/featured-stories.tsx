'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { getMockStories } from '@/lib/mock-stories'
import { StoryWithRelations } from '@/lib/types/database'
import { supabase } from '@/lib/supabase/client'
import { Star, Eye, Heart, ArrowRight } from 'lucide-react'

export function FeaturedStories() {
  const [stories, setStories] = useState<StoryWithRelations[]>([])
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)
  const [activeStory, setActiveStory] = useState<StoryWithRelations | null>(null)

  useEffect(() => {
    async function fetchFeatured() {
      const { data } = await supabase
        .from('stories')
        .select(`
          *,
          author:profiles!user_id(*),
          genres:story_genres(
            genre:genres(*)
          )
        `)
        .eq('status', 'published')
        .eq('is_featured', true)
        .order('view_count', { ascending: false })
        .limit(3)

      if (data && data.length >= 3) {
        const formatted = data.map(story => ({
          ...story,
          genres: story.genres?.map((sg: any) => sg.genre).filter(Boolean) || [],
        }))
        setStories(formatted)
        setActiveStory(formatted[1] || formatted[0])
      } else {
        // Fallback to top 3 mock featured stories!
        const fallbacks = getMockStories().filter(s => s.is_featured).slice(0, 3)
        setStories(fallbacks)
        setActiveStory(fallbacks[1] || fallbacks[0])
      }
    }

    fetchFeatured()
  }, [])

  if (stories.length < 3) return null

  // Define stack transform styles
  const getBookStyle = (index: number) => {
    const isHovered = hoveredIndex !== null
    const isThisHovered = hoveredIndex === index

    if (!isHovered) {
      // Stacked state
      if (index === 0) {
        return {
          transform: 'rotate(-8deg) translate3d(-20px, 0, 0)',
          zIndex: 10,
        }
      }
      if (index === 1) {
        return {
          transform: 'rotate(0deg) translate3d(0, -5px, 10px)',
          zIndex: 20,
        }
      }
      return {
        transform: 'rotate(8deg) translate3d(20px, 5px, 20px)',
        zIndex: 30,
      }
    }

    // Fanned-out state
    let transform = ''
    let zIndex = 20

    if (index === 0) {
      transform = 'rotate(-16deg) translate3d(-110px, 10px, 10px)'
    } else if (index === 1) {
      transform = 'rotate(0deg) translate3d(0, -25px, 25px)'
    } else {
      transform = 'rotate(16deg) translate3d(110px, 10px, 15px)'
    }

    // Amplify currently hovered book in fanned-out list
    if (isThisHovered) {
      transform += ' scale(1.1) translateZ(40px)'
      zIndex = 50
    }

    return {
      transform,
      zIndex,
    }
  }

  return (
    <div className="w-full flex flex-col items-center py-6">
      {/* 3D Stack Viewport */}
      <div 
        className="relative w-full max-w-[500px] h-[340px] flex items-center justify-center perspective-[1200px] transform-style-preserve-3d mb-8"
        onMouseLeave={() => {
          setHoveredIndex(null)
          if (stories[1]) setActiveStory(stories[1])
        }}
      >
        {stories.map((story, index) => (
          <div
            key={story.id}
            onMouseEnter={() => {
              setHoveredIndex(index)
              setActiveStory(story)
            }}
            style={getBookStyle(index)}
            className="absolute w-[160px] h-[230px] sm:w-[180px] sm:h-[260px] cursor-pointer transition-all duration-500 ease-out transform-style-preserve-3d"
          >
            <Link href={`/story/${story.id}`}>
              {/* Spine edge line crease */}
              <div className="absolute inset-0 rounded-r-md shadow-2xl overflow-hidden bg-gradient-to-br from-amber-900 to-stone-950 border border-amber-950/40">
                {/* 3D Spine Crease shade overlay */}
                <div className="absolute left-0 top-0 bottom-0 w-2 bg-gradient-to-r from-black/40 to-transparent z-10" />
                <div className="absolute left-2 w-[0.5px] top-0 bottom-0 bg-white/10 z-10" />
                
                {/* Cover image background */}
                {story.cover_url && (
                  <img 
                    src={story.cover_url} 
                    alt={story.title}
                    className="w-full h-full object-cover opacity-85 transition-transform duration-500 hover:scale-105"
                  />
                )}
                
                {/* Overlay gold detailing frame */}
                <div className="absolute inset-2 border border-amber-500/10 rounded-sm pointer-events-none z-10" />
                
                {/* Dark Vignette */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-black/35 z-0" />
                
                {/* Minimal title text overlay inside cover */}
                <div className="absolute bottom-3 inset-x-2 text-center z-10">
                  <span className="text-[7px] tracking-[0.2em] uppercase text-amber-400/70 font-sans block mb-1">
                    {story.genres[0]?.name || 'Story'}
                  </span>
                  <p className="text-xs font-serif font-bold text-amber-100 line-clamp-1">
                    {story.title}
                  </p>
                </div>
              </div>
            </Link>
          </div>
        ))}
      </div>

      {/* Animated Details Display Card for Active Book */}
      {activeStory && (
        <div className="w-full max-w-xl bg-card border border-border/40 rounded-xl p-5 md:p-6 shadow-xl relative transition-all duration-300">
          <div className="flex flex-col md:flex-row gap-4 items-start justify-between">
            <div className="space-y-2 flex-1">
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase font-bold tracking-wider text-amber-600 dark:text-amber-400 font-sans">
                  {activeStory.genres[0]?.name}
                </span>
                <span className="text-muted-foreground text-xs">•</span>
                <span className="text-xs text-muted-foreground">
                  By @{activeStory.author?.username}
                </span>
              </div>
              <h3 className="text-xl font-serif font-bold text-foreground">
                {activeStory.title}
              </h3>
              <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                {activeStory.description}
              </p>
            </div>
            
            <div className="flex flex-row md:flex-col gap-4 text-xs text-muted-foreground justify-end shrink-0 pt-1 border-t md:border-t-0 md:border-l md:pl-4 border-border/40">
              <div className="flex items-center gap-1.5">
                <Star className="h-3.5 w-3.5 text-amber-500 fill-amber-500" />
                <span className="font-semibold text-foreground">4.8 Rating</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Eye className="h-3.5 w-3.5 text-muted-foreground" />
                <span>{(activeStory.view_count / 1000).toFixed(1)}k Reads</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Heart className="h-3.5 w-3.5 text-muted-foreground" />
                <span>{activeStory.like_count} Likes</span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-border/40 flex justify-end">
            <Link 
              href={`/story/${activeStory.id}`}
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:text-primary/80 transition-colors"
            >
              Read Story
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}
