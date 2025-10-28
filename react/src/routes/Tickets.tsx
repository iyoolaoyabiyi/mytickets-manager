import { ChangeEvent, FormEvent, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import copy from '../../../packages/assets/copy/tickets.json'
import globalCopy from '../../../packages/assets/copy/global.json'
import barChart from '../../../packages/assets/media/icons/bar-chart.svg'
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
} from '../../../packages/utils/tickets'
import { formatRelativeTime } from '../../../packages/utils/time'

const statusClass = (status: string) => (status === 'in_progress' ? 'c-tag--in-progress' : `c-tag--${status}`)

export default function Tickets() {
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [status, setStatus] = useState<'idle' | 'loading' | 'ready' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState('')
  const [feedback, setFeedback] = useState<{ message: string; kind: 'success' | 'error' }>({
    message: '',
    kind: 'success'
  })
  const [filters, setFilters] = useState<TicketFilters>(() => defaultFilters())
  const filtersRef = useRef<TicketFilters>(filters)
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const [modal, setModal] = useState<{ open: boolean; mode: 'create' | 'edit'; ticket: Ticket | null }>(
    { open: false, mode: 'create', ticket: null }
  )
  const feedbackTimer = useRef<number | null>(null)

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

  const showFeedback = useCallback((message: string, kind: 'success' | 'error' = 'success') => {
    if (feedbackTimer.current) {
      window.clearTimeout(feedbackTimer.current)
    }
    setFeedback({ message, kind })
    feedbackTimer.current = window.setTimeout(() => {
      setFeedback((current) => (current.message === message ? { ...current, message: '' } : current))
    }, 3200)
  }, [])

  const fetchTickets = useCallback(async (nextFilters?: TicketFilters) => {
    const criteria = nextFilters ?? filtersRef.current
    filtersRef.current = criteria
    setStatus('loading')
    try {
      const data = await listTickets({ ...criteria })
      setTickets(data)
      setStatus('ready')
      setErrorMessage('')
    } catch {
      setStatus('error')
      setErrorMessage(globalCopy.toasts.loadError)
    }
  }, [])

  useEffect(() => {
    fetchTickets()
    const handler = () => fetchTickets()
    window.addEventListener(TICKETS_CHANGED_EVENT, handler)
    return () => {
      window.removeEventListener(TICKETS_CHANGED_EVENT, handler)
      if (feedbackTimer.current) {
        window.clearTimeout(feedbackTimer.current)
      }
    }
  }, [fetchTickets])

  const handleSearchChange = (event: ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value
    setFilters((prev) => {
      const next = { ...prev, q: value }
      filtersRef.current = next
      return next
    })
  }

  const handleStatusChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const value = event.target.value as TicketFilters['status']
    setFilters((prev) => {
      const next = { ...prev, status: value }
      filtersRef.current = next
      void fetchTickets(next)
      return next
    })
  }

  const handlePriorityChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const value = event.target.value as TicketFilters['priority']
    setFilters((prev) => {
      const next = { ...prev, priority: value }
      filtersRef.current = next
      void fetchTickets(next)
      return next
    })
  }

  const handleFiltersSubmit = (event: FormEvent) => {
    event.preventDefault()
    void fetchTickets()
  }

  const resetFilters = () => {
    const next = defaultFilters()
    setFilters(next)
    filtersRef.current = next
    void fetchTickets(next)
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
        showFeedback(globalCopy.toasts.updateSuccess)
      } else {
        await createTicket(draft)
        showFeedback(globalCopy.toasts.createSuccess)
      }
      closeModal()
      await fetchTickets()
    } catch {
      showFeedback(globalCopy.toasts.validation, 'error')
    }
  }

  const handleDelete = async (id: number) => {
    const confirmMessage = `${globalCopy.confirm.delete.title}\n${globalCopy.confirm.delete.body}`
    if (!window.confirm(confirmMessage)) return
    setDeletingId(id)
    try {
      await deleteTicket(id)
      showFeedback(globalCopy.toasts.deleteSuccess)
      await fetchTickets()
    } catch {
      showFeedback(globalCopy.toasts.loadError, 'error')
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
      .replace('{relativeTime}', formatRelativeTime(ticket.updated_at))

  const formatStatus = (status: Ticket['status']) => status.replace('_', ' ')
  const formatPriority = (priority: Ticket['priority']) =>
    priority.charAt(0).toUpperCase() + priority.slice(1)

  return (
    <section className="l-container py-2xl l-stack">
      <header className="c-page-header">
        <h1 className="c-page-header__title">{copy.title}</h1>
        <div className="c-page-header__actions">
          <button className="c-button c-button--primary" type="button" onClick={openCreateModal}>
            {copy.actions.new}
          </button>
        </div>
      </header>

      {feedback.message && (
        <p className="c-alert" data-kind={feedback.kind}>
          {feedback.message}
        </p>
      )}

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
              <div className="c-empty">
                <img className="c-empty__illustration" src={barChart} alt="" />
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
                <article key={ticket.id} className="c-ticket-card" role="article">
                  <div className="min-w-0 l-stack">
                    <h3 className="c-ticket-card__title">{ticket.title}</h3>
                    <p className="c-ticket-card__meta">{metaFor(ticket)}</p>
                    {ticket.description && <p className="text-sm text-fg-muted">{ticket.description}</p>}
                  </div>
                  <div className="l-stack md:items-end md:flex md:flex-col md:gap-sm">
                    <div className="l-cluster">
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
