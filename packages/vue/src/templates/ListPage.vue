<script setup lang="ts">
import PageHeader from "../patterns/PageHeader.vue";

withDefaults(
  defineProps<{
    title: string;
    eyebrow?: string;
    description?: string;
    headingLevel?: 1 | 2 | 3 | 4 | 5 | 6;
  }>(),
  { headingLevel: 1 },
);

defineSlots<{
  actions?(): unknown;
  summary?(): unknown;
  filters?(): unknown;
  toolbar?(): unknown;
  default?(): unknown;
  pagination?(): unknown;
}>();
</script>

<template>
  <div class="cheese-page-template cheese-list-page">
    <PageHeader
      :title="title"
      :eyebrow="eyebrow"
      :description="description"
      :heading-level="headingLevel"
    >
      <template v-if="$slots.actions" #actions
        ><slot name="actions"
      /></template>
    </PageHeader>
    <div v-if="$slots.summary" class="cheese-page-summary">
      <slot name="summary" />
    </div>
    <div v-if="$slots.filters" class="cheese-page-filters">
      <slot name="filters" />
    </div>
    <div v-if="$slots.toolbar" class="cheese-page-toolbar">
      <slot name="toolbar" />
    </div>
    <div class="cheese-page-content"><slot /></div>
    <div v-if="$slots.pagination" class="cheese-page-pagination">
      <slot name="pagination" />
    </div>
  </div>
</template>
