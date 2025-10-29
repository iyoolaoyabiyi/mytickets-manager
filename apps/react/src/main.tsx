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

const router = createBrowserRouter([
  { path: '/', element: <App><Landing /></App> },
  { path: '/auth/login', element: <App><Login /></App> },
  { path: '/auth/signup', element: <App><Signup /></App> },
  { path: '/dashboard', element: <App><Dashboard /></App> },
  { path: '/tickets', element: <App><Tickets /></App> }
])

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

ensureFavicon(ticketIcon)

createRoot(document.getElementById('root')!).render(
  <StrictMode><RouterProvider router={router} /></StrictMode>
)
