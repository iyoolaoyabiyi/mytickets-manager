import { FormEvent, MouseEvent, useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import ticketsCopy from '../../../packages/assets/copy/tickets.json'
import globalCopy from '../../../packages/assets/copy/global.json'
import type { Ticket, TicketDraft, TicketPriority, TicketStatus } from '../../../packages/utils/tickets'

type ModalMode = 'create' | 'edit'

type Props = {
  visible: boolean
  mode: ModalMode
  ticket?: Ticket | null
  onClose: () => void
  onSubmit: (draft: TicketDraft) => void
}

const statusOptions = ticketsCopy.card.statusTags as TicketStatus[]
const priorityOptions = ticketsCopy.card.priorityTags as TicketPriority[]

const defaultDraft = (): TicketDraft => ({
  title: '',
  description: '',
  status: 'open',
  priority: 'medium'
})

export default function TicketModal({ visible, mode, ticket, onClose, onSubmit }: Props) {
  const [draft, setDraft] = useState<TicketDraft>(() => defaultDraft())
  const [errors, setErrors] = useState({ title: '', status: '', priority: '' })
  const titleRef = useRef<HTMLInputElement | null>(null)

  useEffect(() => {
    if (!visible) return
    if (mode === 'edit' && ticket) {
      setDraft({
        title: ticket.title,
        description: ticket.description ?? '',
        status: ticket.status,
        priority: ticket.priority
      })
    } else {
      setDraft(defaultDraft())
    }
    setErrors({ title: '', status: '', priority: '' })
    window.setTimeout(() => titleRef.current?.focus(), 0)
  }, [visible, mode, ticket])

  const heading = useMemo(
    () => (mode === 'edit' ? ticketsCopy.form.actions.update : ticketsCopy.actions.new),
    [mode]
  )

  const actionLabel = useMemo(
    () => (mode === 'edit' ? ticketsCopy.form.actions.update : ticketsCopy.form.actions.save),
    [mode]
  )

  const headingId = useMemo(
    () => (mode === 'edit' && ticket ? `ticket-modal-${ticket.id}` : 'ticket-modal-create'),
    [mode, ticket]
  )

  if (!visible || typeof document === 'undefined') {
    return null
  }

  useEffect(() => {
    const handleKeydown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose()
      }
    }
    window.addEventListener('keydown', handleKeydown)
    return () => window.removeEventListener('keydown', handleKeydown)
  }, [onClose])

  const validate = () => {
    const nextErrors = {
      title: draft.title.trim() ? '' : globalCopy.validation.titleRequired,
      status: draft.status ? '' : globalCopy.validation.statusRequired,
      priority: draft.priority ? '' : globalCopy.validation.priorityRequired
    }
    setErrors(nextErrors)
    return !nextErrors.title && !nextErrors.status && !nextErrors.priority
  }

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    if (!validate()) return
    onSubmit({
      title: draft.title.trim(),
      description: draft.description.trim(),
      status: draft.status,
      priority: draft.priority
    })
  }

  const overlayClick = (event: MouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) {
      onClose()
    }
  }

  return createPortal(
    <div
      className="c-modal"
      role="dialog"
      aria-modal="true"
      aria-labelledby={headingId}
      onClick={overlayClick}
    >
      <div className="c-modal__panel" onClick={(event) => event.stopPropagation()}>
        <header className="l-stack">
          <h2 id={headingId} className="c-modal__title">{heading}</h2>
        </header>
        <form className="l-stack" onSubmit={handleSubmit}>
          <div className="c-field">
            <label htmlFor="modal-title" className="c-field__label">{ticketsCopy.form.labels.title}</label>
            <input
              id="modal-title"
              value={draft.title}
              ref={titleRef}
              onChange={(event) => setDraft((prev) => ({ ...prev, title: event.target.value }))}
              placeholder={ticketsCopy.form.placeholders.title}
              className="c-field__control"
            />
            {errors.title && <p className="c-field__message">{errors.title}</p>}
          </div>
          <div className="c-field">
            <label htmlFor="modal-description" className="c-field__label">{ticketsCopy.form.labels.description}</label>
            <textarea
              id="modal-description"
              value={draft.description}
              onChange={(event) => setDraft((prev) => ({ ...prev, description: event.target.value }))}
              placeholder={ticketsCopy.form.placeholders.description}
              rows={5}
              className="c-field__control"
            ></textarea>
          </div>
          <div className="grid gap-sm md:grid-cols-2">
            <div className="c-field">
              <label htmlFor="modal-status" className="c-field__label">{ticketsCopy.form.labels.status}</label>
              <select
                id="modal-status"
                value={draft.status}
                onChange={(event) =>
                  setDraft((prev) => ({ ...prev, status: event.target.value as TicketStatus }))
                }
                className="c-field__control"
              >
                {statusOptions.map((status) => (
                  <option key={status} value={status}>{status.replace('_', ' ')}</option>
                ))}
              </select>
              {errors.status && <p className="c-field__message">{errors.status}</p>}
            </div>
            <div className="c-field">
              <label htmlFor="modal-priority" className="c-field__label">{ticketsCopy.form.labels.priority}</label>
              <select
                id="modal-priority"
                value={draft.priority}
                onChange={(event) =>
                  setDraft((prev) => ({ ...prev, priority: event.target.value as TicketPriority }))
                }
                className="c-field__control"
              >
                {priorityOptions.map((priority) => (
                  <option key={priority} value={priority}>
                    {priority.charAt(0).toUpperCase() + priority.slice(1)}
                  </option>
                ))}
              </select>
              {errors.priority && <p className="c-field__message">{errors.priority}</p>}
            </div>
          </div>
          <div className="c-modal__actions">
            <button type="button" className="c-button c-button--secondary" onClick={onClose}>
              {ticketsCopy.form.actions.cancel}
            </button>
            <button type="submit" className="c-button c-button--primary">
              {actionLabel}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  )
}
