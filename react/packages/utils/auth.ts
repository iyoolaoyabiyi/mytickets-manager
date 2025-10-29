export type User = {
  id: number
  name: string
  email: string
  created_at: string
  updated_at: string
}

type StoredUser = User & { password: string }

type SessionUser = Pick<User, 'id' | 'name' | 'email'>

export type Session = {
  user: SessionUser
  token: string
  expiresAt: number
}

export type LoginPayload = {
  email: string
  password: string
}

export type SignupPayload = {
  name: string
  email: string
  password: string
}

const USERS_KEY = 'ticketapp_users'
const SESSION_KEY = 'ticketapp_session'
const SESSION_EVENT = 'ticketapp:session'
const SESSION_DURATION = 1000 * 60 * 60 * 24 // 24 hours

let memoryUsers: StoredUser[] | null = null
let memorySession: Session | null = null

const isBrowser = () => typeof window !== 'undefined'

const now = () => new Date().toISOString()

const ensureSeedUsers = (users: StoredUser[]) => {
  if (users.length > 0) return users
  const timestamp = now()
  return [
    {
      id: 1,
      name: 'Demo User',
      email: 'demo@mytickets.app',
      password: 'demo12345',
      created_at: timestamp,
      updated_at: timestamp
    }
  ]
}

const readUsers = (): StoredUser[] => {
  if (!isBrowser()) {
    if (!memoryUsers) {
      memoryUsers = ensureSeedUsers([])
    }
    return [...memoryUsers]
  }
  try {
    const raw = window.localStorage.getItem(USERS_KEY)
    if (!raw) {
      const seeded = ensureSeedUsers([])
      window.localStorage.setItem(USERS_KEY, JSON.stringify(seeded))
      memoryUsers = [...seeded]
      return seeded
    }
    const parsed = JSON.parse(raw) as StoredUser[]
    const result = ensureSeedUsers(Array.isArray(parsed) ? parsed : [])
    memoryUsers = [...result]
    return result
  } catch {
    const fallback = ensureSeedUsers([])
    memoryUsers = [...fallback]
    return fallback
  }
}

const writeUsers = (users: StoredUser[]) => {
  memoryUsers = [...users]
  if (!isBrowser()) return
  try {
    window.localStorage.setItem(USERS_KEY, JSON.stringify(users))
  } catch {
    // ignore
  }
}

const writeSession = (session: Session | null) => {
  memorySession = session
  if (!isBrowser()) return
  if (!session) {
    window.localStorage.removeItem(SESSION_KEY)
    return
  }
  window.localStorage.setItem(SESSION_KEY, JSON.stringify(session))
}

const createToken = () => {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID()
  }
  return Math.random().toString(36).slice(2)
}

const sanitizeUser = (user: StoredUser): SessionUser => ({
  id: user.id,
  name: user.name,
  email: user.email
})

const readSession = (): Session | null => {
  if (!isBrowser()) {
    return memorySession
  }
  try {
    const raw = window.localStorage.getItem(SESSION_KEY)
    if (!raw) return null
    const session = JSON.parse(raw) as Session
    memorySession = session
    return session
  } catch {
    return null
  }
}

const isExpired = (session: Session | null) => {
  if (!session) return true
  return Date.now() > session.expiresAt
}

const broadcastSession = (session: Session | null) => {
  if (!isBrowser()) return
  window.dispatchEvent(new CustomEvent(SESSION_EVENT, { detail: session }))
}

export const signup = (payload: SignupPayload): SessionUser => {
  const users = readUsers()
  const exists = users.some((user) => user.email.toLowerCase() === payload.email.toLowerCase())
  if (exists) {
    throw new Error('Email already registered.')
  }
  const timestamp = now()
  const user: StoredUser = {
    id: users.length ? Math.max(...users.map((u) => u.id)) + 1 : 1,
    name: payload.name.trim(),
    email: payload.email.trim().toLowerCase(),
    password: payload.password,
    created_at: timestamp,
    updated_at: timestamp
  }
  const next = [...users, user]
  writeUsers(next)
  return sanitizeUser(user)
}

export const login = (payload: LoginPayload): Session => {
  const users = readUsers()
  const user = users.find((candidate) => candidate.email === payload.email.trim().toLowerCase())
  if (!user || user.password !== payload.password) {
    throw new Error('Invalid email or password.')
  }
  const session: Session = {
    user: sanitizeUser(user),
    token: createToken(),
    expiresAt: Date.now() + SESSION_DURATION
  }
  writeSession(session)
  broadcastSession(session)
  return session
}

export const logout = () => {
  writeSession(null)
  broadcastSession(null)
}

export const restoreSession = (): Session | null => {
  const session = readSession()
  if (!session || isExpired(session)) {
    logout()
    return null
  }
  broadcastSession(session)
  return session
}

export const subscribeSession = (listener: (session: Session | null) => void) => {
  if (!isBrowser()) return () => {}
  const handler = (event: Event) => {
    const custom = event as CustomEvent<Session | null>
    listener(custom.detail)
  }
  window.addEventListener(SESSION_EVENT, handler)
  return () => {
    window.removeEventListener(SESSION_EVENT, handler)
  }
}

export const requireAuth = () => {
  // Read session without triggering side-effects (no broadcast/logout)
  const session = readSession()
  if (!session) return false
  return !isExpired(session)
}

export const getCurrentSession = () => {
  const session = readSession()
  if (!session || isExpired(session)) return null
  return session
}

export const peekSession = (): Session | null => readSession()
