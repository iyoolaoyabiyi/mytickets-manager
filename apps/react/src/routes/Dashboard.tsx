import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import copy from '@packages/assets/copy/dashboard.json'
import ticketsCopy from '@packages/assets/copy/tickets.json'
import barChart from '@packages/assets/media/icons/bar-chart.svg?raw'
import { getTicketStats, TICKETS_CHANGED_EVENT } from '@packages/utils/tickets'
import { useAuthGuard } from '../hooks/useAuthGuard'
import { usePageMeta } from '../hooks/usePageMeta'

type StatKey = 'total' | 'open' | 'inProgress' | 'closed'

export default function Dashboard() {
  useAuthGuard()
  usePageMeta({ title: copy.title, description: copy.subtitle })
  const [stats, setStats] = useState<Record<StatKey, number>>({
    total: 0,
    open: 0,
    inProgress: 0,
    closed: 0
  })
  const [loading, setLoading] = useState(true)

  const statEntries = useMemo(
    () => [
      { key: 'total', label: copy.stats.total, value: stats.total },
      { key: 'open', label: copy.stats.open, value: stats.open },
      { key: 'inProgress', label: copy.stats.inProgress, value: stats.inProgress },
      { key: 'closed', label: copy.stats.closed, value: stats.closed }
    ],
    [stats]
  )

  const hasTickets = stats.total > 0

  const loadStats = useCallback(async () => {
    setLoading(true)
    const data = await getTicketStats()
    setStats(data)
    setLoading(false)
  }, [])

  useEffect(() => {
    loadStats()
    const handler = () => loadStats()
    window.addEventListener(TICKETS_CHANGED_EVENT, handler)
    return () => {
      window.removeEventListener(TICKETS_CHANGED_EVENT, handler)
    }
  }, [loadStats])

  return (
    <section className="py-2xl l-stack">
      <header className="c-page-header">
        <h1 className="c-page-header__title">{copy.title}</h1>
        <p className="c-page-header__subtitle">{copy.subtitle}</p>
      </header>
      <div className="grid gap-lg md:grid-cols-4" aria-busy={loading}>
        {statEntries.map((stat) => (
          <article className="c-stat-card animate-fade-up" key={stat.key}>
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
      {!loading && !hasTickets && (
        <section className="c-empty animate-fade-up">
          <div
            className="c-empty__illustration"
            aria-hidden="true"
            role="presentation"
            dangerouslySetInnerHTML={{ __html: barChart }}
          />
          <p className="c-empty__title">{ticketsCopy.empty.primary.title}</p>
          <Link className="c-button c-button--primary" to="/tickets">
            {ticketsCopy.empty.primary.action}
          </Link>
        </section>
      )}
    </section>
  )
}
