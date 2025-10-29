import { FormEvent, useCallback, useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import copy from '@packages/assets/copy/signup.json'
import globalCopy from '@packages/assets/copy/global.json'
import { requireAuth, signup } from '@packages/utils/auth'
import { pushToast } from '@packages/utils/toast'
import { usePageMeta } from '../hooks/usePageMeta'

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export default function Signup() {
  usePageMeta({ title: copy.title, description: copy.tagline })
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' })
  const [errors, setErrors] = useState({ name: '', email: '', password: '', confirm: '', general: '' })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (requireAuth()) {
      navigate('/dashboard', { replace: true })
    }
  }, [navigate])

  const validate = useCallback(() => {
    const nextErrors = { name: '', email: '', password: '', confirm: '', general: '' }
    nextErrors.name = form.name.trim() ? '' : globalCopy.validation.required
    const email = form.email.trim()
    if (!email) {
      nextErrors.email = globalCopy.validation.required
    } else if (!emailPattern.test(email)) {
      nextErrors.email = globalCopy.validation.email
    }
    if (!form.password) {
      nextErrors.password = globalCopy.validation.required
    } else if (form.password.length < 8) {
      nextErrors.password = globalCopy.validation.passwordLength
    }
    if (!form.confirm) {
      nextErrors.confirm = globalCopy.validation.required
    } else if (form.confirm !== form.password) {
      nextErrors.confirm = globalCopy.validation.passwordMatch
    }
    setErrors(nextErrors)
    return !nextErrors.name && !nextErrors.email && !nextErrors.password && !nextErrors.confirm
  }, [form])

  const handleChange = (event: FormEvent<HTMLInputElement>) => {
    const { name, value } = event.currentTarget
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (loading) return
    if (!validate()) return
    setLoading(true)
    try {
      await signup({
        name: form.name.trim(),
        email: form.email.trim().toLowerCase(),
        password: form.password
      })
      pushToast(globalCopy.toasts.postSignup, 'success')
      navigate('/auth/login', { replace: true })
    } catch (error) {
      const message = error instanceof Error ? error.message : globalCopy.toasts.validation
      setErrors((prev) => ({ ...prev, general: message }))
      pushToast(message, 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="c-auth-card l-stack">
      <header className="c-page-header">
        <h1 className="c-page-header__title">{copy.heading}</h1>
        <p className="c-page-header__subtitle">{copy.tagline}</p>
      </header>
      <form className="c-auth-card__form" noValidate onSubmit={handleSubmit} aria-busy={loading}>
        <h2 className="c-modal__title">{copy.title}</h2>
        <div className="c-auth-card__fields">
          <div className="c-field">
            <label htmlFor="signup-name" className="c-field__label">{copy.form.labels.name}</label>
            <input
              id="signup-name"
              name="name"
              value={form.name}
              onInput={handleChange}
              type="text"
              placeholder={copy.form.placeholders.name}
              className="c-field__control"
              autoComplete="name"
              aria-invalid={Boolean(errors.name)}
              aria-describedby={errors.name ? 'signup-name-error' : undefined}
            />
            {errors.name && <p id="signup-name-error" className="c-field__message" role="alert">{errors.name}</p>}
          </div>
          <div className="c-field">
            <label htmlFor="signup-email" className="c-field__label">{copy.form.labels.email}</label>
            <input
              id="signup-email"
              name="email"
              value={form.email}
              onInput={handleChange}
              type="email"
              placeholder={copy.form.placeholders.email}
              className="c-field__control"
              autoComplete="email"
              aria-invalid={Boolean(errors.email)}
              aria-describedby={errors.email ? 'signup-email-error' : undefined}
            />
            {errors.email && <p id="signup-email-error" className="c-field__message" role="alert">{errors.email}</p>}
          </div>
          <div className="c-field">
            <label htmlFor="signup-password" className="c-field__label">{copy.form.labels.password}</label>
            <input
              id="signup-password"
              name="password"
              value={form.password}
              onInput={handleChange}
              type="password"
              placeholder={copy.form.placeholders.password}
              className="c-field__control"
              autoComplete="new-password"
              aria-invalid={Boolean(errors.password)}
              aria-describedby={errors.password ? 'signup-password-error' : undefined}
            />
            {errors.password && <p id="signup-password-error" className="c-field__message" role="alert">{errors.password}</p>}
          </div>
          <div className="c-field">
            <label htmlFor="signup-confirm" className="c-field__label">{copy.form.labels.confirm}</label>
            <input
              id="signup-confirm"
              name="confirm"
              value={form.confirm}
              onInput={handleChange}
              type="password"
              placeholder={copy.form.placeholders.confirm}
              className="c-field__control"
              autoComplete="new-password"
              aria-invalid={Boolean(errors.confirm)}
              aria-describedby={errors.confirm ? 'signup-confirm-error' : undefined}
            />
            {errors.confirm && <p id="signup-confirm-error" className="c-field__message" role="alert">{errors.confirm}</p>}
          </div>
        </div>
        {errors.general && <p className="c-alert" role="alert" aria-live="assertive">{errors.general}</p>}
        <div className="c-auth-card__actions">
          <button className="c-button c-button--primary" type="submit" disabled={loading}>
            {loading ? '...' : copy.form.submit}
          </button>
          <p className="c-auth-card__switch">
            <Link to="/auth/login">{copy.links.switch}</Link>
          </p>
        </div>
      </form>
      <p className="c-auth-card__hint">{copy.postSignup}</p>
    </section>
  )
}
