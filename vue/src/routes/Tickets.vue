<template>
  <section class="l-container py-2xl l-stack">
    <header class="c-page-header">
      <h1 class="c-page-header__title">{{ copy.title }}</h1>
      <div class="c-page-header__actions">
        <button class="c-button c-button--primary" type="button">
          {{ copy.actions.new }}
        </button>
      </div>
    </header>

    <section class="c-filters l-stack md:grid md:grid-cols-[2fr_1fr_1fr_auto] md:items-end" aria-label="Filters">
      <div class="c-field">
        <label for="q" class="c-field__label">{{ copy.filters.search.label }}</label>
        <input
          id="q"
          type="search"
          :placeholder="copy.filters.search.placeholder"
          class="c-filters__search"
        />
      </div>
      <div class="c-field">
        <label for="status" class="c-field__label">{{ copy.filters.status.label }}</label>
        <select id="status" class="c-field__control">
          <option v-for="o in copy.filters.status.options" :key="o">{{ o }}</option>
        </select>
      </div>
      <div class="c-field">
        <label for="priority" class="c-field__label">{{ copy.filters.priority.label }}</label>
        <select id="priority" class="c-field__control">
          <option v-for="o in copy.filters.priority.options" :key="o">{{ o }}</option>
        </select>
      </div>
      <button class="c-button c-button--secondary" type="button">
        {{ copy.filters.actions.search }}
      </button>
    </section>

    <section role="feed" aria-busy="false" id="tickets-feed" class="l-stack">
      <div class="c-empty" hidden>
        <img class="c-empty__illustration" :src="barChart" alt="" />
        <p class="c-empty__title">{{ copy.empty.primary.title }}</p>
        <button class="c-button c-button--primary" type="button">
          {{ copy.empty.primary.action }}
        </button>
      </div>
      <div class="c-empty" hidden>
        <img class="c-empty__illustration" :src="barChart" alt="" />
        <p class="c-empty__title">{{ copy.empty.filtered.title }}</p>
        <button class="c-button c-button--secondary" type="button">
          {{ copy.empty.filtered.action }}
        </button>
      </div>

      <article class="c-ticket-card" role="article">
        <div class="min-w-0 l-stack">
          <h3 class="c-ticket-card__title">Example Ticket</h3>
          <p class="c-ticket-card__meta">{{ exampleMeta }}</p>
        </div>
        <div class="l-stack md:items-end md:flex md:flex-col md:gap-sm">
          <div class="l-cluster">
            <span class="c-tag" :class="statusClass(defaultStatus)">{{ statusLabel }}</span>
            <span class="c-tag">{{ priorityLabel }}</span>
          </div>
          <div class="c-ticket-card__actions">
            <button class="c-button c-button--secondary" type="button" aria-label="Edit">
              {{ copy.card.labels.edit }}
            </button>
            <button class="c-button c-button--danger" type="button" aria-label="Delete">
              {{ copy.card.labels.delete }}
            </button>
          </div>
        </div>
      </article>
    </section>
  </section>
</template>
<script setup lang="ts">
import { computed } from 'vue'
import copy from '../../../packages/assets/copy/tickets.json'
import barChart from '../../../packages/assets/media/icons/bar-chart.svg'

const defaultStatus = copy.card.statusTags[0]
const defaultPriority = copy.card.priorityTags[0]

const exampleMeta = computed(() =>
  copy.card.metaPattern
    .replace('#{id}', '#123')
    .replace('{relativeTime}', '2h ago')
)

const statusLabel = computed(() => defaultStatus.replace('_', ' '))
const priorityLabel = computed(() => defaultPriority.charAt(0).toUpperCase() + defaultPriority.slice(1))

const statusClass = (status: string) => {
  if (status === 'in_progress') {
    return 'c-tag--in-progress'
  }
  return `c-tag--${status}`
}
</script>
