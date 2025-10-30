<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import copy from '@packages/assets/copy/landing.json'
import { usePageMeta } from '../composables/usePageMeta'
import { useSession } from '../composables/useSession'

const svgAssets = import.meta.glob('../../packages/assets/media/**/*.svg', {
  eager: true,
  as: 'raw'
}) as Record<string, string>

const svgAsset = (icon?: string | null) => {
  if (!icon) return undefined
  const key = `../../packages/assets/media/${icon}`
  if (!svgAssets[key]) {
    console.warn(`Missing asset for key: ${key}`)
    return undefined
  }
  return svgAssets[key]
}

const heroWave = svgAsset(copy.hero.media.wave)
const heroCirclePrimary = svgAsset(copy.hero.media.decorativeCircle)
const heroCircleSecondary = svgAsset(copy.hero.media.decorativeCircleSecondary ?? copy.hero.media.decorativeCircle)
const features = computed(() =>
  copy.features.map(feature => ({
    ...feature,
    iconMarkup: svgAsset(feature.icon)
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
    <div
      v-if="heroWave"
      class="c-hero__wave"
      aria-hidden="true"
      role="presentation"
      v-html="heroWave"
    />
    <div
      v-if="heroCirclePrimary"
      class="c-hero__decor"
      aria-hidden="true"
      role="presentation"
      v-html="heroCirclePrimary"
    />
    <div
      v-if="heroCircleSecondary"
      class="c-hero__decor-secondary"
      aria-hidden="true"
      role="presentation"
      v-html="heroCircleSecondary"
    />
  </section>

  <section class="l-stack py-2xl">
    <div class="l-grid-3">
      <article v-for="(f, i) in features" :key="i" class="c-feature-card animate-fade-up">
        <div
          v-if="f.iconMarkup"
          class="c-feature-card__icon"
          aria-hidden="true"
          role="presentation"
          v-html="f.iconMarkup"
        />
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
