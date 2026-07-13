'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/lib/supabase/auth-context'
import { SiteHeader } from '@/components/site-header'
import { StoryWithRelations, Chapter, Profile } from '@/lib/types/database'
import { getDetailedMockStory, getMockStories } from '@/lib/mock-stories'
import { getUnsplashCover } from '@/lib/unsplash'
import { isFreePreviewChapter, isMockBookUnlocked, MOCK_BOOK_PRICE_INR, resetMockBookUnlock } from '@/lib/mock-payments'

import { StoryCard } from '@/components/story-card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import {
  Heart,
  Bookmark,
  Share2,
  Eye,
  MessageCircle,
  BookOpen,
  Clock,
  Star,
  Flag,
  Play,
  ChevronRight,
  Loader2,
  IndianRupee,
  Lock,
  ShieldCheck,
} from 'lucide-react'
import { toast } from 'sonner'
import { FollowersModal } from '@/components/followers-modal'

export default function StoryPage({ params }: { params: { id: string } }) {
  const resolvedParams = params
  const { user, profile } = useAuth()
  const [story, setStory] = useState<StoryWithRelations | null>(null)
  const [chapters, setChapters] = useState<Chapter[]>([])
  const [loading, setLoading] = useState(true)
  const [isLiked, setIsLiked] = useState(false)
  const [isBookmarked, setIsBookmarked] = useState(false)
  const [isFollowing, setIsFollowing] = useState(false)
  const [likeLoading, setLikeLoading] = useState(false)
  const [bookmarkLoading, setBookmarkLoading] = useState(false)
  const [followLoading, setFollowLoading] = useState(false)
  const [mockComments, setMockComments] = useState<any[]>([])
  const [mockReviews, setMockReviews] = useState<any[]>([])
  const [similarStories, setSimilarStories] = useState<StoryWithRelations[]>([])
  const [isBookUnlocked, setIsBookUnlocked] = useState(false)

  useEffect(() => {
    async function loadStory() {
      const { data: storyData } = await supabase
        .from('stories')
        .select(`
          *,
          author:profiles!user_id(*),
          genres:story_genres(
            genre:genres(*)
          )
        `)
        .eq('id', resolvedParams.id)
        .maybeSingle()

      if (storyData) {
        const formatted = {
          ...storyData,
          genres: storyData.genres?.map((sg: any) => sg.genre).filter(Boolean) || [],
        }
        setStory(formatted)

        // Load chapters
        const { data: chapterData } = await supabase
          .from('chapters')
          .select('*')
          .eq('story_id', storyData.id)
          .eq('status', 'published')
          .order('chapter_number', { ascending: true })

        if (chapterData) {
          setChapters(chapterData)
        }

        // Check interactions if user is logged in
        if (user) {
          const [likedData, bookmarkedData, followingData] = await Promise.all([
            supabase.from('likes').select('id').eq('story_id', storyData.id).eq('user_id', user.id).maybeSingle(),
            supabase.from('bookmarks').select('id').eq('story_id', storyData.id).eq('user_id', user.id).maybeSingle(),
            supabase.from('follows').select('id').eq('follower_id', user.id).eq('following_id', storyData.user_id).maybeSingle(),
          ])

          setIsLiked(!!likedData.data)
          setIsBookmarked(!!bookmarkedData.data)
          setIsFollowing(!!followingData.data)
        }

        // Increment view count
        await supabase.rpc('increment_story_views', { story_id: storyData.id })

        // Populate default mock reviews/comments/similar
        const detailed = getDetailedMockStory('mock-fantasy-1')
        if (detailed) {
          setMockComments(detailed.comments)
          setMockReviews(detailed.reviews)
        }
        const similar = getMockStories(formatted.genres[0]?.slug).filter(s => s.id !== formatted.id).slice(0, 3)
        setSimilarStories(similar)
      } else {
        // Fallback to local detailed mock story!
        const detailedMock = getDetailedMockStory(resolvedParams.id)
        if (detailedMock) {
          setStory(detailedMock.story)
          setChapters(detailedMock.chapters)
          setMockComments(detailedMock.comments)
          setMockReviews(detailedMock.reviews)
          
          const similar = getMockStories(detailedMock.story.genres[0]?.slug).filter(s => s.id !== detailedMock.story.id).slice(0, 3)
          setSimilarStories(similar)
        }
      }

      setLoading(false)
    }

    loadStory()
  }, [resolvedParams.id, user])

  useEffect(() => {
    if (story?.id) {
      setIsBookUnlocked(isMockBookUnlocked(story.id))
    }
  }, [story?.id])

  const handleLike = async () => {
    if (!user) {
      toast.error('Please sign in to like stories')
      return
    }
    setLikeLoading(true)

    if (isLiked) {
      await supabase.from('likes').delete().eq('story_id', story!.id).eq('user_id', user.id)
      setIsLiked(false)
      setStory(prev => prev ? { ...prev, like_count: prev.like_count - 1 } : prev)
    } else {
      await supabase.from('likes').insert({ story_id: story!.id, user_id: user.id })
      setIsLiked(true)
      setStory(prev => prev ? { ...prev, like_count: prev.like_count + 1 } : prev)

      // Create notification
      if (story?.author && story.author.user_id !== user.id) {
        await supabase.from('notifications').insert({
          user_id: story.author.user_id,
          type: 'like',
          title: 'New like',
          content: `${profile?.username} liked your story "${story.title}"`,
          data: { story_id: story.id, user_id: user.id },
        })
      }
    }

    setLikeLoading(false)
  }

  const handleBookmark = async () => {
    if (!user) {
      toast.error('Please sign in to bookmark stories')
      return
    }
    setBookmarkLoading(true)

    if (isBookmarked) {
      await supabase.from('bookmarks').delete().eq('story_id', story!.id).eq('user_id', user.id)
      setIsBookmarked(false)
      toast.success('Removed from library')
    } else {
      await supabase.from('bookmarks').insert({ story_id: story!.id, user_id: user.id })
      setIsBookmarked(true)
      toast.success('Added to library')
    }

    setBookmarkLoading(false)
  }

  const handleFollow = async () => {
    if (!user || !story?.author) {
      toast.error('Please sign in to follow authors')
      return
    }
    setFollowLoading(true)

    if (isFollowing) {
      await supabase.from('follows').delete().eq('follower_id', user.id).eq('following_id', story.author.user_id)
      setIsFollowing(false)
      toast.success('Unfollowed')
    } else {
      await supabase.from('follows').insert({ follower_id: user.id, following_id: story.author.user_id })
      setIsFollowing(true)
      toast.success('Following')

      // Create notification
      await supabase.from('notifications').insert({
        user_id: story.author.user_id,
        type: 'follow',
        title: 'New follower',
        content: `${profile?.username} started following you`,
        data: { follower_id: user.id },
      })
    }

    setFollowLoading(false)
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

  if (!story) {
    return (
      <div className="min-h-screen bg-background">
        <SiteHeader />
        <div className="text-center py-24">
          <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h1 className="text-2xl font-bold">Story not found</h1>
          <p className="text-muted-foreground mt-2">This story may have been removed or is not available.</p>
          <Button asChild className="mt-4">
            <Link href="/stories">Browse Stories</Link>
          </Button>
        </div>
      </div>
    )
  }

  const isOwnStory = user?.id === story.user_id

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      {/* Hero */}
      <div className="relative">
        <div className="absolute inset-0 h-96 bg-gradient-to-b from-primary/10 to-background" />
        <div className="container relative px-4 py-12">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Cover */}
            <div className="flex-shrink-0 mx-auto lg:mx-0">
              <div className="relative story-cover w-48 md:w-56 aspect-[2/3] rounded-lg overflow-hidden shadow-xl ring-1 ring-black/5 bg-muted flex items-center justify-center">
                <img
                  src={story.cover_url || getUnsplashCover(story.id, 600, 900)}
                  alt={story.title}
                  className="w-full h-full object-cover"
                />
                {/* 3D Spine Simulation Overlay */}
                <div className="absolute left-0 top-0 bottom-0 w-3 bg-gradient-to-r from-black/55 via-black/15 to-transparent z-25 border-r border-black/10" />
                <div className="absolute left-3 top-0 bottom-0 w-[0.5px] bg-white/10 z-25" />
                {story.is_featured && (
                  <div className="absolute top-2 right-2">
                    <Badge className="bg-primary text-primary-foreground">
                      <Star className="w-3 h-3 mr-1" />
                      Featured
                    </Badge>
                  </div>
                )}
              </div>
            </div>

            {/* Details */}
            <div className="flex-1 text-center lg:text-left">
              <div className="flex flex-wrap gap-2 justify-center lg:justify-start mb-3">
                {story.genres?.map((genre: any) => (
                  <Link key={genre.id} href={`/stories?genre=${genre.slug}`}>
                    <Badge variant="secondary" className="hover:bg-secondary/80 cursor-pointer">
                      {genre.name}
                    </Badge>
                  </Link>
                ))}
              </div>

              <h1 className="text-3xl md:text-4xl font-serif font-bold mb-3">
                {story.title}
              </h1>

              {/* Author */}
              <Link
                href={`/@${story.author?.username}`}
                className="inline-flex items-center gap-2 group mb-4"
              >
                <Avatar className="h-10 w-10">
                  <AvatarImage src={story.author?.avatar_url || ''} />
                  <AvatarFallback>
                    {story.author?.username?.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium group-hover:text-primary transition-colors">
                    {story.author?.display_name || story.author?.username}
                  </p>
                  <p className="text-sm text-muted-foreground">@{story.author?.username}</p>
                </div>
              </Link>

              {/* Stats */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 text-sm text-muted-foreground mb-6">
                <span className="flex items-center gap-1">
                  <Eye className="h-4 w-4" />
                  {formatNumber(story.view_count)} reads
                </span>
                <span className="flex items-center gap-1">
                  <Heart className="h-4 w-4" />
                  {formatNumber(story.like_count)} likes
                </span>
                <span className="flex items-center gap-1">
                  <BookOpen className="h-4 w-4" />
                  {chapters.length} chapters
                </span>
                {story.word_count > 0 && (
                  <span className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {formatNumber(story.word_count)} words
                  </span>
                )}
              </div>

              {/* Actions */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3">
                {chapters.length > 0 && (
                  <Button asChild size="lg">
                    <Link href={`/story/${story.id}/chapter/${chapters[0].id}`}>
                      <Play className="h-4 w-4 mr-2" />
                      Start Reading
                    </Link>
                  </Button>
                )}
                <Button
                  variant="outline"
                  onClick={handleLike}
                  disabled={likeLoading || isOwnStory}
                  className={isLiked ? 'border-rose-300 text-rose-500' : ''}
                >
                  <Heart className={`h-4 w-4 mr-2 ${isLiked ? 'fill-current' : ''}`} />
                  {story.like_count}
                </Button>
                <Button
                  variant="outline"
                  onClick={handleBookmark}
                  disabled={bookmarkLoading || isOwnStory}
                >
                  <Bookmark className={`h-4 w-4 mr-2 ${isBookmarked ? 'fill-current' : ''}`} />
                  Save
                </Button>
                {!isOwnStory && (
                  <Button
                    variant="outline"
                    onClick={handleFollow}
                    disabled={followLoading}
                  >
                    {isFollowing ? 'Following' : 'Follow'}
                  </Button>
                )}
                <Badge variant="secondary" className="h-10 px-3 text-sm">
                  <IndianRupee className="h-4 w-4 mr-1" />
                  Chapter 1 free, full book {MOCK_BOOK_PRICE_INR}
                </Badge>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Description */}
            <Card>
              <CardContent className="p-6">
                <h2 className="text-lg font-semibold mb-3">About this story</h2>
                <p className="text-muted-foreground whitespace-pre-wrap">
                  {story.description || 'No description provided.'}
                </p>
                {story.content_warnings && story.content_warnings.length > 0 && (
                  <div className="mt-4">
                    <p className="text-sm font-medium mb-2">Content Warnings:</p>
                    <div className="flex flex-wrap gap-2">
                      {story.content_warnings.map((warning) => (
                        <Badge key={warning} variant="outline">
                          {warning}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Chapters */}
            <Card>
              <CardContent className="p-6">
                <h2 className="text-lg font-semibold mb-4">Chapters</h2>
                {chapters.length === 0 ? (
                  <p className="text-muted-foreground">No chapters published yet.</p>
                ) : (
                  <div className="space-y-2">
                    {chapters.map((chapter, index) => (
                      <Link
                        key={chapter.id}
                        href={`/story/${story.id}/chapter/${chapter.id}`}
                        className="flex items-center justify-between p-3 rounded-lg hover:bg-secondary/50 transition-colors group"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-sm text-muted-foreground w-8">
                            {chapter.chapter_number}.
                          </span>
                          <span className="font-medium group-hover:text-primary">
                            {chapter.title}
                          </span>
                          {!isFreePreviewChapter(chapter.chapter_number) && !isBookUnlocked && (
                            <Badge variant="outline" className="text-xs">
                              <Lock className="h-3 w-3 mr-1" />
                              Paid
                            </Badge>
                          )}
                          {!isFreePreviewChapter(chapter.chapter_number) && isBookUnlocked && (
                            <Badge variant="secondary" className="text-xs">
                              Unlocked
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span>{chapter.word_count} words</span>
                          <ChevronRight className="h-4 w-4" />
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
                <div className="mt-4 rounded-lg bg-secondary/50 p-4 text-sm text-muted-foreground flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <span className="flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4 text-primary" />
                    Read chapter 1 free. Unlock the full book with mock Razorpay.
                  </span>
                  {isBookUnlocked && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        resetMockBookUnlock(story.id)
                        setIsBookUnlocked(false)
                        toast.success('Mock purchase reset')
                      }}
                    >
                      Reset mock purchase
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Reviews & Comments Card */}
            <Card>
              <CardContent className="p-6">
                <div className="flex flex-col gap-6">
                  {/* Reviews Section */}
                  <div>
                    <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                      <Star className="h-5 w-5 text-amber-500 fill-amber-500" />
                      Reader Reviews
                    </h2>
                    <div className="space-y-4">
                      {mockReviews.map((review) => (
                        <div key={review.id} className="border-b pb-4 last:border-0 last:pb-0">
                          <div className="flex items-center justify-between mb-1.5">
                            <div className="flex items-center gap-2">
                              <Avatar className="h-7 w-7">
                                <AvatarImage src={review.avatar} />
                                <AvatarFallback>{review.author.charAt(0).toUpperCase()}</AvatarFallback>
                              </Avatar>
                              <span className="text-sm font-medium">{review.author}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              {Array.from({ length: review.rating }).map((_, i) => (
                                <Star key={i} className="h-3 w-3 text-amber-500 fill-amber-500" />
                              ))}
                              <span className="text-xs text-muted-foreground ml-1">{review.date}</span>
                            </div>
                          </div>
                          <p className="text-sm text-muted-foreground pl-9">{review.text}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Separator />

                  {/* Comments Section */}
                  <div>
                    <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                      <MessageCircle className="h-5 w-5 text-primary" />
                      Recent Discussion
                    </h2>
                    <div className="space-y-4">
                      {mockComments.map((comment) => (
                        <div key={comment.id} className="flex gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback>{comment.user_id.toUpperCase()}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1 bg-secondary/35 p-3 rounded-lg">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-xs font-semibold">Reader_{comment.user_id}</span>
                              <span className="text-[10px] text-muted-foreground">
                                {new Date(comment.created_at).toLocaleDateString()}
                              </span>
                            </div>
                            <p className="text-sm text-foreground/80">{comment.content}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Similar Stories Section */}
            {similarStories.length > 0 && (
              <div>
                <h2 className="text-xl font-serif font-bold mb-4">Recommended Stories</h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {similarStories.map((story) => (
                    <StoryCard key={story.id} story={story} compact />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Author Card */}
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4">About the Author</h3>
                <Link href={`/@${story.author?.username}`} className="flex items-center gap-3 group">
                  <Avatar className="h-14 w-14">
                    <AvatarImage src={story.author?.avatar_url || ''} />
                    <AvatarFallback className="text-lg">
                      {story.author?.username?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium group-hover:text-primary transition-colors">
                      {story.author?.display_name || story.author?.username}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {story.author?.story_count || 0} stories
                    </p>
                  </div>
                </Link>
                {story.author?.bio && (
                  <p className="text-sm text-muted-foreground mt-3 line-clamp-3">
                    {story.author.bio}
                  </p>
                )}
                {!isOwnStory && user && (
                  <Button
                    className="w-full mt-4"
                    variant={isFollowing ? 'outline' : 'default'}
                    onClick={handleFollow}
                    disabled={followLoading}
                  >
                    {isFollowing ? 'Following' : 'Follow Author'}
                  </Button>
                )}
              </CardContent>
            </Card>

            {/* Story Info */}
            <Card>
              <CardContent className="p-6 space-y-4 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Published</span>
                  <span>{story.published_at ? new Date(story.published_at).toLocaleDateString() : 'Not published'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Language</span>
                  <span>{story.language.toUpperCase()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Age Rating</span>
                  <Badge variant="outline">{story.age_rating}</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Status</span>
                  <Badge variant={story.is_completed ? 'default' : 'secondary'}>
                    {story.is_completed ? 'Completed' : 'Ongoing'}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

function formatNumber(num: number): string {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M'
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K'
  return num.toString()
}
