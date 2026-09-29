<script setup lang="ts">
import { Card } from "../styled";

defineProps<{
  label: string;
  value?: string | number;
  description?: string;
}>();

defineSlots<{
  value?(): unknown;
  description?(): unknown;
}>();
</script>

<template>
  <Card class="cheese-stat-card">
    <p class="cheese-stat-label">{{ label }}</p>
    <p class="cheese-stat-value">
      <slot name="value">{{ value }}</slot>
    </p>
    <p v-if="description || $slots.description" class="cheese-stat-description">
      <slot name="description">{{ description }}</slot>
    </p>
  </Card>
</template>
