import { ChangeEvent, FormEvent, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import copy from '@packages/assets/copy/tickets.json'
import globalCopy from '@packages/assets/copy/global.json'
import barChart from '@packages/assets/media/icons/bar-chart.svg?raw'
import TicketModal from '../components/TicketModal'
import {
  createTicket,
  deleteTicket,
  defaultFilters,
  listTickets,
  updateTicket,
  TICKETS_CHANGED_EVENT,
  type Ticket,
  type TicketDraft,
  type TicketFilters
} from '@packages/utils/tickets'
import { formatRelativeTime } from '@packages/utils/time'
import { pushToast } from '@packages/utils/toast'
import { useAuthGuard } from '../hooks/useAuthGuard'
import { usePageMeta } from '../hooks/usePageMeta'

const statusClass = (status: string) => {
  switch (status) {
    case "in_progress":
      return "c-tag--in-progress";
    case "closed":
      return "c-tag--closed";  
    default:
      return "c-tag--open"
  }
}

export default function Tickets() {
  useAuthGuard()
  usePageMeta({ title: copy.title, description: 'Manage, search, and update your myTickets queue.' })

  const [tickets, setTickets] = useState<Ticket[]>([])
  const [status, setStatus] = useState<'idle' | 'loading' | 'ready' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState('')
  const [alertMessage, setAlertMessage] = useState('')
  const [filters, setFilters] = useState<TicketFilters>(() => defaultFilters())
  const filtersRef = useRef(filters)
  const searchTimer = useRef<number | undefined>(undefined)
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const [modal, setModal] = useState<{ open: boolean; mode: 'create' | 'edit'; ticket: Ticket | null }>(
    { open: false, mode: 'create', ticket: null }
  )
  const didMount = useRef(false)
  const currentRequestIdRef = useRef(0)

  const statusOptions = useMemo(
    () =>
      copy.filters.status.options.map((option) => ({
        value: option === 'All' ? 'all' : option,
        label: option === 'All' ? option : option.replace('_', ' ')
      })),
    []
  )

  const priorityOptions = useMemo(
    () => [
      { value: 'all', label: 'All' },
      ...copy.filters.priority.options.map((option) => ({
        value: option.toLowerCase(),
        label: option.charAt(0).toUpperCase() + option.slice(1).toLowerCase()
      }))
    ],
    []
  )

  const isLoading = status === 'loading'
  const isError = status === 'error'
  const isFiltered = filters.q.trim() !== '' || filters.status !== 'all' || filters.priority !== 'all'

  const emptyTitle = isFiltered ? copy.empty.filtered.title : copy.empty.primary.title
  const emptyAction = isFiltered ? copy.empty.filtered.action : copy.empty.primary.action

  const clearAlert = () => setAlertMessage('')

  const loadTickets = useCallback(async (criteria?: TicketFilters) => {
    const requestId = Date.now()
    currentRequestIdRef.current = requestId

    const nextFilters = criteria ?? filtersRef.current
    filtersRef.current = nextFilters
    setStatus('loading')
    try {
      const data = await listTickets({ ...nextFilters })
      // Only update state if this is still the most recent request
      if (currentRequestIdRef.current === requestId) {
        setTickets(data)
        setStatus('ready')
        setErrorMessage('')
        clearAlert()
      }
    } catch (error) {
      if (currentRequestIdRef.current === requestId) {
        setStatus('error')
        setErrorMessage(globalCopy.toasts.loadError)
        setAlertMessage(globalCopy.toasts.loadError)
        pushToast(globalCopy.toasts.loadError, 'error')
      }
    }
  }, [])

  useEffect(() => {
    let mounted = true
    ;(async () => {
      await loadTickets()
      if (mounted) {
        didMount.current = true
      }
    })()

    let debounceTimer: number | undefined

    const handler = () => {
      // Debounce the ticket reload on change events
      window.clearTimeout(debounceTimer)
      debounceTimer = window.setTimeout(() => {
        if (mounted) {
          loadTickets(filtersRef.current)
        }
      }, 50)
    }

    window.addEventListener(TICKETS_CHANGED_EVENT, handler)
    return () => {
      mounted = false
      window.removeEventListener(TICKETS_CHANGED_EVENT, handler)
      window.clearTimeout(searchTimer.current)
      window.clearTimeout(debounceTimer)
    }
  }, [loadTickets])

  useEffect(() => {
    if (!didMount.current) return
    window.clearTimeout(searchTimer.current)
    searchTimer.current = window.setTimeout(() => {
      void loadTickets(filters)
    }, 240)
    return () => {
      window.clearTimeout(searchTimer.current)
    }
  }, [filters.q, loadTickets])

  useEffect(() => {
    if (!didMount.current) return
    void loadTickets(filters)
  }, [filters.status, filters.priority, loadTickets])

  const handleSearchChange = (event: ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value
    setFilters((prev) => ({ ...prev, q: value }))
  }

  const handleStatusChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const value = event.target.value as TicketFilters['status']
    setFilters((prev) => ({ ...prev, status: value }))
  }

  const handlePriorityChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const value = event.target.value as TicketFilters['priority']
    setFilters((prev) => ({ ...prev, priority: value }))
  }

  const handleFiltersSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    window.clearTimeout(searchTimer.current)
    void loadTickets(filters)
  }

  const resetFilters = () => {
    const defaults = defaultFilters()
    setFilters(defaults)
    filtersRef.current = defaults
    setAlertMessage('')
  }

  const openCreateModal = () => {
    setModal({ open: true, mode: 'create', ticket: null })
  }

  const openEditModal = (ticket: Ticket) => {
    setModal({ open: true, mode: 'edit', ticket })
  }

  const closeModal = () => {
    setModal((prev) => ({ ...prev, open: false, ticket: null }))
  }

  const submitTicket = async (draft: TicketDraft) => {
    try {
      if (modal.mode === 'edit' && modal.ticket) {
        await updateTicket(modal.ticket.id, draft)
        pushToast(globalCopy.toasts.updateSuccess, 'success')
      } else {
        await createTicket(draft)
        pushToast(globalCopy.toasts.createSuccess, 'success')
      }
      closeModal()
      // Let the TICKETS_CHANGED_EVENT trigger the reload instead
    } catch {
      setAlertMessage(globalCopy.toasts.validation)
      pushToast(globalCopy.toasts.validation, 'error')
    }
  }

  const handleDelete = async (id: number) => {
    const confirmMessage = `${globalCopy.confirm.delete.title}\n${globalCopy.confirm.delete.body}`
    if (!window.confirm(confirmMessage)) return

    setDeletingId(id)
    try {
      await deleteTicket(id)
      pushToast(globalCopy.toasts.deleteSuccess, 'success')
      // Let the TICKETS_CHANGED_EVENT trigger the reload instead
    } catch {
      setAlertMessage(globalCopy.toasts.loadError)
      pushToast(globalCopy.toasts.loadError, 'error')
    } finally {
      setDeletingId(null)
    }
  }

  const handleEmptyAction = () => {
    if (isFiltered) {
      resetFilters()
    } else {
      openCreateModal()
    }
  }

  const metaFor = (ticket: Ticket) =>
    copy.card.metaPattern
      .replace('#{id}', `#${ticket.id}`)
      .replace('{relativeTime}', formatRelativeTime(ticket.updated_at) || 'just now')

  const formatStatus = (status: Ticket['status']) => status.replace('_', ' ')
  const formatPriority = (priority: Ticket['priority']) =>
    priority.charAt(0).toUpperCase() + priority.slice(1)

  return (
    <section className="py-2xl l-stack">
      <header className="c-page-header">
        <h1 className="c-page-header__title">{copy.title}</h1>
        <div className="c-page-header__actions">
          <button className="c-button c-button--primary" type="button" onClick={openCreateModal}>
            {copy.actions.new}
          </button>
        </div>
      </header>

      {alertMessage && <p className="c-alert" role="alert">{alertMessage}</p>}

      <form
        className="c-filters l-stack md:grid md:grid-cols-[2fr_1fr_1fr_auto] md:items-end"
        aria-label="Filters"
        onSubmit={handleFiltersSubmit}
      >
        <div className="c-field">
          <label htmlFor="q" className="c-field__label">{copy.filters.search.label}</label>
          <input
            id="q"
            value={filters.q}
            onChange={handleSearchChange}
            type="search"
            placeholder={copy.filters.search.placeholder}
            className="c-filters__search"
          />
        </div>
        <div className="c-field">
          <label htmlFor="status" className="c-field__label">{copy.filters.status.label}</label>
          <select id="status" value={filters.status} onChange={handleStatusChange} className="c-field__control">
            {statusOptions.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        </div>
        <div className="c-field">
          <label htmlFor="priority" className="c-field__label">{copy.filters.priority.label}</label>
          <select id="priority" value={filters.priority} onChange={handlePriorityChange} className="c-field__control">
            {priorityOptions.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        </div>
        <button className="c-button c-button--secondary" type="submit">
          {copy.filters.actions.search}
        </button>
      </form>

      <section role="feed" aria-busy={isLoading} id="tickets-feed" className="l-stack">
        {isLoading && <div className="c-card">Loading tickets…</div>}
        {isError && !isLoading && <div className="c-card c-card--error">{errorMessage}</div>}
        {!isLoading && !isError && (
          <>
            {tickets.length === 0 ? (
              <div className="c-empty animate-fade-up">
                <div
                  className="c-empty__illustration"
                  aria-hidden="true"
                  role="presentation"
                  dangerouslySetInnerHTML={{ __html: barChart }}
                />
                <p className="c-empty__title">{emptyTitle}</p>
                <button
                  className={`c-button ${isFiltered ? 'c-button--secondary' : 'c-button--primary'}`}
                  type="button"
                  onClick={handleEmptyAction}
                >
                  {emptyAction}
                </button>
              </div>
            ) : (
              tickets.map((ticket) => (
                <article key={ticket.id} className="c-ticket-card animate-fade-up" role="article">
                  <div className="min-w-0 l-stack">
                    <h3 className="c-ticket-card__title">{ticket.title}</h3>
                    <p className="c-ticket-card__meta">{metaFor(ticket)}</p>
                    {ticket.description && <p className="text-sm text-fg-muted">{ticket.description}</p>}
                  </div>
                  <div className="l-stack md:items-end md:flex md:flex-col md:gap-md">
                    <div className="c-ticket-card__badges">
                      <span className={`c-tag ${statusClass(ticket.status)}`}>{formatStatus(ticket.status)}</span>
                      <span className="c-tag">{formatPriority(ticket.priority)}</span>
                    </div>
                    <div className="c-ticket-card__actions">
                      <button className="c-button c-button--secondary" type="button" onClick={() => openEditModal(ticket)}>
                        {copy.card.labels.edit}
                      </button>
                      <button
                        className="c-button c-button--danger"
                        type="button"
                        onClick={() => handleDelete(ticket.id)}
                        disabled={deletingId === ticket.id}
                      >
                        {deletingId === ticket.id ? 'Deleting…' : copy.card.labels.delete}
                      </button>
                    </div>
                  </div>
                </article>
              ))
            )}
          </>
        )}
      </section>

      <TicketModal
        visible={modal.open}
        mode={modal.mode}
        ticket={modal.ticket}
        onClose={closeModal}
        onSubmit={submitTicket}
      />
    </section>
  )
}
