export type Theme = 'light' | 'dark'

const THEME_KEY = 'ticketapp_theme'

const isBrowser = () => typeof window !== 'undefined'

const prefersDark = () => {
  if (!isBrowser()) return false
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false
}

export const getStoredTheme = (): Theme => {
  if (!isBrowser()) return 'light'
  try {
    const stored = window.localStorage.getItem(THEME_KEY)
    if (stored === 'dark' || stored === 'light') return stored
  } catch {
    // ignore read errors (private mode, etc.)
  }
  return prefersDark() ? 'dark' : 'light'
}

export const applyTheme = (theme: Theme) => {
  if (!isBrowser()) return
  document.documentElement.dataset.theme = theme
}

export const persistTheme = (theme: Theme) => {
  if (!isBrowser()) return
  try {
    window.localStorage.setItem(THEME_KEY, theme)
  } catch {
    // ignore write errors
  }
  applyTheme(theme)
}

export const toggleTheme = (theme: Theme): Theme => (theme === 'light' ? 'dark' : 'light')
