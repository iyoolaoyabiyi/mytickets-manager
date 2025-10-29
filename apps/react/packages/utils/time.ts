const minute = 60 * 1000
const hour = 60 * minute
const day = 24 * hour
const week = 7 * day

export const formatRelativeTime = (isoDate: string, now = Date.now()): string => {
  if (!isoDate) return ''
  const targetTime = new Date(isoDate).getTime()
  if (Number.isNaN(targetTime)) return ''

  const diff = now - targetTime
  if (diff < 0) return 'just now'
  if (diff < minute) return 'just now'
  if (diff < hour) {
    const minutes = Math.floor(diff / minute)
    return `${minutes}m ago`
  }
  if (diff < day) {
    const hours = Math.floor(diff / hour)
    return `${hours}h ago`
  }
  if (diff < week) {
    const days = Math.floor(diff / day)
    return `${days}d ago`
  }
  const weeks = Math.floor(diff / week)
  return `${weeks}w ago`
}
