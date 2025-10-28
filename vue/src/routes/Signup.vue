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
          <label for="signup-name" class="c-field__label">{{ copy.form.labels.name }}</label>
          <input
            id="signup-name"
            v-model="form.name"
            type="text"
            :placeholder="copy.form.placeholders.name"
            class="c-field__control"
            autocomplete="name"
            :aria-invalid="Boolean(errors.name)"
            :aria-describedby="errors.name ? 'signup-name-error' : undefined"
          />
          <p v-if="errors.name" id="signup-name-error" class="c-field__message" role="alert">{{ errors.name }}</p>
        </div>
        <div class="c-field">
          <label for="signup-email" class="c-field__label">{{ copy.form.labels.email }}</label>
          <input
            id="signup-email"
            v-model="form.email"
            type="email"
            :placeholder="copy.form.placeholders.email"
            class="c-field__control"
            autocomplete="email"
            :aria-invalid="Boolean(errors.email)"
            :aria-describedby="errors.email ? 'signup-email-error' : undefined"
          />
          <p v-if="errors.email" id="signup-email-error" class="c-field__message" role="alert">{{ errors.email }}</p>
        </div>
        <div class="c-field">
          <label for="signup-password" class="c-field__label">{{ copy.form.labels.password }}</label>
          <input
            id="signup-password"
            v-model="form.password"
            type="password"
            :placeholder="copy.form.placeholders.password"
            class="c-field__control"
            autocomplete="new-password"
            :aria-invalid="Boolean(errors.password)"
            :aria-describedby="errors.password ? 'signup-password-error' : undefined"
          />
          <p v-if="errors.password" id="signup-password-error" class="c-field__message" role="alert">{{ errors.password }}</p>
        </div>
        <div class="c-field">
          <label for="signup-confirm" class="c-field__label">{{ copy.form.labels.confirm }}</label>
          <input
            id="signup-confirm"
            v-model="form.confirm"
            type="password"
            :placeholder="copy.form.placeholders.confirm"
            class="c-field__control"
            autocomplete="new-password"
            :aria-invalid="Boolean(errors.confirm)"
            :aria-describedby="errors.confirm ? 'signup-confirm-error' : undefined"
          />
          <p v-if="errors.confirm" id="signup-confirm-error" class="c-field__message" role="alert">{{ errors.confirm }}</p>
        </div>
      </div>
      <p v-if="errors.general" class="c-alert" role="alert" aria-live="assertive">{{ errors.general }}</p>
      <div class="c-auth-card__actions">
        <button class="c-button c-button--primary" type="submit" :disabled="loading">
          <span v-if="loading">...</span>
          <span v-else>{{ copy.form.submit }}</span>
        </button>
        <p class="c-auth-card__switch">
          <RouterLink to="/auth/login">{{ copy.links.switch }}</RouterLink>
        </p>
      </div>
    </form>
    <p class="c-auth-card__hint">{{ copy.postSignup }}</p>
  </section>
</template>
<script setup lang="ts">
import { reactive, ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import copy from '../../../packages/assets/copy/signup.json'
import globalCopy from '../../../packages/assets/copy/global.json'
import { signup } from '../../../packages/utils/auth'
import { pushToast } from '../../../packages/utils/toast'
import { usePageMeta } from '../composables/usePageMeta'

usePageMeta({
  title: copy.title,
  description: copy.tagline
})

const router = useRouter()

const form = reactive({
  name: '',
  email: '',
  password: '',
  confirm: ''
})

const errors = reactive({
  name: '',
  email: '',
  password: '',
  confirm: '',
  general: ''
})

const loading = ref(false)
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const validate = () => {
  errors.name = form.name.trim() ? '' : globalCopy.validation.required
  const email = form.email.trim()
  if (!email) {
    errors.email = globalCopy.validation.required
  } else if (!emailPattern.test(email)) {
    errors.email = globalCopy.validation.email
  } else {
    errors.email = ''
  }
  if (!form.password) {
    errors.password = globalCopy.validation.required
  } else if (form.password.length < 8) {
    errors.password = globalCopy.validation.passwordLength
  } else {
    errors.password = ''
  }
  if (!form.confirm) {
    errors.confirm = globalCopy.validation.required
  } else if (form.password !== form.confirm) {
    errors.confirm = globalCopy.validation.passwordMatch
  } else {
    errors.confirm = ''
  }
  errors.general = ''
  return !errors.name && !errors.email && !errors.password && !errors.confirm
}

const handleSubmit = async () => {
  if (loading.value) return
  if (!validate()) return
  loading.value = true
  try {
    await signup({
      name: form.name.trim(),
      email: form.email.trim().toLowerCase(),
      password: form.password
    })
    pushToast(globalCopy.toasts.postSignup, 'success')
    await router.push('/auth/login')
  } catch (error) {
    const message = error instanceof Error ? error.message : globalCopy.toasts.validation
    errors.general = message
    pushToast(message, 'error')
  } finally {
    loading.value = false
  }
}
</script>
