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
  tabs?(): unknown;
  default?(): unknown;
  aside?(): unknown;
  footer?(): unknown;
}>();
</script>

<template>
  <div class="cheese-page-template cheese-detail-page">
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
    <div v-if="$slots.tabs" class="cheese-page-tabs">
      <slot name="tabs" />
    </div>
    <div
      class="cheese-detail-page-body"
      :data-has-aside="$slots.aside ? '' : undefined"
    >
      <div class="cheese-page-content"><slot /></div>
      <div v-if="$slots.aside" class="cheese-detail-page-aside">
        <slot name="aside" />
      </div>
    </div>
    <div v-if="$slots.footer" class="cheese-page-footer">
      <slot name="footer" />
    </div>
  </div>
</template>
