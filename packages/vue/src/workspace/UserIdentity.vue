<script setup lang="ts">
import { computed } from "vue";
import { AvatarFallback, AvatarImage } from "reka-ui";
import { AvatarRoot } from "../styled";

const props = withDefaults(
  defineProps<{
    name: string;
    description?: string;
    src?: string;
    fallback?: string;
    size?: "sm" | "md" | "lg";
  }>(),
  { size: "md" },
);

const initials = computed(() =>
  props.name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => Array.from(part)[0])
    .join(""),
);
</script>

<template>
  <div class="cheese-user-identity" :data-size="size">
    <span class="cheese-user-identity-avatar" aria-hidden="true">
      <AvatarRoot>
        <AvatarImage v-if="src" :src="src" alt="" />
        <AvatarFallback>{{ fallback ?? initials }}</AvatarFallback>
      </AvatarRoot>
    </span>
    <span class="cheese-user-identity-copy">
      <strong class="cheese-user-identity-name">{{ name }}</strong>
      <span v-if="description" class="cheese-user-identity-description">
        {{ description }}
      </span>
    </span>
  </div>
</template>
