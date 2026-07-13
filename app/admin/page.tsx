'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/lib/supabase/auth-context'
import { SiteHeader } from '@/components/site-header'
import { Story, Profile, Report, Chapter, Comment } from '@/lib/types/database'
import { getMockStories, getMockReadingLogs, MockReadingLog } from '@/lib/mock-stories'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import {
  Shield,
  Users,
  BookOpen,
  Flag,
  BarChart3,
  TrendingUp,
  AlertTriangle,
  MoreVertical,
  Eye,
  Trash2,
  Ban,
  CheckCircle,
  XCircle,
  Loader2,
  Clock,
  Mail,
} from 'lucide-react'
import { toast } from 'sonner'
import { format, formatDistanceToNow } from 'date-fns'

export default function AdminPage() {
  const router = useRouter()
  const { user, profile } = useAuth()
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    users: 0,
    stories: 0,
    reports: 0,
    pendingReports: 0,
  })
  const [reports, setReports] = useState<(Report & { reporter?: Profile; reported_user?: Profile; story?: Story; chapter?: Chapter })[]>([])
  const [users, setUsers] = useState<Profile[]>([])
  const [recentStories, setRecentStories] = useState<Story[]>([])
  const [selectedReport, setSelectedReport] = useState<typeof reports[0] | null>(null)
  const [actionDialog, setActionDialog] = useState(false)
  const [actionReason, setActionReason] = useState('')
  const [analyticsStories, setAnalyticsStories] = useState<any[]>([])
  const [selectedAnalyticsStory, setSelectedAnalyticsStory] = useState<string>('')
  const [readingLogs, setReadingLogs] = useState<MockReadingLog[]>([])

  useEffect(() => {
    if (profile && profile.role !== 'admin' && profile.role !== 'moderator') {
      toast.error('Access denied')
      router.push('/dashboard')
      return
    }
    loadAdminData()
  }, [profile])

  useEffect(() => {
    if (selectedAnalyticsStory) {
      const logs = getMockReadingLogs(selectedAnalyticsStory)
      setReadingLogs(logs)
    }
  }, [selectedAnalyticsStory])

  async function loadAdminData() {
    if (!user) return

    const [userCount, storyCount, reportCount, pendingCount, reportData, userData, storyData] = await Promise.all([
      supabase.from('profiles').select('id', { count: 'exact', head: true }),
      supabase.from('stories').select('id', { count: 'exact', head: true }),
      supabase.from('reports').select('id', { count: 'exact', head: true }),
      supabase.from('reports').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
      supabase.from('reports')
        .select(`
          *,
          reporter:profiles!reporter_id(*),
          reported_user:profiles!reported_user_id(*),
          story:stories(*),
          chapter:chapters(*)
        `)
        .order('created_at', { ascending: false })
        .limit(20),
      supabase.from('profiles').select('*').order('created_at', { ascending: false }).limit(20),
      supabase.from('stories').select('*').order('created_at', { ascending: false }).limit(20),
    ])

    const activeStories = storyData.data && storyData.data.length > 0
      ? storyData.data
      : getMockStories()

    setStats({
      users: userCount.count || 0,
      stories: storyCount.count || activeStories.length,
      reports: reportCount.count || 0,
      pendingReports: pendingCount.count || 0,
    })

    if (reportData.data) setReports(reportData.data)
    if (userData.data) setUsers(userData.data)
    
    setRecentStories(activeStories.slice(0, 10))
    setAnalyticsStories(activeStories)
    
    if (activeStories.length > 0) {
      setSelectedAnalyticsStory(activeStories[0].id)
      setReadingLogs(getMockReadingLogs(activeStories[0].id))
    }

    setLoading(false)
  }

  const handleReportAction = async (status: 'resolved' | 'dismissed', action_taken?: string) => {
    if (!selectedReport) return

    const { error } = await supabase
      .from('reports')
      .update({
        status,
        action_taken,
        reviewed_by: user!.id,
        reviewed_at: new Date().toISOString(),
      } as any)
      .eq('id', selectedReport.id)

    if (error) {
      toast.error('Failed to update report')
      return
    }

    // Notify reporter
    await supabase.from('notifications').insert({
      user_id: selectedReport.reporter_id,
      type: 'report_status',
      title: 'Report Update',
      content: `Your report has been ${status}. ${action_taken || ''}`,
      data: { report_id: selectedReport.id, status },
    } as any)

    toast.success(`Report ${status}`)
    setActionDialog(false)
    loadAdminData()
  }

  const handleUserRoleChange = async (userId: string, newRole: string) => {
    const { error } = await supabase
      .from('profiles')
      .update({ role: newRole })
      .eq('id', userId)

    if (error) {
      toast.error('Failed to update role')
    } else {
      toast.success('Role updated')
      loadAdminData()
    }
  }

  const statusColors: Record<string, string> = {
    pending: 'bg-yellow-500/10 text-yellow-600',
    reviewing: 'bg-blue-500/10 text-blue-600',
    resolved: 'bg-green-500/10 text-green-600',
    dismissed: 'bg-gray-500/10 text-gray-600',
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
        <div className="flex items-center gap-4 mb-8">
          <Shield className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-serif font-bold">Admin Dashboard</h1>
            <p className="text-muted-foreground">Manage Vensoul platform</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                  <Users className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.users}</p>
                  <p className="text-xs text-muted-foreground">Users</p>
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
                  <p className="text-2xl font-bold">{stats.stories}</p>
                  <p className="text-xs text-muted-foreground">Stories</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-orange-500/10 flex items-center justify-center">
                  <Flag className="h-5 w-5 text-orange-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.reports}</p>
                  <p className="text-xs text-muted-foreground">Reports</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-red-500/10 flex items-center justify-center">
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.pendingReports}</p>
                  <p className="text-xs text-muted-foreground">Pending Reports</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="reports" className="space-y-6">
          <TabsList>
            <TabsTrigger value="reports">
              <Flag className="h-4 w-4 mr-2" />
              Reports
            </TabsTrigger>
            <TabsTrigger value="users">
              <Users className="h-4 w-4 mr-2" />
              Users
            </TabsTrigger>
            <TabsTrigger value="stories">
              <BookOpen className="h-4 w-4 mr-2" />
              Stories
            </TabsTrigger>
            <TabsTrigger value="analytics">
              <BarChart3 className="h-4 w-4 mr-2" />
              Live Reading Tracker
            </TabsTrigger>
          </TabsList>

          {/* Reports Tab */}
          <TabsContent value="reports">
            <Card>
              <CardHeader>
                <CardTitle>Content Reports</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Reporter</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Reason</TableHead>
                      <TableHead>Reported</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {reports.map((report) => (
                      <TableRow key={report.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={report.reporter?.avatar_url || ''} />
                              <AvatarFallback>
                                {report.reporter?.username?.charAt(0).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-sm">@{report.reporter?.username}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          {report.story ? 'Story' : report.chapter ? 'Chapter' : report.comment_id ? 'Comment' : 'User'}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{report.reason}</Badge>
                        </TableCell>
                        <TableCell>
                          {report.reported_user && (
                            <span>@{report.reported_user.username}</span>
                          )}
                          {report.story && (
                            <span className="text-sm truncate max-w-32 block">{report.story.title}</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge className={statusColors[report.status]}>{report.status}</Badge>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {formatDistanceToNow(new Date(report.created_at), { addSuffix: true })}
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuItem onClick={() => setSelectedReport(report)}>
                                <Eye className="h-4 w-4 mr-2" />
                                View Details
                              </DropdownMenuItem>
                              {report.status === 'pending' && (
                                <>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem
                                    onClick={() => {
                                      setSelectedReport(report)
                                      setActionDialog(true)
                                    }}
                                  >
                                    <CheckCircle className="h-4 w-4 mr-2" />
                                    Take Action
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() => handleReportAction('dismissed')}
                                  >
                                    <XCircle className="h-4 w-4 mr-2" />
                                    Dismiss
                                  </DropdownMenuItem>
                                </>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users">
            <Card>
              <CardHeader>
                <CardTitle>User Management</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Stories</TableHead>
                      <TableHead>Followers</TableHead>
                      <TableHead>Joined</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((userItem) => (
                      <TableRow key={userItem.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={userItem.avatar_url || ''} />
                              <AvatarFallback>
                                {userItem.username.charAt(0).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium text-sm">{userItem.display_name || userItem.username}</p>
                              <p className="text-xs text-muted-foreground">@{userItem.username}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Select
                            value={userItem.role}
                            onValueChange={(v) => handleUserRoleChange(userItem.id, v)}
                            disabled={profile?.role !== 'admin'}
                          >
                            <SelectTrigger className="w-32">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="reader">Reader</SelectItem>
                              <SelectItem value="author">Author</SelectItem>
                              <SelectItem value="moderator">Moderator</SelectItem>
                              <SelectItem value="admin">Admin</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>{userItem.story_count}</TableCell>
                        <TableCell>{userItem.follower_count}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {format(new Date(userItem.created_at), 'MMM d, yyyy')}
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem asChild>
                                <Link href={`/@${userItem.username}`}>
                                  <Eye className="h-4 w-4 mr-2" />
                                  View Profile
                                </Link>
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Stories Tab */}
          <TabsContent value="stories">
            <Card>
              <CardHeader>
                <CardTitle>Recent Stories</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Views</TableHead>
                      <TableHead>Likes</TableHead>
                      <TableHead>Chapters</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentStories.map((story) => (
                      <TableRow key={story.id}>
                        <TableCell>
                          <Link href={`/story/${story.id}`} className="font-medium hover:text-primary">
                            {story.title}
                          </Link>
                        </TableCell>
                        <TableCell>
                          <Badge
                            className={
                              story.status === 'published' ? 'bg-green-500/10 text-green-600' :
                              story.status === 'draft' ? 'bg-yellow-500/10 text-yellow-600' :
                              'bg-gray-500/10 text-gray-600'
                            }
                          >
                            {story.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{story.view_count}</TableCell>
                        <TableCell>{story.like_count}</TableCell>
                        <TableCell>{story.chapter_count}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {format(new Date(story.created_at), 'MMM d, yyyy')}
                        </TableCell>
                        <TableCell>
                          <Button variant="ghost" size="sm" asChild>
                            <Link href={`/story/${story.id}`}>
                              <Eye className="h-4 w-4" />
                            </Link>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Live Reading Tracker Tab */}
          <TabsContent value="analytics">
            <Card>
              <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <CardTitle>Live Reading Tracker</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1 font-sans">
                    Monitor live reader traffic, chapter-level metrics, and reading times.
                  </p>
                </div>
                <Select value={selectedAnalyticsStory} onValueChange={setSelectedAnalyticsStory}>
                  <SelectTrigger className="w-64">
                    <SelectValue placeholder="Select story to track" />
                  </SelectTrigger>
                  <SelectContent>
                    {analyticsStories.map((story) => (
                      <SelectItem key={story.id} value={story.id}>
                        {story.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </CardHeader>
              <CardContent>
                {/* Stats Summary for selected story */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                  <div className="p-4 rounded-lg bg-amber-500/5 border border-amber-500/10">
                    <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Average Time Spent</p>
                    <p className="text-2xl font-bold font-serif text-amber-800 dark:text-amber-400 mt-1">14.8 mins</p>
                  </div>
                  <div className="p-4 rounded-lg bg-primary/5 border border-primary/10">
                    <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Completion Rate</p>
                    <p className="text-2xl font-bold font-serif text-primary mt-1">82.4%</p>
                  </div>
                  <div className="p-4 rounded-lg bg-secondary/80 border border-border/40">
                    <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Live Active Readers</p>
                    <p className="text-2xl font-bold font-serif text-foreground mt-1">{readingLogs.length} active</p>
                  </div>
                </div>

                {/* Reader Log Table */}
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Reader</TableHead>
                      <TableHead>Current Chapter</TableHead>
                      <TableHead className="w-1/3">Reading Progress</TableHead>
                      <TableHead>Time Spent</TableHead>
                      <TableHead>Last Active</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {readingLogs.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                          No reading logs available for this story.
                        </TableCell>
                      </TableRow>
                    ) : (
                      readingLogs.map((log) => (
                        <TableRow key={log.id}>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Avatar className="h-8 w-8">
                                <AvatarImage src={log.avatar_url} />
                                <AvatarFallback>{log.username.charAt(0).toUpperCase()}</AvatarFallback>
                              </Avatar>
                              <span className="text-sm font-medium">@{log.username}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-sm text-foreground/80">
                            {log.chapter_title}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
                                <div 
                                  className="h-full bg-primary transition-all duration-500" 
                                  style={{ width: `${log.progress_percent}%` }}
                                />
                              </div>
                              <span className="text-xs font-medium min-w-8">{log.progress_percent}%</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-sm text-foreground/80 font-medium">
                            {log.time_spent_minutes} mins
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground">
                            {log.last_active}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Action Dialog */}
        <Dialog open={actionDialog} onOpenChange={setActionDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Take Action on Report</DialogTitle>
              <DialogDescription>
                Review the report and take appropriate action.
              </DialogDescription>
            </DialogHeader>

            {selectedReport && (
              <div className="space-y-4 py-4">
                <div className="bg-muted p-4 rounded-lg">
                  <p className="text-sm font-medium mb-1">Report Details</p>
                  <p className="text-sm text-muted-foreground">Reason: {selectedReport.reason}</p>
                  <p className="text-sm text-muted-foreground">
                    Description: {selectedReport.description || 'No description provided'}
                  </p>
                </div>

                <div className="space-y-2">
                  <p className="text-sm font-medium">Action Taken</p>
                  <Textarea
                    placeholder="Describe the action taken..."
                    value={actionReason}
                    onChange={(e) => setActionReason(e.target.value)}
                  />
                </div>
              </div>
            )}

            <DialogFooter>
              <Button variant="outline" onClick={() => setActionDialog(false)}>
                Cancel
              </Button>
              <Button variant="outline" onClick={() => handleReportAction('dismissed')}>
                Dismiss
              </Button>
              <Button onClick={() => handleReportAction('resolved', actionReason)}>
                Resolve
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  )
}
