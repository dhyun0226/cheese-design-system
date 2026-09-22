<script setup lang="ts">
defineOptions({ inheritAttrs: false });
const model = defineModel<string>();
</script>
<template>
  <textarea
    v-model="model"
    v-bind="$attrs"
    class="cheese-input cheese-textarea"
  >
<slot /></textarea>
</template>
