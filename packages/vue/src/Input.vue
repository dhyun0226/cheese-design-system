<script setup lang="ts">
defineOptions({ inheritAttrs: false });
const model = defineModel<string | number>();
</script>

<template>
  <input v-model="model" class="cheese-input" v-bind="$attrs" />
</template>
