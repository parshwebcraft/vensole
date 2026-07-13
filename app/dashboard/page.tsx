'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/lib/supabase/auth-context'
import { SiteHeader } from '@/components/site-header'
import { Story, Chapter } from '@/lib/types/database'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  PenLine,
  BookOpen,
  Eye,
  Heart,
  BookMarked,
  TrendingUp,
  Calendar,
  Plus,
  Settings,
  ArrowRight,
  Loader2,
  BarChart3,
} from 'lucide-react'

export default function DashboardPage() {
  const { user, profile } = useAuth()
  const [stats, setStats] = useState({
    storyCount: 0,
    totalViews: 0,
    totalLikes: 0,
    totalReads: 0,
    followerCount: 0,
  })
  const [recentStories, setRecentStories] = useState<(Story & { chapters: Chapter[] })[]>([])
  const [drafts, setDrafts] = useState<Story[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadDashboard() {
      if (!user) return

      // Load stats
      const [storiesData, followersData] = await Promise.all([
        supabase.from('stories').select('*').eq('user_id', user.id),
        supabase.from('follows').select('id').eq('following_id', user.id),
      ])

      let totalViews = 0
      let totalLikes = 0
      let totalReads = 0

      if (storiesData.data) {
        totalViews = storiesData.data.reduce((sum, s) => sum + (s.view_count || 0), 0)
        totalLikes = storiesData.data.reduce((sum, s) => sum + (s.like_count || 0), 0)
        totalReads = storiesData.data.reduce((sum, s) => sum + (s.read_count || 0), 0)

        // Get recent stories with chapters
        const recentData = await supabase
          .from('stories')
          .select('*, chapters(*)')
          .eq('user_id', user.id)
          .order('updated_at', { ascending: false })
          .limit(4)

        if (recentData.data) {
          setRecentStories(recentData.data)
        }

        // Get drafts
        const draftsData = await supabase
          .from('stories')
          .select('*')
          .eq('user_id', user.id)
          .eq('status', 'draft')
          .order('updated_at', { ascending: false })
          .limit(5)

        if (draftsData.data) {
          setDrafts(draftsData.data)
        }
      }

      setStats({
        storyCount: storiesData.data?.length || 0,
        totalViews,
        totalLikes,
        totalReads,
        followerCount: followersData.data?.length || 0,
      })

      setLoading(false)
    }

    loadDashboard()
  }, [user])

  const statusColors: Record<string, string> = {
    draft: 'bg-yellow-500/10 text-yellow-600',
    published: 'bg-green-500/10 text-green-600',
    archived: 'bg-gray-500/10 text-gray-600',
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
            <h1 className="text-3xl font-serif font-bold">Dashboard</h1>
            <p className="text-muted-foreground mt-1">
              Welcome back, @{profile?.username}
            </p>
          </div>
          <Button asChild>
            <Link href="/write">
              <Plus className="h-4 w-4 mr-2" />
              Create New Story
            </Link>
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <BookOpen className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.storyCount}</p>
                  <p className="text-xs text-muted-foreground">Stories</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                  <Eye className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{formatNumber(stats.totalViews)}</p>
                  <p className="text-xs text-muted-foreground">Views</p>
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
                  <p className="text-2xl font-bold">{formatNumber(stats.totalLikes)}</p>
                  <p className="text-xs text-muted-foreground">Likes</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{formatNumber(stats.totalReads)}</p>
                  <p className="text-xs text-muted-foreground">Reads</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                  <BookMarked className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{formatNumber(stats.followerCount)}</p>
                  <p className="text-xs text-muted-foreground">Followers</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Content Grid */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Recent Stories */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg">Your Stories</CardTitle>
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/my/stories">
                    View All
                    <ArrowRight className="h-4 w-4 ml-1" />
                  </Link>
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                {recentStories.length === 0 ? (
                  <div className="text-center py-8">
                    <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                    <p className="text-muted-foreground">You haven&apos;t written any stories yet</p>
                    <Button className="mt-4" asChild>
                      <Link href="/write">
                        <PenLine className="h-4 w-4 mr-2" />
                        Write Your First Story
                      </Link>
                    </Button>
                  </div>
                ) : (
                  recentStories.map((story) => (
                    <Link
                      key={story.id}
                      href={`/write/${story.id}`}
                      className="flex items-start gap-4 p-4 rounded-lg hover:bg-secondary/50 transition-colors group"
                    >
                      <div className="w-20 h-28 bg-muted rounded-md overflow-hidden flex-shrink-0 flex items-center justify-center">
                        {story.cover_url ? (
                          <img
                            src={story.cover_url}
                            alt={story.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (() => {
                          const bookThemes = [
                            { bg: 'from-amber-950 to-stone-900', line: 'bg-amber-500/20' },
                            { bg: 'from-emerald-950 to-stone-900', line: 'bg-emerald-500/20' },
                            { bg: 'from-indigo-950 to-stone-900', line: 'bg-indigo-500/20' },
                            { bg: 'from-rose-950 to-stone-900', line: 'bg-rose-500/20' },
                            { bg: 'from-stone-800 to-stone-950', line: 'bg-primary/20' }
                          ]
                          const themeIndex = story.id ? story.id.charCodeAt(0) % bookThemes.length : 0
                          const theme = bookThemes[themeIndex]

                          return (
                            <div
                              className={`w-full h-full bg-gradient-to-br ${theme.bg} flex flex-col justify-between p-2 text-left relative select-none shadow-sm overflow-hidden`}
                            >
                              {/* Book spine simulation */}
                              <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-r from-black/45 via-black/15 to-transparent z-20 border-r border-black/10" />
                              <div className="absolute left-1.5 top-0 bottom-0 w-[0.25px] bg-white/5 z-20" />
                              
                              {/* Content wrapper */}
                              <div className="z-10 pl-1 flex flex-col h-full justify-between">
                                {/* Book header */}
                                <div className={`w-4 h-[1px] ${theme.line} mt-1`} />

                                {/* Book center */}
                                <div className="my-auto">
                                  <h4 className="font-serif font-semibold text-white/90 leading-tight tracking-wide text-[9px] line-clamp-3">
                                    {story.title}
                                  </h4>
                                </div>

                                {/* Book footer */}
                                <div className="flex items-center opacity-25">
                                  <BookOpen className="h-2 w-2 text-white" />
                                </div>
                              </div>
                            </div>
                          )
                        })()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`text-xs px-2 py-0.5 rounded-full ${statusColors[story.status]}`}>
                            {story.status}
                          </span>
                          {story.is_featured && (
                            <Badge variant="secondary" className="text-xs">Featured</Badge>
                          )}
                        </div>
                        <h3 className="font-semibold group-hover:text-primary transition-colors">
                          {story.title}
                        </h3>
                        <p className="text-sm text-muted-foreground line-clamp-1 mt-1">
                          {story.description || 'No description'}
                        </p>
                        <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                          <span>{story.chapters?.length || 0} chapters</span>
                          <span>{formatNumber(story.view_count)} views</span>
                          <span>{formatNumber(story.like_count)} likes</span>
                        </div>
                      </div>
                    </Link>
                  ))
                )}
              </CardContent>
            </Card>

            {/* Drafts */}
            {drafts.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Drafts</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {drafts.map((draft) => (
                    <Link
                      key={draft.id}
                      href={`/write/${draft.id}`}
                      className="flex items-center justify-between p-3 rounded-lg hover:bg-secondary/50 transition-colors"
                    >
                      <div>
                        <h3 className="font-medium">{draft.title}</h3>
                        <p className="text-xs text-muted-foreground mt-1">
                          Last edited {formatDate(draft.updated_at)}
                        </p>
                      </div>
                      <Button variant="ghost" size="sm">
                        Continue Editing
                      </Button>
                    </Link>
                  ))}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-start" asChild>
                  <Link href="/write">
                    <Plus className="h-4 w-4 mr-2" />
                    Create New Story
                  </Link>
                </Button>
                <Button variant="outline" className="w-full justify-start" asChild>
                  <Link href="/my/library">
                    <BookMarked className="h-4 w-4 mr-2" />
                    My Library
                  </Link>
                </Button>
                <Button variant="outline" className="w-full justify-start" asChild>
                  <Link href="/my/analytics">
                    <BarChart3 className="h-4 w-4 mr-2" />
                    Story Analytics
                  </Link>
                </Button>
                <Button variant="outline" className="w-full justify-start" asChild>
                  <Link href="/settings">
                    <Settings className="h-4 w-4 mr-2" />
                    Settings
                  </Link>
                </Button>
              </CardContent>
            </Card>

            {/* Cozy Desk Ambience Widget */}
            <Card className="relative overflow-hidden border border-border/40 bg-gradient-to-br from-amber-500/5 to-transparent select-none">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-serif font-semibold tracking-wide text-amber-800 dark:text-amber-400">Cozy Writing Desk</CardTitle>
              </CardHeader>
              <CardContent className="flex items-center justify-around py-4">
                {/* 3D Floating Candle */}
                <div className="relative w-12 h-24 flex flex-col items-center justify-end">
                  {/* Flicker flame */}
                  <div className="w-2.5 h-4 bg-gradient-to-t from-orange-600 via-amber-400 to-yellow-100 rounded-full blur-[0.5px] animate-flicker absolute top-2" />
                  <div className="w-1.5 h-1.5 bg-yellow-300 rounded-full blur-[1px] absolute top-3 animate-pulse" />
                  {/* Wick */}
                  <div className="w-[1.5px] h-3 bg-stone-800 absolute top-5" />
                  {/* Candle Wax Body */}
                  <div className="w-6 h-16 bg-gradient-to-r from-amber-100 via-amber-50 to-amber-200 dark:from-stone-700 dark:via-stone-600 dark:to-stone-700 rounded-sm shadow-md relative">
                    {/* Melting wax drip */}
                    <div className="absolute top-0 left-1 w-[2px] h-4 bg-amber-50/80 dark:bg-stone-500/80 rounded-full" />
                    <div className="absolute top-0 right-2 w-[1.5px] h-6 bg-amber-50/60 dark:bg-stone-500/60 rounded-full" />
                  </div>
                </div>

                {/* Floating Feather Quill */}
                <div className="relative w-12 h-24 flex items-center justify-center animate-quill-float">
                  <div className="relative rotate-[35deg] transform origin-bottom-right">
                    {/* Quill Feather */}
                    <div className="w-4 h-16 bg-gradient-to-t from-amber-800 to-amber-100/30 rounded-full opacity-70 border-r border-amber-900/20" />
                    {/* Quill nib */}
                    <div className="w-1 h-3 bg-amber-950 mx-auto" />
                  </div>
                  {/* Small ink pot */}
                  <div className="absolute bottom-1 w-6 h-4 bg-stone-900 border border-stone-800 rounded-t-md shadow-sm" />
                </div>
              </CardContent>
              {/* Animations CSS */}
              <style jsx>{`
                @keyframes flicker {
                  0%, 100% { transform: scale(1) rotate(-1deg); opacity: 0.9; }
                  50% { transform: scale(1.08) rotate(1deg); opacity: 1; filter: blur(0.8px); }
                }
                @keyframes floatQuill {
                  0%, 100% { transform: translateY(0) rotate(0); }
                  50% { transform: translateY(-4px) rotate(2deg); }
                }
                .animate-flicker {
                  animation: flicker 0.15s infinite alternate;
                }
                .animate-quill-float {
                  animation: floatQuill 3s ease-in-out infinite;
                }
              `}</style>
            </Card>

            {/* Reading Streak & Achievement Cabinet */}
            <Card className="border border-border/40">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <span>Reading Streak</span>
                  <span className="animate-pulse">🔥</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Streak Counter */}
                <div className="flex items-center justify-between bg-amber-500/5 dark:bg-amber-500/10 p-3.5 rounded-xl border border-amber-500/10">
                  <div>
                    <p className="text-xs text-muted-foreground uppercase font-semibold font-sans tracking-wide">Current Streak</p>
                    <p className="text-3xl font-bold font-serif text-amber-600 dark:text-amber-400 mt-1">7 Days 🔥</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-muted-foreground">Next reward in 3 days</p>
                    <p className="text-xs font-medium text-foreground mt-1">Goal: 10 Days 🏆</p>
                  </div>
                </div>

                {/* Challenge Milestone progress bar */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Monthly Challenger Challenge</span>
                    <span className="font-semibold text-foreground">18 / 30 Days</span>
                  </div>
                  <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                    <div className="h-full bg-primary rounded-full" style={{ width: '60%' }} />
                  </div>
                </div>

                {/* Achievements Cabinet */}
                <div className="space-y-3">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Unlocked Badges</p>
                  <div className="grid grid-cols-4 gap-2">
                    {/* Badge 1 */}
                    <div className="flex flex-col items-center gap-1 text-center group cursor-help">
                      <div className="w-10 h-10 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-500 hover:bg-amber-500/20 transition-colors">
                        <span className="text-lg">🔥</span>
                      </div>
                      <span className="text-[9px] text-muted-foreground group-hover:text-amber-500 transition-colors">7 Day Fire</span>
                    </div>

                    {/* Badge 2 */}
                    <div className="flex flex-col items-center gap-1 text-center group cursor-help">
                      <div className="w-10 h-10 rounded-full bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-500 hover:bg-blue-500/20 transition-colors">
                        <span className="text-lg">📚</span>
                      </div>
                      <span className="text-[9px] text-muted-foreground group-hover:text-blue-500 transition-colors">Ink Drinker</span>
                    </div>

                    {/* Badge 3 */}
                    <div className="flex flex-col items-center gap-1 text-center group cursor-help">
                      <div className="w-10 h-10 rounded-full bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-500 hover:bg-purple-500/20 transition-colors">
                        <span className="text-lg">🔮</span>
                      </div>
                      <span className="text-[9px] text-muted-foreground group-hover:text-purple-500 transition-colors">Sage Scribe</span>
                    </div>

                    {/* Badge 4 */}
                    <div className="flex flex-col items-center gap-1 text-center group cursor-help">
                      <div className="w-10 h-10 rounded-full bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-500 hover:bg-rose-500/20 transition-colors">
                        <span className="text-lg">💖</span>
                      </div>
                      <span className="text-[9px] text-muted-foreground group-hover:text-rose-500 transition-colors">Romance Fan</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-3 text-sm">
                    <div className="h-8 w-8 rounded-full bg-green-500/10 flex items-center justify-center">
                      <Heart className="h-4 w-4 text-green-600" />
                    </div>
                    <p className="text-muted-foreground">
                      Start writing to see your engagement stats here
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
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

function formatDate(date: string): string {
  const d = new Date(date)
  const now = new Date()
  const diff = now.getTime() - d.getTime()

  if (diff < 60000) return 'just now'
  if (diff < 3600000) return `${Math.floor(diff / 60000)} minutes ago`
  if (diff < 86400000) return `${Math.floor(diff / 3600000)} hours ago`
  if (diff < 604800000) return `${Math.floor(diff / 86400000)} days ago`
  return d.toLocaleDateString()
}
