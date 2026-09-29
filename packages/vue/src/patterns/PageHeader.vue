<script setup lang="ts">
defineProps<{
  eyebrow?: string;
  title: string;
  description?: string;
  headingLevel?: 1 | 2 | 3 | 4 | 5 | 6;
}>();

defineSlots<{
  actions?(): unknown;
}>();
</script>

<template>
  <header class="cheese-page-header">
    <div class="cheese-page-header-copy">
      <p v-if="eyebrow" class="cheese-page-eyebrow">{{ eyebrow }}</p>
      <component :is="`h${headingLevel ?? 1}`">{{ title }}</component>
      <p v-if="description" class="cheese-page-description">
        {{ description }}
      </p>
    </div>
    <div v-if="$slots.actions" class="cheese-page-actions">
      <slot name="actions" />
    </div>
  </header>
</template>
