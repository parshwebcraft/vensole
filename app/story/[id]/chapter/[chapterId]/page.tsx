'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/lib/supabase/auth-context'
import { Chapter, StoryWithRelations, Comment, Profile } from '@/lib/types/database'
import { getDetailedMockStory } from '@/lib/mock-stories'
import { isFreePreviewChapter, isMockBookUnlocked, MOCK_BOOK_PRICE_INR, unlockMockBook } from '@/lib/mock-payments'
import { SiteHeader } from '@/components/site-header'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import {
  ChevronLeft,
  ChevronRight,
  Home,
  List,
  MessageCircle,
  Heart,
  BookmarkPlus,
  CreditCard,
  Settings,
  Loader2,
  Flag,
  IndianRupee,
  Lock,
  Send,
  ShieldCheck,
  Sparkles,
  Highlighter,
  FileText,
} from 'lucide-react'
import { toast } from 'sonner'
import { formatDistanceToNow } from 'date-fns'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { ScrollArea } from '@/components/ui/scroll-area'

export default function ChapterPage({ params }: { params: { id: string; chapterId: string } }) {
  const resolvedParams = params
  const router = useRouter()
  const { user, profile } = useAuth()
  const [story, setStory] = useState<StoryWithRelations | null>(null)
  const [chapter, setChapter] = useState<Chapter | null>(null)
  const [chapters, setChapters] = useState<Chapter[]>([])
  const [comments, setComments] = useState<(Comment & { author: Profile })[]>([])
  const [newComment, setNewComment] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [fontSize, setFontSize] = useState(18)
  const [isBookUnlocked, setIsBookUnlocked] = useState(false)
  const [paying, setPaying] = useState(false)

  useEffect(() => {
    async function loadChapter() {
      setLoading(true)

      const { data: chapterData } = await supabase
        .from('chapters')
        .select('*')
        .eq('id', resolvedParams.chapterId)
        .maybeSingle()

      if (chapterData) {
        setChapter(chapterData)

        const { data: storyData } = await supabase
          .from('stories')
          .select(`
            *,
            author:profiles!user_id(*),
            genres:story_genres(
              genre:genres(*)
            )
          `)
          .eq('id', chapterData.story_id)
          .maybeSingle()

        if (storyData) {
          setStory({
            ...storyData,
            genres: storyData.genres?.map((sg: any) => sg.genre).filter(Boolean) || [],
          })
        }

        const { data: allChapters } = await supabase
          .from('chapters')
          .select('*')
          .eq('story_id', chapterData.story_id)
          .eq('status', 'published')
          .order('chapter_number', { ascending: true })

        if (allChapters) {
          setChapters(allChapters)
        }

        // Load comments
        const { data: commentData } = await supabase
          .from('comments')
          .select(`
            *,
            author:profiles!user_id(*)
          `)
          .eq('chapter_id', chapterData.id)
          .eq('is_hidden', false)
          .is('parent_id', null)
          .order('created_at', { ascending: false })

        if (commentData) {
          setComments(commentData)
        }

        // Update reading history and increment view count
        if (user) {
          await supabase
            .from('reading_history')
            .upsert({
              user_id: user.id,
              story_id: chapterData.story_id,
              chapter_id: chapterData.id,
              last_read_at: new Date().toISOString(),
            }, { onConflict: 'user_id,story_id' })
        }

        await supabase
          .from('chapters')
          .update({ view_count: chapterData.view_count + 1 })
          .eq('id', chapterData.id)
      } else {
        // Fallback to local detailed mock story chapter!
        const detailedMock = getDetailedMockStory(resolvedParams.id)
        if (detailedMock) {
          const mockCh = detailedMock.chapters.find(c => c.id === resolvedParams.chapterId)
          if (mockCh) {
            setChapter(mockCh)
            setStory(detailedMock.story)
            setChapters(detailedMock.chapters)
            
            // Format comments
            const formattedComments = detailedMock.comments.map(c => ({
              ...c,
              author: detailedMock.story.author
            }))
            setComments(formattedComments)
          }
        }
      }

      setLoading(false)
    }

    loadChapter()
  }, [resolvedParams.id, resolvedParams.chapterId, user])

  useEffect(() => {
    if (story?.id) {
      setIsBookUnlocked(isMockBookUnlocked(story.id))
    }
  }, [story?.id])

  const currentChapterIndex = chapters.findIndex(c => c.id === chapter?.id)
  const prevChapter = currentChapterIndex > 0 ? chapters[currentChapterIndex - 1] : null
  const nextChapter = currentChapterIndex < chapters.length - 1 ? chapters[currentChapterIndex + 1] : null
  const isLockedChapter = chapter ? !isFreePreviewChapter(chapter.chapter_number) && !isBookUnlocked : false

  const handleMockPayment = async () => {
    if (!story) return

    setPaying(true)
    await new Promise(resolve => setTimeout(resolve, 900))
    unlockMockBook(story.id)
    setIsBookUnlocked(true)
    setPaying(false)
    toast.success('Mock payment successful. Full book unlocked.')
  }

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) {
      toast.error('Please sign in to comment')
      return
    }
    if (!newComment.trim()) return
    setSubmitting(true)

    const { data, error } = await supabase
      .from('comments')
      .insert({
        chapter_id: chapter!.id,
        user_id: user.id,
        content: newComment.trim(),
      })
      .select(`
        *,
        author:profiles!user_id(*)
      `)
      .maybeSingle()

    if (data && !error) {
      setComments([data as (Comment & { author: Profile }), ...comments])
      setNewComment('')
      toast.success('Comment posted')

      // Notify story author
      if (story?.author && story.author.user_id !== user.id) {
        await supabase.from('notifications').insert({
          user_id: story.author.user_id,
          type: 'comment',
          title: 'New comment',
          content: `${profile?.username} commented on chapter ${chapter?.chapter_number} of "${story.title}"`,
          data: { chapter_id: chapter!.id, story_id: story.id },
        })
      }
    }

    setSubmitting(false)
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

  if (!chapter || !story) {
    return (
      <div className="min-h-screen bg-background">
        <SiteHeader />
        <div className="text-center py-24">
          <h1 className="text-2xl font-bold">Chapter not found</h1>
          <Button asChild className="mt-4">
            <Link href={`/story/${resolvedParams.id}`}>Go to Story</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      {/* Reading Nav */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Navigation */}
        <div className="flex items-center justify-between mb-6">
          <Button variant="ghost" size="sm" asChild>
            <Link href={`/story/${story.id}`}>
              <Home className="h-4 w-4 mr-2" />
              Story Home
            </Link>
          </Button>

          <div className="flex items-center gap-2">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm">
                  <List className="h-4 w-4 mr-2" />
                  Chapters
                </Button>
              </SheetTrigger>
              <SheetContent>
                <SheetHeader>
                  <SheetTitle>Chapters</SheetTitle>
                </SheetHeader>
                <ScrollArea className="h-[_calc(100vh-80px)] mt-4">
                  <div className="space-y-1">
                    {chapters.map((ch) => (
                      <Link
                        key={ch.id}
                        href={`/story/${story.id}/chapter/${ch.id}`}
                        className={`block p-3 rounded-lg transition-colors ${
                          ch.id === chapter.id
                            ? 'bg-secondary font-medium'
                            : 'hover:bg-secondary/50'
                        }`}
                      >
                        <span className="text-muted-foreground mr-2">
                          {ch.chapter_number}.
                        </span>
                        {ch.title}
                        {!isFreePreviewChapter(ch.chapter_number) && !isBookUnlocked && (
                          <Lock className="h-3.5 w-3.5 ml-2 inline text-muted-foreground" />
                        )}
                      </Link>
                    ))}
                  </div>
                </ScrollArea>
              </SheetContent>
            </Sheet>

            <Button variant="ghost" size="sm" onClick={() => setFontSize(Math.max(14, fontSize - 2))}>
              A-
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setFontSize(Math.min(24, fontSize + 2))}>
              A+
            </Button>
          </div>
        </div>

        {/* Chapter Header */}
        <div className="text-center mb-12">
          <Link
            href={`/story/${story.id}`}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            {story.title}
          </Link>
          <h1 className="text-3xl font-serif font-bold mt-2">
            Chapter {chapter.chapter_number}: {chapter.title}
          </h1>
          <p className="text-sm text-muted-foreground mt-2">
            {chapter.word_count} words
            {isLockedChapter && (
              <Badge variant="secondary" className="ml-2 align-middle">
                <Lock className="h-3 w-3 mr-1" />
                Paid chapter
              </Badge>
            )}
          </p>
        </div>

        {isLockedChapter ? (
          <Card className="max-w-2xl mx-auto border-primary/20">
            <CardContent className="p-8 text-center space-y-6">
              <div className="mx-auto h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center">
                <Lock className="h-7 w-7 text-primary" />
              </div>
              <div>
                <h2 className="text-2xl font-serif font-bold">Unlock the full book</h2>
                <p className="text-muted-foreground mt-2">
                  Chapter 1 is free. Complete a mock Razorpay checkout to read every remaining chapter of "{story.title}".
                </p>
              </div>
              <div className="rounded-lg bg-secondary/60 p-4 flex items-center justify-between text-left">
                <div>
                  <p className="font-medium">Full book access</p>
                  <p className="text-sm text-muted-foreground">{Math.max(chapters.length - 1, 0)} paid chapters included</p>
                </div>
                <div className="flex items-center text-2xl font-bold">
                  <IndianRupee className="h-5 w-5" />
                  {MOCK_BOOK_PRICE_INR}
                </div>
              </div>
              <Button size="lg" onClick={handleMockPayment} disabled={paying} className="w-full sm:w-auto">
                {paying ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <CreditCard className="h-4 w-4 mr-2" />
                )}
                {paying ? 'Processing mock payment...' : 'Pay with Mock Razorpay'}
              </Button>
              <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                <ShieldCheck className="h-3.5 w-3.5" />
                Local demo only. No real money is charged.
              </div>
            </CardContent>
          </Card>
        ) : (
          <>
        {/* Content */}
        <article
          className="prose-reading font-serif mx-auto space-y-6"
          style={{ fontSize: `${fontSize}px` }}
        >
          {chapter.content.split('\n').filter(Boolean).map((paraText, pIndex) => (
            <ParagraphBlock 
              key={pIndex} 
              paraText={paraText} 
              pIndex={pIndex} 
              chapterId={chapter.id} 
            />
          ))}
        </article>
          </>
        )}

        <Separator className="my-12" />

        {/* Chapter Navigation */}
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            disabled={!prevChapter}
            onClick={() => prevChapter && router.push(`/story/${story.id}/chapter/${prevChapter.id}`)}
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Previous
          </Button>

          <span className="text-muted-foreground">
            {currentChapterIndex + 1} / {chapters.length}
          </span>

          <Button
            disabled={!nextChapter}
            onClick={() => nextChapter && router.push(`/story/${story.id}/chapter/${nextChapter.id}`)}
          >
            Next
            <ChevronRight className="h-4 w-4 ml-2" />
          </Button>
        </div>

        {!isLockedChapter && (
          <>
            <Separator className="my-12" />

        {/* Comments Section */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">
              Comments ({comments.length})
            </h2>
          </div>

          {/* Comment Form */}
          {user ? (
            <form onSubmit={handleSubmitComment} className="flex gap-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src={profile?.avatar_url || ''} />
                <AvatarFallback>
                  {profile?.username?.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 flex gap-2">
                <Input
                  placeholder="Share your thoughts..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  disabled={submitting}
                />
                <Button type="submit" disabled={submitting || !newComment.trim()}>
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </form>
          ) : (
            <div className="text-center py-6 text-muted-foreground bg-secondary/50 rounded-lg">
              <Button asChild>
                <Link href="/login">Sign in to comment</Link>
              </Button>
            </div>
          )}

          {/* Comments List */}
          <div className="space-y-4">
            {comments.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                No comments yet. Be the first to share your thoughts!
              </p>
            ) : (
              comments.map((comment) => (
                <Card key={comment.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={comment.author?.avatar_url || ''} />
                        <AvatarFallback className="text-xs">
                          {comment.author?.username?.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Link
                            href={`/@${comment.author?.username}`}
                            className="font-medium text-sm hover:text-primary"
                          >
                            @{comment.author?.username}
                          </Link>
                          <span className="text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                          </span>
                        </div>
                        <p className="text-muted-foreground">{comment.content}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
          </>
        )}
      </main>
    </div>
  )
}

function ParagraphBlock({ paraText, pIndex, chapterId }: { paraText: string; pIndex: number; chapterId: string }) {
  const [hovered, setHovered] = useState(false)
  const [showPicker, setShowPicker] = useState(false)
  const [isHighlighted, setIsHighlighted] = useState(false)
  const [noteText, setNoteText] = useState('')
  const [noteInput, setNoteInput] = useState('')
  const [showNoteField, setShowNoteField] = useState(false)
  const [showComments, setShowComments] = useState(false)
  const [newCommentText, setNewCommentText] = useState('')
  
  const [reactions, setReactions] = useState<Record<string, number>>({
    '😍': Math.floor((pIndex * 7) % 6),
    '😂': Math.floor((pIndex * 3) % 4),
    '😱': Math.floor((pIndex * 9) % 3),
    '😭': Math.floor((pIndex * 13) % 4),
    '🤯': Math.floor((pIndex * 5) % 5),
  })

  const [paragraphComments, setParagraphComments] = useState<string[]>([
    pIndex % 3 === 0 ? "Wow, this description is absolutely gorgeous!" : "Oh no, I did not expect this twist!",
    pIndex % 4 === 0 ? "The prose flows so beautifully here." : "Intense chapter. Highly engaging!"
  ])

  // Load highlights & notes from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedHighlight = localStorage.getItem(`vensoul-hl-${chapterId}-${pIndex}`) === 'true'
      const savedNote = localStorage.getItem(`vensoul-note-${chapterId}-${pIndex}`) || ''
      setIsHighlighted(savedHighlight)
      setNoteText(savedNote)
      setNoteInput(savedNote)
    }
  }, [chapterId, pIndex])

  const handleReact = (emoji: string) => {
    setReactions(prev => ({
      ...prev,
      [emoji]: prev[emoji] + 1
    }))
    toast.success(`Reacted with ${emoji}`)
  }

  const handleToggleHighlight = () => {
    const nextVal = !isHighlighted
    setIsHighlighted(nextVal)
    localStorage.setItem(`vensoul-hl-${chapterId}-${pIndex}`, String(nextVal))
    toast.success(nextVal ? 'Paragraph highlighted' : 'Highlight removed')
  }

  const handleSaveNote = () => {
    setNoteText(noteInput)
    localStorage.setItem(`vensoul-note-${chapterId}-${pIndex}`, noteInput)
    setShowNoteField(false)
    toast.success(noteInput ? 'Private note saved' : 'Private note deleted')
  }

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newCommentText.trim()) return
    setParagraphComments(prev => [...prev, newCommentText.trim()])
    setNewCommentText('')
    toast.success('Paragraph comment posted')
  }

  return (
    <div 
      className={`relative group pr-8 md:pr-14 rounded-lg px-2 py-1 transition-all ${
        isHighlighted ? 'bg-amber-500/10 border-l-2 border-amber-500/50' : 'hover:bg-secondary/20'
      }`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => {
        setHovered(false)
        setShowPicker(false)
      }}
    >
      <p className="leading-relaxed text-foreground/90">{paraText}</p>

      {/* Inline Saved Note Display */}
      {noteText && (
        <div className="text-xs text-amber-800 dark:text-amber-300 bg-amber-500/5 border border-amber-500/10 p-2 rounded mt-2 flex items-start gap-2 font-sans select-none">
          <span className="text-amber-500 font-bold">📝 Note:</span>
          <span className="flex-1">{noteText}</span>
          <button 
            onClick={() => {
              setNoteInput('')
              setNoteText('')
              localStorage.removeItem(`vensoul-note-${chapterId}-${pIndex}`)
            }}
            className="text-[10px] text-muted-foreground hover:text-destructive transition-colors"
          >
            Clear
          </button>
        </div>
      )}

      {/* Floating Toolbar */}
      <div 
        className={`absolute right-1 top-1.5 flex items-center gap-1.5 transition-all duration-300 ${
          hovered || showPicker || showNoteField || showComments ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-2 pointer-events-none'
        }`}
      >
        {/* Reactions Picker button */}
        <button 
          onClick={() => setShowPicker(!showPicker)}
          className="h-7 w-7 rounded-full bg-secondary border border-border/60 flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary/40 transition-colors shadow-sm"
          title="React to paragraph"
        >
          <Sparkles className="h-3.5 w-3.5" />
        </button>

        {/* Highlighter button */}
        <button 
          onClick={handleToggleHighlight}
          className={`h-7 w-7 rounded-full border flex items-center justify-center transition-colors shadow-sm ${
            isHighlighted 
              ? 'bg-amber-500 border-amber-500 text-white' 
              : 'bg-secondary border-border/60 text-muted-foreground hover:text-primary hover:border-primary/40'
          }`}
          title="Highlight paragraph"
        >
          <Highlighter className="h-3.5 w-3.5" />
        </button>

        {/* Notebook Notes button */}
        <button 
          onClick={() => setShowNoteField(!showNoteField)}
          className={`h-7 w-7 rounded-full border flex items-center justify-center transition-colors shadow-sm ${
            showNoteField 
              ? 'bg-primary border-primary text-white' 
              : 'bg-secondary border-border/60 text-muted-foreground hover:text-primary hover:border-primary/40'
          }`}
          title="Write private note"
        >
          <FileText className="h-3.5 w-3.5" />
        </button>

        {/* Paragraph Comments button */}
        <button 
          onClick={() => setShowComments(!showComments)}
          className={`h-7 w-7 rounded-full border flex items-center justify-center transition-colors shadow-sm relative ${
            showComments 
              ? 'bg-primary border-primary text-white' 
              : 'bg-secondary border-border/60 text-muted-foreground hover:text-primary hover:border-primary/40'
          }`}
          title="Paragraph comments"
        >
          <MessageCircle className="h-3.5 w-3.5" />
          {paragraphComments.length > 0 && (
            <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-[8px] h-3.5 w-3.5 rounded-full flex items-center justify-center font-bold font-sans">
              {paragraphComments.length}
            </span>
          )}
        </button>
      </div>

      {/* Emoji picker console */}
      {showPicker && (
        <div className="absolute right-0 top-8 mt-1 z-50 bg-popover border border-border/60 rounded-full shadow-lg px-3 py-1.5 flex gap-2 items-center animate-in fade-in slide-in-from-top-1 duration-200">
          {Object.entries(reactions).map(([emoji, count]) => (
            <button
              key={emoji}
              onClick={() => handleReact(emoji)}
              className="flex items-center gap-1 hover:scale-110 transition-transform text-sm px-1.5 py-0.5 rounded-md hover:bg-secondary/60"
            >
              <span>{emoji}</span>
              {count > 0 && <span className="text-[10px] text-muted-foreground font-sans">{count}</span>}
            </button>
          ))}
        </div>
      )}

      {/* Inline Private Note Editor */}
      {showNoteField && (
        <div className="mt-2 bg-popover border border-border/60 rounded-lg p-3 shadow-md max-w-sm flex gap-2 items-center z-50 relative">
          <input 
            type="text"
            className="flex-1 text-xs bg-background border border-border rounded px-2.5 py-1.5 outline-none focus:border-primary/40 font-sans"
            placeholder="Type private note..."
            value={noteInput}
            onChange={(e) => setNoteInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSaveNote()
            }}
          />
          <button 
            onClick={handleSaveNote}
            className="text-xs bg-primary text-primary-foreground font-semibold px-3 py-1.5 rounded hover:bg-primary/95 transition-colors font-sans"
          >
            Save
          </button>
        </div>
      )}

      {/* Paragraph-level floating comments console */}
      {showComments && (
        <div className="mt-2 bg-popover border border-border/60 rounded-lg p-4 shadow-lg max-w-md space-y-3 z-50 relative">
          <h4 className="text-xs font-semibold text-foreground border-b pb-1 font-sans">Paragraph Conversation</h4>
          
          <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
            {paragraphComments.map((comment, cIndex) => (
              <div key={cIndex} className="bg-secondary/40 p-2.5 rounded text-xs font-sans">
                <p className="font-semibold text-muted-foreground text-[10px] mb-0.5">Reader {cIndex + 1}</p>
                <p className="text-foreground/90">{comment}</p>
              </div>
            ))}
          </div>

          <form onSubmit={handleAddComment} className="flex gap-2">
            <input 
              type="text"
              className="flex-1 text-xs bg-background border border-border rounded px-2.5 py-1.5 outline-none focus:border-primary/40 font-sans"
              placeholder="Add paragraph comment..."
              value={newCommentText}
              onChange={(e) => setNewCommentText(e.target.value)}
            />
            <button 
              type="submit"
              className="text-xs bg-primary text-primary-foreground font-semibold px-3 py-1.5 rounded hover:bg-primary/95 transition-colors font-sans"
            >
              Post
            </button>
          </form>
        </div>
      )}
    </div>
  )
}
