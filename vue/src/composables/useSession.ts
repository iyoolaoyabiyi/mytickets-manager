import { onBeforeUnmount, onMounted, ref } from 'vue'
import { getCurrentSession, subscribeSession, type Session } from '@packages/utils/auth'

export function useSession() {
  const session = ref<Session | null>(getCurrentSession())
  let unsubscribe: (() => void) | null = null

  onMounted(() => {
    unsubscribe = subscribeSession((next) => {
      session.value = next
    })
  })

  onBeforeUnmount(() => {
    unsubscribe?.()
    unsubscribe = null
  })

  return session
}
