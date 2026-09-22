<script setup lang="ts">
withDefaults(
  defineProps<{
    variant?: "primary" | "accent" | "weak" | "ghost" | "critical";
    size?: "sm" | "md" | "lg";
    loading?: boolean;
    type?: "button" | "submit" | "reset";
    disabled?: boolean;
  }>(),
  {
    variant: "primary",
    type: "button",
    disabled: false,
  },
);
</script>

<template>
  <button
    class="cheese-button"
    :data-variant="variant"
    :data-size="size || 'md'"
    :type="type"
    :disabled="disabled || loading"
    :aria-busy="loading || undefined"
  >
    <slot /><span v-if="loading" aria-hidden="true">…</span>
  </button>
</template>
