<script setup lang="ts">
import {
  Circle,
  CircleAlert,
  CircleCheck,
  CircleDot,
  LoaderCircle,
} from "@lucide/vue";
import Button from "../Button.vue";

defineProps<{
  status: "idle" | "dirty" | "saving" | "saved" | "error";
  label?: string;
  retryable?: boolean;
}>();

const emit = defineEmits<{
  retry: [];
}>();

const labels = {
  idle: "저장할 변경 사항이 없습니다",
  dirty: "저장하지 않은 변경 사항",
  saving: "저장 중",
  saved: "저장됨",
  error: "저장에 실패했습니다",
};

const icons = {
  idle: Circle,
  dirty: CircleDot,
  saving: LoaderCircle,
  saved: CircleCheck,
  error: CircleAlert,
};
</script>

<template>
  <div
    class="cheese-save-status"
    :data-status="status"
    role="status"
    aria-live="polite"
    aria-atomic="true"
  >
    <component :is="icons[status]" :size="16" aria-hidden="true" />
    <span>{{ label ?? labels[status] }}</span>
    <Button
      v-if="status === 'error' && retryable"
      variant="ghost"
      size="sm"
      @click="emit('retry')"
    >
      다시 시도
    </Button>
  </div>
</template>
