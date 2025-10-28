import { Link } from 'react-router-dom'
import copy from '../../../packages/assets/copy/signup.json'

export default function Signup() {
  return (
    <section className="c-auth-card l-stack">
      <header className="c-page-header">
        <h1 className="c-page-header__title">{copy.heading}</h1>
        <p className="c-page-header__subtitle">{copy.tagline}</p>
      </header>
      <form className="c-auth-card__form" noValidate>
        <h2 className="c-modal__title">{copy.title}</h2>
        <div className="c-auth-card__fields">
          <div className="c-field">
            <label htmlFor="name" className="c-field__label">{copy.form.labels.name}</label>
            <input id="name" type="text" placeholder={copy.form.placeholders.name} className="c-field__control" />
          </div>
          <div className="c-field">
            <label htmlFor="email" className="c-field__label">{copy.form.labels.email}</label>
            <input id="email" type="email" placeholder={copy.form.placeholders.email} className="c-field__control" />
          </div>
          <div className="c-field">
            <label htmlFor="password" className="c-field__label">{copy.form.labels.password}</label>
            <input id="password" type="password" placeholder={copy.form.placeholders.password} className="c-field__control" />
          </div>
          <div className="c-field">
            <label htmlFor="confirm" className="c-field__label">{copy.form.labels.confirm}</label>
            <input id="confirm" type="password" placeholder={copy.form.placeholders.confirm} className="c-field__control" />
          </div>
        </div>
        <div className="c-auth-card__actions">
          <button className="c-button c-button--primary" type="submit">{copy.form.submit}</button>
          <p className="c-auth-card__switch">
            <Link to="/auth/login">{copy.links.switch}</Link>
          </p>
        </div>
      </form>
      <p className="c-auth-card__hint">{copy.postSignup}</p>
    </section>
  )
}
