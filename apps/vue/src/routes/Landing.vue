<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import copy from '@packages/assets/copy/landing.json'
import { usePageMeta } from '../composables/usePageMeta'
import { useSession } from '../composables/useSession'

const mediaAssets = import.meta.glob('../../packages/assets/media/**/*', {
  eager: true,
  query: '?url',
  import: 'default'
}) as Record<string, string>

const asset = (icon?: string | null) => {
  if (!icon) return undefined
  const key = `../../packages/assets/media/${icon}`
  if (!mediaAssets[key]) {
    console.warn(`Missing asset for key: ${key}`)
    return undefined
  }
  return mediaAssets[key]
}

const heroWave = asset(copy.hero.media.wave)
const heroCirclePrimary = asset(copy.hero.media.decorativeCircle)
const heroCircleSecondary = asset(copy.hero.media.decorativeCircleSecondary ?? copy.hero.media.decorativeCircle)
const features = computed(() =>
  copy.features.map(feature => ({
    ...feature,
    icon: asset(feature.icon)
  }))
)
const session = useSession()

usePageMeta({
  title: copy.hero.title,
  description: copy.hero.subtitle
})

const isAuthenticated = computed(() => !!session.value)
const authenticatedLabel = computed(() => copy.hero.authenticatedCta ?? 'Dashboard')
const authenticatedHref = computed(() => copy.hero.authenticatedHref ?? '/dashboard')
</script>
<template>
  <section class="c-hero">
    <div class="c-hero__inner animate-fade-up">
      <h1 class="c-hero__title">{{ copy.hero.title }}</h1>
      <p class="c-hero__subtitle">{{ copy.hero.subtitle }}</p>
      <div class="c-hero__actions">
        <RouterLink
          v-if="isAuthenticated"
          :to="authenticatedHref"
          class="c-button c-button--primary"
        >
          {{ authenticatedLabel }}
        </RouterLink>
        <template v-else>
          <RouterLink to="/auth/signup" class="c-button c-button--primary">{{ copy.hero.primaryCta }}</RouterLink>
          <RouterLink to="/auth/login" class="c-button c-button--secondary">{{ copy.hero.secondaryCta }}</RouterLink>
        </template>
      </div>
    </div>
    <img :src="heroWave" class="c-hero__wave" alt="" aria-hidden="true" />
    <img :src="heroCirclePrimary" class="c-hero__decor" alt="" aria-hidden="true" />
    <img :src="heroCircleSecondary" class="c-hero__decor-secondary" alt="" aria-hidden="true" />
  </section>

  <section class="l-stack py-2xl">
    <div class="l-grid-3">
      <article v-for="(f, i) in features" :key="i" class="c-feature-card animate-fade-up">
        <img :src="f.icon" class="c-feature-card__icon" alt="" />
        <h3 class="c-feature-card__title">{{ f.title }}</h3>
        <p class="c-feature-card__body">{{ f.body }}</p>
      </article>
    </div>
  </section>

  <section class="l-stack py-2xl">
    <div class="l-grid-3">
      <article v-for="(s, i) in copy.howItWorks" :key="i" class="c-how-step animate-fade-up">
        <h3 class="c-how-step__title">{{ s.title }}</h3>
        <p class="c-how-step__body">{{ s.body }}</p>
      </article>
    </div>
  </section>
</template>
