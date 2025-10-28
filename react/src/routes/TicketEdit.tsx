import { Link, useParams } from 'react-router-dom'
import copy from '../../../packages/assets/copy/ticketEdit.json'
import ticketsCopy from '../../../packages/assets/copy/tickets.json'

export default function TicketEdit() {
  const { id } = useParams<{ id: string }>()
  const ticketId = id ?? '123'
  const ticketLabel = copy.breadcrumb
    .replace('Tickets / ', '')
    .replace('#{id}', `#${ticketId}`)

  return (
    <section className="l-container py-2xl l-stack">
      <header className="c-page-header">
        <h1 className="c-page-header__title">{copy.title}</h1>
      </header>
      <nav className="c-breadcrumb l-cluster text-sm text-fg-muted" aria-label="Breadcrumb">
        <Link className="underline" to="/tickets">{ticketsCopy.title}</Link>
        <span className="c-breadcrumb__sep">/</span>
        <span>{ticketLabel}</span>
      </nav>
      <section className="c-card l-stack max-w-xl">
        <div className="c-field">
          <label htmlFor="e-title" className="c-field__label">{copy.form.labels.title}</label>
          <input
            id="e-title"
            className="c-field__control"
            placeholder={ticketsCopy.form.placeholders.title}
          />
        </div>
        <div className="c-field">
          <label htmlFor="e-desc" className="c-field__label">{copy.form.labels.description}</label>
          <textarea
            id="e-desc"
            className="c-field__control"
            rows={6}
            placeholder={ticketsCopy.form.placeholders.description}
          ></textarea>
        </div>
        <div className="c-field">
          <label htmlFor="e-status" className="c-field__label">{copy.form.labels.status}</label>
          <select id="e-status" className="c-field__control">
            {ticketsCopy.card.statusTags.map((status) => (
              <option key={status}>{status}</option>
            ))}
          </select>
        </div>
        <div className="c-field">
          <label htmlFor="e-priority" className="c-field__label">{copy.form.labels.priority}</label>
          <select id="e-priority" className="c-field__control">
            {ticketsCopy.card.priorityTags.map((priority) => (
              <option key={priority}>{priority}</option>
            ))}
          </select>
        </div>
        <div className="c-modal__actions">
          <button className="c-button c-button--primary" type="button">
            {copy.form.actions.update}
          </button>
          <button className="c-button c-button--secondary" type="button">
            {copy.form.actions.cancel}
          </button>
        </div>
      </section>
    </section>
  )
}
