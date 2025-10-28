<template>
  <header class="c-header">
    <div class="c-header__inner">
      <RouterLink to="/" class="c-header__brand">{{ copy.app.name }}</RouterLink>
      <div class="l-cluster">
        <button
          class="c-header__toggle"
          type="button"
          aria-controls="primary-nav"
          :aria-expanded="isMenuOpen"
          :aria-label="menuLabel"
          @click="toggleMenu"
        >
          <span class="sr-only">{{ menuLabel }}</span>
        </button>
        <button
          class="c-button c-button--secondary hidden md:inline-flex"
          type="button"
          @click="toggleThemeHandler"
        >
          {{ themeToggleLabel }}
        </button>
      </div>
      <nav
        id="primary-nav"
        :class="['c-header__nav', isMenuOpen ? 'flex flex-col gap-sm md:flex md:flex-row' : '']"
        aria-label="Primary"
        :data-state="isMenuOpen ? 'open' : 'closed'"
      >
        <template v-for="link in links" :key="link.label">
          <RouterLink
            v-if="link.action !== 'logout'"
            :to="link.to"
            class="c-header__link"
            @click="handleNavigate"
          >
            {{ link.label }}
          </RouterLink>
          <button
            v-else
            type="button"
            class="c-header__link"
            @click="handleLogout"
          >
            {{ link.label }}
          </button>
        </template>
        <button
          class="c-button c-button--secondary md:hidden"
          type="button"
          @click="toggleThemeHandler"
        >
          {{ themeToggleLabel }}
        </button>
      </nav>
    </div>
  </header>
</template>
<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import copy from '../../../packages/assets/copy/global.json'
import { getStoredTheme, persistTheme, toggleTheme, type Theme } from '../../../packages/utils/theme'
import { logout } from '../../../packages/utils/auth'
import { pushToast } from '../../../packages/utils/toast'

const route = useRoute()
const router = useRouter()
const isMenuOpen = ref(false)
const theme = ref<Theme>(getStoredTheme())

const isAuthRoute = computed(() => route.path.startsWith('/auth'))
const links = computed(() => {
  if (isAuthRoute.value) {
    return [
      { to: '/auth/login', label: copy.nav.login },
      { to: '/auth/signup', label: copy.nav.signup }
    ]
  }
  return [
    { to: '/dashboard', label: copy.nav.dashboard },
    { to: '/tickets', label: copy.nav.tickets },
    { to: '/auth/login', label: copy.nav.logout, action: 'logout' as const }
  ]
})

const menuLabel = computed(() =>
  isMenuOpen.value ? copy.nav.toggle.close : copy.nav.toggle.open
)
const themeToggleLabel = computed(() => {
  const nextTheme = theme.value === 'light' ? 'Dark' : 'Light'
  return copy.theme.toggle.replace('{app.theme}', nextTheme)
})

const toggleMenu = () => {
  isMenuOpen.value = !isMenuOpen.value
}

const toggleThemeHandler = () => {
  theme.value = toggleTheme(theme.value)
  persistTheme(theme.value)
}

const handleNavigate = () => {
  isMenuOpen.value = false
}

const handleLogout = async () => {
  logout()
  isMenuOpen.value = false
  pushToast(copy.toasts.authEnd ?? 'Session ended, please login again to continue.', 'info')
  await router.push('/auth/login')
}

onMounted(() => {
  persistTheme(theme.value)
})
</script>
