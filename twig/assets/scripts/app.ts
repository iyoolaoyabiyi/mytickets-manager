import {
  getStoredTheme,
  persistTheme,
  toggleTheme
} from '../../../packages/utils/theme'
import {
  pushToast,
  subscribeToasts,
  subscribeToastDismissals,
  dismissToast,
  type ToastMessage
} from '../../../packages/utils/toast'
import {
  login,
  signup,
  logout,
  requireAuth,
  peekSession
} from '../../../packages/utils/auth'
import {
  defaultFilters,
  listTickets,
  createTicket,
  updateTicket,
  deleteTicket,
  getTicketStats,
  TICKETS_CHANGED_EVENT,
  type Ticket,
  type TicketDraft,
  type TicketFilters
} from '../../../packages/utils/tickets'
import { formatRelativeTime } from '../../../packages/utils/time'

const configEl = document.getElementById('ticket-app-config') as HTMLScriptElement | null
const appConfig = configEl ? JSON.parse(configEl.textContent || '{}') : {}
const copyGlobal = appConfig.copyGlobal || {}
const pageConfig = appConfig.page || { id: document.body.dataset.page, props: {} }
const pageId: string = pageConfig.id || document.body.dataset.page || ''
const pageProps: Record<string, unknown> = pageConfig.props || {}

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const initTheme = () => {
  const stored = getStoredTheme()
  persistTheme(stored)

  const themeButtons = document.querySelectorAll<HTMLButtonElement>('[data-action="toggle-theme"]')
  themeButtons.forEach((button) => {
    button.addEventListener('click', () => {
      const next = toggleTheme(getStoredTheme())
      persistTheme(next)
      updateThemeButtonLabels(next)
    })
  })

  updateThemeButtonLabels(stored)
}

const updateThemeButtonLabels = (theme: 'light' | 'dark') => {
  const nextLabel = copyGlobal?.theme?.toggle?.replace?.('{app.theme}', theme === 'light' ? 'Dark' : 'Light')
  document
    .querySelectorAll<HTMLButtonElement>('[data-action="toggle-theme"]')
    .forEach((btn) => {
      if (nextLabel) btn.textContent = nextLabel
    })
}

const initHeader = () => {
  const header = document.querySelector('[data-component="header"]')
  if (!header) return

  const nav = header.querySelector<HTMLElement>('[data-nav]')
  const toggle = header.querySelector<HTMLButtonElement>('[data-action="toggle-nav"]')

  if (toggle && nav) {
    toggle.addEventListener('click', () => {
      const expanded = toggle.getAttribute('aria-expanded') === 'true'
      toggle.setAttribute('aria-expanded', String(!expanded))
      toggle.setAttribute('aria-label', expanded ? copyGlobal.nav.toggle.open : copyGlobal.nav.toggle.close)
      nav.dataset.state = expanded ? 'closed' : 'open'
    })
  }

  header.querySelectorAll<HTMLAnchorElement>('[data-nav-link]').forEach((link) => {
    link.addEventListener('click', () => {
      if (toggle && nav) {
        toggle.setAttribute('aria-expanded', 'false')
        nav.dataset.state = 'closed'
      }
    })
  })

  header.querySelectorAll<HTMLButtonElement>('[data-action="logout"]').forEach((button) => {
    button.addEventListener('click', (event) => {
      event.preventDefault()
      logout()
      pushToast(copyGlobal.toasts?.authEnd || 'Session ended, please login again to continue.', 'info')
      window.location.href = '/auth/login'
    })
  })
}

const toastStackSelector = '[data-toast-stack]'

type ToastState = ToastMessage & { leaving: boolean }

const initToasts = () => {
  let stack = document.querySelector<HTMLDivElement>(toastStackSelector)
  if (!stack) {
    stack = document.createElement('div')
    stack.className = 'c-toast-stack'
    stack.setAttribute('data-toast-stack', '')
    document.body.appendChild(stack)
  }

  const toasts: ToastState[] = []
  const lifetimes = new Map<string, number>()
  const exitTimers = new Map<string, number>()

  const render = () => {
    if (!stack) return
    stack.innerHTML = ''
    toasts.forEach((toast) => {
      const article = document.createElement('article')
      article.className = 'c-toast'
      article.dataset.level = toast.level
      article.dataset.leaving = String(toast.leaving)
      article.setAttribute('role', toast.level === 'error' ? 'alert' : 'status')

      const message = document.createElement('div')
      message.className = 'c-toast__message'
      message.textContent = toast.message
      article.appendChild(message)

      const close = document.createElement('button')
      close.type = 'button'
      close.className = 'c-toast__close'
      close.setAttribute('aria-label', 'Dismiss notification')
      close.innerHTML = '&times;'
      close.addEventListener('click', () => dismissToast(toast.id))
      article.appendChild(close)

      stack!.appendChild(article)
    })
  }

  const scheduleExit = (id: string, delay = 220) => {
    if (exitTimers.has(id)) return
    const timer = window.setTimeout(() => {
      const index = toasts.findIndex((t) => t.id === id)
      if (index >= 0) {
        toasts.splice(index, 1)
        render()
      }
      lifetimes.delete(id)
      exitTimers.delete(id)
    }, delay)
    exitTimers.set(id, timer)
  }

  const handlePush = (toast: ToastMessage) => {
    toasts.push({ ...toast, leaving: false })
    render()
    const timer = window.setTimeout(() => dismissToast(toast.id), toast.duration)
    lifetimes.set(toast.id, timer)
  }

  const handleDismiss = (id: string) => {
    const toast = toasts.find((t) => t.id === id)
    if (!toast) return
    toast.leaving = true
    render()
    scheduleExit(id)
  }

  const unsubscribePush = subscribeToasts(handlePush)
  const unsubscribeDismiss = subscribeToastDismissals(handleDismiss)

  window.addEventListener('beforeunload', () => {
    unsubscribePush?.()
    unsubscribeDismiss?.()
    lifetimes.forEach((timer) => window.clearTimeout(timer))
    exitTimers.forEach((timer) => window.clearTimeout(timer))
  })
}

const setFieldError = (field: HTMLElement | null, message: string) => {
  if (!field) return
  if (!message) {
    field.textContent = ''
    field.setAttribute('hidden', 'true')
  } else {
    field.textContent = message
    field.removeAttribute('hidden')
  }
}

const initLoginForm = () => {
  const form = document.querySelector<HTMLFormElement>('[data-auth-form="login"]')
  if (!form) return
  const copy = pageProps.copy as any

  const emailInput = form.querySelector<HTMLInputElement>('#login-email')
  const passwordInput = form.querySelector<HTMLInputElement>('#login-password')
  const emailError = form.querySelector<HTMLElement>('#login-email-error')
  const passwordError = form.querySelector<HTMLElement>('#login-password-error')
  const formError = form.querySelector<HTMLElement>('#login-form-error')
  const submitButton = form.querySelector<HTMLButtonElement>('[data-button="submit"]')
  const redirect = form.dataset.redirect

  form.addEventListener('submit', async (event) => {
    event.preventDefault()
    const email = emailInput?.value.trim() || ''
    const password = passwordInput?.value || ''
    let valid = true

    if (!email) {
      setFieldError(emailError, copyGlobal.validation?.required || 'This field is required.')
      valid = false
    } else if (!emailPattern.test(email)) {
      setFieldError(emailError, copyGlobal.validation?.email || 'Enter a valid email address.')
      valid = false
    } else {
      setFieldError(emailError, '')
    }

    if (!password) {
      setFieldError(passwordError, copyGlobal.validation?.required || 'This field is required.')
      valid = false
    } else {
      setFieldError(passwordError, '')
    }

    if (!valid) return

    setFieldError(formError, '')
    submitButton?.setAttribute('disabled', 'true')
    submitButton && (submitButton.textContent = '…')

    try {
      const session = await login({ email: email.toLowerCase(), password })
      const message = (copyGlobal.toasts?.authSuccess || 'Welcome back {name}.').replace('{name}', session.user.name || 'there')
      pushToast(message, 'success')
      const target = redirect || '/dashboard'
      window.location.href = target
    } catch (error) {
      const message = error instanceof Error ? error.message : (copyGlobal.toasts?.authError || 'Invalid email or password.')
      setFieldError(formError, message)
      pushToast(message, 'error')
      submitButton?.removeAttribute('disabled')
      submitButton && (submitButton.textContent = copy.form.submit)
    }
  })
}

const initSignupForm = () => {
  const form = document.querySelector<HTMLFormElement>('[data-auth-form="signup"]')
  if (!form) return
  const copy = pageProps.copy as any

  const nameInput = form.querySelector<HTMLInputElement>('#signup-name')
  const emailInput = form.querySelector<HTMLInputElement>('#signup-email')
  const passwordInput = form.querySelector<HTMLInputElement>('#signup-password')
  const confirmInput = form.querySelector<HTMLInputElement>('#signup-confirm')
  const nameError = form.querySelector<HTMLElement>('#signup-name-error')
  const emailError = form.querySelector<HTMLElement>('#signup-email-error')
  const passwordError = form.querySelector<HTMLElement>('#signup-password-error')
  const confirmError = form.querySelector<HTMLElement>('#signup-confirm-error')
  const formError = form.querySelector<HTMLElement>('#signup-form-error')
  const submitButton = form.querySelector<HTMLButtonElement>('[data-button="submit"]')

  form.addEventListener('submit', async (event) => {
    event.preventDefault()

    const name = nameInput?.value.trim() || ''
    const email = emailInput?.value.trim() || ''
    const password = passwordInput?.value || ''
    const confirm = confirmInput?.value || ''
    let valid = true

    if (!name) {
      setFieldError(nameError, copyGlobal.validation?.required || 'This field is required.')
      valid = false
    } else {
      setFieldError(nameError, '')
    }

    if (!email) {
      setFieldError(emailError, copyGlobal.validation?.required || 'This field is required.')
      valid = false
    } else if (!emailPattern.test(email)) {
      setFieldError(emailError, copyGlobal.validation?.email || 'Enter a valid email address.')
      valid = false
    } else {
      setFieldError(emailError, '')
    }

    if (!password) {
      setFieldError(passwordError, copyGlobal.validation?.required || 'This field is required.')
      valid = false
    } else if (password.length < 8) {
      setFieldError(passwordError, copyGlobal.validation?.passwordLength || 'Use at least 8 characters.')
      valid = false
    } else {
      setFieldError(passwordError, '')
    }

    if (!confirm) {
      setFieldError(confirmError, copyGlobal.validation?.required || 'This field is required.')
      valid = false
    } else if (password !== confirm) {
      setFieldError(confirmError, copyGlobal.validation?.passwordMatch || 'Passwords do not match.')
      valid = false
    } else {
      setFieldError(confirmError, '')
    }

    if (!valid) return

    setFieldError(formError, '')
    submitButton?.setAttribute('disabled', 'true')
    submitButton && (submitButton.textContent = '…')

    try {
      await signup({ name, email: email.toLowerCase(), password })
      pushToast(copyGlobal.toasts?.postSignup || 'Account created. Please login.', 'success')
      window.location.href = '/auth/login'
    } catch (error) {
      const message = error instanceof Error ? error.message : (copyGlobal.toasts?.validation || 'Please fix the errors and try again.')
      setFieldError(formError, message)
      pushToast(message, 'error')
      submitButton?.removeAttribute('disabled')
      submitButton && (submitButton.textContent = copy.form.submit)
    }
  })
}

const guardRoutes = () => {
  const protectedPages = ['dashboard', 'tickets', 'ticket-edit']
  const authPages = ['login', 'signup']

  if (protectedPages.includes(pageId)) {
    if (!requireAuth()) {
      const message = peekSession() ? (copyGlobal.toasts?.sessionExpired || 'Your session has expired, please log in again.') : (copyGlobal.toasts?.sessionInvalid || 'Invalid session, please login to access resource.')
      pushToast(message, 'error')
      const redirect = encodeURIComponent(window.location.pathname + window.location.search)
      window.location.replace(`/auth/login?redirect=${redirect}`)
      return false
    }
  }

  if (authPages.includes(pageId) && requireAuth()) {
    window.location.replace('/dashboard')
    return false
  }

  return true
}

const initDashboard = async () => {
  if (pageId !== 'dashboard') return
  const statsContainer = document.querySelector<HTMLElement>('[data-dashboard-stats]')
  const statElements = {
    total: document.querySelector<HTMLElement>('[data-stat="total"]'),
    open: document.querySelector<HTMLElement>('[data-stat="open"]'),
    inProgress: document.querySelector<HTMLElement>('[data-stat="inProgress"]'),
    closed: document.querySelector<HTMLElement>('[data-stat="closed"]')
  }
  const empty = document.querySelector<HTMLElement>('[data-dashboard-empty]')

  try {
    const stats = await getTicketStats()
    Object.entries(statElements).forEach(([key, el]) => {
      if (el) el.textContent = String(stats[key as keyof typeof stats] ?? 0)
    })
    if (statsContainer) statsContainer.setAttribute('aria-busy', 'false')
    if (empty) {
      if ((stats.total ?? 0) === 0) {
        empty.hidden = false
      } else {
        empty.hidden = true
      }
    }
  } catch (error) {
    console.error(error)
    if (statsContainer) statsContainer.setAttribute('aria-busy', 'false')
  }
}

const renderTicketCard = (template: HTMLTemplateElement, ticket: Ticket, copy: any) => {
  const fragment = template.content.cloneNode(true) as DocumentFragment
  const article = fragment.querySelector<HTMLElement>('article')!
  article.dataset.ticketId = String(ticket.id)

  const title = fragment.querySelector<HTMLElement>('[data-ticket-title]')
  const meta = fragment.querySelector<HTMLElement>('[data-ticket-meta]')
  const description = fragment.querySelector<HTMLElement>('[data-ticket-description]')
  const status = fragment.querySelector<HTMLElement>('[data-ticket-status]')
  const priority = fragment.querySelector<HTMLElement>('[data-ticket-priority]')

  if (title) title.textContent = ticket.title
  if (meta) meta.textContent = copy.card.metaPattern.replace('#{id}', `#${ticket.id}`).replace('{relativeTime}', formatRelativeTime(ticket.updated_at) || 'just now')

  if (description) {
    if (ticket.description) {
      description.textContent = ticket.description
      description.hidden = false
    } else {
      description.hidden = true
    }
  }

  if (status) {
    status.textContent = ticket.status.replace('_', ' ')
    status.className = `c-tag ${ticket.status === 'in_progress' ? 'c-tag--in-progress' : `c-tag--${ticket.status}`}`
  }

  if (priority) {
    priority.textContent = ticket.priority.charAt(0).toUpperCase() + ticket.priority.slice(1)
    priority.className = 'c-tag'
  }

  return article
}

const renderEmptyState = (template: HTMLTemplateElement, state: 'primary' | 'filtered', copy: any, onPrimary: () => void) => {
  const fragment = template.content.cloneNode(true) as DocumentFragment
  const container = fragment.querySelector<HTMLElement>('.c-empty')!
  const title = container.querySelector<HTMLElement>('[data-empty-title]')
  const button = container.querySelector<HTMLButtonElement>('[data-action="primary"]')

  const emptyCopy = state === 'filtered' ? copy.empty.filtered : copy.empty.primary
  if (title) title.textContent = emptyCopy.title
  if (button) {
    button.textContent = emptyCopy.action
    button.onclick = onPrimary
    button.className = `c-button ${state === 'filtered' ? 'c-button--secondary' : 'c-button--primary'}`
  }
  return container
}

const initTicketsPage = () => {
  if (pageId !== 'tickets') return
  const copy = pageProps.copy as any
  const filtersForm = document.querySelector<HTMLFormElement>('[data-ticket-filters]')
  const alert = document.querySelector<HTMLElement>('[data-alert]')
  const feed = document.querySelector<HTMLElement>('[data-tickets-feed]')
  const template = document.getElementById('ticket-card-template') as HTMLTemplateElement | null
  const emptyTemplate = document.getElementById('ticket-empty-template') as HTMLTemplateElement | null
  const createButton = document.querySelector<HTMLButtonElement>('[data-action="open-create"]')

  if (!filtersForm || !feed || !template || !emptyTemplate) return

  let filters: TicketFilters = { ...defaultFilters() }
  let tickets: Ticket[] = []
  let modal: HTMLElement | null = null
  let searchTimeout: number | undefined
  let escListener: ((event: KeyboardEvent) => void) | null = null

  const setAlert = (message: string) => {
    if (!alert) return
    if (!message) {
      alert.hidden = true
      alert.textContent = ''
    } else {
      alert.hidden = false
      alert.textContent = message
    }
  }

  const resetFilters = () => {
    filters = { ...defaultFilters() }
    const searchInput = filtersForm.querySelector<HTMLInputElement>('#tickets-search')
    if (searchInput) searchInput.value = ''
    const statusSelect = filtersForm.querySelector<HTMLSelectElement>('#tickets-status')
    if (statusSelect) statusSelect.value = 'all'
    const prioritySelect = filtersForm.querySelector<HTMLSelectElement>('#tickets-priority')
    if (prioritySelect) prioritySelect.value = 'all'
    setAlert('')
  }

  const closeModal = () => {
    if (modal) {
      modal.remove()
      modal = null
    }
    if (escListener) {
      document.removeEventListener('keydown', escListener)
      escListener = null
    }
  }

  const openModal = (mode: 'create' | 'edit', ticket?: Ticket) => {
    closeModal()
    modal = document.createElement('div')
    modal.className = 'c-modal'
    modal.setAttribute('role', 'dialog')
    modal.setAttribute('aria-modal', 'true')

    const panel = document.createElement('div')
    panel.className = 'c-modal__panel'
    modal.appendChild(panel)

    const heading = document.createElement('h2')
    heading.className = 'c-modal__title'
    heading.textContent = mode === 'edit' ? copy.form.actions.update : copy.actions.new
    panel.appendChild(heading)

    const form = document.createElement('form')
    form.className = 'l-stack'
    panel.appendChild(form)

    const makeField = (labelText: string, id: string, element: 'input' | 'textarea', value = '', options?: { rows?: number; type?: string; placeholder?: string }) => {
      const wrapper = document.createElement('div')
      wrapper.className = 'c-field'
      const label = document.createElement('label')
      label.className = 'c-field__label'
      label.setAttribute('for', id)
      label.textContent = labelText
      wrapper.appendChild(label)
      const control = document.createElement(element)
      control.className = 'c-field__control'
      control.id = id
      if (element === 'textarea' && options?.rows) {
        (control as HTMLTextAreaElement).rows = options.rows
      }
      if (options?.type) control.setAttribute('type', options.type)
      if (options?.placeholder) control.setAttribute('placeholder', options.placeholder)
      if ('value' in control) (control as HTMLInputElement).value = value
      wrapper.appendChild(control)
      return { wrapper, control }
    }

    const titleField = makeField(copy.form.labels.title, 'ticket-title', 'input', ticket?.title || '', {
      placeholder: copy.form.placeholders?.title || 'Enter ticket title'
    })
    form.appendChild(titleField.wrapper)

    const descriptionField = makeField(copy.form.labels.description, 'ticket-description', 'textarea', ticket?.description || '', {
      rows: 5,
      placeholder: copy.form.placeholders?.description || 'Enter ticket description'
    })
    form.appendChild(descriptionField.wrapper)

    const statusField = document.createElement('div')
    statusField.className = 'c-field'
    const statusLabel = document.createElement('label')
    statusLabel.className = 'c-field__label'
    statusLabel.setAttribute('for', 'ticket-status')
    statusLabel.textContent = copy.form.labels.status
    statusField.appendChild(statusLabel)
    const statusSelect = document.createElement('select')
    statusSelect.className = 'c-field__control'
    statusSelect.id = 'ticket-status'
    copy.card.statusTags.forEach((status: string) => {
      const option = document.createElement('option')
      option.value = status
      option.textContent = status.replace('_', ' ')
      if (ticket && ticket.status === status) option.selected = true
      statusSelect.appendChild(option)
    })
    statusField.appendChild(statusSelect)
    form.appendChild(statusField)

    const priorityField = document.createElement('div')
    priorityField.className = 'c-field'
    const priorityLabel = document.createElement('label')
    priorityLabel.className = 'c-field__label'
    priorityLabel.setAttribute('for', 'ticket-priority')
    priorityLabel.textContent = copy.form.labels.priority
    priorityField.appendChild(priorityLabel)
    const prioritySelect = document.createElement('select')
    prioritySelect.className = 'c-field__control'
    prioritySelect.id = 'ticket-priority'
    copy.card.priorityTags.forEach((priority: string) => {
      const option = document.createElement('option')
      option.value = priority
      option.textContent = priority.charAt(0).toUpperCase() + priority.slice(1)
      if (ticket && ticket.priority === priority) option.selected = true
      prioritySelect.appendChild(option)
    })
    priorityField.appendChild(prioritySelect)
    form.appendChild(priorityField)

    const actions = document.createElement('div')
    actions.className = 'c-modal__actions'
    const cancel = document.createElement('button')
    cancel.type = 'button'
    cancel.className = 'c-button c-button--secondary'
    cancel.textContent = copy.form.actions.cancel
    cancel.addEventListener('click', closeModal)
    actions.appendChild(cancel)
    const submit = document.createElement('button')
    submit.type = 'submit'
    submit.className = 'c-button c-button--primary'
    submit.textContent = mode === 'edit' ? copy.form.actions.update : copy.form.actions.save
    actions.appendChild(submit)
    form.appendChild(actions)

    form.addEventListener('submit', async (event) => {
      event.preventDefault()
      const draft: TicketDraft = {
        title: (titleField.control as HTMLInputElement).value.trim(),
        description: (descriptionField.control as HTMLTextAreaElement).value.trim(),
        status: statusSelect.value as TicketDraft['status'],
        priority: prioritySelect.value as TicketDraft['priority']
      }

      if (!draft.title) {
        pushToast(copyGlobal.validation?.titleRequired || 'Enter a ticket title.', 'error')
        return
      }

      try {
        if (mode === 'edit' && ticket) {
          await updateTicket(ticket.id, draft)
          pushToast(copyGlobal.toasts?.updateSuccess || 'Ticket updated successfully.', 'success')
        } else {
          await createTicket(draft)
          pushToast(copyGlobal.toasts?.createSuccess || 'Ticket created successfully.', 'success')
        }
        closeModal()
        await loadTickets(filters)
      } catch (error) {
        console.error(error)
        pushToast(copyGlobal.toasts?.validation || 'Please fix the errors and try again.', 'error')
      }
    })

    modal.addEventListener('click', (event) => {
      if (event.target === modal) {
        closeModal()
      }
    })

    escListener = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        closeModal()
      }
    }
    document.addEventListener('keydown', escListener)

    document.body.appendChild(modal)
    const firstInput = modal.querySelector<HTMLInputElement>('#ticket-title')
    firstInput?.focus()
  }

  const renderTickets = () => {
    feed.innerHTML = ''
    if (tickets.length === 0) {
      const filtered = filters.q.trim() !== '' || filters.status !== 'all' || filters.priority !== 'all'
      const state = filtered ? 'filtered' : 'primary'
      const empty = renderEmptyState(emptyTemplate, state as 'primary' | 'filtered', copy, () => {
        if (state === 'filtered') {
          resetFilters()
          void loadTickets(filters)
        } else {
          openModal('create')
        }
      })
      feed.appendChild(empty)
      return
    }

    tickets.forEach((ticket) => {
      const card = renderTicketCard(template, ticket, copy)
      const editButton = card.querySelector<HTMLButtonElement>('[data-action="edit-ticket"]')
      editButton?.addEventListener('click', () => openModal('edit', ticket))
      const deleteButton = card.querySelector<HTMLButtonElement>('[data-action="delete-ticket"]')
      if (deleteButton) {
        deleteButton.addEventListener('click', async () => {
          if (!window.confirm(`${copyGlobal.confirm?.delete?.title || 'Delete ticket?'}\n${copyGlobal.confirm?.delete?.body || 'This action cannot be undone.'}`)) {
            return
          }
          setAlert('')
          try {
            await deleteTicket(ticket.id)
            pushToast(copyGlobal.toasts?.deleteSuccess || 'Ticket deleted.', 'success')
            await loadTickets(filters)
          } catch (error) {
            console.error(error)
            setAlert(copyGlobal.toasts?.loadError || 'Failed to load tickets. Please retry.')
            pushToast(copyGlobal.toasts?.loadError || 'Failed to load tickets. Please retry.', 'error')
          }
        })
      }
      feed.appendChild(card)
    })
  }

  const loadTickets = async (criteria: TicketFilters) => {
    filters = { ...criteria }
    feed.setAttribute('aria-busy', 'true')
    setAlert('')
    try {
      tickets = await listTickets(criteria)
      feed.setAttribute('aria-busy', 'false')
      renderTickets()
    } catch (error) {
      console.error(error)
      feed.innerHTML = `<div class="c-card c-card--error">${copyGlobal.toasts?.loadError || 'Failed to load tickets. Please retry.'}</div>`
      feed.setAttribute('aria-busy', 'false')
    }
  }

  filtersForm.addEventListener('submit', (event) => {
    event.preventDefault()
    if (typeof searchTimeout === 'number') window.clearTimeout(searchTimeout)
    void loadTickets(filters)
  })

  filtersForm.addEventListener('input', (event) => {
    const target = event.target as HTMLInputElement | HTMLSelectElement
    if (!target.name) return
    filters = { ...filters, [target.name]: target.value }
    if (target.name === 'q') {
      if (typeof searchTimeout === 'number') window.clearTimeout(searchTimeout)
      searchTimeout = window.setTimeout(() => {
        void loadTickets(filters)
      }, 240)
    } else {
      void loadTickets(filters)
    }
  }, true)

  createButton?.addEventListener('click', () => openModal('create'))

  window.addEventListener(TICKETS_CHANGED_EVENT, () => {
    void loadTickets(filters)
  })

  void loadTickets(filters)
}

const bootstrap = () => {
  initTheme()
  initHeader()
  initToasts()

  if (!guardRoutes()) return

  switch (pageId) {
    case 'login':
      initLoginForm()
      break
    case 'signup':
      initSignupForm()
      break
    case 'dashboard':
      void initDashboard()
      break
    case 'tickets':
      initTicketsPage()
      break
    default:
      break
  }
}

document.addEventListener('DOMContentLoaded', bootstrap)
