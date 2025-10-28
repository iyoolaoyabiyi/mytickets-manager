import { Link } from 'react-router-dom'
import landing from '../../../packages/assets/copy/landing.json'
import wave from '../../../packages/assets/media/wave.svg'
import circle from '../../../packages/assets/media/circle-1.svg'
import { usePageMeta } from '../hooks/usePageMeta'

export default function Landing() {
  const asset = (icon: string) =>
    new URL(`../../../packages/assets/media/${icon}`, import.meta.url).toString()
  usePageMeta({ title: 'Home', description: landing.hero.subtitle })
  return (
    <>
      <section className="c-hero">
        <div className="c-hero__inner animate-fade-up">
          <h1 className="c-hero__title">{landing.hero.title}</h1>
          <p className="c-hero__subtitle">{landing.hero.subtitle}</p>
          <div className="c-hero__actions">
            <Link to="/auth/signup" className="c-button c-button--primary">{landing.hero.primaryCta}</Link>
            <Link to="/auth/login" className="c-button c-button--secondary">{landing.hero.secondaryCta}</Link>
          </div>
        </div>
        <img src={wave} className="c-hero__wave" alt="" />
        <img src={circle} className="c-hero__decor" alt="" />
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
