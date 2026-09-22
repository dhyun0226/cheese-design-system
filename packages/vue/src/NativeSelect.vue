<script setup lang="ts">
defineOptions({ inheritAttrs: false });
const model = defineModel<string>();
</script>
<template>
  <select v-model="model" v-bind="$attrs" class="cheese-input cheese-select">
    <slot />
  </select>
</template>
