<template>
  <section class="c-auth-card l-stack">
    <header class="c-page-header">
      <h1 class="c-page-header__title">{{ copy.heading }}</h1>
      <p class="c-page-header__subtitle">{{ copy.tagline }}</p>
    </header>
    <form class="c-auth-card__form" novalidate @submit.prevent="handleSubmit" :aria-busy="loading">
      <h2 class="c-modal__title">{{ copy.title }}</h2>
      <div class="c-auth-card__fields">
        <div class="c-field">
          <label for="login-email" class="c-field__label">{{ copy.form.labels.email }}</label>
          <input
            id="login-email"
            v-model="form.email"
            type="email"
            :placeholder="copy.form.placeholders.email"
            class="c-field__control"
            autocomplete="email"
            :aria-invalid="Boolean(errors.email)"
            :aria-describedby="errors.email ? 'login-email-error' : undefined"
          />
          <p v-if="errors.email" id="login-email-error" class="c-field__message" role="alert">{{ errors.email }}</p>
        </div>
        <div class="c-field">
          <label for="login-password" class="c-field__label">{{ copy.form.labels.password }}</label>
          <input
            id="login-password"
            v-model="form.password"
            type="password"
            :placeholder="copy.form.placeholders.password"
            class="c-field__control"
            autocomplete="current-password"
            :aria-invalid="Boolean(errors.password)"
            :aria-describedby="errors.password ? 'login-password-error' : undefined"
          />
          <p v-if="errors.password" id="login-password-error" class="c-field__message" role="alert">{{ errors.password }}</p>
        </div>
      </div>
      <p v-if="errors.general" class="c-alert" role="alert" aria-live="assertive">{{ errors.general }}</p>
      <div class="c-auth-card__actions">
        <button class="c-button c-button--primary" type="submit" :disabled="loading">
          <span v-if="loading">...</span>
          <span v-else>{{ copy.form.submit }}</span>
        </button>
        <p class="c-auth-card__switch">
          <RouterLink to="/auth/signup">{{ copy.links.switch }}</RouterLink>
        </p>
      </div>
    </form>
    <p class="c-auth-card__hint">{{ copy.demo }}</p>
  </section>
</template>
<script setup lang="ts">
import { reactive, ref } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import copy from '@packages/assets/copy/login.json'
import globalCopy from '@packages/assets/copy/global.json'
import { login } from '@packages/utils/auth'
import { pushToast } from '@packages/utils/toast'
import { usePageMeta } from '../composables/usePageMeta'

usePageMeta({
  title: copy.title,
  description: copy.tagline
})

const router = useRouter()
const route = useRoute()

const form = reactive({
  email: '',
  password: ''
})

const errors = reactive({
  email: '',
  password: '',
  general: ''
})

const loading = ref(false)

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const validate = () => {
  const email = form.email.trim()
  if (!email) {
    errors.email = globalCopy.validation.required
  } else if (!emailPattern.test(email)) {
    errors.email = globalCopy.validation.email
  } else {
    errors.email = ''
  }
  errors.password = form.password ? '' : globalCopy.validation.required
  errors.general = ''
  return !errors.email && !errors.password
}

const handleSubmit = async () => {
  if (loading.value) return
  if (!validate()) return
  loading.value = true
  try {
    const session = await login({
      email: form.email.trim().toLowerCase(),
      password: form.password
    })
    const name = session.user.name || 'there'
    pushToast(globalCopy.toasts.authSuccess.replace('{name}', name), 'success')
    form.password = ''
    const redirect = typeof route.query.redirect === 'string' ? route.query.redirect : null
    await router.push(redirect || '/dashboard')
  } catch (error) {
    const message = error instanceof Error ? error.message : globalCopy.toasts.authError
    errors.general = message
    pushToast(message, 'error')
  } finally {
    loading.value = false
  }
}
</script>
