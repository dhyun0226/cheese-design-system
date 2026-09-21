<script setup lang="ts">
withDefaults(defineProps<{ variant?: 'primary' | 'accent' | 'weak' | 'critical'; type?: 'button' | 'submit' | 'reset'; disabled?: boolean }>(), {
  variant: 'primary',
  type: 'button',
  disabled: false,
})
</script>

<template>
  <button class="cheese-button" :data-variant="variant" :type="type" :disabled="disabled"><slot /></button>
</template>
