<template>
  <section class="l-container py-2xl l-stack">
    <header class="c-page-header">
      <h1 class="c-page-header__title">{{ copy.title }}</h1>
    </header>
    <nav class="c-breadcrumb l-cluster text-sm text-fg-muted" aria-label="Breadcrumb">
      <RouterLink class="underline" to="/tickets">{{ ticketsCopy.title }}</RouterLink>
      <span class="c-breadcrumb__sep">/</span>
      <span>{{ ticketLabel }}</span>
    </nav>
    <section class="c-card l-stack max-w-xl">
      <div class="c-field">
        <label for="e-title" class="c-field__label">{{ copy.form.labels.title }}</label>
        <input
          id="e-title"
          class="c-field__control"
          :placeholder="ticketsCopy.form.placeholders.title"
        />
      </div>
      <div class="c-field">
        <label for="e-desc" class="c-field__label">{{ copy.form.labels.description }}</label>
        <textarea
          id="e-desc"
          class="c-field__control"
          rows="6"
          :placeholder="ticketsCopy.form.placeholders.description"
        ></textarea>
      </div>
      <div class="c-field">
        <label for="e-status" class="c-field__label">{{ copy.form.labels.status }}</label>
        <select id="e-status" class="c-field__control">
          <option v-for="status in statusOptions" :key="status">{{ status }}</option>
        </select>
      </div>
      <div class="c-field">
        <label for="e-priority" class="c-field__label">{{ copy.form.labels.priority }}</label>
        <select id="e-priority" class="c-field__control">
          <option v-for="priority in priorityOptions" :key="priority">{{ priority }}</option>
        </select>
      </div>
      <div class="c-modal__actions">
        <button class="c-button c-button--primary" type="button">
          {{ copy.form.actions.update }}
        </button>
        <button class="c-button c-button--secondary" type="button">
          {{ copy.form.actions.cancel }}
        </button>
      </div>
    </section>
  </section>
</template>
<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import copy from '../../../packages/assets/copy/ticketEdit.json'
import ticketsCopy from '../../../packages/assets/copy/tickets.json'

const route = useRoute()
const ticketId = computed(() => String(route.params.id ?? '123'))
const ticketLabel = computed(() =>
  copy.breadcrumb
    .replace('Tickets / ', '')
    .replace('#{id}', `#${ticketId.value}`)
)

const statusOptions = ticketsCopy.card.statusTags
const priorityOptions = ticketsCopy.card.priorityTags
</script>
