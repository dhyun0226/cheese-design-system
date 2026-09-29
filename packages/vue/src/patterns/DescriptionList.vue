<script setup lang="ts">
defineProps<{
  items: readonly { label: string; value: string }[];
}>();
</script>

<template>
  <dl class="cheese-description-list">
    <div v-for="(item, index) in items" :key="index">
      <dt>{{ item.label }}</dt>
      <dd>{{ item.value }}</dd>
    </div>
  </dl>
</template>
