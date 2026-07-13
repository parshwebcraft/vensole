'use client'

import { useEffect, useState, use } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/lib/supabase/auth-context'
import { SiteHeader } from '@/components/site-header'
import { Profile } from '@/lib/types/database'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { StoryCard } from '@/components/story-card'
import {
  Loader2,
  User,
  BookOpen,
  UserPlus,
  Calendar,
  ExternalLink,
  Settings,
} from 'lucide-react'
import { toast } from 'sonner'
import { format } from 'date-fns'

interface StoryWithAuthor {
  id: string
  title: string
  description: string | null
  cover_url: string | null
  view_count: number
  like_count: number
  chapter_count: number
  status: string
  genres: { id: string; name: string }[]
  author?: { username: string; avatar_url: string | null; display_name: string | null }
  [key: string]: any
}

export default function ProfilePage({ params }: { params: Promise<{ username: string }> }) {
  const resolvedParams = use(params)
  const username = resolvedParams.username.replace('@', '')
  const { user, profile: currentUser } = useAuth()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [stories, setStories] = useState<StoryWithAuthor[]>([])
  const [isFollowing, setIsFollowing] = useState(false)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)

  useEffect(() => {
    loadProfile()
  }, [username])

  useEffect(() => {
    if (user && profile) {
      supabase.from('follows').select('id').eq('follower_id', user.id).eq('following_id', profile.user_id).maybeSingle()
        .then(({ data }) => setIsFollowing(!!data))
    }
  }, [user, profile])

  async function loadProfile() {
    setLoading(true)

    const { data: profileData } = await supabase
      .from('profiles')
      .select('*')
      .eq('username', username)
      .maybeSingle()

    if (profileData) {
      setProfile(profileData as Profile)

      const { data: storiesData } = await supabase
        .from('stories')
        .select(`
          *,
          author:profiles!user_id(*),
          genres:story_genres(
            genre:genres(*)
          )
        `)
        .eq('user_id', (profileData as Profile).user_id)
        .eq('status', 'published')
        .order('created_at', { ascending: false })

      if (storiesData) {
        setStories(storiesData.map((s: any) => ({
          ...s,
          genres: s.genres?.map((sg: any) => sg.genre).filter(Boolean) || [],
        })))
      }
    }

    setLoading(false)
  }

  const handleFollow = async () => {
    if (!user || !profile) {
      toast.error('Please sign in to follow')
      return
    }

    setActionLoading(true)

    if (isFollowing) {
      await supabase.from('follows').delete().eq('follower_id', user.id).eq('following_id', profile.user_id)
      setIsFollowing(false)
      toast.success('Unfollowed')
    } else {
      await supabase.from('follows').insert({ follower_id: user.id, following_id: profile.user_id } as any)
      setIsFollowing(true)
      toast.success('Following')

      await supabase.from('notifications').insert({
        user_id: profile.user_id,
        type: 'follow',
        title: 'New follower',
        content: `${currentUser?.username} started following you`,
        data: { follower_id: user.id },
      } as any)
    }

    setActionLoading(false)
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

  if (!profile) {
    return (
      <div className="min-h-screen bg-background">
        <SiteHeader />
        <div className="text-center py-24">
          <User className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h1 className="text-2xl font-bold">User not found</h1>
          <Button asChild className="mt-4">
            <Link href="/stories">Browse Stories</Link>
          </Button>
        </div>
      </div>
    )
  }

  const isOwnProfile = user?.id === profile.user_id

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      {/* Profile Header */}
      <div className="relative">
        <div className="absolute inset-0 h-48 bg-gradient-to-b from-primary/10 to-background" />
        <div className="container relative px-4 py-12">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
            <Avatar className="h-24 w-24 md:h-32 md:w-32 border-4 border-background shadow-lg">
              <AvatarImage src={profile.avatar_url || ''} className="object-cover" />
              <AvatarFallback className="text-3xl">
                {profile.username.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
                <h1 className="text-2xl font-bold">{profile.display_name || profile.username}</h1>
                {profile.is_verified && (
                  <Badge className="bg-primary text-primary-foreground">
                    Verified
                  </Badge>
                )}
              </div>
              <p className="text-muted-foreground text-lg">@{profile.username}</p>

              {profile.bio && (
                <p className="text-muted-foreground mt-4 max-w-lg">{profile.bio}</p>
              )}

              <div className="flex flex-wrap items-center justify-center md:justify-start gap-6 mt-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <BookOpen className="h-4 w-4" />
                  <span><strong>{stories.length}</strong> stories</span>
                </div>
                <div className="flex items-center gap-1">
                  <UserPlus className="h-4 w-4" />
                  <span><strong>{profile.follower_count}</strong> followers</span>
                </div>
                <div className="flex items-center gap-1">
                  <span><strong>{profile.following_count}</strong> following</span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  <span>Joined {format(new Date(profile.created_at), 'MMMM yyyy')}</span>
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              {isOwnProfile ? (
                <Button variant="outline" asChild>
                  <Link href="/settings">
                    <Settings className="h-4 w-4 mr-2" />
                    Edit Profile
                  </Link>
                </Button>
              ) : (
                <>
                  <Button
                    variant={isFollowing ? 'outline' : 'default'}
                    onClick={handleFollow}
                    disabled={actionLoading}
                  >
                    {isFollowing ? 'Following' : 'Follow'}
                  </Button>
                  {profile.website_url && (
                    <Button variant="outline" asChild>
                      <a href={profile.website_url} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </Button>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      <Separator />

      <div className="container px-4 py-8">
        <Tabs defaultValue="stories" className="space-y-6">
          <TabsList>
            <TabsTrigger value="stories">
              <BookOpen className="h-4 w-4 mr-2" />
              Stories ({stories.length})
            </TabsTrigger>
            <TabsTrigger value="about">About</TabsTrigger>
          </TabsList>

          <TabsContent value="stories">
            {stories.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No stories published yet</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                {stories.map((story) => (
                  <StoryCard key={story.id} story={story as any} showAuthor={false} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="about">
            <Card>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold mb-1">Bio</h3>
                    <p className="text-muted-foreground">{profile.bio || 'No bio provided.'}</p>
                  </div>
                  {profile.website_url && (
                    <div>
                      <h3 className="font-semibold mb-1">Website</h3>
                      <a
                        href={profile.website_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        {profile.website_url}
                      </a>
                    </div>
                  )}
                  <div>
                    <h3 className="font-semibold mb-1">Stats</h3>
                    <div className="flex gap-6 text-muted-foreground">
                      <span>{profile.total_read_count} total reads</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
