<script setup lang="ts">
import { computed, useId } from "vue";
import { GripVertical } from "@lucide/vue";
import { useFieldModel } from "./fieldModel";
const props = withDefaults(
  defineProps<{
    label: string;
    modelValue?: number;
    defaultValue?: number;
    min?: number;
    max?: number;
    disabled?: boolean;
  }>(),
  { min: 20, max: 80, defaultValue: 40 },
);
const emit = defineEmits<{ "update:modelValue": [value: number] }>();
const { root, value } = useFieldModel(
    () => props.modelValue,
    () => props.defaultValue,
    (v) => emit("update:modelValue", v),
  ),
  id = useId();
const low = computed(() => Math.max(0, Math.min(props.min, 100))),
  high = computed(() => Math.max(low.value, Math.min(props.max, 100)));
const clamp = (n: number) => Math.max(low.value, Math.min(high.value, n)),
  current = computed(() => clamp(value.value));
function down(event: PointerEvent) {
  if (props.disabled || event.button !== 0) return;
  event.preventDefault();
  const el = event.currentTarget as HTMLElement;
  el.focus();
  el.setPointerCapture(event.pointerId);
}
function move(event: PointerEvent) {
  if (
    props.disabled ||
    !(event.currentTarget as HTMLElement).hasPointerCapture(event.pointerId)
  )
    return;
  const box = root.value?.getBoundingClientRect();
  if (box?.width)
    value.value = clamp(
      Math.round(((event.clientX - box.left) / box.width) * 100),
    );
}
function up(event: PointerEvent) {
  const el = event.currentTarget as HTMLElement;
  if (el.hasPointerCapture(event.pointerId))
    el.releasePointerCapture(event.pointerId);
}
function key(event: KeyboardEvent) {
  if (props.disabled) return;
  if (["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) {
    event.preventDefault();
    value.value =
      event.key === "Home"
        ? low.value
        : event.key === "End"
          ? high.value
          : clamp(
              current.value +
                (event.key === "ArrowLeft" ? -1 : 1) *
                  (event.shiftKey ? 10 : 2),
            );
  }
}
</script>
<template>
  <div ref="root" class="cheese-splitter" :style="{ '--split': current + '%' }">
    <div :id="id" class="cheese-splitter-panel"><slot name="first" /></div>
    <div
      role="separator"
      :tabindex="disabled ? -1 : 0"
      :aria-label="label"
      aria-orientation="vertical"
      :aria-controls="id"
      :aria-valuemin="low"
      :aria-valuemax="high"
      :aria-valuenow="current"
      :aria-valuetext="`첫 패널 ${current}%`"
      :aria-disabled="disabled || undefined"
      class="cheese-splitter-handle"
      @pointerdown="down"
      @pointermove="move"
      @pointerup="up"
      @keydown="key"
    >
      <GripVertical :size="16" aria-hidden="true" />
    </div>
    <div class="cheese-splitter-panel"><slot name="second" /></div>
  </div>
</template>
