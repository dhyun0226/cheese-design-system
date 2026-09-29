<script setup lang="ts">
import Button from "../Button.vue";
import type { BulkAction, BulkActionResult } from "./types";

defineProps<{
  selectedCount: number;
  actions: BulkAction[];
  busy?: boolean;
  result?: BulkActionResult;
  retryable?: boolean;
}>();
const emit = defineEmits<{
  action: [id: string];
  clear: [];
  retry: [];
}>();
</script>

<template>
  <div
    v-if="selectedCount || busy || result"
    class="cheese-bulk-action-bar"
    role="group"
    aria-label="선택 항목 작업"
    :aria-busy="busy || undefined"
  >
    <p class="cheese-bulk-summary" role="status" aria-atomic="true">
      <strong>{{ selectedCount }}건 선택</strong
      ><span v-if="busy"> · 처리 중</span>
    </p>
    <div class="cheese-bulk-actions">
      <Button
        v-for="action in actions"
        :key="action.id"
        size="sm"
        variant="weak"
        :disabled="busy || !selectedCount || action.disabled"
        @click="emit('action', action.id)"
        >{{ action.label }}</Button
      >
      <Button
        v-if="selectedCount > 0"
        size="sm"
        variant="ghost"
        :disabled="busy || !selectedCount"
        @click="emit('clear')"
      >
        선택 해제
      </Button>
      <Button
        v-if="result?.failed && retryable"
        size="sm"
        variant="weak"
        :disabled="busy"
        @click="emit('retry')"
      >
        실패 항목 다시 시도
      </Button>
    </div>
    <p
      v-if="result"
      class="cheese-bulk-result"
      role="status"
      aria-atomic="true"
    >
      {{ result.succeeded }}건 성공 · {{ result.failed }}건 실패
    </p>
  </div>
</template>
