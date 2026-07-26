'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import {
  ChevronLeft, ChevronRight, Bookmark, Highlighter, Settings, Sun, Moon,
  BookOpen, Type, AlignLeft, Volume2, Share2, Heart, MessageCircle, List,
} from 'lucide-react';

type Theme = 'paper' | 'sepia' | 'dark';
type FontSize = 'sm' | 'md' | 'lg' | 'xl';

export function ReaderClient({ story }: { story: any }) {
  const chapters = story.chapters?.sort((a: any, b: any) => a.chapter_number - b.chapter_number) || [];
  const [currentChapter, setCurrentChapter] = useState(0);
  const [theme, setTheme] = useState<Theme>('paper');
  const [fontSize, setFontSize] = useState<FontSize>('md');
  const [showSettings, setShowSettings] = useState(false);
  const [showToc, setShowToc] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [liked, setLiked] = useState(false);
  const [progress, setProgress] = useState(0);
  const contentRef = useRef<HTMLDivElement>(null);

  const chapter = chapters[currentChapter];

  useEffect(() => {
    const onScroll = () => {
      if (!contentRef.current) return;
      const el = contentRef.current;
      const total = el.scrollHeight - el.clientHeight;
      const scrolled = el.scrollTop;
      setProgress(total > 0 ? Math.round((scrolled / total) * 100) : 0);
    };
    const el = contentRef.current;
    if (el) el.addEventListener('scroll', onScroll);
    return () => { if (el) el.removeEventListener('scroll', onScroll); };
  }, [currentChapter]);

  if (!chapter) {
    return (
      <div className="pt-32 pb-20 text-center max-w-2xl mx-auto px-6">
        <BookOpen className="w-16 h-16 text-gold/30 mx-auto mb-6" />
        <h1 className="font-serif text-4xl text-midnight mb-3">{story.title}</h1>
        <p className="text-midnight/50 italic font-serif text-lg">This story has no chapters yet. Check back soon.</p>
        <Link href="/discover" className="btn-gold px-6 py-3 rounded-lg inline-block mt-8 relative">
          <span className="relative z-10">Back to Library</span>
        </Link>
      </div>
    );
  }

  const fontSizes: Record<FontSize, string> = {
    sm: 'text-base',
    md: 'text-lg',
    lg: 'text-xl',
    xl: 'text-2xl',
  };

  const themeClasses: Record<Theme, string> = {
    paper: 'reader-paper',
    sepia: 'reader-sepia',
    dark: 'reader-dark',
  };

  return (
    <div className={`min-h-screen ${themeClasses[theme]} transition-colors duration-500`}>
      {/* Top bar */}
      <div className="sticky top-0 z-40 glass border-b border-gold/10 px-6 py-3 flex items-center justify-between">
        <Link href="/discover" className="flex items-center gap-2 text-midnight/60 hover:text-gold transition-colors">
          <ChevronLeft className="w-4 h-4" />
          <span className="text-sm font-sans">Library</span>
        </Link>

        <div className="text-center">
          <div className="font-serif text-lg text-midnight">{story.title}</div>
          <div className="text-xs text-midnight/40">Chapter {chapter.chapter_number} of {chapters.length}</div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowToc(!showToc)}
            className="w-9 h-9 rounded-lg flex items-center justify-center text-midnight/50 hover:text-gold hover:bg-gold/5 transition-all"
          >
            <List className="w-4 h-4" />
          </button>
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="w-9 h-9 rounded-lg flex items-center justify-center text-midnight/50 hover:text-gold hover:bg-gold/5 transition-all"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Progress bar */}
      <div className="sticky top-[57px] z-30 h-0.5 bg-gold/10">
        <div className="h-full bg-gradient-to-r from-gold-dark to-gold transition-all duration-300" style={{ width: `${progress}%` }} />
      </div>

      {/* Settings panel */}
      {showSettings && (
        <div className="fixed right-4 top-20 z-50 glass rounded-2xl p-6 w-72 animate-scale-in shadow-deep">
          <h3 className="font-serif text-lg text-midnight mb-4">Reading Settings</h3>

          <div className="mb-4">
            <label className="text-xs tracking-wider uppercase text-midnight/40 mb-2 block">Theme</label>
            <div className="flex gap-2">
              {([['paper', Sun], ['sepia', BookOpen], ['dark', Moon]] as const).map(([t, Icon]) => (
                <button
                  key={t}
                  onClick={() => setTheme(t)}
                  className={`flex-1 p-3 rounded-lg flex flex-col items-center gap-1 transition-all ${theme === t ? 'bg-gold/15 text-gold' : 'text-midnight/40 hover:bg-gold/5'
                    }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="text-xs capitalize">{t}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="mb-4">
            <label className="text-xs tracking-wider uppercase text-midnight/40 mb-2 block">Font Size</label>
            <div className="flex gap-2">
              {(['sm', 'md', 'lg', 'xl'] as FontSize[]).map((s) => (
                <button
                  key={s}
                  onClick={() => setFontSize(s)}
                  className={`flex-1 p-2 rounded-lg text-center transition-all ${fontSize === s ? 'bg-gold/15 text-gold' : 'text-midnight/40 hover:bg-gold/5'
                    }`}
                >
                  <Type className="w-4 h-4 mx-auto" style={{ fontSize: s === 'sm' ? 12 : s === 'md' ? 14 : s === 'lg' ? 16 : 18 }} />
                </button>
              ))}
            </div>
          </div>

          <div className="ink-divider my-4" />
          <div className="space-y-2">
            <button className="w-full flex items-center gap-3 p-2 rounded-lg text-midnight/60 hover:bg-gold/5 transition-all text-sm">
              <Volume2 className="w-4 h-4" /> Text to Speech
            </button>
            <button className="w-full flex items-center gap-3 p-2 rounded-lg text-midnight/60 hover:bg-gold/5 transition-all text-sm">
              <Share2 className="w-4 h-4" /> Share Chapter
            </button>
          </div>
        </div>
      )}

      {/* TOC panel */}
      {showToc && (
        <div className="fixed left-4 top-20 z-50 glass rounded-2xl p-6 w-72 animate-scale-in shadow-deep max-h-[70vh] overflow-y-auto">
          <h3 className="font-serif text-lg text-midnight mb-4">Chapters</h3>
          <div className="space-y-1">
            {chapters.map((ch: any, i: number) => (
              <button
                key={ch.id}
                onClick={() => { setCurrentChapter(i); setShowToc(false); contentRef.current?.scrollTo(0, 0); }}
                className={`w-full text-left p-3 rounded-lg transition-all text-sm ${i === currentChapter ? 'bg-gold/15 text-gold' : 'text-midnight/60 hover:bg-gold/5'
                  }`}
              >
                <span className="text-xs text-midnight/30 mr-2">{ch.chapter_number}.</span>
                {ch.title}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Content */}
      <div className="max-w-2xl mx-auto px-6 py-16">
        {/* Chapter header */}
        <div className="text-center mb-12 animate-fade-up">
          <div className="section-label mb-4">Chapter {chapter.chapter_number}</div>
          <h1 className="font-serif text-4xl md:text-5xl text-midnight mb-2">{chapter.title}</h1>
          <div className="ink-divider mt-6" />
        </div>

        {/* Chapter content */}
        <div
          ref={contentRef}
          className={`${fontSizes[fontSize]} font-serif leading-[1.8] ${theme === 'dark' ? 'text-ivory/90' : 'text-midnight/80'} max-h-[60vh] overflow-y-auto pr-2`}
        >
          {chapter.content ? (
            <div className="space-y-6">
              {chapter.content.split('\n').map((para: string, i: number) => (
                <p key={i} className="animate-fade-up" style={{ animationDelay: `${i * 50}ms` }}>
                  {para}
                </p>
              ))}
            </div>
          ) : (
            <div className="space-y-6">
              <p className="italic text-midnight/40">
                The ink has not yet touched this page. The author's quill rests, waiting for inspiration to flow once more.
              </p>
              <p>
                In the quiet village of Thornhaven, where mist clung to cobblestone streets and the moon hung low and heavy, a young woman named Elara discovered a letter tucked beneath her door. The envelope bore no name, no address — only a wax seal of deep gold, imprinted with the image of a feather.
              </p>
              <p>
                She turned it over in her hands, feeling the weight of the paper, the texture of the seal. Something about it felt alive, as though the letter itself was breathing. With trembling fingers, she broke the seal.
              </p>
              <p>
                "If you are reading this," the letter began, "then you have already been chosen. The library between worlds has opened its doors to you. Come at midnight. Come alone. Come with your story."
              </p>
              <p>
                Elara looked up from the letter. The clock on the mantle struck eleven. She had one hour to decide whether to step into a world she had only ever dreamed of — or to remain in the safety of the one she knew.
              </p>
              <p>
                She folded the letter, pressed it to her heart, and reached for her coat.
              </p>
            </div>
          )}
        </div>

        {/* Chapter navigation */}
        <div className="flex items-center justify-between mt-12 pt-8 border-t border-gold/15">
          <button
            onClick={() => { if (currentChapter > 0) { setCurrentChapter(currentChapter - 1); contentRef.current?.scrollTo(0, 0); } }}
            disabled={currentChapter === 0}
            className="flex items-center gap-2 text-midnight/50 hover:text-gold disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          >
            <ChevronLeft className="w-5 h-5" />
            <span className="text-sm font-sans">Previous</span>
          </button>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setBookmarked(!bookmarked)}
              className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${bookmarked ? 'bg-gold/20 text-gold' : 'text-midnight/40 hover:text-gold'
                }`}
            >
              <Bookmark className="w-4 h-4" fill={bookmarked ? 'currentColor' : 'none'} />
            </button>
            <button
              onClick={() => setLiked(!liked)}
              className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${liked ? 'bg-gold/20 text-gold' : 'text-midnight/40 hover:text-gold'
                }`}
            >
              <Heart className="w-4 h-4" fill={liked ? 'currentColor' : 'none'} />
            </button>
          </div>

          <button
            onClick={() => { if (currentChapter < chapters.length - 1) { setCurrentChapter(currentChapter + 1); contentRef.current?.scrollTo(0, 0); } }}
            disabled={currentChapter === chapters.length - 1}
            className="flex items-center gap-2 text-midnight/50 hover:text-gold disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          >
            <span className="text-sm font-sans">Next</span>
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* End of chapter */}
        <div className="text-center mt-16">
          <div className="ink-divider mb-6" />
          <p className="font-serif italic text-midnight/30 text-sm">
            End of Chapter {chapter.chapter_number}
          </p>
        </div>
      </div>
    </div>
  );
}
