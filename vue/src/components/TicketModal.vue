<template>
  <teleport to="body">
    <div
      v-if="visible"
      class="c-modal"
      role="dialog"
      aria-modal="true"
      :aria-labelledby="headingId"
      @click="emitClose"
    >
      <div class="c-modal__panel" @click.stop @keydown.esc.stop.prevent="emitClose">
        <header class="l-stack">
          <h2 :id="headingId" class="c-modal__title">{{ heading }}</h2>
        </header>
        <form class="l-stack" @submit.prevent="handleSubmit">
          <div class="c-field">
            <label for="modal-title" class="c-field__label">{{ ticketsCopy.form.labels.title }}</label>
            <input
              id="modal-title"
              v-model="draft.title"
              :placeholder="ticketsCopy.form.placeholders.title"
              class="c-field__control"
              ref="titleInput"
            />
            <p v-if="errors.title" class="c-field__message">{{ errors.title }}</p>
          </div>
          <div class="c-field">
            <label for="modal-description" class="c-field__label">{{ ticketsCopy.form.labels.description }}</label>
            <textarea
              id="modal-description"
              v-model="draft.description"
              :placeholder="ticketsCopy.form.placeholders.description"
              rows="5"
              class="c-field__control"
            ></textarea>
          </div>
          <div class="grid gap-sm md:grid-cols-2">
            <div class="c-field">
              <label for="modal-status" class="c-field__label">{{ ticketsCopy.form.labels.status }}</label>
              <select id="modal-status" v-model="draft.status" class="c-field__control">
                <option v-for="status in statusOptions" :key="status" :value="status">
                  {{ formatStatus(status) }}
                </option>
              </select>
              <p v-if="errors.status" class="c-field__message">{{ errors.status }}</p>
            </div>
            <div class="c-field">
              <label for="modal-priority" class="c-field__label">{{ ticketsCopy.form.labels.priority }}</label>
              <select id="modal-priority" v-model="draft.priority" class="c-field__control">
                <option v-for="priority in priorityOptions" :key="priority" :value="priority">
                  {{ formatPriority(priority) }}
                </option>
              </select>
              <p v-if="errors.priority" class="c-field__message">{{ errors.priority }}</p>
            </div>
          </div>
          <div class="c-modal__actions">
            <button type="button" class="c-button c-button--secondary" @click="emitClose">
              {{ ticketsCopy.form.actions.cancel }}
            </button>
            <button type="submit" class="c-button c-button--primary">
              {{ actionLabel }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </teleport>
</template>
<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue'
import ticketsCopy from '@packages/assets/copy/tickets.json'
import globalCopy from '@packages/assets/copy/global.json'
import type { Ticket, TicketDraft, TicketPriority, TicketStatus } from '@packages/utils/tickets'

type ModalMode = 'create' | 'edit'

const props = defineProps<{
  visible: boolean
  mode: ModalMode
  ticket?: Ticket | null
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'submit', payload: TicketDraft): void
}>()

const defaultDraft = (): TicketDraft => ({
  title: '',
  description: '',
  status: 'open',
  priority: 'medium'
})

const draft = reactive<TicketDraft>(defaultDraft())
const errors = reactive<{ title: string; status: string; priority: string }>({
  title: '',
  status: '',
  priority: ''
})

const titleInput = ref<HTMLInputElement | null>(null)

const statusOptions = ticketsCopy.card.statusTags as TicketStatus[]
const priorityOptions = ticketsCopy.card.priorityTags as TicketPriority[]

const heading = computed(() =>
  props.mode === 'edit' ? ticketsCopy.form.actions.update : ticketsCopy.actions.new
)

const headingId = computed(() =>
  props.mode === 'edit'
    ? `ticket-modal-edit-${props.ticket?.id ?? 'new'}`
    : 'ticket-modal-create'
)

const actionLabel = computed(() =>
  props.mode === 'edit' ? ticketsCopy.form.actions.update : ticketsCopy.form.actions.save
)

const hydrate = (ticket?: Ticket | null) => {
  const source = ticket
    ? {
        title: ticket.title,
        description: ticket.description ?? '',
        status: ticket.status,
        priority: ticket.priority
      }
    : defaultDraft()

  draft.title = source.title
  draft.description = source.description
  draft.status = source.status
  draft.priority = source.priority
  errors.title = ''
  errors.status = ''
  errors.priority = ''
}

watch(
  () => props.visible,
  (visible) => {
    if (visible) {
      hydrate(props.mode === 'edit' ? props.ticket ?? null : null)
      nextTick(() => {
        titleInput.value?.focus()
      })
    }
  }
)

watch(
  () => props.ticket,
  (ticket) => {
    if (props.visible && props.mode === 'edit') {
      hydrate(ticket ?? null)
      nextTick(() => titleInput.value?.focus())
    }
  },
  { immediate: true }
)

const validate = () => {
  errors.title = draft.title.trim() ? '' : globalCopy.validation.titleRequired
  errors.status = draft.status ? '' : globalCopy.validation.statusRequired
  errors.priority = draft.priority ? '' : globalCopy.validation.priorityRequired
  return !errors.title && !errors.status && !errors.priority
}

const emitClose = () => emit('close')

const handleSubmit = () => {
  if (!validate()) return
  emit('submit', {
    title: draft.title.trim(),
    description: draft.description.trim(),
    status: draft.status,
    priority: draft.priority
  })
}

const formatStatus = (status: TicketStatus) => status.replace('_', ' ')
const formatPriority = (priority: TicketPriority) =>
  priority.charAt(0).toUpperCase() + priority.slice(1)

const handleEscape = (event: KeyboardEvent) => {
  if (event.key === 'Escape' && props.visible) {
    emitClose()
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleEscape)
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', handleEscape)
})
</script>
