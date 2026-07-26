'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Feather, Save, Eye, Send, Plus, Clock, FileText, TrendingUp, Award,
  Bold, Italic, Underline, List, ListOrdered, Quote, Image as ImageIcon,
  Sparkles, BookOpen, ChevronRight, PenLine, BarChart3, Calendar,
} from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import type { Story } from '@/lib/supabase';

export function StudioClient() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'dashboard' | 'editor' | 'preview'>('dashboard');
  const [selectedStory, setSelectedStory] = useState<Story | null>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const [wordCount, setWordCount] = useState(0);
  const [showAI, setShowAI] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handlePublish = async () => {
    if (!title) {
      toast.error('Story title is required to publish.');
      return;
    }
    
    setSavedAt('Publishing...');
    try {
      let currentStoryId = selectedStory?.id;
      
      if (!currentStoryId) {
        // Create new story
        const { data: story, error: storyErr } = await supabase
          .from('stories')
          .insert({
            title,
            author_id: user.id,
            status: 'published',
            slug: title.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Math.floor(Math.random() * 1000)
          })
          .select()
          .single();
          
        if (storyErr) throw storyErr;
        currentStoryId = story.id;
        setSelectedStory(story);
        
        // Create chapter 1
        await supabase.from('chapters').insert({
          story_id: currentStoryId,
          author_id: user.id,
          title: 'Chapter 1',
          content,
          chapter_number: 1,
          status: 'published'
        });
        
        toast.success('Your story has been published!');
        router.push(`/read/${story.slug}`);
      } else {
        // Update existing story
        await supabase
          .from('stories')
          .update({ title, status: 'published' })
          .eq('id', currentStoryId);
          
        toast.success('Story updated successfully!');
        
        // fetch the updated story to get the slug
        const { data: updatedStory } = await supabase
          .from('stories')
          .select('slug')
          .eq('id', currentStoryId)
          .single();
          
        if (updatedStory) {
          router.push(`/read/${updatedStory.slug}`);
        }
      }
      
      // Refresh list
      const { data: storiesData } = await supabase
        .from('stories')
        .select('*, chapters(*)')
        .eq('author_id', user.id)
        .order('updated_at', { ascending: false });
        
      if (storiesData) setStories(storiesData);
      setSavedAt(new Date().toLocaleTimeString());
      
    } catch (err: any) {
      toast.error(err.message || 'Failed to publish story');
      setSavedAt('Error');
    }
  };

  useEffect(() => {
    setWordCount(content.trim() ? content.trim().split(/\s+/).length : 0);
  }, [content]);

  // Auth & Data fetch
  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }
      setUser(user);

      const { data: storiesData } = await supabase
        .from('stories')
        .select('*, chapters(*)')
        .eq('author_id', user.id)
        .order('updated_at', { ascending: false });

      setStories((storiesData as any) || []);
      setLoading(false);
    })();
  }, []);

  // Autosave
  useEffect(() => {
    if (!title && !content) return;
    const timer = setTimeout(() => {
      setSavedAt(new Date().toLocaleTimeString());
    }, 2000);
    return () => clearTimeout(timer);
  }, [title, content]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-20">
        <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="pt-32 pb-20 text-center max-w-2xl mx-auto px-6">
        <div className="relative w-24 h-24 mx-auto mb-8">
          <div className="absolute inset-0 blur-2xl bg-gold/20 rounded-full" />
          <Feather className="w-24 h-24 text-gold relative z-10 animate-float" />
        </div>
        <h1 className="font-serif text-5xl text-midnight mb-4">The Writing Studio</h1>
        <p className="text-midnight/50 font-serif text-xl italic mb-8">
          Sign in to access your writing desk, drafts, and AI-powered tools.
        </p>
        <div className="flex gap-4 justify-center">
          <Link href="/login" className="btn-outline-gold px-6 py-3 rounded-lg">Sign In</Link>
          <Link href="/signup" className="btn-gold px-6 py-3 rounded-lg relative">
            <span className="relative z-10">Create Account</span>
          </Link>
        </div>
      </div>
    );
  }

  if (view === 'editor') {
    return (
      <div className="pt-20 min-h-screen bg-gradient-to-b from-ivory to-ivory-dark">
        {/* Toolbar */}
        <div className="sticky top-[57px] z-30 glass border-b border-gold/10 px-6 py-3 flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-3">
            <button
              onClick={() => { setView('dashboard'); setSelectedStory(null); setTitle(''); setContent(''); }}
              className="flex items-center gap-2 text-midnight/60 hover:text-gold transition-colors"
            >
              <ChevronRight className="w-4 h-4 rotate-180" />
              <span className="text-sm font-sans">Dashboard</span>
            </button>
            <div className="h-4 w-px bg-gold/20" />
            <span className="text-xs text-midnight/40 font-sans">
              {savedAt ? `Saved at ${savedAt}` : 'Not saved yet'}
            </span>
          </div>

          <div className="flex items-center gap-1">
            {[
              [Bold, 'bold'], [Italic, 'italic'], [Underline, 'underline'],
              [List, 'list'], [ListOrdered, 'ordered'], [Quote, 'quote'],
            ].map(([Icon, name]) => (
              <button
                key={name as string}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-midnight/50 hover:text-gold hover:bg-gold/5 transition-all"
              >
                {(Icon as any).className = 'w-4 h-4'}
                <Icon className="w-4 h-4" />
              </button>
            ))}
            <div className="h-4 w-px bg-gold/20 mx-1" />
            <button className="w-8 h-8 rounded-lg flex items-center justify-center text-midnight/50 hover:text-gold hover:bg-gold/5 transition-all">
              <ImageIcon className="w-4 h-4" />
            </button>
            <button
              onClick={() => setShowAI(!showAI)}
              className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
                showAI ? 'bg-gold/15 text-gold' : 'text-midnight/50 hover:text-gold hover:bg-gold/5'
              }`}
            >
              <Sparkles className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button 
              onClick={() => setView('preview')}
              className="btn-outline-gold px-4 py-2 rounded-lg flex items-center gap-1.5"
            >
              <Eye className="w-3.5 h-3.5" /> Preview
            </button>
            <button 
              onClick={handlePublish}
              className="btn-gold px-4 py-2 rounded-lg flex items-center gap-1.5 relative"
            >
              <Send className="w-3.5 h-3.5 relative z-10" />
              <span className="relative z-10">Publish</span>
            </button>
          </div>
        </div>

        {/* AI Panel */}
        {showAI && (
          <div className="fixed right-4 top-32 z-50 glass rounded-2xl p-6 w-80 animate-scale-in shadow-deep">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-5 h-5 text-gold" />
              <h3 className="font-serif text-lg text-midnight">AI Writing Assistant</h3>
            </div>
            <div className="space-y-2">
              {[
                { icon: PenLine, label: 'Continue Story', desc: 'Let AI write the next paragraph' },
                { icon: Sparkles, label: 'Rewrite', desc: 'Improve this passage' },
                { icon: FileText, label: 'Grammar Check', desc: 'Fix errors instantly' },
                { icon: BookOpen, label: 'Character Builder', desc: 'Generate a character' },
                { icon: TrendingUp, label: 'Plot Generator', desc: 'Suggest plot twists' },
                { icon: Award, label: 'World Builder', desc: 'Create a world' },
              ].map((tool) => (
                <button
                  key={tool.label}
                  className="w-full flex items-center gap-3 p-3 rounded-lg text-left hover:bg-gold/5 transition-all group"
                >
                  <div className="w-8 h-8 rounded-lg bg-gold/10 flex items-center justify-center">
                    <tool.icon className="w-4 h-4 text-gold" />
                  </div>
                  <div>
                    <div className="text-sm text-midnight font-sans">{tool.label}</div>
                    <div className="text-xs text-midnight/40">{tool.desc}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Editor */}
        <div className="max-w-3xl mx-auto px-6 py-12">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Chapter title..."
            className="w-full bg-transparent outline-none font-serif text-4xl text-midnight placeholder:text-midnight/20 mb-8"
          />
          <textarea
            ref={textareaRef}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Begin writing... Let the ink flow."
            className="w-full min-h-[60vh] bg-transparent outline-none font-serif text-lg leading-[1.8] text-midnight/80 placeholder:text-midnight/20 resize-none"
          />

          {/* Footer */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-gold/15">
            <div className="text-xs text-midnight/40 font-sans">
              {wordCount} words · {Math.ceil(wordCount / 200)} min read
            </div>
            <button className="flex items-center gap-2 text-xs text-midnight/40 hover:text-gold transition-colors">
              <Save className="w-3.5 h-3.5" />
              {savedAt ? `Saved at ${savedAt}` : 'Not saved yet'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (view === 'preview') {
    return (
      <div className="min-h-screen bg-ivory paper-texture pt-20">
        <div className="max-w-2xl mx-auto px-6 py-12">
          <button 
            onClick={() => setView('editor')}
            className="flex items-center gap-2 text-midnight/60 hover:text-gold transition-colors mb-12"
          >
            <ChevronRight className="w-4 h-4 rotate-180" />
            <span className="text-sm font-sans">Back to Editor</span>
          </button>
          <div className="text-center mb-16">
            <div className="text-gold tracking-widest text-xs uppercase mb-4">Chapter 1</div>
            <h1 className="font-serif text-5xl text-midnight mb-8">{title || 'Untitled'}</h1>
            <div className="w-12 h-px bg-gold/30 mx-auto" />
          </div>
          <div className="prose prose-lg prose-headings:font-serif prose-p:font-serif prose-p:text-midnight/80 max-w-none whitespace-pre-wrap">
            {content || 'Your story will appear here...'}
          </div>
        </div>
      </div>
    );
  }

  // Dashboard
  return (
    <div className="pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="mb-12">
          <div className="section-label mb-3">Writing Studio</div>
          <h1 className="font-serif text-5xl text-midnight mb-2">Your Writing Desk</h1>
          <p className="text-midnight/50 font-serif text-lg italic">Where stories are born.</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          {[
            { icon: FileText, label: 'Total Stories', value: stories.length, color: '#C8A46A' },
            { icon: BookOpen, label: 'Published', value: stories.filter(s => s.status === 'published').length, color: '#006D77' },
            { icon: Clock, label: 'Drafts', value: stories.filter(s => s.status === 'draft').length, color: '#8B5E34' },
            { icon: TrendingUp, label: 'Total Views', value: stories.reduce((acc, s) => acc + s.views_count, 0), color: '#2A9D8F' },
          ].map((stat) => (
            <div key={stat.label} className="glass rounded-xl p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: `${stat.color}15` }}>
                  <stat.icon className="w-5 h-5" style={{ color: stat.color }} />
                </div>
              </div>
              <div className="font-serif text-3xl text-midnight">{stat.value.toLocaleString()}</div>
              <div className="text-xs text-midnight/40 tracking-wider uppercase mt-1">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Writing chart placeholder */}
        <div className="glass rounded-2xl p-6 mb-12">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-serif text-xl text-midnight">Writing Activity</h3>
              <p className="text-xs text-midnight/40">Last 7 days</p>
            </div>
            <BarChart3 className="w-5 h-5 text-gold" />
          </div>
          <div className="flex items-end justify-between gap-2 h-32">
            {[40, 65, 30, 80, 55, 90, 70].map((h, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-2">
                <div
                  className="w-full rounded-t-lg bg-gradient-to-t from-gold-dark to-gold transition-all duration-500 hover:from-gold hover:to-gold-light"
                  style={{ height: `${h}%` }}
                />
                <span className="text-xs text-midnight/30">{['M', 'T', 'W', 'T', 'F', 'S', 'S'][i]}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Stories list */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-serif text-2xl text-midnight">Your Stories</h2>
          <button
            onClick={() => { setTitle(''); setContent(''); setView('editor'); }}
            className="btn-gold px-5 py-2.5 rounded-lg flex items-center gap-2 relative"
          >
            <Plus className="w-4 h-4 relative z-10" />
            <span className="relative z-10">New Story</span>
          </button>
        </div>

        {stories.length === 0 ? (
          <div className="glass rounded-2xl p-16 text-center">
            <Feather className="w-12 h-12 text-gold/30 mx-auto mb-4" />
            <h3 className="font-serif text-2xl text-midnight/60 italic mb-2">No stories yet</h3>
            <p className="text-midnight/40 mb-6">Every great journey begins with a single word.</p>
            <button
              onClick={() => { setTitle(''); setContent(''); setView('editor'); }}
              className="btn-gold px-6 py-3 rounded-lg inline-flex items-center gap-2 relative"
            >
              <PenLine className="w-4 h-4 relative z-10" />
              <span className="relative z-10">Write Your First Story</span>
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {stories.map((story) => (
              <div
                key={story.id}
                className="glass rounded-xl p-4 flex items-center justify-between hover:glow-gold transition-all duration-400 group cursor-pointer"
                onClick={() => { setSelectedStory(story); setTitle(story.title); setContent(''); setView('editor'); }}
              >
                <div className="flex items-center gap-4">
                  <div className="w-14 h-20 rounded-lg overflow-hidden flex-shrink-0">
                    <img src={story.cover_url || `https://picsum.photos/seed/${story.slug}/100/140`} alt={story.title} className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <h3 className="font-serif text-lg text-midnight">{story.title}</h3>
                    <div className="flex items-center gap-3 text-xs text-midnight/40 mt-1">
                      <span className={`px-2 py-0.5 rounded-full capitalize ${
                        story.status === 'published' ? 'bg-peacock-green/10 text-peacock-green' :
                        story.status === 'draft' ? 'bg-bronze/10 text-bronze' :
                        'bg-midnight/5 text-midnight/40'
                      }`}>{story.status}</span>
                      <span>{story.chapter_count} chapters</span>
                      <span>{story.word_count.toLocaleString()} words</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-midnight/40">{story.views_count} views</span>
                  <ChevronRight className="w-4 h-4 text-midnight/30 group-hover:text-gold group-hover:translate-x-1 transition-all" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
