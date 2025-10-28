import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { makeCanonical, updateMeta } from '../../../packages/utils/meta'

type MetaOptions = {
  title: string
  description?: string
}

const APP_NAME = 'myTickets Manager'

export const usePageMeta = ({ title, description }: MetaOptions) => {
  const location = useLocation()

  useEffect(() => {
    updateMeta({
      title: `${title} · ${APP_NAME}`,
      description,
      canonical: makeCanonical(location.pathname + location.search)
    })
  }, [title, description, location.pathname, location.search])
}
