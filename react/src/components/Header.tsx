import { Link, useLocation } from 'react-router-dom'
import { useEffect, useMemo, useState } from 'react'
import globalCopy from '../../../packages/assets/copy/global.json'

type Theme = 'light' | 'dark'

export default function Header() {
  const location = useLocation()
  const isAuthRoute = location.pathname.startsWith('/auth')
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [theme, setTheme] = useState<Theme>(
    document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light'
  )

  useEffect(() => {
    document.documentElement.dataset.theme = theme
  }, [theme])

  const links = useMemo(() => {
    if (isAuthRoute) {
      return [
        { to: '/auth/login', label: globalCopy.nav.login },
        { to: '/auth/signup', label: globalCopy.nav.signup }
      ]
    }
    return [
      { to: '/dashboard', label: globalCopy.nav.dashboard },
      { to: '/tickets', label: globalCopy.nav.tickets },
      { to: '/auth/login', label: globalCopy.nav.logout }
    ]
  }, [isAuthRoute])

  const menuLabel = isMenuOpen ? globalCopy.nav.toggle.close : globalCopy.nav.toggle.open
  const nextTheme = theme === 'light' ? 'Dark' : 'Light'
  const themeToggleLabel = globalCopy.theme.toggle.replace('{app.theme}', nextTheme)

  const toggleTheme = () => {
    setTheme((current) => (current === 'light' ? 'dark' : 'light'))
  }

  return (
    <header className="c-header">
      <div className="c-header__inner">
        <Link to="/" className="c-header__brand">{globalCopy.app.name}</Link>
        <div className="l-cluster">
          <button
            className="c-header__toggle"
            type="button"
            aria-controls="primary-nav"
            aria-expanded={isMenuOpen}
            aria-label={menuLabel}
            onClick={() => setIsMenuOpen((open) => !open)}
          >
            <span className="sr-only">{menuLabel}</span>
          </button>
          <button
            className="c-button c-button--secondary hidden md:inline-flex"
            type="button"
            onClick={toggleTheme}
          >
            {themeToggleLabel}
          </button>
        </div>
        <nav
          id="primary-nav"
          className={`c-header__nav ${isMenuOpen ? 'flex flex-col gap-sm md:flex md:flex-row' : ''}`}
          aria-label="Primary"
          data-state={isMenuOpen ? 'open' : 'closed'}
        >
          {links.map((link) => (
            <Link key={link.to} to={link.to} className="c-header__link">{link.label}</Link>
          ))}
          <button
            className="c-button c-button--secondary md:hidden"
            type="button"
            onClick={toggleTheme}
          >
            {themeToggleLabel}
          </button>
        </nav>
      </div>
    </header>
  )
}
