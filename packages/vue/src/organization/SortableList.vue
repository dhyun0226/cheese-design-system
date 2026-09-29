<script setup lang="ts" generic="T extends SortableListItem">
import { computed, nextTick, ref, useId } from "vue";
import { ArrowDown, ArrowUp, Lock } from "@lucide/vue";
import Button from "../Button.vue";
import type { SortableListItem } from "./types";
import { useFormLock } from "../form-state";

const props = defineProps<{
  label: string;
  items: T[];
  disabled?: boolean;
  description?: string;
}>();
const emit = defineEmits<{ "update:items": [value: T[]] }>();
const formLock = useFormLock();
const effectiveDisabled = computed(() => !!props.disabled || formLock.value);
const id = useId();
const root = ref<HTMLElement>();
const announcement = ref("");
function canMove(index: number, direction: -1 | 1) {
  const target = index + direction;
  return (
    !effectiveDisabled.value &&
    target >= 0 &&
    target < props.items.length &&
    !props.items[index]?.disabled &&
    !props.items[target]?.disabled
  );
}
async function move(itemId: string, direction: -1 | 1) {
  const index = props.items.findIndex((item) => item.id === itemId);
  if (index < 0 || !canMove(index, direction)) return;
  const next = [...props.items];
  const target = index + direction;
  [next[index], next[target]] = [next[target]!, next[index]!];
  emit("update:items", next);
  await nextTick();
  const actualIndex = props.items.findIndex((item) => item.id === itemId);
  // The consumer owns this state; announce only an accepted reorder.
  if (actualIndex !== target) return;
  root.value?.querySelectorAll<HTMLElement>("[data-sort-id]").forEach((row) => {
    if (row.dataset.sortId === itemId) row.focus();
  });
  announcement.value = `${props.items[target]!.label}, ${props.items.length}개 중 ${target + 1}번째로 이동했습니다.`;
}
function onKeydown(event: KeyboardEvent, itemId: string) {
  if (!event.altKey || (event.key !== "ArrowUp" && event.key !== "ArrowDown"))
    return;
  event.preventDefault();
  event.stopPropagation();
  void move(itemId, event.key === "ArrowUp" ? -1 : 1);
}
</script>

<template>
  <section class="cheese-sortable" :aria-labelledby="`${id}-label`">
    <h3 :id="`${id}-label`" class="cheese-label">{{ label }}</h3>
    <p :id="`${id}-hint`" class="cheese-org-hint">
      {{
        description ??
        "위·아래 버튼 또는 Alt + 방향키로 순서를 변경하세요. 고정된 항목을 넘어 이동할 수 없습니다."
      }}
    </p>
    <ol
      v-if="items.length"
      ref="root"
      class="cheese-sortable-list"
      :aria-label="label"
      :aria-describedby="`${id}-hint`"
    >
      <li
        v-for="(item, index) in items"
        :key="item.id"
        class="cheese-sortable-item"
        :data-sort-id="item.id"
        :data-disabled="effectiveDisabled || item.disabled || undefined"
        :tabindex="effectiveDisabled || item.disabled ? -1 : 0"
        :aria-label="`${item.label}, ${items.length}개 중 ${index + 1}번째${item.disabled ? ', 위치 고정' : ''}`"
        @keydown="onKeydown($event, item.id)"
      >
        <span class="cheese-sortable-index" aria-hidden="true">{{
          index + 1
        }}</span>
        <span class="cheese-sortable-copy"
          ><strong>{{ item.label }}</strong
          ><small v-if="item.description">{{ item.description }}</small
          ><small v-if="item.disabled"
            ><Lock :size="12" aria-hidden="true" /> 위치 고정</small
          ></span
        >
        <div class="cheese-sortable-controls">
          <Button
            variant="ghost"
            size="sm"
            :disabled="!canMove(index, -1)"
            :aria-label="`${item.label} 위로 이동`"
            @click="move(item.id, -1)"
            ><ArrowUp :size="16" aria-hidden="true"
          /></Button>
          <Button
            variant="ghost"
            size="sm"
            :disabled="!canMove(index, 1)"
            :aria-label="`${item.label} 아래로 이동`"
            @click="move(item.id, 1)"
            ><ArrowDown :size="16" aria-hidden="true"
          /></Button>
        </div>
      </li>
    </ol>
    <p v-else class="cheese-org-empty">정렬할 항목이 없습니다.</p>
    <span
      class="cheese-sr-only"
      role="status"
      aria-live="polite"
      aria-atomic="true"
      >{{ announcement }}</span
    >
  </section>
</template>
