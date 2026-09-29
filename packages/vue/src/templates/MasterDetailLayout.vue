<script setup lang="ts">
withDefaults(
  defineProps<{
    listLabel?: string;
    detailLabel?: string;
  }>(),
  { listLabel: "목록", detailLabel: "상세" },
);

defineSlots<{
  list?(): unknown;
  detail?(): unknown;
}>();
</script>

<template>
  <div class="cheese-master-detail">
    <div
      class="cheese-master-detail-list"
      role="region"
      :aria-label="listLabel"
    >
      <slot name="list" />
    </div>
    <div
      class="cheese-master-detail-detail"
      role="region"
      :aria-label="detailLabel"
    >
      <slot name="detail" />
    </div>
  </div>
</template>
