import { Link } from 'react-router-dom'
import landing from '@packages/assets/copy/landing.json'
import { usePageMeta } from '../hooks/usePageMeta'
import { useSession } from '../hooks/useSession'

const svgAssets = import.meta.glob('../../packages/assets/media/**/*.svg', {
  eager: true,
  as: 'raw',
}) as Record<string, string>

const svgAsset = (icon?: string | null) => {
  if (!icon) return undefined
  const key = `../../packages/assets/media/${icon}`
  if (!svgAssets[key]) {
    console.warn(`Missing asset for key: ${key}`)
    return undefined
  }
  return svgAssets[key]
}

export default function Landing() {
  const heroWave = svgAsset(landing.hero.media.wave)
  const features = landing.features.map(feature => {
    return {
      ...feature,
      iconMarkup: svgAsset(feature.icon),
    }
  })
  const heroCirclePrimary = svgAsset(landing.hero.media.decorativeCircle)
  const heroCircleSecondary = svgAsset(
    landing.hero.media.decorativeCircleSecondary ?? landing.hero.media.decorativeCircle
  )
  const session = useSession()
  const isAuthenticated = Boolean(session)
  const authenticatedCtaLabel = landing.hero.authenticatedCta ?? 'Dashboard'
  const authenticatedHref = landing.hero.authenticatedHref ?? '/dashboard'
  usePageMeta({ title: landing.hero.title, description: landing.hero.subtitle })
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
        {heroWave && (
          <div
            className="c-hero__wave"
            aria-hidden="true"
            role="presentation"
            dangerouslySetInnerHTML={{ __html: heroWave }}
          />
        )}
        {heroCirclePrimary && (
          <div
            className="c-hero__decor"
            aria-hidden="true"
            role="presentation"
            dangerouslySetInnerHTML={{ __html: heroCirclePrimary }}
          />
        )}
        {heroCircleSecondary && (
          <div
            className="c-hero__decor-secondary"
            aria-hidden="true"
            role="presentation"
            dangerouslySetInnerHTML={{ __html: heroCircleSecondary }}
          />
        )}
      </section>

      <section className="l-stack py-2xl">
        <div className="l-grid-3">
          {features.map((f, i) => (
            <article className="c-feature-card animate-fade-up" key={i}>
              {f.iconMarkup && (
                <div
                  className="c-feature-card__icon"
                  aria-hidden="true"
                  role="presentation"
                  dangerouslySetInnerHTML={{ __html: f.iconMarkup }}
                />
              )}
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
