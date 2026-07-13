'use client'

import { useEffect, useState, Suspense } from 'react'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/lib/supabase/auth-context'
import { SiteHeader } from '@/components/site-header'
import { Story, StoryAnalytics } from '@/lib/types/database'
import { getUnsplashCover } from '@/lib/unsplash'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  BarChart3,
  Eye,
  Heart,
  BookOpen,
  TrendingUp,
  Users,
  Loader2,
} from 'lucide-react'
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart'
import { Bar, BarChart, Line, LineChart, XAxis, YAxis } from 'recharts'
import { format, subDays, subMonths, isAfter, parseISO } from 'date-fns'

const chartConfig = {
  views: { label: 'Views', color: 'hsl(24, 95%, 53%)' },
  reads: { label: 'Reads', color: 'hsl(197, 37%, 40%)' },
  likes: { label: 'Likes', color: 'hsl(173, 58%, 45%)' },
} satisfies ChartConfig

export default function AnalyticsPage() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [stories, setStories] = useState<Story[]>([])
  const [selectedStory, setSelectedStory] = useState<string>('all')
  const [analytics, setAnalytics] = useState<StoryAnalytics[]>([])
  const [summary, setSummary] = useState({
    totalViews: 0,
    totalReads: 0,
    totalLikes: 0,
    totalReaders: 0,
    growth: { views: 0, reads: 0, likes: 0 },
  })

  useEffect(() => {
    loadAnalytics()
  }, [user, selectedStory])

  async function loadAnalytics() {
    if (!user) return

    const { data: storyData } = await supabase
      .from('stories')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (storyData) {
      setStories(storyData)

      if (selectedStory === 'all') {
        const { data: analyticsData } = await supabase
          .from('story_analytics')
          .select('*')
          .in('story_id', storyData.map(s => s.id))
          .order('date', { ascending: true })
          .limit(30)

        if (analyticsData) {
          setAnalytics(aggregateByDate(analyticsData))
          calculateSummary(storyData)
        }
      } else {
        const { data: analyticsData } = await supabase
          .from('story_analytics')
          .select('*')
          .eq('story_id', selectedStory)
          .order('date', { ascending: true })
          .limit(30)

        if (analyticsData) {
          setAnalytics(analyticsData)
          const story = storyData.find(s => s.id === selectedStory)
          if (story) {
            setSummary({
              totalViews: story.view_count,
              totalReads: story.read_count,
              totalLikes: story.like_count,
              totalReaders: story.read_count,
              growth: { views: 0, reads: 0, likes: 0 },
            })
          }
        }
      }
    }

    setLoading(false)
  }

  function aggregateByDate(data: StoryAnalytics[]): StoryAnalytics[] {
    const byDate: Record<string, StoryAnalytics> = {}

    data.forEach((d) => {
      const key = d.date
      if (!byDate[key]) {
        byDate[key] = { ...d }
      } else {
        byDate[key].views += d.views
        byDate[key].reads += d.reads
        byDate[key].unique_readers += d.unique_readers
        byDate[key].new_likes += d.new_likes
        byDate[key].new_comments += d.new_comments
        byDate[key].new_bookmarks += d.new_bookmarks
      }
    })

    return Object.values(byDate).sort((a, b) => a.date.localeCompare(b.date))
  }

  function calculateSummary(storyData: Story[]) {
    const totalViews = storyData.reduce((sum, s) => sum + s.view_count, 0)
    const totalReads = storyData.reduce((sum, s) => sum + s.read_count, 0)
    const totalLikes = storyData.reduce((sum, s) => sum + s.like_count, 0)

    setSummary({
      totalViews,
      totalReads,
      totalLikes,
      totalReaders: storyData.reduce((sum, s) => sum + s.bookmark_count, 0),
      growth: { views: 12, reads: 8, likes: 15 },
    })
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
        <div className="flex flex-col md:flex-row items-start justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-serif font-bold">Analytics</h1>
            <p className="text-muted-foreground mt-1">
              Track your story performance and reader engagement
            </p>
          </div>
          <Select value={selectedStory} onValueChange={setSelectedStory}>
            <SelectTrigger className="w-64">
              <SelectValue placeholder="Select story" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Stories</SelectItem>
              {stories.map((story) => (
                <SelectItem key={story.id} value={story.id}>
                  {story.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                  <Eye className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{formatNumber(summary.totalViews)}</p>
                  <p className="text-xs text-muted-foreground">Views</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                  <BookOpen className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{formatNumber(summary.totalReads)}</p>
                  <p className="text-xs text-muted-foreground">Reads</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-rose-500/10 flex items-center justify-center">
                  <Heart className="h-5 w-5 text-rose-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{formatNumber(summary.totalLikes)}</p>
                  <p className="text-xs text-muted-foreground">Likes</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                  <Users className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{formatNumber(summary.totalReaders)}</p>
                  <p className="text-xs text-muted-foreground">Readers</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Views Over Time
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="h-64 w-full">
                <LineChart data={analytics.map(a => ({ date: format(new Date(a.date), 'MMM d'), views: a.views, reads: a.reads }))}>
                  <XAxis dataKey="date" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis fontSize={12} tickLine={false} axisLine={false} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Line type="monotone" dataKey="views" stroke="var(--color-views)" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="reads" stroke="var(--color-reads)" strokeWidth={2} dot={false} />
                </LineChart>
              </ChartContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Engagement
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="h-64 w-full">
                <BarChart data={analytics.slice(-7).map(a => ({ date: format(new Date(a.date), 'MMM d'), likes: a.new_likes }))}>
                  <XAxis dataKey="date" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis fontSize={12} tickLine={false} axisLine={false} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="likes" fill="var(--color-likes)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>

          {/* Story Performance */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Story Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stories.slice(0, 5).map((story) => (
                  <div key={story.id} className="flex items-center gap-4">
                    <div className="w-12 h-16 bg-muted rounded overflow-hidden flex-shrink-0 relative flex items-center justify-center">
                      <img
                        src={story.cover_url || getUnsplashCover(story.id, 200, 300)}
                        alt={story.title}
                        className="w-full h-full object-cover"
                      />
                      {/* 3D Spine Simulation Overlay */}
                      <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-r from-black/45 via-black/15 to-transparent z-20 border-r border-black/10" />
                      <div className="absolute left-1.5 top-0 bottom-0 w-[0.25px] bg-white/5 z-20" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{story.title}</p>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                        <span>{story.view_count} views</span>
                        <span>{story.read_count} reads</span>
                        <span>{story.like_count} likes</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">{story.chapter_count} chapters</p>
                      <p className="text-xs text-muted-foreground">{story.word_count} words</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}

function formatNumber(num: number): string {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M'
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K'
  return num.toString()
}
