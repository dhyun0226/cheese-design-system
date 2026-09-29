<script setup lang="ts">
withDefaults(defineProps<{ columns?: 1 | 2 | 3 }>(), { columns: 2 });
defineSlots<{ default?(): unknown }>();
</script>

<template>
  <div class="cheese-form-grid" :data-columns="columns"><slot /></div>
</template>
