<script setup lang="ts">
import { computed, ref, useId } from "vue";
import Button from "../Button.vue";
import Textarea from "../Textarea.vue";
import type { CommentComposerProps } from "./types";

const props = withDefaults(defineProps<CommentComposerProps>(), {
  label: "댓글 작성",
  defaultValue: "",
  placeholder: "의견을 입력해 주세요.",
  submitLabel: "등록",
  maxLength: 5000,
  disabled: false,
});
const id = useId();
const draft = ref(props.defaultValue);
const pending = ref(false);
const error = ref("");
const status = ref("");
const limit = computed(() => Math.max(1, props.maxLength));
function updateDraft(value: string | undefined) {
  draft.value = value ?? "";
  error.value = "";
  status.value = "";
}
async function submit() {
  if (props.disabled || pending.value) return;
  const submitted = draft.value;
  const body = submitted.trim();
  if (!body) {
    error.value = "내용을 입력해 주세요.";
    return;
  }
  if (body.length > limit.value) {
    error.value = `${limit.value}자 이내로 입력해 주세요.`;
    return;
  }
  pending.value = true;
  error.value = "";
  status.value = "";
  try {
    await props.onSubmit(body);
    if (draft.value === submitted) draft.value = "";
    status.value = "등록되었습니다.";
  } catch {
    error.value =
      "저장하지 못했습니다. 작성한 내용은 유지됩니다. 다시 시도해 주세요.";
  } finally {
    pending.value = false;
  }
}
function keydown(event: KeyboardEvent) {
  if (
    (event.ctrlKey || event.metaKey) &&
    event.key === "Enter" &&
    !event.isComposing
  ) {
    event.preventDefault();
    void submit();
  }
}
</script>

<template>
  <div class="cheese-comment-composer cheese-root" :aria-busy="pending">
    <label class="cheese-label" :for="id">{{ label }}</label>
    <Textarea
      :id="id"
      :model-value="draft"
      :rows="3"
      :placeholder="placeholder"
      :maxlength="limit"
      :disabled="disabled || pending"
      :aria-invalid="!!error || undefined"
      :aria-describedby="`${id}-hint${error ? ` ${id}-error` : ''}`"
      @update:model-value="updateDraft"
      @keydown="keydown"
    />
    <p
      v-if="error"
      :id="`${id}-error`"
      class="cheese-collaboration-error"
      role="alert"
    >
      {{ error }}
    </p>
    <div class="cheese-comment-composer-footer">
      <span :id="`${id}-hint`" class="cheese-comment-hint"
        >{{ draft.length.toLocaleString() }} /
        {{ limit.toLocaleString() }}자</span
      >
      <div class="cheese-comment-actions">
        <Button
          v-if="onCancel"
          variant="ghost"
          size="sm"
          :disabled="pending"
          @click="onCancel"
          >취소</Button
        ><Button
          size="sm"
          :loading="pending"
          :disabled="disabled"
          @click="submit"
          >{{ submitLabel }}</Button
        >
      </div>
    </div>
    <span class="cheese-comment-status" role="status" aria-live="polite">{{
      status
    }}</span>
  </div>
</template>
