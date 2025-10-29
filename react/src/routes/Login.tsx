import { FormEvent, useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import copy from '@packages/assets/copy/login.json'
import globalCopy from '@packages/assets/copy/global.json'
import { login, requireAuth } from '@packages/utils/auth'
import { pushToast } from '@packages/utils/toast'
import { usePageMeta } from '../hooks/usePageMeta'

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export default function Login() {
  usePageMeta({ title: copy.title, description: copy.tagline })
  const navigate = useNavigate()
  const location = useLocation()
  const redirect = useMemo(() => {
    if (typeof location.search === 'string') {
      const params = new URLSearchParams(location.search)
      return params.get('redirect')
    }
    return null
  }, [location.search])

  const [form, setForm] = useState({ email: '', password: '' })
  const [errors, setErrors] = useState({ email: '', password: '', general: '' })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (requireAuth()) {
      navigate(redirect || '/dashboard', { replace: true })
    }
  }, [navigate, redirect])

  const validate = useCallback(() => {
    const nextErrors = { email: '', password: '', general: '' }
    const email = form.email.trim()
    if (!email) {
      nextErrors.email = globalCopy.validation.required
    } else if (!emailPattern.test(email)) {
      nextErrors.email = globalCopy.validation.email
    }
    if (!form.password) {
      nextErrors.password = globalCopy.validation.required
    }
    setErrors(nextErrors)
    return !nextErrors.email && !nextErrors.password
  }, [form.email, form.password])

  const handleChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.currentTarget
    setForm((prev) => ({ ...prev, [name]: value }))
  }, [])

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (loading) return
    if (!validate()) return
    setLoading(true)
    try {
      const session = await login({
        email: form.email.trim().toLowerCase(),
        password: form.password
      })
      const message = globalCopy.toasts.authSuccess.replace('{name}', session.user.name || 'there')
      pushToast(message, 'success')
      setForm((prev) => ({ ...prev, password: '' }))
      navigate(redirect || '/dashboard', { replace: true })
    } catch (error) {
      const message = error instanceof Error ? error.message : globalCopy.toasts.authError
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
            <label htmlFor="login-email" className="c-field__label">{copy.form.labels.email}</label>
            <input
              id="login-email"
              name="email"
              value={form.email}
              onChange={handleChange}
              type="email"
              placeholder={copy.form.placeholders.email}
              className="c-field__control"
              autoComplete="email"
              aria-invalid={Boolean(errors.email)}
              aria-describedby={errors.email ? 'login-email-error' : undefined}
            />
            {errors.email && <p id="login-email-error" className="c-field__message" role="alert">{errors.email}</p>}
          </div>
          <div className="c-field">
            <label htmlFor="login-password" className="c-field__label">{copy.form.labels.password}</label>
            <input
              id="login-password"
              name="password"
              value={form.password}
              onChange={handleChange}
              type="password"
              placeholder={copy.form.placeholders.password}
              className="c-field__control"
              autoComplete="current-password"
              aria-invalid={Boolean(errors.password)}
              aria-describedby={errors.password ? 'login-password-error' : undefined}
            />
            {errors.password && <p id="login-password-error" className="c-field__message" role="alert">{errors.password}</p>}
          </div>
        </div>
        {errors.general && <p className="c-alert" role="alert" aria-live="assertive">{errors.general}</p>}
        <div className="c-auth-card__actions">
          <button className="c-button c-button--primary" type="submit" disabled={loading}>
            {loading ? '...' : copy.form.submit}
          </button>
          <p className="c-auth-card__switch">
            <Link to="/auth/signup">{copy.links.switch}</Link>
          </p>
        </div>
      </form>
      <p className="c-auth-card__hint">{copy.demo}</p>
    </section>
  )
}
