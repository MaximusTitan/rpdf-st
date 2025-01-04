'use client'

import { ScrollArea } from '../components/ui/scroll-area'
import { useChat, Message } from 'ai/react'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'
import Image from "next/image"
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { User } from '@supabase/auth-js'

export default function Home() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const getUser = async () => {
      const { data: { session }, error } = await supabase.auth.getSession()
      if (error) {
        console.error('Error fetching session:', error.message)
        setLoading(false)
      } else {
        if (session?.user) {
          setUser(session.user)
        } else {
          router.push('/auth') // Redirect to /auth if not authenticated
        }
        setLoading(false)
      }
    }
    getUser()
  }, [router])


  // Let's only add user message in db from here
  const insertMessage = async (message: string, userType: 'user' | 'AI') => {
    if (!user) return;

    const { error } = await supabase
      .from('chat_history')
      .insert({
        user_id: user.id,
        message: message,
        user_type: userType,
      })

    if (error) {
      console.error('Error inserting message:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!user || !input.trim()) return

    // Insert user message
    await insertMessage(input, 'user')

    // Call AI submit function
    await aiSubmit(e)

    // Get the AI response (last message)
    const aiMessage = messages[messages.length - 1]
    if (aiMessage && aiMessage.role === 'assistant') {
      // Insert AI response
      await insertMessage(aiMessage.content, 'AI')
    }
  }

  const { messages, input, handleInputChange, handleSubmit: aiSubmit, isLoading, setMessages } = useChat({
    // Remove sendExtraMessage if it's not a valid option
  })


  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) {
      console.error('Error logging out:', error.message)
    } else {
      setUser(null)
      router.push('/auth') // Redirect to /auth after logout
    }
  }

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container flex items-center justify-between h-16">
          <Image
            className="dark:invert"
            src="/next.svg"
            alt="Next.js logo"
            width={100}
            height={20}
            priority
          />
          <div className="flex gap-4">
            {user && (
              <>
                <span className="text-sm font-medium">{user.email}</span>
                <Button
                  variant="ghost"
                  onClick={handleLogout}
                >
                  Sign Out
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="container py-6">
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>Chat with AI</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[500px] pr-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`mb-4 flex ${
                    message.role === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  <div
                    className={`rounded-lg px-4 py-2 max-w-[80%] ${
                      message.role === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted'
                    }`}
                  >
                    {message.content}
                  </div>
                </div>
              ))}
            </ScrollArea>
          </CardContent>
          <CardFooter>
            <form onSubmit={handleSubmit} className="flex w-full gap-2">
              <Input
                value={input}
                onChange={handleInputChange}
                placeholder="Type your message..."
                disabled={isLoading}
              />
              <Button type="submit" disabled={isLoading}>
                Send
              </Button>
            </form>
          </CardFooter>
        </Card>
      </main>
    </div>
  )
}

