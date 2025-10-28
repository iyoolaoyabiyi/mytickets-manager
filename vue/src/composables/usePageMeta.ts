import { onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { makeCanonical, updateMeta } from '../../../packages/utils/meta'

type Meta = {
  title: string
  description?: string
}

const APP_NAME = 'myTickets Manager'

export const usePageMeta = ({ title, description }: Meta) => {
  const route = useRoute()
  const apply = () => {
    updateMeta({
      title: `${title} · ${APP_NAME}`,
      description,
      canonical: makeCanonical(route.fullPath)
    })
  }
  onMounted(apply)
  watch(() => route.fullPath, apply)
}
