export type ToastLevel = 'info' | 'success' | 'error'

export type ToastMessage = {
  id: string
  level: ToastLevel
  message: string
  duration: number
}

export type ToastListener = (toast: ToastMessage) => void

const TOAST_PUSH_EVENT = 'ticketapp:toast'
const TOAST_DISMISS_EVENT = 'ticketapp:toast:dismiss'

const DEFAULT_DURATION = 3200

const isBrowser = () => typeof window !== 'undefined'

const createId = () => {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID()
  }
  return `toast-${Date.now()}-${Math.random().toString(16).slice(2)}`
}

export const pushToast = (
  message: string,
  level: ToastLevel = 'info',
  duration = DEFAULT_DURATION
) => {
  if (!isBrowser()) return
  const detail: ToastMessage = {
    id: createId(),
    message,
    level,
    duration
  }
  window.dispatchEvent(new CustomEvent(TOAST_PUSH_EVENT, { detail }))
}

export const dismissToast = (id: string) => {
  if (!isBrowser()) return
  window.dispatchEvent(new CustomEvent(TOAST_DISMISS_EVENT, { detail: { id } }))
}

export const subscribeToasts = (listener: ToastListener) => {
  if (!isBrowser()) return () => {}

  const pushHandler = (event: Event) => {
    const custom = event as CustomEvent<ToastMessage>
    listener(custom.detail)
  }

  window.addEventListener(TOAST_PUSH_EVENT, pushHandler)

  return () => {
    window.removeEventListener(TOAST_PUSH_EVENT, pushHandler)
  }
}

export const subscribeToastDismissals = (listener: (id: string) => void) => {
  if (!isBrowser()) return () => {}

  const handler = (event: Event) => {
    const custom = event as CustomEvent<{ id: string }>
    listener(custom.detail.id)
  }

  window.addEventListener(TOAST_DISMISS_EVENT, handler)

  return () => {
    window.removeEventListener(TOAST_DISMISS_EVENT, handler)
  }
}

export const notifyToastLifecycle = (id: string) => {
  if (!isBrowser()) return
  dismissToast(id)
}

export const TOAST_EVENTS = {
  push: TOAST_PUSH_EVENT,
  dismiss: TOAST_DISMISS_EVENT
} as const
