'use client'

import { useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/lib/supabase/auth-context'
import { SiteHeader } from '@/components/site-header'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Flag, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

const reportReasons = [
  { value: 'spam', label: 'Spam or misleading' },
  { value: 'harassment', label: 'Harassment or bullying' },
  { value: 'inappropriate', label: 'Inappropriate content' },
  { value: 'copyright', label: 'Copyright violation' },
  { value: 'other', label: 'Other' },
]

export default function ReportPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { user } = useAuth()

  const storyId = searchParams.get('story')
  const chapterId = searchParams.get('chapter')
  const commentId = searchParams.get('comment')
  const userId = searchParams.get('user')

  const [reason, setReason] = useState('')
  const [description, setDescription] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) {
      toast.error('Please sign in to report content')
      return
    }
    if (!reason) {
      toast.error('Please select a reason')
      return
    }

    setLoading(true)

    const reportData: any = {
      reporter_id: user.id,
      reason,
      description: description || null,
    }

    if (storyId) reportData.story_id = storyId
    if (chapterId) reportData.chapter_id = chapterId
    if (commentId) reportData.comment_id = commentId
    if (userId) reportData.reported_user_id = userId

    const { error } = await supabase
      .from('reports')
      .insert(reportData)

    if (error) {
      toast.error('Failed to submit report')
    } else {
      toast.success('Report submitted. Thank you for helping keep Vensoul safe.')
      router.back()
    }

    setLoading(false)
  }

  const getReportTarget = () => {
    if (storyId) return 'story'
    if (chapterId) return 'chapter'
    if (commentId) return 'comment'
    if (userId) return 'user'
    return 'content'
  }

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="container px-4 py-8 max-w-2xl">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <Flag className="h-6 w-6 text-orange-500" />
              <CardTitle>Report {getReportTarget()}</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label>Reason</Label>
                <Select value={reason} onValueChange={setReason}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a reason" />
                  </SelectTrigger>
                  <SelectContent>
                    {reportReasons.map((r) => (
                      <SelectItem key={r.value} value={r.value}>
                        {r.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Details (optional)</Label>
                <Textarea
                  placeholder="Provide additional details about your report..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                />
              </div>

              <div className="bg-muted p-4 rounded-lg text-sm text-muted-foreground">
                <p className="font-medium mb-1">Important</p>
                <p>
                  False reports may result in account restrictions. Our moderation team will review your report within 24-48 hours.
                </p>
              </div>

              <div className="flex gap-3">
                <Button type="button" variant="outline" onClick={() => router.back()}>
                  Cancel
                </Button>
                <Button type="submit" disabled={loading || !reason}>
                  {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  Submit Report
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
