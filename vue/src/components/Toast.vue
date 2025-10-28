<template>
  <div v-if="toasts.length" class="c-toast-stack" aria-live="polite">
    <article
      v-for="toast in toasts"
      :key="toast.id"
      class="c-toast"
      :data-level="toast.level"
      :data-leaving="toast.leaving"
      :role="toast.level === 'error' ? 'alert' : 'status'"
    >
      <div class="c-toast__message">{{ toast.message }}</div>
      <button
        type="button"
        class="c-toast__close"
        aria-label="Dismiss notification"
        @click="dismiss(toast.id)"
      >
        &times;
      </button>
    </article>
  </div>
</template>
<script setup lang="ts">
import { onBeforeUnmount, onMounted, reactive } from 'vue'
import {
  dismissToast,
  subscribeToastDismissals,
  subscribeToasts,
  type ToastMessage
} from '../../../packages/utils/toast'

type ToastState = ToastMessage & { leaving: boolean }

const toasts = reactive<ToastState[]>([])
const lifetimes = new Map<string, number>()
const exitTimers = new Map<string, number>()

const scheduleRemoval = (id: string, duration: number) => {
  clearTimeout(lifetimes.get(id))
  const timeout = window.setTimeout(() => {
    startExit(id)
  }, duration)
  lifetimes.set(id, timeout)
}

const startExit = (id: string) => {
  const target = toasts.find((toast) => toast.id === id)
  if (!target || target.leaving) return
  target.leaving = true
  const timer = window.setTimeout(() => {
    const index = toasts.findIndex((toast) => toast.id === id)
    if (index >= 0) {
      toasts.splice(index, 1)
    }
    lifetimes.delete(id)
    exitTimers.delete(id)
  }, 220)
  exitTimers.set(id, timer)
}

const enqueue = (toast: ToastMessage) => {
  toasts.push({ ...toast, leaving: false })
  scheduleRemoval(toast.id, toast.duration)
}

const dismiss = (id: string) => {
  dismissToast(id)
  startExit(id)
}

let unsubscribePush: (() => void) | undefined
let unsubscribeDismiss: (() => void) | undefined

onMounted(() => {
  unsubscribePush = subscribeToasts(enqueue)
  unsubscribeDismiss = subscribeToastDismissals(startExit)
})

onBeforeUnmount(() => {
  unsubscribePush?.()
  unsubscribeDismiss?.()
  lifetimes.forEach((timeout) => window.clearTimeout(timeout))
  exitTimers.forEach((timeout) => window.clearTimeout(timeout))
  lifetimes.clear()
  exitTimers.clear()
})
</script>
