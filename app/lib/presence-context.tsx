'use client'
import React, { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from './supabase'
import { useSession } from './auth-client'
import type { RealtimeChannel } from '@supabase/supabase-js'

interface PresenceUser {
  user_id: string
  email?: string
  online_at: string
}

interface PresenceContextType {
  isOnline: boolean
  onlineUsers: PresenceUser[]
  userCount: number
  isLoading: boolean
  error: string | null
  dbPresenceUsers: any[] // Users from database
  refreshDbPresence: () => Promise<void>
}

const PresenceContext = createContext<PresenceContextType | undefined>(undefined)

// Database operations for user_presence table
const updateUserPresence = async (userId: string, isOnline: boolean) => {
  try {
    const now = new Date().toISOString()
    
    // Upsert user presence data
    const { data, error } = await supabase
      .from('user_presence')
      .upsert({
        id: `presence_${userId}`,
        userId: userId,
        isOnline: isOnline,
        lastSeen: now,
        updatedAt: now
      }, {
        onConflict: 'userId',
        ignoreDuplicates: false
      })

    if (error) {
      console.error('Error updating user presence:', error)
      return false
    }

    console.log('User presence updated in database:', { userId, isOnline })
    return true
  } catch (error) {
    console.error('Failed to update user presence:', error)
    return false
  }
}

// Get all presence records from database
const getDbPresenceUsers = async () => {
  try {
    const { data, error } = await supabase
      .from('user_presence')
      .select('*')
      .order('updatedAt', { ascending: false })

    if (error) {
      console.error('Error fetching presence users:', error)
      return []
    }

    return data || []
  } catch (error) {
    console.error('Failed to fetch presence users:', error)
    return []
  }
}

export function PresenceProvider({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession()
  const [isOnline, setIsOnline] = useState(false)
  const [onlineUsers, setOnlineUsers] = useState<PresenceUser[]>([])
  const [userCount, setUserCount] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [channel, setChannel] = useState<RealtimeChannel | null>(null)
  const [dbPresenceUsers, setDbPresenceUsers] = useState<any[]>([])

  // Function to refresh database presence data
  const refreshDbPresence = async () => {
    const users = await getDbPresenceUsers()
    setDbPresenceUsers(users)
  }

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
                    online_at: presence.online_at
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
            }

            const presenceTrackStatus = await presenceChannel.track(userPresence)
            
            if (presenceTrackStatus === 'ok') {
              setIsOnline(true)
              await updateUserPresence(session.user.id, true)
              console.log('Successfully tracking presence')
            } else {
              setError('Failed to track presence')
            }
          }
        })

        setChannel(presenceChannel)
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

  useEffect(() => {
    const handleVisibilityChange = async () => {
      if (!channel || !session?.user) return

      if (document.visibilityState === 'visible') {
        const userPresence: PresenceUser = {
          user_id: session.user.id,
          email: session.user.email,
          online_at: new Date().toISOString(),
        }
        
        const status = await channel.track(userPresence)
        if (status === 'ok') {
          setIsOnline(true)
          await updateUserPresence(session.user.id, true)
        }
      } else {
        await channel.untrack()
        setIsOnline(false)
        await updateUserPresence(session.user.id, false)
      }
    }

    const handleBeforeUnload = async () => {
      if (channel && session?.user) {
        channel.untrack()
        await updateUserPresence(session.user.id, false)
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    window.addEventListener('beforeunload', handleBeforeUnload)

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('beforeunload', handleBeforeUnload)
    }
  }, [channel, session?.user])

  useEffect(() => {
    return () => {
      if (session?.user) {
        updateUserPresence(session.user.id, false)
      }
    }
  }, [session?.user])

  // Load database presence data on mount
  useEffect(() => {
    refreshDbPresence()
  }, [])

  const value: PresenceContextType = {
    isOnline,
    onlineUsers,
    userCount,
    isLoading,
    error,
    dbPresenceUsers,
    refreshDbPresence,
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