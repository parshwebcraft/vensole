'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/lib/supabase/auth-context'
import { SiteHeader } from '@/components/site-header'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Loader2, Plus, X } from 'lucide-react'
import { toast } from 'sonner'

const ageRatings = [
  { value: 'everyone', label: 'Everyone', description: 'Suitable for all ages' },
  { value: 'teen', label: 'Teen', description: 'Recommended for ages 13+' },
  { value: 'mature', label: 'Mature', description: 'Recommended for ages 18+' },
  { value: 'adult', label: 'Adult', description: 'Adult content only' },
]

const contentWarnings = [
  'Violence', 'Strong Language', 'Sexual Content', 'Drug Use',
  'Suicide', 'Self-Harm', 'Abuse', 'Mental Health', 'Horror',
  'Discrimination', 'Death'
]

const languages = [
  { code: 'en', name: 'English' },
  { code: 'es', name: 'Spanish' },
  { code: 'fr', name: 'French' },
  { code: 'de', name: 'German' },
  { code: 'pt', name: 'Portuguese' },
  { code: 'it', name: 'Italian' },
]

export default function NewStoryPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    language: 'en',
    age_rating: 'everyone',
    tags: [] as string[],
    genres: [] as string[],
    content_warnings: [] as string[],
  })
  const [tagInput, setTagInput] = useState('')
  const [availableGenres, setAvailableGenres] = useState<any[]>([])

  if (typeof window !== 'undefined') {
    useState(() => {
      supabase.from('genres').select('*').order('name').then(({ data }) => {
        if (data) setAvailableGenres(data)
      })
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.title.trim()) {
      toast.error('Please enter a title')
      return
    }

    setLoading(true)

    const { data: story, error } = await supabase
      .from('stories')
      .insert({
        user_id: user!.id,
        title: formData.title.trim(),
        description: formData.description.trim() || null,
        language: formData.language,
        age_rating: formData.age_rating,
        content_warnings: formData.content_warnings,
        status: 'draft',
      })
      .select()
      .maybeSingle()

    if (error) {
      toast.error('Failed to create story')
      setLoading(false)
      return
    }

    if (story) {
      // Add genres
      if (formData.genres.length > 0) {
        const genreInserts = formData.genres.map(genreId => ({
          story_id: story.id,
          genre_id: genreId,
        }))
        await supabase.from('story_genres').insert(genreInserts)
      }

      // Add tags
      if (formData.tags.length > 0) {
        const tagInserts = formData.tags.map(tag => ({
          story_id: story.id,
          tag: tag.toLowerCase(),
        }))
        await supabase.from('story_tags').insert(tagInserts)
      }

      toast.success('Story created!')
      router.push(`/write/${story.id}`)
    }

    setLoading(false)
  }

  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim().toLowerCase())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim().toLowerCase()],
      }))
      setTagInput('')
    }
  }

  const handleRemoveTag = (tag: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(t => t !== tag),
    }))
  }

  const handleToggleWarning = (warning: string) => {
    setFormData(prev => ({
      ...prev,
      content_warnings: prev.content_warnings.includes(warning)
        ? prev.content_warnings.filter(w => w !== warning)
        : [...prev.content_warnings, warning],
    }))
  }

  const handleToggleGenre = (genreId: string) => {
    setFormData(prev => ({
      ...prev,
      genres: prev.genres.includes(genreId)
        ? prev.genres.filter(g => g !== genreId)
        : [...prev.genres, genreId],
    }))
  }

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="container px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-serif font-bold">Create a New Story</h1>
          <p className="text-muted-foreground mt-1">
            Start with the basics. You can always edit these details later.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Info */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  placeholder="Enter your story title"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  maxLength={100}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="What is your story about? This will appear on the story's page."
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  rows={4}
                  maxLength={2000}
                />
              </div>
            </CardContent>
          </Card>

          {/* Categories */}
          <Card>
            <CardHeader>
              <CardTitle>Categories & Genres</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Genres</Label>
                <p className="text-sm text-muted-foreground">
                  Select up to 3 genres for your story
                </p>
                <div className="flex flex-wrap gap-2 mt-2">
                  {availableGenres.map((genre) => {
                    const isSelected = formData.genres.includes(genre.id)
                    const isDisabled = !isSelected && formData.genres.length >= 3
                    return (
                      <Button
                        key={genre.id}
                        type="button"
                        variant={isSelected ? 'default' : 'outline'}
                        size="sm"
                        disabled={isDisabled}
                        onClick={() => handleToggleGenre(genre.id)}
                        className="rounded-full"
                      >
                        {genre.name}
                      </Button>
                    )
                  })}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Tags</Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="Add a tag"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        handleAddTag()
                      }
                    }}
                  />
                  <Button type="button" onClick={handleAddTag}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                {formData.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {formData.tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="gap-1">
                        {tag}
                        <button
                          type="button"
                          onClick={() => handleRemoveTag(tag)}
                          className="ml-1 hover:bg-secondary-foreground/10 rounded-full p-0.5"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Content Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Content Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Language</Label>
                  <Select
                    value={formData.language}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, language: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {languages.map((lang) => (
                        <SelectItem key={lang.code} value={lang.code}>
                          {lang.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Age Rating</Label>
                  <Select
                    value={formData.age_rating}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, age_rating: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {ageRatings.map((rating) => (
                        <SelectItem key={rating.value} value={rating.value}>
                          {rating.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Content Warnings</Label>
                <p className="text-sm text-muted-foreground">
                  Help readers know what to expect
                </p>
                <div className="flex flex-wrap gap-2 mt-2">
                  {contentWarnings.map((warning) => {
                    const isSelected = formData.content_warnings.includes(warning)
                    return (
                      <Button
                        key={warning}
                        type="button"
                        variant={isSelected ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => handleToggleWarning(warning)}
                        className="rounded-full"
                      >
                        {warning}
                      </Button>
                    )
                  })}
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex items-center gap-4">
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Create Story
            </Button>
            <Button type="button" variant="outline" onClick={() => router.back()}>
              Cancel
            </Button>
          </div>
        </form>
      </main>
    </div>
  )
}
