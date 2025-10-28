import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import App from './App'
import Landing from './routes/Landing'
import Login from './routes/Login'
import Signup from './routes/Signup'
import Dashboard from './routes/Dashboard'
import Tickets from './routes/Tickets'
import TicketEdit from './routes/TicketEdit'

const router = createBrowserRouter([
  { path: '/', element: <App><Landing /></App> },
  { path: '/auth/login', element: <App><Login /></App> },
  { path: '/auth/signup', element: <App><Signup /></App> },
  { path: '/dashboard', element: <App><Dashboard /></App> },
  { path: '/tickets', element: <App><Tickets /></App> },
  { path: '/tickets/:id/edit', element: <App><TicketEdit /></App> }
])

createRoot(document.getElementById('root')!).render(
  <StrictMode><RouterProvider router={router} /></StrictMode>
)
