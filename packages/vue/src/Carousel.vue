<script setup lang="ts">
import { computed, useId } from "vue";
import { ChevronLeft, ChevronRight } from "@lucide/vue";
import { useFieldModel } from "./fieldModel";
const props = defineProps<{
  label: string;
  count: number;
  modelValue?: number;
  defaultValue?: number;
}>();
const emit = defineEmits<{ "update:modelValue": [value: number] }>();
const { root, value } = useFieldModel(
    () => props.modelValue,
    () => props.defaultValue ?? 0,
    (v) => emit("update:modelValue", v),
  ),
  id = useId();
const index = computed(() =>
  Math.max(0, Math.min(value.value, props.count - 1)),
);
defineSlots<{ default: (props: { index: number }) => unknown }>();
</script>
<template>
  <div
    ref="root"
    class="cheese-carousel"
    role="region"
    aria-roledescription="캐러셀"
    :aria-label="label"
  >
    <div class="cheese-carousel-controls">
      <button
        type="button"
        class="cheese-icon-button"
        aria-label="이전 슬라이드"
        :aria-controls="id"
        :disabled="index === 0 || !count"
        @click="value = index - 1"
      >
        <ChevronLeft :size="18" /></button
      ><span class="cheese-help" aria-live="polite"
        >{{ count ? index + 1 : 0 }} / {{ count }}</span
      ><button
        type="button"
        class="cheese-icon-button"
        aria-label="다음 슬라이드"
        :aria-controls="id"
        :disabled="index >= count - 1"
        @click="value = index + 1"
      >
        <ChevronRight :size="18" />
      </button>
    </div>
    <div :id="id" class="cheese-carousel-viewport">
      <div
        v-if="count"
        role="group"
        aria-roledescription="슬라이드"
        :aria-label="`${count}개 중 ${index + 1}`"
      >
        <slot :index="index" />
      </div>
      <p v-else class="cheese-help">표시할 콘텐츠가 없습니다.</p>
    </div>
    <div class="cheese-carousel-dots">
      <button
        v-for="n in count"
        :key="n"
        type="button"
        :aria-label="`${n}번 슬라이드로 이동`"
        :aria-current="n - 1 === index ? 'true' : undefined"
        class="cheese-carousel-dot"
        @click="value = n - 1"
      >
        <span />
      </button>
    </div>
  </div>
</template>
