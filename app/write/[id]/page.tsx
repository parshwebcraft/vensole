'use client'

import { useEffect, useState, use } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/lib/supabase/auth-context'
import { SiteHeader } from '@/components/site-header'
import { RichTextEditor } from '@/components/rich-text-editor'
import { Story, Chapter, Genre } from '@/lib/types/database'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Save,
  Eye,
  Settings,
  Plus,
  ChevronRight,
  Trash2,
  GripVertical,
  BookOpen,
  MoreVertical,
  Loader2,
  FileText,
  Home,
  Menu,
  ArrowLeft,
  ArrowRight,
} from 'lucide-react'
import { toast } from 'sonner'
import Link from 'next/link'

const ageRatings = [
  { value: 'everyone', label: 'Everyone' },
  { value: 'teen', label: 'Teen (13+)' },
  { value: 'mature', label: 'Mature (18+)' },
  { value: 'adult', label: 'Adult Only' },
]

const contentWarnings = [
  'Violence', 'Strong Language', 'Sexual Content', 'Drug Use',
  'Suicide', 'Self-Harm', 'Abuse', 'Mental Health', 'Horror'
]

export default function StoryEditorPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const router = useRouter()
  const { user } = useAuth()
  const [story, setStory] = useState<Story | null>(null)
  const [chapters, setChapters] = useState<Chapter[]>([])
  const [selectedChapter, setSelectedChapter] = useState<Chapter | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [availableGenres, setAvailableGenres] = useState<Genre[]>([])

  // Story settings state
  const [storySettings, setStorySettings] = useState({
    title: '',
    description: '',
    age_rating: 'everyone',
    content_warnings: [] as string[],
    selectedGenres: [] as string[],
    status: 'draft' as 'draft' | 'published' | 'archived',
    is_completed: false,
  })

  // Chapter editing state
  const [chapterContent, setChapterContent] = useState('')
  const [chapterTitle, setChapterTitle] = useState('')

  useEffect(() => {
    loadData()
  }, [resolvedParams.id, user])

  async function loadData() {
    if (!user) return

    const [genreResult, storyResult, chapterResult] = await Promise.all([
      supabase.from('genres').select('*').order('name'),
      supabase.from('stories').select('*').eq('id', resolvedParams.id).maybeSingle(),
      supabase.from('chapters').select('*').eq('story_id', resolvedParams.id).order('chapter_number', { ascending: true }),
    ])

    if (genreResult.data) {
      setAvailableGenres(genreResult.data)
    }

    if (storyResult.data) {
      if (storyResult.data.user_id !== user.id) {
        toast.error('You do not have permission to edit this story')
        router.push('/dashboard')
        return
      }

      setStory(storyResult.data)
      setStorySettings({
        title: storyResult.data.title,
        description: storyResult.data.description || '',
        age_rating: storyResult.data.age_rating,
        content_warnings: storyResult.data.content_warnings || [],
        selectedGenres: [],
        status: storyResult.data.status as any,
        is_completed: storyResult.data.is_completed,
      })

      // Load story genres
      const { data: storyGenres } = await supabase
        .from('story_genres')
        .select('genre_id')
        .eq('story_id', storyResult.data.id)

      if (storyGenres) {
        setStorySettings(prev => ({
          ...prev,
          selectedGenres: storyGenres.map((sg: any) => sg.genre_id),
        }))
      }
    }

    if (chapterResult.data) {
      setChapters(chapterResult.data)
      if (chapterResult.data.length > 0) {
        setSelectedChapter(chapterResult.data[0])
        setChapterContent(chapterResult.data[0].content)
        setChapterTitle(chapterResult.data[0].title)
      }
    }

    setLoading(false)
  }

  const handleSaveStory = async () => {
    if (!story) return
    setSaving(true)

    const { error: storyError } = await supabase
      .from('stories')
      .update({
        title: storySettings.title,
        description: storySettings.description || null,
        age_rating: storySettings.age_rating,
        content_warnings: storySettings.content_warnings,
        status: storySettings.status,
        is_completed: storySettings.is_completed,
      })
      .eq('id', story.id)

    if (storyError) {
      toast.error('Failed to save story settings')
      setSaving(false)
      return
    }

    // Update genres
    await supabase.from('story_genres').delete().eq('story_id', story.id)
    if (storySettings.selectedGenres.length > 0) {
      await supabase.from('story_genres').insert(
        storySettings.selectedGenres.map(genreId => ({
          story_id: story.id,
          genre_id: genreId,
        }))
      )
    }

    toast.success('Story settings saved!')
    setSaving(false)
  }

  const handleSaveChapter = async () => {
    if (!selectedChapter || !story) return
    setSaving(true)

    const wordCount = chapterContent.replace(/<[^>]*>/g, '').split(/\s+/).filter(Boolean).length

    const { error } = await supabase
      .from('chapters')
      .update({
        title: chapterTitle,
        content: chapterContent,
        word_count: wordCount,
      })
      .eq('id', selectedChapter.id)

    if (error) {
      toast.error('Failed to save chapter')
    } else {
      const updatedChapters = chapters.map(c =>
        c.id === selectedChapter.id
          ? { ...c, title: chapterTitle, content: chapterContent, word_count: wordCount }
          : c
      )
      setChapters(updatedChapters)
      setSelectedChapter({ ...selectedChapter, title: chapterTitle, content: chapterContent, word_count: wordCount })
      toast.success('Chapter saved!')
    }

    // Update story word count
    const totalWords = chapters.reduce((sum, c) => sum + (c.word_count || 0), 0)
    await supabase
      .from('stories')
      .update({ word_count: totalWords })
      .eq('id', story.id)

    setSaving(false)
  }

  const handleAddChapter = async () => {
    if (!story) return

    const nextChapter = chapters.length + 1
    const { data, error } = await supabase
      .from('chapters')
      .insert({
        story_id: story.id,
        title: `Chapter ${nextChapter}`,
        content: '',
        chapter_number: nextChapter,
        status: 'draft',
      })
      .select()
      .maybeSingle()

    if (data) {
      setChapters([...chapters, data])
      setSelectedChapter(data)
      setChapterContent('')
      setChapterTitle(`Chapter ${nextChapter}`)
      await supabase.from('stories').update({ chapter_count: chapters.length + 1 }).eq('id', story.id)
      toast.success('Chapter added!')
    }
  }

  const handlePublishChapter = async () => {
    if (!selectedChapter) return

    const newStatus = selectedChapter.status === 'published' ? 'draft' : 'published'
    const { error } = await supabase
      .from('chapters')
      .update({
        status: newStatus,
        published_at: newStatus === 'published' ? new Date().toISOString() : null,
      })
      .eq('id', selectedChapter.id)

    if (!error) {
      const updatedChapters = chapters.map(c =>
        c.id === selectedChapter.id ? { ...c, status: newStatus as 'published' | 'draft' } : c
      )
      setChapters(updatedChapters)
      setSelectedChapter({ ...selectedChapter, status: newStatus as 'published' | 'draft' })
      toast.success(newStatus === 'published' ? 'Chapter published!' : 'Chapter unpublished')

      if (newStatus === 'published' && story?.status === 'draft') {
        await supabase.from('stories').update({
          status: 'published',
          published_at: new Date().toISOString(),
        }).eq('id', story.id)
        setStorySettings(prev => ({ ...prev, status: 'published' }))
      }
    }
  }

  const handleDeleteChapter = async (chapterId: string) => {
    if (!confirm('Are you sure you want to delete this chapter?')) return

    await supabase.from('chapters').delete().eq('id', chapterId)
    const updated = chapters.filter(c => c.id !== chapterId)
    setChapters(updated)
    if (selectedChapter?.id === chapterId) {
      setSelectedChapter(updated[0] || null)
      if (updated[0]) {
        setChapterContent(updated[0].content)
        setChapterTitle(updated[0].title)
      }
    }
    await supabase.from('stories').update({ chapter_count: updated.length }).eq('id', story!.id)
    toast.success('Chapter deleted')
  }

  const toggleWarning = (warning: string) => {
    setStorySettings(prev => ({
      ...prev,
      content_warnings: prev.content_warnings.includes(warning)
        ? prev.content_warnings.filter(w => w !== warning)
        : [...prev.content_warnings, warning],
    }))
  }

  const toggleGenre = (genreId: string) => {
    setStorySettings(prev => ({
      ...prev,
      selectedGenres: prev.selectedGenres.includes(genreId)
        ? prev.selectedGenres.filter(g => g !== genreId)
        : prev.selectedGenres.length < 3 ? [...prev.selectedGenres, genreId] : prev.selectedGenres,
    }))
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
          <h1 className="text-2xl font-bold">Story not found</h1>
          <Button asChild className="mt-4">
            <Link href="/dashboard">Go to Dashboard</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <div className="container px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/dashboard">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Link>
            </Button>
            <div>
              <h1 className="text-xl font-serif font-bold">{storySettings.title || 'Untitled Story'}</h1>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Badge variant={storySettings.status === 'published' ? 'default' : 'secondary'}>
                  {storySettings.status}
                </Badge>
                <span>{chapters.length} chapters</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={handleSaveStory}>
              {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              <Save className="h-4 w-4 mr-2" />
              Save Settings
            </Button>
            {storySettings.status === 'published' && (
              <Button variant="outline" asChild>
                <Link href={`/story/${story.id}`} target="_blank">
                  <Eye className="h-4 w-4 mr-2" />
                  Preview
                </Link>
              </Button>
            )}
          </div>
        </div>

        <div className="grid lg:grid-cols-4 gap-6">
          {/* Chapter List */}
          <div className="lg:col-span-1 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold">Chapters</h2>
              <Button size="sm" variant="outline" onClick={handleAddChapter}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <ScrollArea className="h-[_calc(100vh-280px)]">
              <div className="space-y-1 pr-4">
                {chapters.map((chapter) => (
                  <div
                    key={chapter.id}
                    className={`group flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors ${
                      selectedChapter?.id === chapter.id
                        ? 'bg-secondary'
                        : 'hover:bg-secondary/50'
                    }`}
                    onClick={() => {
                      setSelectedChapter(chapter)
                      setChapterContent(chapter.content)
                      setChapterTitle(chapter.title)
                    }}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <GripVertical className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100" />
                      <div className="min-w-0">
                        <p className="font-medium truncate">{chapter.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {chapter.word_count} words
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Badge variant={chapter.status === 'published' ? 'default' : 'secondary'} className="text-xs">
                        {chapter.status}
                      </Badge>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 opacity-0 group-hover:opacity-100"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDeleteChapter(chapter.id)
                        }}
                      >
                        <Trash2 className="h-3 w-3 text-destructive" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>

          {/* Editor */}
          <div className="lg:col-span-3">
            <Tabs defaultValue="write" className="space-y-4">
              <div className="flex items-center justify-between">
                <TabsList>
                  <TabsTrigger value="write">Write</TabsTrigger>
                  <TabsTrigger value="settings">Story Settings</TabsTrigger>
                </TabsList>
                {selectedChapter && (
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleSaveChapter}
                      disabled={saving}
                    >
                      {saving && <Loader2 className="h-3 w-3 mr-2 animate-spin" />}
                      Save Chapter
                    </Button>
                    <Button
                      size="sm"
                      variant={selectedChapter.status === 'published' ? 'outline' : 'default'}
                      onClick={handlePublishChapter}
                    >
                      {selectedChapter.status === 'published' ? 'Unpublish' : 'Publish'}
                    </Button>
                  </div>
                )}
              </div>

              <TabsContent value="write" className="space-y-4">
                {selectedChapter ? (
                  <div className="space-y-4">
                    <div>
                      <Input
                        placeholder="Chapter Title"
                        value={chapterTitle}
                        onChange={(e) => setChapterTitle(e.target.value)}
                        className="text-xl font-serif font-semibold border-0 px-0 focus-visible:ring-0"
                      />
                      <div className="flex items-center gap-4 text-sm text-muted-foreground mt-2">
                        <span>Chapter {selectedChapter.chapter_number}</span>
                        <span>{chapterContent.replace(/<[^>]*>/g, '').split(/\s+/).filter(Boolean).length} words</span>
                        <Badge variant={selectedChapter.status === 'published' ? 'default' : 'secondary'}>
                          {selectedChapter.status}
                        </Badge>
                      </div>
                    </div>
                    <RichTextEditor
                      value={chapterContent}
                      onChange={setChapterContent}
                      placeholder="Start writing your chapter..."
                      minHeight="500px"
                    />
                  </div>
                ) : (
                  <div className="text-center py-24 text-muted-foreground">
                    <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Select a chapter to start writing</p>
                    <Button className="mt-4" onClick={handleAddChapter}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Your First Chapter
                    </Button>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="settings">
                <div className="grid md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Basic Info</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label>Story Title</Label>
                        <Input
                          value={storySettings.title}
                          onChange={(e) => setStorySettings(prev => ({ ...prev, title: e.target.value }))}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Description</Label>
                        <Textarea
                          value={storySettings.description}
                          onChange={(e) => setStorySettings(prev => ({ ...prev, description: e.target.value }))}
                          rows={4}
                        />
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Categories</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label>Genres (max 3)</Label>
                        <div className="flex flex-wrap gap-2">
                          {availableGenres.map((genre) => (
                            <Button
                              key={genre.id}
                              size="sm"
                              variant={storySettings.selectedGenres.includes(genre.id) ? 'default' : 'outline'}
                              onClick={() => toggleGenre(genre.id)}
                            >
                              {genre.name}
                            </Button>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>Age Rating</Label>
                        <Select
                          value={storySettings.age_rating}
                          onValueChange={(v) => setStorySettings(prev => ({ ...prev, age_rating: v }))}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {ageRatings.map((r) => (
                              <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Content Warnings</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        {contentWarnings.map((warning) => (
                          <Button
                            key={warning}
                            size="sm"
                            variant={storySettings.content_warnings.includes(warning) ? 'default' : 'outline'}
                            onClick={() => toggleWarning(warning)}
                          >
                            {warning}
                          </Button>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Publication</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label>Status</Label>
                        <Select
                          value={storySettings.status}
                          onValueChange={(v: any) => setStorySettings(prev => ({ ...prev, status: v }))}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="draft">Draft</SelectItem>
                            <SelectItem value="published">Published</SelectItem>
                            <SelectItem value="archived">Archived</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <Label>Completed Story</Label>
                          <p className="text-xs text-muted-foreground">Mark as finished</p>
                        </div>
                        <Switch
                          checked={storySettings.is_completed}
                          onCheckedChange={(checked) => setStorySettings(prev => ({ ...prev, is_completed: checked }))}
                        />
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="flex justify-end mt-6">
                  <Button onClick={handleSaveStory} disabled={saving}>
                    {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                    Save All Settings
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  )
}
