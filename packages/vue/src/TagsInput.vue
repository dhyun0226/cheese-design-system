<script setup lang="ts">
import { ref, useId, watch } from "vue";
import { X } from "@lucide/vue";
import { useFieldModel } from "./fieldModel";
const props = withDefaults(
  defineProps<{
    label: string;
    modelValue?: string[];
    defaultValue?: string[];
    max?: number;
    name?: string;
    disabled?: boolean;
    placeholder?: string;
  }>(),
  { max: 10, placeholder: "입력 후 Enter" },
);
const emit = defineEmits<{ "update:modelValue": [value: string[]] }>();
const { root, value } = useFieldModel(
  () => props.modelValue,
  () => props.defaultValue ?? [],
  (v) => emit("update:modelValue", v),
);
const id = useId(),
  draft = ref(""),
  message = ref(""),
  input = ref<HTMLInputElement>();
watch(root, (node, _, cleanup) => {
  const form = node?.closest("form");
  const timers = new Set<ReturnType<typeof setTimeout>>();
  const reset = (event: Event) => {
    const timer = setTimeout(() => {
      timers.delete(timer);
      if (event.defaultPrevented) return;
      draft.value = "";
      message.value = "";
    }, 0);
    timers.add(timer);
  };
  form?.addEventListener("reset", reset);
  cleanup(() => {
    form?.removeEventListener("reset", reset);
    timers.forEach(clearTimeout);
  });
});
function remove(tag: string) {
  value.value = value.value.filter((t) => t !== tag);
  message.value = tag + " 삭제됨";
  input.value?.focus();
}
function key(event: KeyboardEvent) {
  if (event.isComposing) return;
  if (event.key === "Enter" || event.key === ",") {
    event.preventDefault();
    const tag = draft.value.trim();
    if (!tag) return;
    if (value.value.includes(tag)) {
      message.value = "이미 추가된 태그입니다.";
      return;
    }
    if (value.value.length >= props.max) {
      message.value = `최대 ${props.max}개까지 추가할 수 있습니다.`;
      return;
    }
    value.value = [...value.value, tag];
    draft.value = "";
    message.value = tag + " 추가됨";
  } else if (event.key === "Backspace" && !draft.value && value.value.length) {
    event.preventDefault();
    remove(value.value[value.value.length - 1]);
  }
}
</script>
<template>
  <div ref="root" class="cheese-field">
    <label :for="id" class="cheese-label">{{ label }}</label>
    <div class="cheese-tags" :data-disabled="disabled || undefined">
      <span v-for="tag in value" :key="tag" class="cheese-tag"
        >{{ tag
        }}<button
          type="button"
          :disabled="disabled"
          :aria-label="tag + ' 삭제'"
          @click="remove(tag)"
        >
          <X :size="14" aria-hidden="true" /></button
        ><input
          v-if="name"
          type="hidden"
          :name="name"
          :value="tag"
          :disabled="disabled" /></span
      ><input
        ref="input"
        :id="id"
        v-model="draft"
        :disabled="disabled"
        :placeholder="placeholder"
        :aria-describedby="id + '-help'"
        @keydown="key"
      />
    </div>
    <p :id="id + '-help'" class="cheese-help">
      Enter로 추가 · 빈 입력에서 Backspace로 삭제 · 최대 {{ max }}개
    </p>
    <span role="status" class="cheese-help">{{ message }}</span>
  </div>
</template>
