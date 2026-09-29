<script setup lang="ts">
import { LogIn } from "@lucide/vue";
import Button from "../Button.vue";
import StatePage from "./StatePage.vue";
withDefaults(
  defineProps<{
    title?: string;
    description?: string;
    actionLabel?: string;
    actionable?: boolean;
    busy?: boolean;
  }>(),
  {
    title: "로그인이 만료되었습니다",
    description: "안전한 이용을 위해 다시 로그인해 주세요.",
    actionLabel: "다시 로그인",
  },
);
const emit = defineEmits<{ reauthenticate: [] }>();
</script>
<template>
  <StatePage :title="title" :description="description" :busy="busy">
    <template #icon><LogIn :size="28" /></template>
    <template v-if="$slots.actions || actionable" #default
      ><slot name="actions"
        ><Button
          v-if="actionable"
          :loading="busy"
          @click="emit('reauthenticate')"
          >{{ actionLabel }}</Button
        ></slot
      ></template
    >
  </StatePage>
</template>
