import { Link } from 'react-router-dom'
import landing from '@packages/assets/copy/landing.json'
import { usePageMeta } from '../hooks/usePageMeta'
import { useSession } from '../hooks/useSession'

export default function Landing() {
  const asset = (icon: string) =>
    new URL(`../../packages/assets/media/${icon}`, import.meta.url).toString()
  const heroWave = asset(landing.hero.media.wave)
  const heroCirclePrimary = asset(landing.hero.media.decorativeCircle)
  const heroCircleSecondary = asset(
    landing.hero.media.decorativeCircleSecondary ?? landing.hero.media.decorativeCircle
  )
  const session = useSession()
  const isAuthenticated = Boolean(session)
  const authenticatedCtaLabel = landing.hero.authenticatedCta ?? 'Dashboard'
  const authenticatedHref = landing.hero.authenticatedHref ?? '/dashboard'
  usePageMeta({ title: 'Home', description: landing.hero.subtitle })
  return (
    <>
      <section className="c-hero">
        <div className="c-hero__inner animate-fade-up">
          <h1 className="c-hero__title">{landing.hero.title}</h1>
          <p className="c-hero__subtitle">{landing.hero.subtitle}</p>
          <div className="c-hero__actions">
            {isAuthenticated ? (
              <Link to={authenticatedHref} className="c-button c-button--primary">
                {authenticatedCtaLabel}
              </Link>
            ) : (
              <>
                <Link to="/auth/signup" className="c-button c-button--primary">{landing.hero.primaryCta}</Link>
                <Link to="/auth/login" className="c-button c-button--secondary">{landing.hero.secondaryCta}</Link>
              </>
            )}
          </div>
        </div>
        <img src={heroWave} className="c-hero__wave" alt="" aria-hidden="true" />
        <img src={heroCirclePrimary} className="c-hero__decor" alt="" aria-hidden="true" />
        <img src={heroCircleSecondary} className="c-hero__decor-secondary" alt="" aria-hidden="true" />
      </section>

      <section className="l-stack py-2xl">
        <div className="l-grid-3">
          {landing.features.map((f, i) => (
            <article className="c-feature-card animate-fade-up" key={i}>
              <img src={asset(f.icon)} className="c-feature-card__icon" alt="" />
              <h3 className="c-feature-card__title">{f.title}</h3>
              <p className="c-feature-card__body">{f.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="l-stack py-2xl">
        <div className="l-grid-3">
          {landing.howItWorks.map((s, i) => (
            <article className="c-how-step animate-fade-up" key={i}>
              <h3 className="c-how-step__title">{s.title}</h3>
              <p className="c-how-step__body">{s.body}</p>
            </article>
          ))}
        </div>
      </section>
    </>
  )
}
