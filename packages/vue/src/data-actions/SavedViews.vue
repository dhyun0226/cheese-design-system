<script setup lang="ts">
import { computed, onBeforeUnmount, ref, useId } from "vue";
import Button from "../Button.vue";
import Input from "../Input.vue";
import Select from "../Select.vue";
import type { SavedView } from "./types";

const props = withDefaults(
  defineProps<{
    views: SavedView[];
    modelValue?: string;
    save: (label: string) => Promise<void> | void;
    remove?: (id: string) => Promise<void> | void;
    disabled?: boolean;
    label?: string;
  }>(),
  { label: "저장된 보기" },
);
const emit = defineEmits<{ "update:modelValue": [id: string] }>();
const id = useId();
const name = ref("");
const busy = ref(false);
const error = ref("");
const message = ref("");
const removePending = ref<string>();
let composing = false;
let mounted = true;
onBeforeUnmount(() => {
  mounted = false;
});
const selected = computed(() =>
  props.views.find((view) => view.id === props.modelValue),
);
const validName = computed(() => {
  const value = name.value.trim();
  return (
    value.length > 0 &&
    value.length <= 80 &&
    !props.views.some(
      (view) =>
        view.label.trim().toLocaleLowerCase() === value.toLocaleLowerCase(),
    )
  );
});
function choose(value: string) {
  if (
    props.disabled ||
    busy.value ||
    !props.views.some((view) => view.id === value)
  )
    return;
  removePending.value = undefined;
  error.value = "";
  message.value = "";
  emit("update:modelValue", value);
}
function keydown(event: KeyboardEvent) {
  if (event.key !== "Enter") return;
  event.preventDefault();
  if (composing || event.isComposing || event.keyCode === 229) return;
  void saveView();
}
function compositionstart() {
  composing = true;
}
function compositionend() {
  composing = false;
}
async function saveView() {
  if (props.disabled || busy.value || !validName.value) return;
  const label = name.value.trim();
  busy.value = true;
  error.value = "";
  message.value = "";
  removePending.value = undefined;
  try {
    await props.save(label);
    if (!mounted) return;
    name.value = "";
    message.value = `‘${label}’ 보기를 저장했습니다.`;
  } catch {
    if (mounted)
      error.value =
        "보기를 저장하지 못했습니다. 입력한 이름은 유지됩니다. 다시 시도해 주세요.";
  } finally {
    if (mounted) busy.value = false;
  }
}
async function removeView() {
  const pending = removePending.value;
  const action = props.remove;
  if (
    !pending ||
    !action ||
    props.disabled ||
    busy.value ||
    !props.views.some((view) => view.id === pending)
  )
    return;
  busy.value = true;
  error.value = "";
  message.value = "";
  try {
    await action(pending);
    if (!mounted) return;
    if (props.modelValue === pending) emit("update:modelValue", "");
    removePending.value = undefined;
    message.value = "저장된 보기를 삭제했습니다.";
  } catch {
    if (mounted)
      error.value = "보기를 삭제하지 못했습니다. 다시 시도해 주세요.";
  } finally {
    if (mounted) busy.value = false;
  }
}
</script>

<template>
  <section
    class="cheese-data-actions cheese-data-actions-stack"
    :aria-label="label"
    :aria-busy="busy || undefined"
  >
    <div class="cheese-data-actions-toolbar">
      <Select
        :label="label"
        :model-value="selected?.id ?? ''"
        :options="views.map((view) => ({ value: view.id, label: view.label }))"
        :disabled="disabled || busy || !views.length"
        placeholder="저장된 보기 선택"
        @update:model-value="choose"
      />
      <Button
        v-if="remove"
        variant="ghost"
        :disabled="disabled || busy || !selected"
        @click="removePending = selected?.id"
        >선택한 보기 삭제</Button
      >
    </div>
    <div
      v-if="removePending && views.some((view) => view.id === removePending)"
      class="cheese-data-actions-result"
      role="group"
      aria-label="저장된 보기 삭제 확인"
    >
      <p>
        ‘{{ views.find((view) => view.id === removePending)?.label }}’ 보기를
        삭제할까요? 원본 데이터는 삭제되지 않습니다.
      </p>
      <div class="cheese-data-actions-toolbar">
        <Button
          variant="weak"
          :disabled="busy"
          @click="removePending = undefined"
          >취소</Button
        >
        <Button
          variant="critical"
          :disabled="disabled || busy"
          @click="removeView"
          >보기 삭제</Button
        >
      </div>
    </div>
    <div class="cheese-data-actions-toolbar">
      <div class="cheese-field">
        <label class="cheese-label" :for="`${id}-name`">새 보기 이름</label>
        <Input
          :id="`${id}-name`"
          :model-value="name"
          :disabled="disabled || busy"
          maxlength="80"
          :aria-describedby="`${id}-hint`"
          @update:model-value="name = String($event ?? '')"
          @compositionstart="compositionstart"
          @compositionend="compositionend"
          @keydown="keydown"
        />
      </div>
      <Button
        variant="weak"
        :disabled="disabled || busy || !validName"
        @click="saveView"
        >현재 조건 저장</Button
      >
    </div>
    <p :id="`${id}-hint`" class="cheese-data-actions-muted">
      다른 보기와 겹치지 않는 이름을 입력해 주세요. 검색·정렬 등 실제 조건의
      저장과 복원은 연결한 서비스에서 처리합니다.
    </p>
    <p v-if="error" class="cheese-data-actions-error" role="alert">
      {{ error }}
    </p>
    <p v-if="message" class="cheese-data-actions-status" role="status">
      {{ message }}
    </p>
  </section>
</template>
