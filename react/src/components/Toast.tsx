import { useEffect, useRef, useState } from 'react'
import {
  dismissToast,
  subscribeToastDismissals,
  subscribeToasts,
  type ToastMessage
} from '../../../packages/utils/toast'

type ToastState = ToastMessage & { leaving: boolean }

export default function Toast() {
  const [toasts, setToasts] = useState<ToastState[]>([])
  const lifetimes = useRef(new Map<string, number>())
  const exitTimers = useRef(new Map<string, number>())

  useEffect(() => {
    const startExit = (id: string) => {
      setToasts((current) =>
        current.map((toast) => (toast.id === id ? { ...toast, leaving: true } : toast))
      )
      if (exitTimers.current.has(id)) {
        return
      }
      const timeout = window.setTimeout(() => {
        lifetimes.current.delete(id)
        exitTimers.current.delete(id)
        setToasts((current) => current.filter((toast) => toast.id !== id))
      }, 220)
      exitTimers.current.set(id, timeout)
    }

    const enqueue = (toast: ToastMessage) => {
      setToasts((current) => [...current, { ...toast, leaving: false }])
      const timeout = window.setTimeout(() => startExit(toast.id), toast.duration)
      lifetimes.current.set(toast.id, timeout)
    }

    const unsubscribePush = subscribeToasts(enqueue)
    const unsubscribeDismiss = subscribeToastDismissals(startExit)

    return () => {
      unsubscribePush()
      unsubscribeDismiss()
      lifetimes.current.forEach((timeout) => window.clearTimeout(timeout))
      exitTimers.current.forEach((timeout) => window.clearTimeout(timeout))
      lifetimes.current.clear()
      exitTimers.current.clear()
    }
  }, [])

  const close = (id: string) => {
    dismissToast(id)
  }

  if (toasts.length === 0) return null

  return (
    <div className="c-toast-stack" aria-live="polite">
      {toasts.map((toast) => (
        <article
          key={toast.id}
          className="c-toast"
          data-level={toast.level}
          data-leaving={toast.leaving}
          role={toast.level === 'error' ? 'alert' : 'status'}
        >
          <div className="c-toast__message">{toast.message}</div>
          <button
            type="button"
            className="c-toast__close"
            aria-label="Dismiss notification"
            onClick={() => close(toast.id)}
          >
            &times;
          </button>
        </article>
      ))}
    </div>
  )
}
