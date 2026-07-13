'use client'

import { Suspense } from 'react'
import Link from 'next/link'
import { SiteHeader } from '@/components/site-header'
import { GenreGrid } from '@/components/genre-grid'

export default function GenresPage() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="container px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-serif font-bold">Browse by Genre</h1>
          <p className="text-muted-foreground mt-1">
            Find stories that match your interests
          </p>
        </div>

        <Suspense fallback={<div className="h-96 animate-pulse bg-muted rounded-lg" />}>
          <GenreGrid />
        </Suspense>
      </main>
    </div>
  )
}
