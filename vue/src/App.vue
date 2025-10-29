<script setup lang="ts">
import { onBeforeUnmount, onMounted } from 'vue'
import Header from './components/Header.vue'
import Footer from './components/Footer.vue'
import Toast from './components/Toast.vue'
import globalCopy from '@packages/assets/copy/global.json'
import { applyLayoutFrameObserver } from '@packages/utils/layout'

import '@packages/styles/app.css'

let detachLayoutObserver: (() => void) | null = null

onMounted(() => {
  detachLayoutObserver = applyLayoutFrameObserver()
})

onBeforeUnmount(() => {
  detachLayoutObserver?.()
  detachLayoutObserver = null
})
</script>
<template>
  <a href="#main-content" class="c-skiplink">{{ globalCopy.a11y.skipLink }}</a>
  <Header />
  <main id="main-content" class="l-page">
    <div class="l-container">
      <router-view />
    </div>
  </main>
  <Footer />
  <Toast />
</template>
