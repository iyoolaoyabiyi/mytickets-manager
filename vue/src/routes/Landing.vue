<script setup lang="ts">
  import { RouterLink } from 'vue-router'
  import copy from '@packages/assets/copy/landing.json'
  import circle from '@packages/assets/media/circle-1.svg';
  import wave from '@packages/assets/media/wave.svg';
  import { usePageMeta } from '../composables/usePageMeta'

  const asset = (icon: string) => {
    return new URL(`@packages/assets/media/${icon}`, import.meta.url).toString()
  }

  usePageMeta({
    title: 'Home',
    description: copy.hero.subtitle
  })
</script>
<template>
  <section class="c-hero">
    <div class="c-hero__inner animate-fade-up">
      <h1 class="c-hero__title">{{ copy.hero.title }}</h1>
      <p class="c-hero__subtitle">{{ copy.hero.subtitle }}</p>
      <div class="c-hero__actions">
        <RouterLink to="/auth/signup" class="c-button c-button--primary">{{ copy.hero.primaryCta }}</RouterLink>
        <RouterLink to="/auth/login" class="c-button c-button--secondary">{{ copy.hero.secondaryCta }}</RouterLink>
      </div>
    </div>
    <img :src="wave" class="c-hero__wave" alt="" />
    <img :src="circle" class="c-hero__decor" alt="" />
  </section>

  <section class="l-stack py-2xl">
    <div class="l-grid-3">
      <article v-for="(f, i) in copy.features" :key="i" class="c-feature-card animate-fade-up">
        <img :src="asset(f.icon)" class="c-feature-card__icon" alt="" />
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
