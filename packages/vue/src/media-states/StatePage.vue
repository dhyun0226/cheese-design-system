<script setup lang="ts">
import { useId } from "vue";
defineProps<{ title: string; description: string; busy?: boolean }>();
const id = useId();
</script>
<template>
  <section
    class="cheese-state-page"
    :aria-labelledby="id"
    :aria-busy="busy || undefined"
  >
    <div class="cheese-state-page-icon" aria-hidden="true">
      <slot name="icon" />
    </div>
    <div class="cheese-state-page-copy" role="status">
      <h2 :id="id">{{ title }}</h2>
      <p>{{ description }}</p>
    </div>
    <div v-if="$slots.default" class="cheese-state-page-actions"><slot /></div>
  </section>
</template>
