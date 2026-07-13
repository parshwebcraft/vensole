'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/lib/supabase/auth-context'
import { SiteHeader } from '@/components/site-header'
import { StoryWithRelations } from '@/lib/types/database'
import { getUnsplashCover } from '@/lib/unsplash'

import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  BookMarked,
  Heart,
  Clock,
  Loader2,
  BookOpen,
  Trash2,
} from 'lucide-react'
import { toast } from 'sonner'
import { formatDistanceToNow } from 'date-fns'

export default function LibraryPage() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [bookmarks, setBookmarks] = useState<StoryWithRelations[]>([])
  const [likes, setLikes] = useState<StoryWithRelations[]>([])
  const [history, setHistory] = useState<(StoryWithRelations & { last_read_at: string })[]>([])

  useEffect(() => {
    loadLibrary()
  }, [user])

  async function loadLibrary() {
    if (!user) return

    const [bookmarksData, likesData, historyData] = await Promise.all([
      supabase.from('bookmarks').select(`
        *,
        story:stories(
          *,
          author:profiles!user_id(*),
          genres:story_genres(
            genre:genres(*)
          )
        )
      `).eq('user_id', user.id).order('created_at', { ascending: false }),
      supabase.from('likes').select(`
        *,
        story:stories(
          *,
          author:profiles!user_id(*),
          genres:story_genres(
            genre:genres(*)
          )
        )
      `).eq('user_id', user.id).order('created_at', { ascending: false }),
      supabase.from('reading_history').select(`
        *,
        story:stories(
          *,
          author:profiles!user_id(*),
          genres:story_genres(
            genre:genres(*)
          )
        )
      `).eq('user_id', user.id).order('last_read_at', { ascending: false }).limit(20),
    ])

    if (bookmarksData.data) {
      setBookmarks(
        bookmarksData.data
          .map((b: any) => b.story)
          .filter(Boolean)
          .map((s: any) => ({
            ...s,
            genres: s.genres?.map((sg: any) => sg.genre).filter(Boolean) || [],
          }))
      )
    }

    if (likesData.data) {
      setLikes(
        likesData.data
          .map((l: any) => l.story)
          .filter(Boolean)
          .map((s: any) => ({
            ...s,
            genres: s.genres?.map((sg: any) => sg.genre).filter(Boolean) || [],
          }))
      )
    }

    if (historyData.data) {
      setHistory(
        historyData.data
          .map((h: any) => ({
            ...h.story,
            last_read_at: h.last_read_at,
          }))
          .filter((h) => h.id)
          .map((s: any) => ({
            ...s,
            genres: s.genres?.map((sg: any) => sg.genre).filter(Boolean) || [],
          }))
      )
    }

    setLoading(false)
  }

  const handleRemoveBookmark = async (storyId: string) => {
    await supabase.from('bookmarks').delete().eq('story_id', storyId).eq('user_id', user!.id)
    setBookmarks(bookmarks.filter(s => s.id !== storyId))
    toast.success('Removed from library')
  }

  const handleRemoveLike = async (storyId: string) => {
    await supabase.from('likes').delete().eq('story_id', storyId).eq('user_id', user!.id)
    setLikes(likes.filter(s => s.id !== storyId))
    toast.success('Like removed')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <SiteHeader />
        <div className="flex items-center justify-center py-24">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="container px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-serif font-bold">My Library</h1>
          <p className="text-muted-foreground mt-1">
            Your saved stories, likes, and reading history
          </p>
        </div>

        <Tabs defaultValue="saved" className="space-y-6">
          <TabsList>
            <TabsTrigger value="saved">
              <BookMarked className="h-4 w-4 mr-2" />
              Saved ({bookmarks.length})
            </TabsTrigger>
            <TabsTrigger value="likes">
              <Heart className="h-4 w-4 mr-2" />
              Liked ({likes.length})
            </TabsTrigger>
            <TabsTrigger value="history">
              <Clock className="h-4 w-4 mr-2" />
              History ({history.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="saved">
            {bookmarks.length === 0 ? (
              <div className="text-center py-16 text-muted-foreground">
                <BookMarked className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No saved stories yet</p>
                <Button className="mt-4" asChild>
                  <Link href="/stories">Browse Stories</Link>
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                {bookmarks.map((story) => (
                  <Card key={story.id} className="overflow-hidden relative group">
                    <div className="aspect-[3/4] bg-muted relative">
                      <img
                        src={story.cover_url || getUnsplashCover(story.id, 300, 400)}
                        alt={story.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <CardContent className="p-3">
                      <Link href={`/story/${story.id}`} className="font-medium line-clamp-1 hover:text-primary">
                        {story.title}
                      </Link>
                      <p className="text-sm text-muted-foreground">
                        by @{story.author?.username}
                      </p>
                    </CardContent>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-black/50 hover:bg-black/70"
                      onClick={() => handleRemoveBookmark(story.id)}
                    >
                      <Trash2 className="h-4 w-4 text-white" />
                    </Button>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="likes">
            {likes.length === 0 ? (
              <div className="text-center py-16 text-muted-foreground">
                <Heart className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No liked stories yet</p>
                <Button className="mt-4" asChild>
                  <Link href="/stories">Browse Stories</Link>
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                {likes.map((story) => (
                  <Card key={story.id} className="overflow-hidden relative group">
                    <div className="aspect-[3/4] bg-muted relative">
                      <img
                        src={story.cover_url || getUnsplashCover(story.id, 300, 400)}
                        alt={story.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <CardContent className="p-3">
                      <Link href={`/story/${story.id}`} className="font-medium line-clamp-1 hover:text-primary">
                        {story.title}
                      </Link>
                      <p className="text-sm text-muted-foreground">
                        by @{story.author?.username}
                      </p>
                    </CardContent>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-black/50 hover:bg-black/70"
                      onClick={() => handleRemoveLike(story.id)}
                    >
                      <Trash2 className="h-4 w-4 text-white" />
                    </Button>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="history">
            {history.length === 0 ? (
              <div className="text-center py-16 text-muted-foreground">
                <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No reading history yet</p>
                <Button className="mt-4" asChild>
                  <Link href="/stories">Start Reading</Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {history.map((story) => (
                  <Link key={story.id} href={`/story/${story.id}`}>
                    <Card className="card-hover">
                      <CardContent className="flex items-center gap-4 p-4">
                        <div className="w-16 h-20 bg-muted rounded overflow-hidden flex-shrink-0">
                          <img
                            src={story.cover_url || getUnsplashCover(story.id, 100, 130)}
                            alt={story.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium line-clamp-1">{story.title}</p>
                          <p className="text-sm text-muted-foreground">
                            by @{story.author?.username}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Read {formatDistanceToNow(new Date(story.last_read_at), { addSuffix: true })}
                          </p>
                        </div>
                        <Badge variant="outline">
                          {story.chapter_count} chapters
                        </Badge>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
