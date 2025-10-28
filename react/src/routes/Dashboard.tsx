import { Link } from 'react-router-dom'
import copy from '../../../packages/assets/copy/dashboard.json'
import ticketsCopy from '../../../packages/assets/copy/tickets.json'
import barChart from '../../../packages/assets/media/icons/bar-chart.svg'

const totals = {
  total: 0,
  open: 0,
  inProgress: 0,
  closed: 0
}

export default function Dashboard() {
  const stats = [
    { key: 'total', label: copy.stats.total, value: totals.total },
    { key: 'open', label: copy.stats.open, value: totals.open },
    { key: 'inProgress', label: copy.stats.inProgress, value: totals.inProgress },
    { key: 'closed', label: copy.stats.closed, value: totals.closed }
  ]
  const hasTickets = totals.total > 0

  return (
    <section className="l-container py-2xl l-stack">
      <header className="c-page-header">
        <h1 className="c-page-header__title">{copy.title}</h1>
        <p className="c-page-header__subtitle">{copy.subtitle}</p>
      </header>
      <div className="grid gap-lg md:grid-cols-4">
        {stats.map((stat) => (
          <article className="c-stat-card" key={stat.key}>
            <div>
              <span className="c-stat-card__label">{stat.label}</span>
              <div className="c-stat-card__value">{stat.value}</div>
            </div>
          </article>
        ))}
      </div>
      <div className="c-page-header__actions">
        <Link className="c-button c-button--primary" to="/tickets">{copy.actions.toTickets}</Link>
      </div>
      {!hasTickets && (
        <section className="c-empty">
          <img className="c-empty__illustration" src={barChart} alt="" />
          <p className="c-empty__title">{ticketsCopy.empty.primary.title}</p>
          <Link className="c-button c-button--primary" to="/tickets">
            {ticketsCopy.empty.primary.action}
          </Link>
        </section>
      )}
    </section>
  )
}
