export type TicketStatus = 'open' | 'in_progress' | 'closed'
export type TicketPriority = 'high' | 'medium' | 'low'

export type Ticket = {
  id: number
  title: string
  description?: string
  status: TicketStatus
  priority: TicketPriority
  created_at: string
  updated_at: string
}

export type TicketDraft = {
  title: string
  description?: string
  status: TicketStatus
  priority: TicketPriority
}

export type TicketFilters = {
  q: string
  status: 'all' | TicketStatus
  priority: 'all' | TicketPriority
}

const STORAGE_KEY = 'ticketapp_tickets'
export const TICKETS_CHANGED_EVENT = 'tickets:changed'

const DEFAULT_FILTERS: TicketFilters = {
  q: '',
  status: 'all',
  priority: 'all'
}

const DEFAULT_LATENCY = 120

let memoryStore: Ticket[] | null = null

const createSeedTickets = (): Ticket[] => {
  const now = Date.now()
  const makeTimestamp = (offsetMinutes: number) =>
    new Date(now - offsetMinutes * 60 * 1000).toISOString()

  return [
    {
      id: 1,
      title: 'Welcome to myTickets Manager',
      description: 'Start by creating a ticket to track work items and assign statuses.',
      status: 'open',
      priority: 'high',
      created_at: makeTimestamp(720),
      updated_at: makeTimestamp(45)
    },
    {
      id: 2,
      title: 'Review onboarding flow copy',
      description: 'Ensure login and signup microcopy matches the latest deck.',
      status: 'in_progress',
      priority: 'medium',
      created_at: makeTimestamp(1440),
      updated_at: makeTimestamp(120)
    },
    {
      id: 3,
      title: 'Archive resolved tickets weekly',
      description: 'Closed tickets should be exported and archived every Friday.',
      status: 'closed',
      priority: 'low',
      created_at: makeTimestamp(4320),
      updated_at: makeTimestamp(1440)
    }
  ]
}

const getStorage = (): Storage | null => {
  if (typeof window === 'undefined') return null
  try {
    return window.localStorage
  } catch {
    return null
  }
}

const readTickets = (): Ticket[] => {
  const storage = getStorage()
  if (!storage) {
    if (memoryStore === null) {
      memoryStore = createSeedTickets()
    }
    return [...memoryStore]
  }

  const raw = storage.getItem(STORAGE_KEY)
  if (!raw) {
    const seeds = createSeedTickets()
    storage.setItem(STORAGE_KEY, JSON.stringify(seeds))
    memoryStore = [...seeds]
    return seeds
  }

  try {
    const parsed = JSON.parse(raw) as Ticket[]
    if (!Array.isArray(parsed)) throw new Error('Invalid tickets data')
    memoryStore = [...parsed]
    return parsed
  } catch {
    const seeds = createSeedTickets()
    storage.setItem(STORAGE_KEY, JSON.stringify(seeds))
    memoryStore = [...seeds]
    return seeds
  }
}

const writeTickets = (tickets: Ticket[]) => {
  const storage = getStorage()
  memoryStore = [...tickets]
  if (storage) {
    storage.setItem(STORAGE_KEY, JSON.stringify(tickets))
  }
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(TICKETS_CHANGED_EVENT))
  }
}

const withLatency = async <T>(value: T, latency = DEFAULT_LATENCY): Promise<T> => {
  await new Promise((resolve) => setTimeout(resolve, latency))
  return value
}

const generateId = (tickets: Ticket[]) => {
  const ids = tickets.map((ticket) => ticket.id)
  return ids.length ? Math.max(...ids) + 1 : 1
}

const applyFilters = (tickets: Ticket[], filters: TicketFilters): Ticket[] => {
  const query = filters.q.trim().toLowerCase()
  return tickets
    .filter((ticket) => {
      const description = (ticket.description ?? '').toLowerCase()
      const matchesQuery = query
        ? ticket.title.toLowerCase().includes(query) || description.includes(query)
        : true

      const matchesStatus =
        filters.status === 'all' ? true : ticket.status === filters.status

      const matchesPriority =
        filters.priority === 'all' ? true : ticket.priority === filters.priority

      return matchesQuery && matchesStatus && matchesPriority
    })
    .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
}

export const listTickets = async (
  rawFilters?: Partial<TicketFilters>
): Promise<Ticket[]> => {
  const filters: TicketFilters = { ...DEFAULT_FILTERS, ...rawFilters }
  const tickets = readTickets()
  return withLatency(applyFilters(tickets, filters))
}

export const getTicket = async (id: number): Promise<Ticket | null> => {
  const tickets = readTickets()
  const ticket = tickets.find((item) => item.id === id) ?? null
  return withLatency(ticket)
}

export const createTicket = async (draft: TicketDraft): Promise<Ticket> => {
  const tickets = readTickets()
  const id = generateId(tickets)
  const timestamp = new Date().toISOString()
  const ticket: Ticket = {
    id,
    title: draft.title.trim(),
    description: draft.description?.trim() ?? '',
    status: draft.status,
    priority: draft.priority,
    created_at: timestamp,
    updated_at: timestamp
  }
  const next = [...tickets, ticket]
  writeTickets(next)
  return withLatency(ticket)
}

export const updateTicket = async (
  id: number,
  draft: TicketDraft
): Promise<Ticket> => {
  const tickets = readTickets()
  const index = tickets.findIndex((ticket) => ticket.id === id)
  if (index === -1) {
    throw await withLatency(new Error('Ticket not found'))
  }

  const updated: Ticket = {
    ...tickets[index],
    title: draft.title.trim(),
    description: draft.description?.trim() ?? '',
    status: draft.status,
    priority: draft.priority,
    updated_at: new Date().toISOString()
  }

  const next = [...tickets]
  next.splice(index, 1, updated)
  writeTickets(next)
  return withLatency(updated)
}

export const deleteTicket = async (id: number): Promise<void> => {
  const tickets = readTickets()
  const next = tickets.filter((ticket) => ticket.id !== id)
  writeTickets(next)
  await withLatency(undefined)
}

export const clearTickets = () => {
  const storage = getStorage()
  memoryStore = createSeedTickets()
  if (storage) {
    storage.setItem(STORAGE_KEY, JSON.stringify(memoryStore))
  }
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(TICKETS_CHANGED_EVENT))
  }
}

export const getTicketStats = async () => {
  const tickets = readTickets()
  const stats = tickets.reduce(
    (acc, ticket) => {
      acc.total += 1
      if (ticket.status === 'open') acc.open += 1
      if (ticket.status === 'in_progress') acc.inProgress += 1
      if (ticket.status === 'closed') acc.closed += 1
      return acc
    },
    { total: 0, open: 0, inProgress: 0, closed: 0 }
  )
  return withLatency(stats)
}

export const defaultFilters = (): TicketFilters => ({ ...DEFAULT_FILTERS })
