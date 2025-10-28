import { useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
// import globalCopy from '../../packages/assets/copy/global.json'
import globalCopy from '../../../packages/assets/copy/global.json'
import { peekSession, requireAuth } from '../../../packages/utils/auth'
import { pushToast } from '../../../packages/utils/toast'

export const useAuthGuard = () => {
  const location = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
    const path = location.pathname
    const requiresAuth = path.startsWith('/dashboard') || path.startsWith('/tickets')

    if (!requiresAuth) {
      if (path.startsWith('/auth') && requireAuth()) {
        navigate('/dashboard', { replace: true })
      }
      return
    }

    const hadSession = Boolean(peekSession())
    if (requireAuth()) {
      return
    }

    const message = hadSession
      ? globalCopy.toasts.sessionExpired
      : globalCopy.toasts.sessionInvalid
    pushToast(message, 'error')
    const redirect = encodeURIComponent(path + location.search)
    navigate(`/auth/login?redirect=${redirect}`, { replace: true })
  }, [location.pathname, location.search, navigate])
}
