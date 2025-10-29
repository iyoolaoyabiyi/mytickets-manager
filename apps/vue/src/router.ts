import { createRouter, createWebHistory } from 'vue-router'
import Landing from './routes/Landing.vue'
import Login from './routes/Login.vue'
import Signup from './routes/Signup.vue'
import Dashboard from './routes/Dashboard.vue'
import Tickets from './routes/Tickets.vue'
import globalCopy from '@packages/assets/copy/global.json'
import { peekSession, requireAuth } from '@packages/utils/auth'
import { pushToast } from '@packages/utils/toast'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: Landing },
    { path: '/auth/login', component: Login },
    { path: '/auth/signup', component: Signup },
    { path: '/dashboard', component: Dashboard },
    { path: '/tickets', component: Tickets }
  ]
})

router.beforeEach((to, from, next) => {
  const requiresAuth =
    to.path.startsWith('/dashboard') || to.path.startsWith('/tickets')

  if (!requiresAuth) {
    if (to.path.startsWith('/auth') && requireAuth()) {
      return next('/dashboard')
    }
    return next()
  }

  const hadSession = !!peekSession()
  if (requireAuth()) {
    return next()
  }

  pushToast(
    hadSession ? globalCopy.toasts.sessionExpired : globalCopy.toasts.sessionInvalid,
    'error'
  )
  next({
    path: '/auth/login',
    query: { redirect: to.fullPath }
  })
})

export default router
