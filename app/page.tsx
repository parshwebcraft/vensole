import Link from 'next/link'
import { Suspense } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { SiteHeader } from '@/components/site-header'
import {
  BookOpen,
  PenLine,
  Users,
  TrendingUp,
  Heart,
  Sparkles,
  ArrowRight,
  Facebook,
  Instagram,
  Linkedin,
} from 'lucide-react'
import { FeaturedStories } from '@/components/featured-stories'
import { GenreSection } from '@/components/genre-section'
import { createClient } from '@/lib/supabase/server'
import { HeroInteractive } from '@/components/hero-interactive'
import { FooterNewsletter } from '@/components/footer-newsletter'




const features = [
  {
    icon: PenLine,
    title: 'Write Your Story',
    description: 'Powerful writing tools to bring your imagination to life. Draft, edit, and publish chapters with ease.',
  },
  {
    icon: BookOpen,
    title: 'Discover Stories',
    description: 'Explore millions of stories across every genre. Find your next favorite read from emerging and established authors.',
  },
  {
    icon: Users,
    title: 'Connect with Readers',
    description: 'Build a community around your work. Engage with readers through comments, likes, and direct messaging.',
  },
  {
    icon: TrendingUp,
    title: 'Track Your Growth',
    description: 'Detailed analytics to understand your audience. See what resonates and grow your readership.',
  },
]

function formatStatNumber(num: number): string {
  if (num >= 1000000) return (num / 1000000).toFixed(1).replace(/\.0$/, '') + 'M'
  if (num >= 1000) return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'K'
  return num.toString()
}

export default async function HomePage() {
  const supabase = await createClient()

  // Fetch counts from Supabase
  const [storiesRes, writersRes, readersRes] = await Promise.all([
    supabase
      .from('stories')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'published'),
    supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .eq('role', 'author'),
    supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .eq('role', 'reader'),
  ])

  const storiesCount = storiesRes.count || 0
  const writersCount = writersRes.count || 0
  const readersCount = readersRes.count || 0

  return (
    <div className="min-h-screen bg-background max-w-full overflow-x-hidden">
      <SiteHeader />


      <HeroInteractive
        storiesCount={storiesCount}
        readersCount={readersCount}
        writersCount={writersCount}
      />

      {/* Featured Stories */}
      <section className="py-16 md:py-24 bg-secondary/30">
        <div className="container px-4">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-serif font-bold">Featured Stories</h2>
              <p className="text-muted-foreground mt-1">Handpicked stories from our community</p>
            </div>
            <Button variant="ghost" asChild>
              <Link href="/stories?featured=true">
                View All
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
          <Suspense fallback={<div className="h-96 animate-pulse bg-muted rounded-lg" />}>
            <FeaturedStories />
          </Suspense>
        </div>
      </section>

      {/* Genres */}
      <section className="py-16 md:py-24">
        <div className="container px-4">
          <GenreSection />
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 md:py-24 bg-secondary/30">
        <div className="container px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-serif font-bold mb-4">
              Everything You Need to Write & Read
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Vensoul provides all the tools writers and readers need for an amazing storytelling experience.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature) => (
              <Card key={feature.title} className="bg-card border">
                <CardContent className="pt-6">
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                    <feature.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24">
        <div className="container px-4">
          <Card className="bg-gradient-to-br from-primary/10 via-primary/5 to-background border-primary/20">
            <CardContent className="p-12 text-center">
              <Heart className="h-12 w-12 text-primary mx-auto mb-4" />
              <h2 className="text-3xl font-serif font-bold mb-4">
                Ready to Share Your Story?
              </h2>
              <p className="text-muted-foreground max-w-xl mx-auto mb-8">
                Join thousands of writers who have found their audience on Vensoul.
                Your story deserves to be told.
              </p>
              <Button size="lg" asChild>
                <Link href="/signup">
                  Create Your Free Account
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-secondary/30 py-12">
        <div className="container px-4">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-8">
            <div>
              <h4 className="font-semibold mb-4">Platform</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/stories" className="hover:text-foreground">Browse Stories</Link></li>
                <li><Link href="/genres" className="hover:text-foreground">Genres</Link></li>
                <li><Link href="/authors" className="hover:text-foreground">Authors</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">For Writers</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/write" className="hover:text-foreground">Start Writing</Link></li>
                <li><Link href="/guidelines" className="hover:text-foreground">Writing Guidelines</Link></li>
                <li><Link href="/resources" className="hover:text-foreground">Resources</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/help" className="hover:text-foreground">Help Center</Link></li>
                <li><Link href="/safety" className="hover:text-foreground">Safety</Link></li>
                <li><Link href="/contact" className="hover:text-foreground">Contact Us</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/terms" className="hover:text-foreground">Terms of Service</Link></li>
                <li><Link href="/privacy" className="hover:text-foreground">Privacy Policy</Link></li>
              </ul>
            </div>
            <div className="col-span-2 md:col-span-1">
              <h4 className="font-semibold mb-4">Stay Connected</h4>
              <div className="flex items-center gap-2 mb-4">
                <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full" asChild>
                  <Link href="https://www.instagram.com/" aria-label="Instagram" target="_blank" rel="noreferrer">
                    <Instagram className="h-4 w-4" />
                  </Link>
                </Button>
                <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full" asChild>
                  <Link href="https://www.facebook.com/" aria-label="Facebook" target="_blank" rel="noreferrer">
                    <Facebook className="h-4 w-4" />
                  </Link>
                </Button>
                <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full" asChild>
                  <Link href="https://www.linkedin.com/" aria-label="LinkedIn" target="_blank" rel="noreferrer">
                    <Linkedin className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
              <FooterNewsletter />
            </div>
          </div>
          <div className="pt-8 border-t grid gap-4 md:grid-cols-[1fr_auto_1fr] items-center">
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 text-center sm:text-left">
              <div className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-primary" />
              <span className="font-serif font-bold">Vensoul</span>
              </div>
              <p className="text-sm text-muted-foreground">
                © {new Date().getFullYear()} Vensoul. All rights reserved.
              </p>
            </div>
            <p className="text-sm font-medium text-center text-foreground">
              Developed by{' '}
              <Link
                href="https://www.parshwebcraft.in/"
                target="_blank"
                rel="noreferrer"
                className="text-primary hover:underline"
              >
                ParshWebCraft
              </Link>
              {' '}| Palak Rai
            </p>
            <div />
          </div>
        </div>
      </footer>
    </div>
  )
}
