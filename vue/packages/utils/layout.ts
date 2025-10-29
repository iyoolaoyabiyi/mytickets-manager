const isBrowser = () => typeof window !== 'undefined'

const ROOT_VAR_NAME = '--layout-frame-offset'

const measure = () => {
  if (!isBrowser()) return
  const header = document.querySelector<HTMLElement>('.c-header')
  const footer = document.querySelector<HTMLElement>('.c-footer')
  const headerHeight = header?.getBoundingClientRect().height ?? 0
  const footerHeight = footer?.getBoundingClientRect().height ?? 0
  const total = Math.max(0, Math.round(headerHeight + footerHeight))
  document.documentElement.style.setProperty(ROOT_VAR_NAME, `${total}px`)
}

export const applyLayoutFrameObserver = () => {
  if (!isBrowser()) {
    return () => {}
  }

  let raf = 0
  let observer: ResizeObserver | null = null
  const observedElements = new Set<Element>()
  const ensureObservedElements = () => {
    const activeObserver = observer
    if (!activeObserver) return
    const header = document.querySelector<HTMLElement>('.c-header')
    const footer = document.querySelector<HTMLElement>('.c-footer')
    ;[header, footer].forEach((element) => {
      if (element && !observedElements.has(element)) {
        activeObserver.observe(element)
        observedElements.add(element)
      }
    })
  }

  const scheduleMeasure = () => {
    if (raf) {
      cancelAnimationFrame(raf)
    }
    raf = requestAnimationFrame(() => {
      ensureObservedElements()
      measure()
      raf = 0
    })
  }

  scheduleMeasure()

  const resizeHandler = () => scheduleMeasure()
  window.addEventListener('resize', resizeHandler, { passive: true })

  let intervalId: number | null = null
  const supportsResizeObserver = typeof (window as typeof window & { ResizeObserver?: typeof ResizeObserver }).ResizeObserver !== 'undefined'
  if (supportsResizeObserver) {
    observer = new ResizeObserver(() => scheduleMeasure())
    ensureObservedElements()
  } else {
    intervalId = window.setInterval(scheduleMeasure, 500)
  }

  return () => {
    window.removeEventListener('resize', resizeHandler)
    if (raf) {
      cancelAnimationFrame(raf)
      raf = 0
    }
    if (intervalId !== null) {
      window.clearInterval(intervalId)
      intervalId = null
    }
    observer?.disconnect()
    observedElements.clear()
  }
}
