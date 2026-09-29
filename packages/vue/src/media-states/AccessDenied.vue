<script setup lang="ts">
import { LockKeyhole } from "@lucide/vue";
import Button from "../Button.vue";
import StatePage from "./StatePage.vue";
withDefaults(
  defineProps<{
    title?: string;
    description?: string;
    actionLabel?: string;
    actionable?: boolean;
  }>(),
  {
    title: "접근 권한이 없습니다",
    description:
      "이 화면을 보려면 필요한 권한이 있어야 합니다. 관리자에게 문의해 주세요.",
    actionLabel: "이전 화면으로",
  },
);
const emit = defineEmits<{ action: [] }>();
</script>
<template>
  <StatePage :title="title" :description="description">
    <template #icon><LockKeyhole :size="28" /></template>
    <template v-if="$slots.actions || actionable" #default
      ><slot name="actions"
        ><Button v-if="actionable" variant="weak" @click="emit('action')">{{
          actionLabel
        }}</Button></slot
      ></template
    >
  </StatePage>
</template>
