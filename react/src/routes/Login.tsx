import { Link } from 'react-router-dom'
import copy from '../../../packages/assets/copy/login.json'

export default function Login() {
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
            <label htmlFor="email" className="c-field__label">{copy.form.labels.email}</label>
            <input id="email" type="email" placeholder={copy.form.placeholders.email} className="c-field__control" />
            <p className="c-field__message" id="email-msg" hidden></p>
          </div>
          <div className="c-field">
            <label htmlFor="password" className="c-field__label">{copy.form.labels.password}</label>
            <input id="password" type="password" placeholder={copy.form.placeholders.password} className="c-field__control" />
            <p className="c-field__message" id="password-msg" hidden></p>
          </div>
        </div>
        <div className="c-auth-card__actions">
          <button className="c-button c-button--primary" type="submit">{copy.form.submit}</button>
          <p className="c-auth-card__switch">
            <Link to="/auth/signup">{copy.links.switch}</Link>
          </p>
        </div>
      </form>
      <p className="c-auth-card__hint">{copy.demo}</p>
    </section>
  )
}
