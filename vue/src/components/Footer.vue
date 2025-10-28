<template>
  <footer class="c-footer">
    <div class="c-footer__inner">
      <div class="c-footer__legal">{{ yearText }}</div>
      <nav class="c-footer__links" aria-label="Footer">
        <a class="c-footer__link" href="#">{{ copy.footer.privacy }}</a>
        <a class="c-footer__link" href="#">{{ copy.footer.terms }}</a>
        <a class="c-footer__link" href="#">{{ copy.footer.help }}</a>
      </nav>
      <p class="c-footer__note">{{ copy.footer.note }}</p>
    </div>
  </footer>
</template>
<script setup lang="ts">
import copy from '../../../packages/assets/copy/global.json'
const yearText = copy.footer.copyright.replace('{year}', String(new Date().getFullYear()))
</script>
