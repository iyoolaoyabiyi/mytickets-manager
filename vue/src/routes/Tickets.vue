<template>
  <section class="l-container py-2xl l-stack">
    <header class="c-page-header">
      <h1 class="c-page-header__title">{{ copy.title }}</h1>
      <div class="c-page-header__actions">
        <button class="c-button c-button--primary" type="button" @click="openCreateModal">
          {{ copy.actions.new }}
        </button>
      </div>
    </header>

    <p v-if="alertMessage" class="c-alert" role="alert">
      {{ alertMessage }}
    </p>

    <form
      class="c-filters l-stack md:grid md:grid-cols-[2fr_1fr_1fr_auto] md:items-end"
      aria-label="Filters"
      @submit.prevent="applyFilters"
    >
      <div class="c-field">
        <label for="q" class="c-field__label">{{ copy.filters.search.label }}</label>
        <input
          id="q"
          v-model="filters.q"
          type="search"
          :placeholder="copy.filters.search.placeholder"
          class="c-filters__search"
        />
      </div>
      <div class="c-field">
        <label for="status" class="c-field__label">{{ copy.filters.status.label }}</label>
        <select id="status" v-model="filters.status" class="c-field__control">
          <option v-for="option in statusOptions" :key="option.value" :value="option.value">
            {{ option.label }}
          </option>
        </select>
      </div>
      <div class="c-field">
        <label for="priority" class="c-field__label">{{ copy.filters.priority.label }}</label>
        <select id="priority" v-model="filters.priority" class="c-field__control">
          <option v-for="option in priorityOptions" :key="option.value" :value="option.value">
            {{ option.label }}
          </option>
        </select>
      </div>
      <button class="c-button c-button--secondary" type="submit">
        {{ copy.filters.actions.search }}
      </button>
    </form>

    <section role="feed" :aria-busy="isLoading" id="tickets-feed" class="l-stack">
      <div v-if="isLoading" class="c-card">Loading tickets…</div>
      <div v-else-if="isError" class="c-card c-card--error">{{ errorMessage }}</div>
      <template v-else>
        <div v-if="tickets.length === 0" class="c-empty animate-fade-up">
          <img class="c-empty__illustration" :src="barChart" alt="" />
          <p class="c-empty__title">{{ emptyTitle }}</p>
          <button
            class="c-button"
            :class="isFiltered ? 'c-button--secondary' : 'c-button--primary'"
            type="button"
            @click="handleEmptyAction"
          >
            {{ emptyAction }}
          </button>
        </div>
        <article v-for="ticket in tickets" :key="ticket.id" class="c-ticket-card animate-fade-up" role="article">
          <div class="min-w-0 l-stack">
            <h3 class="c-ticket-card__title">{{ ticket.title }}</h3>
            <p class="c-ticket-card__meta">{{ metaFor(ticket) }}</p>
            <p v-if="ticket.description" class="text-sm text-fg-muted">{{ ticket.description }}</p>
          </div>
          <div class="l-stack md:items-end md:flex md:flex-col md:gap-sm">
            <div class="l-cluster">
              <span class="c-tag" :class="statusClass(ticket.status)">{{ formatStatus(ticket.status) }}</span>
              <span class="c-tag">{{ formatPriority(ticket.priority) }}</span>
            </div>
            <div class="c-ticket-card__actions">
              <button class="c-button c-button--secondary" type="button" @click="openEditModal(ticket)">
                {{ copy.card.labels.edit }}
              </button>
              <button
                class="c-button c-button--danger"
                type="button"
                :disabled="deletingId === ticket.id"
                @click="handleDelete(ticket.id)"
              >
                {{ deletingId === ticket.id ? 'Deleting…' : copy.card.labels.delete }}
              </button>
            </div>
          </div>
        </article>
      </template>
    </section>

    <TicketModal
      :visible="modal.open"
      :mode="modal.mode"
      :ticket="modal.ticket"
      @close="closeModal"
      @submit="submitTicket"
    />
  </section>
</template>
<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue'
import copy from '../../../packages/assets/copy/tickets.json'
import globalCopy from '../../../packages/assets/copy/global.json'
import barChart from '../../../packages/assets/media/icons/bar-chart.svg'
import TicketModal from '../components/TicketModal.vue'
import {
  createTicket,
  deleteTicket,
  defaultFilters,
  listTickets,
  updateTicket,
  TICKETS_CHANGED_EVENT,
  type Ticket,
  type TicketDraft,
  type TicketFilters
} from '../../../packages/utils/tickets'
import { formatRelativeTime } from '../../../packages/utils/time'
import { pushToast } from '../../../packages/utils/toast'
import { usePageMeta } from '../composables/usePageMeta'

usePageMeta({
  title: copy.title,
  description: 'Manage, search, and resolve tickets with inline editing, filters, and quick actions.'
})

const state = ref<'idle' | 'loading' | 'ready' | 'error'>('idle')
const tickets = ref<Ticket[]>([])
const errorMessage = ref('')
const alertMessage = ref('')
const filters = reactive<TicketFilters>(defaultFilters())
const deletingId = ref<number | null>(null)
const modal = reactive<{ open: boolean; mode: 'create' | 'edit'; ticket: Ticket | null }>({
  open: false,
  mode: 'create',
  ticket: null
})
const bootstrapped = ref(false)

const statusOptions = copy.filters.status.options.map((option) => ({
  value: option === 'All' ? 'all' : option,
  label: option === 'All' ? option : option.replace('_', ' ')
}))

const priorityOptions = [
  { value: 'all', label: 'All' },
  ...copy.filters.priority.options.map((option) => ({
    value: option.toLowerCase(),
    label: option.charAt(0).toUpperCase() + option.slice(1).toLowerCase()
  }))
]

const isLoading = computed(() => state.value === 'loading')
const isError = computed(() => state.value === 'error')
const isFiltered = computed(
  () => filters.q.trim() !== '' || filters.status !== 'all' || filters.priority !== 'all'
)

const emptyTitle = computed(() =>
  isFiltered.value ? copy.empty.filtered.title : copy.empty.primary.title
)
const emptyAction = computed(() =>
  isFiltered.value ? copy.empty.filtered.action : copy.empty.primary.action
)

const clearAlert = () => {
  alertMessage.value = ''
}

const showError = (message: string) => {
  alertMessage.value = message
}

let searchTimer: number | undefined

const loadTickets = async () => {
  state.value = 'loading'
  try {
    tickets.value = await listTickets({ ...filters })
    state.value = 'ready'
    errorMessage.value = ''
    clearAlert()
  } catch {
    state.value = 'error'
    errorMessage.value = globalCopy.toasts.loadError
    showError(globalCopy.toasts.loadError)
    pushToast(globalCopy.toasts.loadError, 'error')
  } finally {
    bootstrapped.value = true
  }
}

const applyFilters = async () => {
  window.clearTimeout(searchTimer)
  await loadTickets()
}

const resetFilters = async () => {
  Object.assign(filters, defaultFilters())
  clearAlert()
}

const openCreateModal = () => {
  modal.open = true
  modal.mode = 'create'
  modal.ticket = null
}

const openEditModal = (ticket: Ticket) => {
  modal.open = true
  modal.mode = 'edit'
  modal.ticket = ticket
}

const closeModal = () => {
  modal.open = false
  modal.ticket = null
}

const submitTicket = async (draft: TicketDraft) => {
  try {
    if (modal.mode === 'edit' && modal.ticket) {
      await updateTicket(modal.ticket.id, draft)
      pushToast(globalCopy.toasts.updateSuccess, 'success')
    } else {
      await createTicket(draft)
      pushToast(globalCopy.toasts.createSuccess, 'success')
    }
    closeModal()
    await loadTickets()
  } catch {
    showError(globalCopy.toasts.validation)
    pushToast(globalCopy.toasts.validation, 'error')
  }
}

const handleDelete = async (id: number) => {
  const confirmMessage = `${globalCopy.confirm.delete.title}\n${globalCopy.confirm.delete.body}`
  if (!window.confirm(confirmMessage)) return
  deletingId.value = id
  try {
    await deleteTicket(id)
    pushToast(globalCopy.toasts.deleteSuccess, 'success')
    await loadTickets()
  } catch {
    showError(globalCopy.toasts.loadError)
    pushToast(globalCopy.toasts.loadError, 'error')
  } finally {
    deletingId.value = null
  }
}

const handleEmptyAction = () => {
  if (isFiltered.value) {
    void resetFilters()
  } else {
    openCreateModal()
  }
}

const metaFor = (ticket: Ticket) =>
  copy.card.metaPattern
    .replace('#{id}', `#${ticket.id}`)
    .replace('{relativeTime}', formatRelativeTime(ticket.updated_at) || 'just now')

const formatStatus = (status: Ticket['status']) => status.replace('_', ' ')
const formatPriority = (priority: Ticket['priority']) =>
  priority.charAt(0).toUpperCase() + priority.slice(1)

const statusClass = (status: Ticket['status']) =>
  status === 'in_progress' ? 'c-tag--in-progress' : `c-tag--${status}`

const handleTicketsChanged = () => {
  void loadTickets()
}

watch(
  () => filters.q,
  () => {
    if (!bootstrapped.value) return
    window.clearTimeout(searchTimer)
    searchTimer = window.setTimeout(() => {
      void loadTickets()
    }, 240)
  }
)

watch(
  () => [filters.status, filters.priority],
  () => {
    if (!bootstrapped.value) return
    void loadTickets()
  }
)

onMounted(() => {
  void loadTickets()
  window.addEventListener(TICKETS_CHANGED_EVENT, handleTicketsChanged)
})

onBeforeUnmount(() => {
  window.removeEventListener(TICKETS_CHANGED_EVENT, handleTicketsChanged)
  window.clearTimeout(searchTimer)
})
</script>
