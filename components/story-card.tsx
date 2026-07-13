'use client'

import { useState, CSSProperties } from 'react'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { StoryWithRelations } from '@/lib/types/database'
import { getUnsplashCover } from '@/lib/unsplash'

import {
  Eye,
  Heart,
  BookOpen,
  Star,
} from 'lucide-react'

interface StoryCardProps {
  story: StoryWithRelations
  showAuthor?: boolean
  showStats?: boolean
  compact?: boolean
}

export function StoryCard({
  story,
  showAuthor = true,
  showStats = true,
  compact = false,
}: StoryCardProps) {
  const [tiltStyle, setTiltStyle] = useState<CSSProperties>({})

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    // Check if device supports hover/fine pointer
    const isTouch = window.matchMedia('(pointer: coarse)').matches
    if (isTouch) return

    const card = e.currentTarget
    const rect = card.getBoundingClientRect()
    const x = e.clientX - rect.left - rect.width / 2
    const y = e.clientY - rect.top - rect.height / 2
    
    const rotY = (x / (rect.width / 2)) * 12
    const rotX = -(y / (rect.height / 2)) * 12

    setTiltStyle({
      transform: `perspective(1000px) rotateY(${rotY}deg) rotateX(${rotX}deg) scale3d(1.02, 1.02, 1.02)`,
      transition: 'transform 0.1s ease-out',
    })
  }

  const handleMouseLeave = () => {
    setTiltStyle({
      transform: 'perspective(1000px) rotateY(0deg) rotateX(0deg) scale3d(1, 1, 1)',
      transition: 'transform 0.5s ease-out',
    })
  }

  const coverUrl = story.cover_url || getUnsplashCover(story.id, 400, 600)

  return (
    <Link href={`/story/${story.id}`}>
      <Card 
        className="group overflow-hidden h-full relative transition-all duration-300 hover:shadow-2xl border border-border/50 bg-card/90"
        style={tiltStyle}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        {/* Glossy reflection sheen sweep */}
        <div className="absolute inset-0 bg-[linear-gradient(105deg,transparent_35%,rgba(255,255,255,0.08)_45%,rgba(255,255,255,0.16)_50%,rgba(255,255,255,0.08)_55%,transparent_65%)] translate-x-[-150%] group-hover:translate-x-[150%] transition-transform duration-[1200ms] ease-in-out pointer-events-none z-35" />
        
        <div className="relative story-cover bg-muted">
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent z-10" />
          {story.is_featured && (
            <div className="absolute top-2 left-2 z-20">
              <Badge className="bg-primary text-primary-foreground">
                <Star className="w-3 h-3 mr-1" />
                Featured
              </Badge>
            </div>
          )}
          <img
            src={coverUrl}
            alt={story.title}
            className={`w-full object-cover transition-transform duration-300 group-hover:scale-105 ${
              compact ? 'h-48' : 'h-64'
            }`}
          />
          {/* 3D Spine Simulation Overlay */}
          <div className="absolute left-0 top-0 bottom-0 w-2.5 bg-gradient-to-r from-black/50 via-black/15 to-transparent z-25 border-r border-black/10" />
          <div className="absolute left-2.5 top-0 bottom-0 w-[0.5px] bg-white/10 z-25" />
          <div className="absolute bottom-0 left-0 right-0 p-4 z-20">
            <h3 className="font-semibold text-white text-lg line-clamp-2 group-hover:text-primary-foreground">
              {story.title}
            </h3>
            {story.description && !compact && (
              <p className="text-sm text-white/80 line-clamp-2 mt-1">
                {story.description}
              </p>
            )}
          </div>
        </div>
        {(showAuthor || showStats) && (
          <CardContent className="p-4">
            {showAuthor && story.author && (
              <Link
                href={`/@${story.author.username}`}
                className="flex items-center gap-2 mb-3 hover:opacity-80 transition-opacity"
                onClick={(e) => e.stopPropagation()}
              >
                <Avatar className="h-6 w-6">
                  <AvatarImage src={story.author.avatar_url || ''} />
                  <AvatarFallback className="text-xs">
                    {story.author.username.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm text-muted-foreground">
                  @{story.author.username}
                </span>
              </Link>
            )}
            {showStats && (
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Eye className="h-3 w-3" />
                  {formatNumber(story.view_count)}
                </span>
                <span className="flex items-center gap-1">
                  <Heart className="h-3 w-3" />
                  {formatNumber(story.like_count)}
                </span>
                <span className="flex items-center gap-1">
                  <BookOpen className="h-3 w-3" />
                  {story.chapter_count} chapters
                </span>
              </div>
            )}
            {story.genres && story.genres.length > 0 && !compact && (
              <div className="flex flex-wrap gap-1 mt-3">
                {story.genres.slice(0, 2).map((genre) => (
                  <Badge key={genre.id} variant="secondary" className="text-xs">
                    {genre.name}
                  </Badge>
                ))}
                {story.genres.length > 2 && (
                  <Badge variant="secondary" className="text-xs">
                    +{story.genres.length - 2}
                  </Badge>
                )}
              </div>
            )}
          </CardContent>
        )}
      </Card>
    </Link>
  )
}

function formatNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M'
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K'
  }
  return num.toString()
}
