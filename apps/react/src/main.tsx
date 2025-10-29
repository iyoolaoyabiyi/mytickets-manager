import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import App from './App'
import Landing from './routes/Landing'
import Login from './routes/Login'
import Signup from './routes/Signup'
import Dashboard from './routes/Dashboard'
import Tickets from './routes/Tickets'
import ticketIcon from '@packages/assets/media/icons/ticket.svg'
import interRegular from '@packages/assets/fonts/Inter-Regular.woff2'
import interMedium from '@packages/assets/fonts/Inter-Medium.woff2'
import interSemiBold from '@packages/assets/fonts/Inter-SemiBold.woff2'

const router = createBrowserRouter([
  { path: '/', element: <App><Landing /></App> },
  { path: '/auth/login', element: <App><Login /></App> },
  { path: '/auth/signup', element: <App><Signup /></App> },
  { path: '/dashboard', element: <App><Dashboard /></App> },
  { path: '/tickets', element: <App><Tickets /></App> }
])

const ensureFontPreload = (href: string, token: string) => {
  const existing = document.querySelector<HTMLLinkElement>(`link[data-preload-font='${token}']`)
  if (existing) {
    if (existing.href !== href) {
      existing.href = href
    }
    return
  }

  const link = document.createElement('link')
  link.rel = 'preload'
  link.as = 'font'
  link.type = 'font/woff2'
  link.href = href
  link.crossOrigin = 'anonymous'
  link.dataset.preloadFont = token
  document.head.appendChild(link)
}

const ensureFontsPreloaded = () => {
  const fonts = [
    { href: interRegular, token: 'inter-400' },
    { href: interMedium, token: 'inter-500' },
    { href: interSemiBold, token: 'inter-600' }
  ]

  for (const font of fonts) {
    ensureFontPreload(font.href, font.token)
  }
}

const ensureFavicon = (href: string) => {
  const existing = document.querySelector<HTMLLinkElement>("link[rel~='icon']")
  if (existing) {
    existing.type = 'image/svg+xml'
    existing.href = href
    return
  }

  const link = document.createElement('link')
  link.rel = 'icon'
  link.type = 'image/svg+xml'
  link.href = href
  document.head.appendChild(link)
}

ensureFontsPreloaded()
ensureFavicon(ticketIcon)

createRoot(document.getElementById('root')!).render(
  <StrictMode><RouterProvider router={router} /></StrictMode>
)
