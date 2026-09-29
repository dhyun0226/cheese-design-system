<script setup lang="ts">
withDefaults(defineProps<{ columns?: 2 | 3 | 4 }>(), { columns: 3 });

defineSlots<{ default?(): unknown }>();
</script>

<template>
  <div class="cheese-stat-group" :data-columns="columns"><slot /></div>
</template>
