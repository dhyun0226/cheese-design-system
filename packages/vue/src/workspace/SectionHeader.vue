<script setup lang="ts">
withDefaults(
  defineProps<{
    title: string;
    description?: string;
    headingLevel?: 1 | 2 | 3 | 4 | 5 | 6;
  }>(),
  { headingLevel: 2 },
);

defineSlots<{
  title?(): unknown;
  description?(): unknown;
  actions?(): unknown;
}>();
</script>

<template>
  <header class="cheese-section-header">
    <div class="cheese-section-header-copy">
      <component :is="`h${headingLevel}`" class="cheese-section-header-title">
        <slot name="title">{{ title }}</slot>
      </component>
      <p
        v-if="description || $slots.description"
        class="cheese-section-header-description"
      >
        <slot name="description">{{ description }}</slot>
      </p>
    </div>
    <div v-if="$slots.actions" class="cheese-section-header-actions">
      <slot name="actions" />
    </div>
  </header>
</template>
