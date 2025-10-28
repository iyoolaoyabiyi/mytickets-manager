<template>
  <section class="l-container py-2xl l-stack">
    <header class="c-page-header">
      <h1 class="c-page-header__title">{{ copy.title }}</h1>
      <p class="c-page-header__subtitle">{{ copy.subtitle }}</p>
    </header>
    <div class="grid gap-lg md:grid-cols-4" :aria-busy="loading">
      <article
        v-for="stat in stats"
        :key="stat.key"
        class="c-stat-card animate-fade-up"
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
    <section v-if="!loading && !hasTickets" class="c-empty animate-fade-up">
      <img class="c-empty__illustration" :src="barChart" alt="" />
      <p class="c-empty__title">{{ ticketsCopy.empty.primary.title }}</p>
      <RouterLink class="c-button c-button--primary" to="/tickets">
        {{ ticketsCopy.empty.primary.action }}
      </RouterLink>
    </section>
  </section>
</template>
<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, reactive, ref } from 'vue'
import { RouterLink } from 'vue-router'
import copy from '../../../packages/assets/copy/dashboard.json'
import ticketsCopy from '../../../packages/assets/copy/tickets.json'
import barChart from '../../../packages/assets/media/icons/bar-chart.svg'
import { getTicketStats, TICKETS_CHANGED_EVENT } from '../../../packages/utils/tickets'
import { usePageMeta } from '../composables/usePageMeta'

type StatKey = 'total' | 'open' | 'inProgress' | 'closed'

const totals = reactive<Record<StatKey, number>>({
  total: 0,
  open: 0,
  inProgress: 0,
  closed: 0
})

const loading = ref(true)

usePageMeta({
  title: copy.title,
  description: copy.subtitle
})

const stats = computed(() => ([
  { key: 'total', label: copy.stats.total, value: totals.total },
  { key: 'open', label: copy.stats.open, value: totals.open },
  { key: 'inProgress', label: copy.stats.inProgress, value: totals.inProgress },
  { key: 'closed', label: copy.stats.closed, value: totals.closed }
]))

const hasTickets = computed(() => totals.total > 0)

const loadStats = async () => {
  loading.value = true
  try {
    const data = await getTicketStats()
    totals.total = data.total
    totals.open = data.open
    totals.inProgress = data.inProgress
    totals.closed = data.closed
  } finally {
    loading.value = false
  }
}

const handleTicketsChanged = () => {
  loadStats()
}

onMounted(() => {
  loadStats()
  window.addEventListener(TICKETS_CHANGED_EVENT, handleTicketsChanged)
})

onBeforeUnmount(() => {
  window.removeEventListener(TICKETS_CHANGED_EVENT, handleTicketsChanged)
})
</script>
