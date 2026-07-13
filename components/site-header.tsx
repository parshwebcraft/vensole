'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useAuth } from '@/lib/supabase/auth-context'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { ThemeToggle } from '@/components/theme-toggle'
import { NotificationDropdown } from '@/components/notification-dropdown'
import {
  BookOpen,
  PenLine,
  LayoutDashboard,
  Menu,
  User,
  Settings,
  LogOut,
  Shield,
  Search,
  Compass,
  BarChart3
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useEffect, useState } from 'react'

const navLinks = [
  { href: '/stories', label: 'Browse', icon: Compass },
  { href: '/genres', label: 'Genres', icon: BookOpen },
]

export function SiteHeader() {
  const pathname = usePathname()
  const router = useRouter()
  const { user, profile, signOut } = useAuth()
  const isAdmin = profile?.role === 'admin' || profile?.role === 'moderator'

  // Scroll detection state for hide/reveal navbar
  const [visible, setVisible] = useState(true)
  const [lastScrollY, setLastScrollY] = useState(0)

  useEffect(() => {
    const controlNavbar = () => {
      if (typeof window !== 'undefined') {
        const currentScrollY = window.scrollY
        if (currentScrollY > lastScrollY && currentScrollY > 80) {
          // scrolling down, hide
          setVisible(false)
        } else {
          // scrolling up, show
          setVisible(true)
        }
        setLastScrollY(currentScrollY)
      }
    }

    window.addEventListener('scroll', controlNavbar, { passive: true })
    return () => window.removeEventListener('scroll', controlNavbar)
  }, [lastScrollY])

  // Global keyboard shortcut listener for search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.key === 'k' && (e.metaKey || e.ctrlKey)) || e.key === '/') {
        if (
          e.target instanceof HTMLInputElement ||
          e.target instanceof HTMLTextAreaElement ||
          e.target instanceof HTMLDivElement && e.target.isContentEditable
        ) {
          return
        }
        e.preventDefault()
        router.push('/search')
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [router])

  return (
    <header 
      className={cn(
        "sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/60 transition-transform duration-300 ease-in-out",
        visible ? "translate-y-0" : "-translate-y-full"
      )}
    >
      <div className="container flex h-16 items-center px-4">
        {/* Logo and Desktop Navigation */}
        <div className="mr-4 flex items-center">
          <Link href="/" className="mr-6 flex items-center space-x-2 group">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-rose-600 to-amber-500 shadow-sm transition-transform duration-300 group-hover:scale-105">
              <BookOpen className="h-4 w-4 text-white" />
            </div>
            <span className="font-serif text-xl font-bold text-gradient hidden sm:inline-block">
              Vensoul
            </span>
          </Link>
          <nav className="hidden md:flex items-center space-x-1">
            {navLinks.map((link) => {
              const isActive = pathname === link.href || pathname.startsWith(link.href + '/')
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    'relative flex items-center px-4 py-2 text-sm font-medium rounded-md transition-all duration-300',
                    isActive
                      ? 'text-foreground bg-secondary/80 shadow-sm'
                      : 'text-muted-foreground hover:text-foreground hover:bg-secondary/40'
                  )}
                >
                  <link.icon className="mr-2 h-4 w-4" />
                  {link.label}
                  {isActive && (
                    <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-primary rounded-full animate-fade-in" />
                  )}
                </Link>
              )
            })}
          </nav>
        </div>

        {/* Premium Search Bar */}
        <div className="flex-1 flex items-center justify-center px-4">
          <Link
            href="/search"
            className="group w-full max-w-sm flex items-center justify-between rounded-full border border-border/60 bg-background/40 hover:bg-background/70 backdrop-blur-md px-4 py-2 text-sm text-muted-foreground hover:text-foreground hover:border-primary/30 hover:shadow-[0_0_15px_rgba(234,88,12,0.06)] transition-all duration-300"
          >
            <div className="flex items-center gap-2">
              <Search className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:scale-105 transition-all duration-300" />
              <span className="hidden sm:inline text-xs font-medium">Search stories, authors...</span>
              <span className="sm:hidden text-xs font-medium">Search...</span>
            </div>
            <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border border-border/80 bg-muted/60 px-2 font-mono text-[9px] font-medium text-muted-foreground opacity-90 hidden md:flex transition-colors group-hover:border-primary/20 group-hover:text-primary">
              /
            </kbd>
          </Link>
        </div>

        {/* Action Controls */}
        <div className="flex items-center space-x-2">
          <ThemeToggle />

          {user ? (
            <>
              <NotificationDropdown />
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-9 w-9 rounded-full select-none">
                    <Avatar className="h-9 w-9 border border-border/60 hover:scale-105 transition-transform duration-200">
                      <AvatarImage src={profile?.avatar_url || ''} alt={profile?.username || ''} />
                      <AvatarFallback>
                        {profile?.username?.charAt(0).toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56 bg-background/95 backdrop-blur-md border border-border/60" align="end" forceMount>
                  <div className="flex items-center justify-start gap-2 p-2">
                    <div className="flex flex-col space-y-1 leading-none">
                      <p className="font-semibold">{profile?.display_name || profile?.username}</p>
                      <p className="text-xs text-muted-foreground">@{profile?.username}</p>
                    </div>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard" className="cursor-pointer">
                      <LayoutDashboard className="mr-2 h-4 w-4 text-muted-foreground" />
                      Dashboard
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/my/analytics" className="cursor-pointer">
                      <BarChart3 className="mr-2 h-4 w-4 text-muted-foreground" />
                      Analytics
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/write" className="cursor-pointer">
                      <PenLine className="mr-2 h-4 w-4 text-muted-foreground" />
                      Write Story
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href={`/@${profile?.username}`} className="cursor-pointer">
                      <User className="mr-2 h-4 w-4 text-muted-foreground" />
                      My Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/settings" className="cursor-pointer">
                      <Settings className="mr-2 h-4 w-4 text-muted-foreground" />
                      Settings
                    </Link>
                  </DropdownMenuItem>
                  {isAdmin && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link href="/admin" className="cursor-pointer text-primary">
                          <Shield className="mr-2 h-4 w-4" />
                          Admin Panel
                        </Link>
                      </DropdownMenuItem>
                    </>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={signOut} className="cursor-pointer text-destructive focus:bg-destructive/10">
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <div className="hidden sm:flex items-center space-x-2">
              <Button variant="ghost" asChild>
                <Link href="/login">Sign In</Link>
              </Button>
              <Button asChild>
                <Link href="/signup">Get Started</Link>
              </Button>
            </div>
          )}

          {/* Mobile Drawer menu */}
          <Sheet>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon" className="h-10 w-10">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] bg-background/95 backdrop-blur-lg border-l border-border/60 p-6 flex flex-col justify-between">
              <div className="flex flex-col gap-6 mt-6">
                <div className="flex items-center space-x-2 px-2 py-1">
                  <div className="flex h-7 w-7 items-center justify-center rounded-md bg-gradient-to-br from-rose-600 to-amber-500">
                    <BookOpen className="h-4 w-4 text-white" />
                  </div>
                  <span className="font-serif text-lg font-bold text-gradient">
                    Vensoul
                  </span>
                </div>
                
                <nav className="flex flex-col gap-2">
                  {navLinks.map((link) => {
                    const isActive = pathname === link.href
                    return (
                      <Link
                        key={link.href}
                        href={link.href}
                        className={cn(
                          'flex items-center px-4 py-3 text-sm font-medium rounded-md transition-all duration-200',
                          isActive
                            ? 'bg-secondary text-foreground font-semibold shadow-sm'
                            : 'text-muted-foreground hover:text-foreground hover:bg-secondary/40'
                        )}
                      >
                        <link.icon className="mr-3 h-4 w-4" />
                        {link.label}
                      </Link>
                    )
                  })}
                  <div className="h-px bg-border/60 my-3" />
                  {user ? (
                    <>
                      <Link href="/dashboard" className="flex items-center px-4 py-3 text-sm font-medium rounded-md hover:bg-secondary/60 transition-colors">
                        <LayoutDashboard className="mr-3 h-4 w-4 text-muted-foreground" />
                        Dashboard
                      </Link>
                      <Link href="/my/analytics" className="flex items-center px-4 py-3 text-sm font-medium rounded-md hover:bg-secondary/60 transition-colors">
                        <BarChart3 className="mr-3 h-4 w-4 text-muted-foreground" />
                        Analytics
                      </Link>
                      <Link href="/write" className="flex items-center px-4 py-3 text-sm font-medium rounded-md hover:bg-secondary/60 transition-colors">
                        <PenLine className="mr-3 h-4 w-4 text-muted-foreground" />
                        Write Story
                      </Link>
                      <Link href={`/@${profile?.username}`} className="flex items-center px-4 py-3 text-sm font-medium rounded-md hover:bg-secondary/60 transition-colors">
                        <User className="mr-3 h-4 w-4 text-muted-foreground" />
                        My Profile
                      </Link>
                    </>
                  ) : null}
                </nav>
              </div>

              <div className="mt-auto">
                {user ? (
                  <Button
                    onClick={signOut}
                    variant="outline"
                    className="w-full text-destructive hover:bg-destructive/5 hover:text-destructive border-destructive/20 h-11"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign Out
                  </Button>
                ) : (
                  <div className="flex flex-col gap-2.5">
                    <Button asChild variant="outline" className="w-full h-11">
                      <Link href="/login">Sign In</Link>
                    </Button>
                    <Button asChild className="w-full h-11">
                      <Link href="/signup">Get Started</Link>
                    </Button>
                  </div>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}

