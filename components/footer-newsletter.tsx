'use client'

import { FormEvent, useState } from 'react'
import { Send } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export function FooterNewsletter() {
  const [email, setEmail] = useState('')

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!email.trim()) {
      toast.error('Please enter your email')
      return
    }

    toast.success('Thanks for subscribing to Vensoul updates')
    setEmail('')
  }

  return (
    <form onSubmit={handleSubmit} className="flex w-full max-w-xs items-center gap-2">
      <Input
        type="email"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        placeholder="Newsletter email"
        aria-label="Newsletter email"
        className="h-9 bg-background/70"
        required
      />
      <Button type="submit" size="icon" className="h-9 w-9 shrink-0" aria-label="Subscribe">
        <Send className="h-4 w-4" />
      </Button>
    </form>
  )
}
