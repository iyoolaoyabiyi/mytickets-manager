<template>
  <section class="l-container py-2xl l-stack">
    <header class="c-page-header">
      <h1 class="c-page-header__title">{{ copy.title }}</h1>
      <p class="c-page-header__subtitle">{{ copy.subtitle }}</p>
    </header>
    <div class="grid gap-lg md:grid-cols-4">
      <article
        v-for="stat in stats"
        :key="stat.key"
        class="c-stat-card"
      >
        <div>
          <span class="c-stat-card__label">{{ stat.label }}</span>
          <div class="c-stat-card__value">{{ stat.value }}</div>
        </div>
      </article>
    </div>
    <div class="c-page-header__actions">
      <RouterLink class="c-button c-button--primary" to="/tickets">
        {{ copy.actions.toTickets }}
      </RouterLink>
    </div>
    <section v-if="!hasTickets" class="c-empty">
      <img class="c-empty__illustration" :src="barChart" alt="" />
      <p class="c-empty__title">{{ ticketsCopy.empty.primary.title }}</p>
      <RouterLink class="c-button c-button--primary" to="/tickets">
        {{ ticketsCopy.empty.primary.action }}
      </RouterLink>
    </section>
  </section>
</template>
<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import copy from '../../../packages/assets/copy/dashboard.json'
import ticketsCopy from '../../../packages/assets/copy/tickets.json'
import barChart from '../../../packages/assets/media/icons/bar-chart.svg'

type StatKey = 'total' | 'open' | 'inProgress' | 'closed'

const totals: Record<StatKey, number> = {
  total: 0,
  open: 0,
  inProgress: 0,
  closed: 0
}

const stats = computed(() => ([
  { key: 'total', label: copy.stats.total, value: totals.total },
  { key: 'open', label: copy.stats.open, value: totals.open },
  { key: 'inProgress', label: copy.stats.inProgress, value: totals.inProgress },
  { key: 'closed', label: copy.stats.closed, value: totals.closed }
]))

const hasTickets = computed(() => totals.total > 0)
</script>
