'use client'
import React, { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from './supabase'
import { useSession } from './auth-client'

interface PresenceUser {
  user_id: string
  email?: string
  online_at: string,
  isOnline?: boolean
}

interface PresenceContextType {
  isOnline: boolean
  onlineUsers: PresenceUser[]
  userCount: number
  isLoading: boolean
  error: string | null

}

const PresenceContext = createContext<PresenceContextType | undefined>(undefined)



export function PresenceProvider({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession()
  const [isOnline, setIsOnline] = useState(false)
  const [onlineUsers, setOnlineUsers] = useState<PresenceUser[]>([])
  const [userCount, setUserCount] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)


  useEffect(() => {
    if (!session?.user) {
      setIsLoading(false)
      return
    }

    const setupPresence = async () => {
      try {
        setIsLoading(true)
        setError(null)

        const presenceChannel = supabase.channel('global-presence', {
          config: {
            presence: {
              key: session.user.id,
            },
          },
        })

        presenceChannel
          .on('presence', { event: 'sync' }, () => {
            const state = presenceChannel.presenceState()
            const users: PresenceUser[] = []
            
            Object.entries(state).forEach(([key, presences]) => {
              if (Array.isArray(presences) && presences.length > 0) {
                const presence = presences[0] as any
                if (presence.user_id && presence.online_at) {
                  users.push({
                    user_id: presence.user_id,
                    email: presence.email,
                    online_at: presence.online_at,
                    isOnline: true
                  })
                }
              }
            })
            
            setOnlineUsers(users)
            setUserCount(users.length)
          })
          .on('presence', { event: 'join' }, ({ key, newPresences }) => {
            console.log('User joined:', key, newPresences)
          })
          .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
            console.log('User left:', key, leftPresences)
          })

        presenceChannel.subscribe(async (status) => {
          if (status === 'SUBSCRIBED') {
            const userPresence: PresenceUser = {
              user_id: session.user.id,
              email: session.user.email,
              online_at: new Date().toISOString(),
              isOnline: true
            }

            const presenceTrackStatus = await presenceChannel.track(userPresence)
            
            if (presenceTrackStatus === 'ok') {
              setIsOnline(true)
              // await updateUserPresence(session.user.id, true)
              console.log('Successfully tracking presence')
            } else {
              setError('Failed to track presence')
            }
          }
        })

        setIsLoading(false)

        return () => {
          presenceChannel.untrack()
          presenceChannel.unsubscribe()
        }
      } catch (err) {
        console.error('Error setting up presence:', err)
        setError(err instanceof Error ? err.message : 'Failed to setup presence')
        setIsLoading(false)
      }
    }

    const cleanup = setupPresence()

    return () => {
      cleanup?.then(cleanupFn => cleanupFn?.())
    }
  }, [session?.user])



  const value: PresenceContextType = {
    isOnline,
    onlineUsers,
    userCount,
    isLoading,
    error,

  }

  return (
    <PresenceContext.Provider value={value}>
      {children}
    </PresenceContext.Provider>
  )
}

export function usePresence() {
  const context = useContext(PresenceContext)
  if (context === undefined) {
    throw new Error('usePresence must be used within a PresenceProvider')
  }
  return context
}