'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase/client'
import { SiteHeader } from '@/components/site-header'
import { StoryWithRelations, Profile, Genre } from '@/lib/types/database'
import { getUnsplashCover } from '@/lib/unsplash'

import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Search, Loader2, Users, BookOpen, Hash } from 'lucide-react'

export default function SearchPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const initialQuery = searchParams.get('q') || ''
  const initialTab = searchParams.get('type') || 'stories'

  const [query, setQuery] = useState(initialQuery)
  const [activeTab, setActiveTab] = useState(initialTab)
  const [results, setResults] = useState({
    stories: [] as StoryWithRelations[],
    users: [] as Profile[],
    genres: [] as (Genre & { story_count?: number })[],
  })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (query) {
      search()
    }
  }, [query, activeTab])

  async function search() {
    if (!query.trim()) return
    setLoading(true)

    if (activeTab === 'stories' || activeTab === 'all') {
      const { data } = await supabase
        .from('stories')
        .select(`
          *,
          author:profiles!user_id(*),
          genres:story_genres(
            genre:genres(*)
          )
        `)
        .or(`title.ilike.%${query}%,description.ilike.%${query}%`)
        .eq('status', 'published')
        .limit(20)

      if (data) {
        setResults(prev => ({
          ...prev,
          stories: data.map(s => ({
            ...s,
            genres: s.genres?.map((sg: any) => sg.genre).filter(Boolean) || [],
          })),
        }))
      }
    }

    if (activeTab === 'authors' || activeTab === 'all') {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .or(`username.ilike.%${query}%,display_name.ilike.%${query}%,bio.ilike.%${query}%`)
        .limit(10)

      if (data) {
        setResults(prev => ({ ...prev, users: data }))
      }
    }

    if (activeTab === 'tags' || activeTab === 'all') {
      const { data } = await supabase
        .from('genres')
        .select('*')
        .or(`name.ilike.%${query}%,slug.ilike.%${query}%`)
        .limit(15)

      if (data) {
        setResults(prev => ({ ...prev, genres: data }))
      }
    }

    setLoading(false)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    router.push(`/search?q=${encodeURIComponent(query)}&type=${activeTab}`)
  }

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="container px-4 py-8 max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-serif font-bold mb-4">Search</h1>
          <form onSubmit={handleSubmit} className="max-w-xl mx-auto">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Search stories, authors, tags..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="pl-10 h-12 text-lg"
              />
            </div>
          </form>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : query && (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="stories">
                <BookOpen className="h-4 w-4 mr-2" />
                Stories
              </TabsTrigger>
              <TabsTrigger value="authors">
                <Users className="h-4 w-4 mr-2" />
                Authors
              </TabsTrigger>
              <TabsTrigger value="tags">
                <Hash className="h-4 w-4 mr-2" />
                Tags
              </TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="space-y-8">
              {results.stories.length > 0 && (
                <section>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold">Stories</h2>
                    <Button variant="ghost" size="sm" onClick={() => setActiveTab('stories')}>
                      View all
                    </Button>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {results.stories.slice(0, 4).map((story) => (
                      <Card key={story.id} className="overflow-hidden card-hover">
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
                      </Card>
                    ))}
                  </div>
                </section>
              )}

              {results.users.length > 0 && (
                <section>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold">Authors</h2>
                    <Button variant="ghost" size="sm" onClick={() => setActiveTab('authors')}>
                      View all
                    </Button>
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    {results.users.slice(0, 4).map((user) => (
                      <Link key={user.id} href={`/@${user.username}`}>
                        <Card className="card-hover">
                          <CardContent className="flex items-center gap-3 p-4">
                            <Avatar className="h-12 w-12">
                              <AvatarImage src={user.avatar_url || ''} />
                              <AvatarFallback>
                                {user.username.charAt(0).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">{user.display_name || user.username}</p>
                              <p className="text-sm text-muted-foreground">@{user.username}</p>
                            </div>
                          </CardContent>
                        </Card>
                      </Link>
                    ))}
                  </div>
                </section>
              )}

              {results.genres.length > 0 && (
                <section>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold">Tags & Genres</h2>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {results.genres.map((genre) => (
                      <Link key={genre.id} href={`/stories?genre=${genre.slug}`}>
                        <Badge variant="secondary" className="text-sm px-4 py-2 cursor-pointer hover:bg-secondary/80">
                          {genre.name}
                        </Badge>
                      </Link>
                    ))}
                  </div>
                </section>
              )}
            </TabsContent>

            <TabsContent value="stories">
              {results.stories.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No stories found for &quot;{query}&quot;</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {results.stories.map((story) => (
                    <Card key={story.id} className="overflow-hidden card-hover">
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
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="authors">
              {results.users.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No authors found for &quot;{query}&quot;</p>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 gap-4">
                  {results.users.map((user) => (
                    <Link key={user.id} href={`/@${user.username}`}>
                      <Card className="card-hover">
                        <CardContent className="flex items-center gap-4 p-4">
                          <Avatar className="h-14 w-14">
                            <AvatarImage src={user.avatar_url || ''} />
                            <AvatarFallback className="text-lg">
                              {user.username.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <p className="font-medium text-lg">{user.display_name || user.username}</p>
                            <p className="text-muted-foreground">@{user.username}</p>
                            <p className="text-sm text-muted-foreground mt-1">
                              {user.story_count} stories
                            </p>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="tags">
              {results.genres.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Hash className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No tags found for &quot;{query}&quot;</p>
                </div>
              ) : (
                <div className="flex flex-wrap gap-3">
                  {results.genres.map((genre) => (
                    <Link key={genre.id} href={`/stories?genre=${genre.slug}`}>
                      <Card className="card-hover">
                        <CardContent className="p-4">
                          <p className="font-medium">{genre.name}</p>
                          <p className="text-sm text-muted-foreground">{genre.story_count} stories</p>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        )}

        {!query && (
          <div className="text-center py-16 text-muted-foreground">
            <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg">Search for stories, authors, or tags</p>
          </div>
        )}
      </main>
    </div>
  )
}
