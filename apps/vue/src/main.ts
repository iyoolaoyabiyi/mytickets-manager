import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import ticketIcon from '@packages/assets/media/icons/ticket.svg'

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

createApp(App).use(router).mount('#app')
