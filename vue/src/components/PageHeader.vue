<template>
  <header class="c-page-header">
    <h1 class="c-page-header__title">{{ title }}</h1>
    <p v-if="subtitle" class="c-page-header__subtitle">{{ subtitle }}</p>
    <div v-if="$slots.actions" class="c-page-header__actions">
      <slot name="actions" />
    </div>
  </header>
</template>
<script setup lang="ts">
defineProps<{ title: string; subtitle?: string }>()
</script>
