type MetaOptions = {
  title?: string
  description?: string
  canonical?: string
}

const isBrowser = () => typeof document !== 'undefined'

export const updateMeta = ({ title, description, canonical }: MetaOptions) => {
  if (!isBrowser()) return
  if (title) {
    document.title = title
  }
  if (description) {
    let tag = document.querySelector('meta[name="description"]')
    if (!tag) {
      tag = document.createElement('meta')
      tag.setAttribute('name', 'description')
      document.head.appendChild(tag)
    }
    tag.setAttribute('content', description)
  }
  if (canonical) {
    let link = document.querySelector('link[rel="canonical"]')
    if (!link) {
      link = document.createElement('link')
      link.setAttribute('rel', 'canonical')
      document.head.appendChild(link)
    }
    link.setAttribute('href', canonical)
  }
}

export const makeCanonical = (path: string) => {
  if (!isBrowser()) return ''
  const { origin } = window.location
  return `${origin}${path}`
}
