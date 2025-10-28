<template>
  <section class="c-auth-card l-stack">
    <header class="c-page-header">
      <h1 class="c-page-header__title">{{ copy.heading }}</h1>
      <p class="c-page-header__subtitle">{{ copy.tagline }}</p>
    </header>
    <form class="c-auth-card__form" novalidate>
      <h2 class="c-modal__title">{{ copy.title }}</h2>
      <div class="c-auth-card__fields">
        <div class="c-field">
          <label for="email" class="c-field__label">{{ copy.form.labels.email }}</label>
          <input
            id="email"
            type="email"
            :placeholder="copy.form.placeholders.email"
            class="c-field__control"
          />
          <p class="c-field__message" id="email-msg" hidden></p>
        </div>
        <div class="c-field">
          <label for="password" class="c-field__label">{{ copy.form.labels.password }}</label>
          <input
            id="password"
            type="password"
            :placeholder="copy.form.placeholders.password"
            class="c-field__control"
          />
          <p class="c-field__message" id="password-msg" hidden></p>
        </div>
      </div>
      <div class="c-auth-card__actions">
        <button class="c-button c-button--primary" type="submit">{{ copy.form.submit }}</button>
        <p class="c-auth-card__switch">
          <RouterLink to="/auth/signup">{{ copy.links.switch }}</RouterLink>
        </p>
      </div>
    </form>
    <p class="c-auth-card__hint">{{ copy.demo }}</p>
  </section>
</template>
<script setup lang="ts">
import { RouterLink } from 'vue-router'
import copy from '../../../packages/assets/copy/login.json'
</script>
