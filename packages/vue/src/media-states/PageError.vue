<script setup lang="ts">
import { CircleAlert } from "@lucide/vue";
import Button from "../Button.vue";
import StatePage from "./StatePage.vue";
withDefaults(
  defineProps<{
    title?: string;
    description?: string;
    retryLabel?: string;
    retryable?: boolean;
    busy?: boolean;
  }>(),
  {
    title: "화면을 불러오지 못했습니다",
    description:
      "잠시 후 다시 시도해 주세요. 문제가 계속되면 관리자에게 문의해 주세요.",
    retryLabel: "다시 시도",
  },
);
const emit = defineEmits<{ retry: [] }>();
</script>
<template>
  <StatePage :title="title" :description="description" :busy="busy">
    <template #icon><CircleAlert :size="28" /></template>
    <template v-if="$slots.actions || retryable" #default
      ><slot name="actions"
        ><Button
          v-if="retryable"
          variant="weak"
          :loading="busy"
          @click="emit('retry')"
          >{{ retryLabel }}</Button
        ></slot
      ></template
    >
  </StatePage>
</template>
