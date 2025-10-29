import { useEffect, useState } from 'react'
import { getCurrentSession, subscribeSession, type Session } from '@packages/utils/auth'

export function useSession() {
  const [session, setSession] = useState<Session | null>(getCurrentSession())

  useEffect(() => {
    const unsubscribe = subscribeSession((next) => setSession(next))
    return () => {
      unsubscribe?.()
    }
  }, [])

  return session
}
