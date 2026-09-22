<script setup lang="ts">
import {
  computed,
  getCurrentInstance,
  nextTick,
  onBeforeUnmount,
  ref,
  useId,
  watch,
} from "vue";
import { Search, X } from "@lucide/vue";

defineOptions({ inheritAttrs: false });
const props = defineProps<{
  label: string;
  modelValue?: string;
  defaultValue?: string;
  clearLabel?: string;
  description?: string;
  error?: string;
  name?: string;
  form?: string;
  id?: string;
  disabled?: boolean;
  readOnly?: boolean;
  required?: boolean;
}>();
const emit = defineEmits<{
  "update:modelValue": [value: string];
  /** Handles Enter instead of submitting the surrounding form. */
  search: [value: string];
  keydown: [event: KeyboardEvent];
  compositionstart: [event: CompositionEvent];
  compositionend: [event: CompositionEvent];
}>();
const instance = getCurrentInstance();
const autoId = useId();
const id = computed(() => props.id ?? autoId);
const input = ref<HTMLInputElement>();
const local = ref(props.defaultValue ?? "");
const current = computed(() =>
  props.modelValue === undefined ? local.value : props.modelValue,
);
const hint = computed(() => props.error || props.description);
let composing = false;
watch(
  [input, () => props.error, () => props.disabled, () => props.readOnly],
  () =>
    input.value?.setCustomValidity(
      props.disabled || props.readOnly ? "" : props.error || "",
    ),
  { flush: "post" },
);
let timer: ReturnType<typeof setTimeout> | undefined;
watch(
  [input, () => props.form],
  (_, __, cleanup) => {
    const owner = input.value?.form;
    if (!owner) return;
    const reset = (event: Event) => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        if (event.defaultPrevented) return;
        composing = false;
        if (props.modelValue === undefined) {
          local.value = props.defaultValue ?? "";
          emit("update:modelValue", local.value);
        }
        if (input.value) input.value.value = current.value;
      }, 0);
    };
    owner.addEventListener("reset", reset);
    cleanup(() => {
      owner.removeEventListener("reset", reset);
      clearTimeout(timer);
    });
  },
  { flush: "post" },
);
onBeforeUnmount(() => clearTimeout(timer));
function update(next: string) {
  if (props.disabled || props.readOnly) return;
  if (props.modelValue === undefined) local.value = next;
  emit("update:modelValue", next);
  void nextTick(() => {
    // Owners may reject or normalize an edit without Vue patching this input.
    if (input.value && input.value.value !== current.value)
      input.value.value = current.value;
  });
}
function clear() {
  update("");
  input.value?.focus();
}
function keydown(event: KeyboardEvent) {
  emit("keydown", event);
  if (event.defaultPrevented || props.disabled) return;
  const isComposing = composing || event.isComposing || event.keyCode === 229;
  // Declared emits are not in $attrs; inspect the current vnode listener.
  const hasSearch = !!(
    instance?.vnode.props?.onSearch || instance?.vnode.props?.onSearchOnce
  );
  if (event.key === "Enter" && hasSearch) {
    event.preventDefault();
    if (!isComposing && input.value?.reportValidity())
      emit("search", current.value);
  } else if (
    event.key === "Escape" &&
    !isComposing &&
    !props.readOnly &&
    current.value
  ) {
    event.preventDefault();
    clear();
  }
}
function compositionstart(event: CompositionEvent) {
  composing = true;
  emit("compositionstart", event);
}
function compositionend(event: CompositionEvent) {
  composing = false;
  emit("compositionend", event);
}
defineExpose({ input, focus: () => input.value?.focus() });
</script>

<template>
  <div class="cheese-field cheese-search-field">
    <label :for="id" class="cheese-label">
      {{ label }}<span v-if="required" aria-hidden="true"> *</span>
    </label>
    <div class="cheese-search-input-control">
      <Search class="cheese-search-input-icon" :size="18" aria-hidden="true" />
      <input
        v-bind="$attrs"
        :id="id"
        ref="input"
        :name="name"
        :form="form"
        type="search"
        :value="current"
        :disabled="disabled"
        :readonly="readOnly"
        :required="required"
        class="cheese-input cheese-search-input"
        :aria-invalid="
          error
            ? true
            : ($attrs['aria-invalid'] as boolean | 'true' | 'false' | undefined)
        "
        :aria-describedby="
          [$attrs['aria-describedby'], hint ? `${id}-hint` : undefined]
            .filter(Boolean)
            .join(' ') || undefined
        "
        @input="update(($event.target as HTMLInputElement).value)"
        @keydown="keydown"
        @compositionstart="compositionstart"
        @compositionend="compositionend"
      />
      <button
        v-if="current && !disabled && !readOnly"
        type="button"
        class="cheese-field-action cheese-search-input-clear"
        :aria-label="clearLabel ?? `${label} 지우기`"
        @click="clear"
      >
        <X :size="16" aria-hidden="true" />
      </button>
    </div>
    <p
      v-if="hint"
      :id="`${id}-hint`"
      class="cheese-help"
      :data-error="!!error"
      :role="error ? 'alert' : undefined"
    >
      {{ hint }}
    </p>
  </div>
</template>
