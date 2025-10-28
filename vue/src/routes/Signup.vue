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
          <label for="name" class="c-field__label">{{ copy.form.labels.name }}</label>
          <input
            id="name"
            type="text"
            :placeholder="copy.form.placeholders.name"
            class="c-field__control"
          />
        </div>
        <div class="c-field">
          <label for="email" class="c-field__label">{{ copy.form.labels.email }}</label>
          <input
            id="email"
            type="email"
            :placeholder="copy.form.placeholders.email"
            class="c-field__control"
          />
        </div>
        <div class="c-field">
          <label for="password" class="c-field__label">{{ copy.form.labels.password }}</label>
          <input
            id="password"
            type="password"
            :placeholder="copy.form.placeholders.password"
            class="c-field__control"
          />
        </div>
        <div class="c-field">
          <label for="confirm" class="c-field__label">{{ copy.form.labels.confirm }}</label>
          <input
            id="confirm"
            type="password"
            :placeholder="copy.form.placeholders.confirm"
            class="c-field__control"
          />
        </div>
      </div>
      <div class="c-auth-card__actions">
        <button class="c-button c-button--primary" type="submit">{{ copy.form.submit }}</button>
        <p class="c-auth-card__switch">
          <RouterLink to="/auth/login">{{ copy.links.switch }}</RouterLink>
        </p>
      </div>
    </form>
    <p class="c-auth-card__hint">{{ copy.postSignup }}</p>
  </section>
</template>
<script setup lang="ts">
import { RouterLink } from 'vue-router'
import copy from '../../../packages/assets/copy/signup.json'
</script>
