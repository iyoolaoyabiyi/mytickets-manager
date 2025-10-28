import copy from '../../../packages/assets/copy/tickets.json'
import barChart from '../../../packages/assets/media/icons/bar-chart.svg'

const defaultStatus = copy.card.statusTags[0]
const defaultPriority = copy.card.priorityTags[0]

const exampleMeta = copy.card.metaPattern
  .replace('#{id}', '#123')
  .replace('{relativeTime}', '2h ago')

const statusLabel = defaultStatus.replace('_', ' ')
const priorityLabel = defaultPriority.charAt(0).toUpperCase() + defaultPriority.slice(1)

const statusClass = (status: string) => {
  if (status === 'in_progress') {
    return 'c-tag--in-progress'
  }
  return `c-tag--${status}`
}

export default function Tickets() {
  return (
    <section className="l-container py-2xl l-stack">
      <header className="c-page-header">
        <h1 className="c-page-header__title">{copy.title}</h1>
        <div className="c-page-header__actions">
          <button className="c-button c-button--primary" type="button">
            {copy.actions.new}
          </button>
        </div>
      </header>

      <section className="c-filters l-stack md:grid md:grid-cols-[2fr_1fr_1fr_auto] md:items-end" aria-label="Filters">
        <div className="c-field">
          <label htmlFor="q" className="c-field__label">{copy.filters.search.label}</label>
          <input
            id="q"
            type="search"
            placeholder={copy.filters.search.placeholder}
            className="c-filters__search"
          />
        </div>
        <div className="c-field">
          <label htmlFor="status" className="c-field__label">{copy.filters.status.label}</label>
          <select id="status" className="c-field__control">
            {copy.filters.status.options.map((option) => (
              <option key={option}>{option}</option>
            ))}
          </select>
        </div>
        <div className="c-field">
          <label htmlFor="priority" className="c-field__label">{copy.filters.priority.label}</label>
          <select id="priority" className="c-field__control">
            {copy.filters.priority.options.map((option) => (
              <option key={option}>{option}</option>
            ))}
          </select>
        </div>
        <button className="c-button c-button--secondary" type="button">
          {copy.filters.actions.search}
        </button>
      </section>

      <section role="feed" aria-busy="false" id="tickets-feed" className="l-stack">
        <div className="c-empty" hidden>
          <img className="c-empty__illustration" src={barChart} alt="" />
          <p className="c-empty__title">{copy.empty.primary.title}</p>
          <button className="c-button c-button--primary" type="button">
            {copy.empty.primary.action}
          </button>
        </div>
        <div className="c-empty" hidden>
          <img className="c-empty__illustration" src={barChart} alt="" />
          <p className="c-empty__title">{copy.empty.filtered.title}</p>
          <button className="c-button c-button--secondary" type="button">
            {copy.empty.filtered.action}
          </button>
        </div>

        <article className="c-ticket-card" role="article">
          <div className="min-w-0 l-stack">
            <h3 className="c-ticket-card__title">Example Ticket</h3>
            <p className="c-ticket-card__meta">{exampleMeta}</p>
          </div>
          <div className="l-stack md:items-end md:flex md:flex-col md:gap-sm">
            <div className="l-cluster">
              <span className={`c-tag ${statusClass(defaultStatus)}`}>{statusLabel}</span>
              <span className="c-tag">{priorityLabel}</span>
            </div>
            <div className="c-ticket-card__actions">
              <button className="c-button c-button--secondary" type="button" aria-label="Edit">
                {copy.card.labels.edit}
              </button>
              <button className="c-button c-button--danger" type="button" aria-label="Delete">
                {copy.card.labels.delete}
              </button>
            </div>
          </div>
        </article>
      </section>
    </section>
  )
}
