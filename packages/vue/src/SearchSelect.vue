<script setup lang="ts">
import { ref, computed, watch, onMounted, onBeforeUnmount, useId } from "vue";
import { Search, X, Check, ChevronDown, RotateCcw } from "@lucide/vue";
import { useFieldModel, type ChoiceOption } from "./fieldModel";
import type { OptionsLoader } from "./business";
export interface SearchSelectProps {
  label: string;
  options?: ChoiceOption[];
  loadOptions?: OptionsLoader;
  modelValue?: ChoiceOption[];
  defaultValue?: ChoiceOption[];
  multiple?: boolean;
  name?: string;
  disabled?: boolean;
  required?: boolean;
  max?: number;
  debounceMs?: number;
  minLength?: number;
  placeholder?: string;
  error?: string;
}
const props = withDefaults(defineProps<SearchSelectProps>(), {
  multiple: true,
  max: 100,
  debounceMs: 250,
  minLength: 0,
  placeholder: "검색하여 선택",
});
const emit = defineEmits<{ "update:modelValue": [value: ChoiceOption[]] }>();
const { root, value: selected } = useFieldModel(
  () => props.modelValue,
  () => props.defaultValue ?? [],
  (value) => emit("update:modelValue", value),
);
const id = useId(),
  input = ref<HTMLInputElement>(),
  open = ref(false),
  query = ref(""),
  active = ref(-1),
  remote = ref<ChoiceOption[]>([]),
  loading = ref(false),
  failure = ref(false),
  retry = ref(0),
  composing = ref(false),
  invalid = ref(false);
let sequence = 0;
watch(
  [
    query,
    open,
    () => props.disabled,
    composing,
    () => props.loadOptions,
    () => props.debounceMs,
    () => props.minLength,
    retry,
  ],
  (_, __, cleanup) => {
    const ticket = ++sequence,
      controller = new AbortController();
    active.value = -1;
    failure.value = false;
    remote.value = [];
    if (
      !props.loadOptions ||
      !open.value ||
      props.disabled ||
      composing.value ||
      query.value.trim().length < props.minLength
    ) {
      loading.value = false;
      cleanup(() => controller.abort());
      return;
    }
    loading.value = true;
    const timer = setTimeout(
      () => {
        Promise.resolve()
          .then(() =>
            props.loadOptions!(query.value, { signal: controller.signal }),
          )
          .then((items) => {
            if (!controller.signal.aborted && sequence === ticket) {
              remote.value = [
                ...new Map(items.map((item) => [item.value, item])).values(),
              ];
              loading.value = false;
            }
          })
          .catch(() => {
            if (!controller.signal.aborted && sequence === ticket) {
              loading.value = false;
              failure.value = true;
            }
          });
      },
      Math.max(0, props.debounceMs),
    );
    cleanup(() => {
      clearTimeout(timer);
      controller.abort();
    });
  },
);
watch(
  () => props.disabled,
  (value) => {
    if (value) open.value = false;
  },
);
const results = computed(() =>
  props.loadOptions
    ? remote.value
    : (props.options ?? []).filter((item) =>
        item.label
          .toLocaleLowerCase()
          .includes(query.value.toLocaleLowerCase()),
      ),
);
const resultStatus = computed(() =>
  loading.value
    ? "검색 중…"
    : query.value.trim().length < props.minLength
      ? props.minLength + "자 이상 입력하세요."
      : results.value.length
        ? results.value.length + "개 결과"
        : "검색 결과가 없습니다.",
);
const has = (item: ChoiceOption) =>
  selected.value.some((value) => value.value === item.value);
const blocked = (item: ChoiceOption) =>
  !!item.disabled ||
  (props.multiple && selected.value.length >= props.max && !has(item));
function choose(item: ChoiceOption) {
  if (props.disabled || blocked(item)) return;
  selected.value = props.multiple
    ? has(item)
      ? selected.value.filter((value) => value.value !== item.value)
      : [...selected.value, item]
    : [item];
  invalid.value = false;
  query.value = "";
  if (!props.multiple) open.value = false;
  input.value?.focus();
}
function remove(key: string) {
  selected.value = selected.value.filter((item) => item.value !== key);
  input.value?.focus();
}
function outside(event: PointerEvent) {
  if (!root.value?.contains(event.target as Node)) open.value = false;
}
let form: HTMLFormElement | null | undefined;
const reset = (event: Event) =>
  queueMicrotask(() => {
    if (!event.defaultPrevented) {
      query.value = "";
      open.value = false;
      invalid.value = false;
    }
  });
onMounted(() => {
  document.addEventListener("pointerdown", outside);
  form = root.value?.closest("form");
  form?.addEventListener("reset", reset);
});
onBeforeUnmount(() => {
  document.removeEventListener("pointerdown", outside);
  form?.removeEventListener("reset", reset);
});
function change(event: Event) {
  query.value = (event.target as HTMLInputElement).value;
  open.value = true;
  if (!props.multiple && selected.value.length) selected.value = [];
}
function key(event: KeyboardEvent) {
  if (event.isComposing || composing.value) return;
  if (event.key === "ArrowDown" || event.key === "ArrowUp") {
    event.preventDefault();
    open.value = true;
    const enabled = results.value
        .map((item, index) => (blocked(item) ? -1 : index))
        .filter((index) => index >= 0),
      position = enabled.indexOf(active.value);
    const next =
      position < 0
        ? event.key === "ArrowDown"
          ? 0
          : enabled.length - 1
        : Math.max(
            0,
            Math.min(
              enabled.length - 1,
              position + (event.key === "ArrowDown" ? 1 : -1),
            ),
          );
    active.value = enabled[next] ?? -1;
    root.value
      ?.querySelector("#" + CSS.escape(id + "-option-" + active.value))
      ?.scrollIntoView({ block: "nearest" });
  } else if (event.key === "Enter" && open.value) {
    event.preventDefault();
    if (results.value[active.value]) choose(results.value[active.value]);
  } else if (event.key === "Escape") {
    event.preventDefault();
    open.value = false;
    query.value = "";
  } else if (
    event.key === "Backspace" &&
    props.multiple &&
    !query.value &&
    selected.value.length
  )
    selected.value = selected.value.slice(0, -1);
}
function blur(event: FocusEvent) {
  if (!root.value?.contains(event.relatedTarget as Node)) open.value = false;
}
</script>
<template>
  <div ref="root" class="cheese-field cheese-combobox" @focusout="blur">
    <label class="cheese-label" :for="id"
      >{{ label }}{{ required ? " *" : "" }}</label
    >
    <ul
      v-if="multiple && selected.length"
      class="cheese-selected-tags"
      :aria-label="label + ' 선택 항목'"
    >
      <li v-for="item in selected" :key="item.value" class="cheese-tag">
        {{ item.label
        }}<button
          type="button"
          :disabled="disabled"
          :aria-label="item.label + ' 선택 해제'"
          @click="remove(item.value)"
        >
          <X :size="14" aria-hidden="true" />
        </button>
      </li>
    </ul>
    <div class="cheese-input-shell">
      <Search :size="17" aria-hidden="true" /><input
        ref="input"
        :id="id"
        class="cheese-input"
        role="combobox"
        autocomplete="off"
        aria-autocomplete="list"
        :aria-expanded="open && !disabled"
        :aria-controls="open ? id + '-list' : undefined"
        :aria-activedescendant="
          open && results[active] ? id + '-option-' + active : undefined
        "
        :aria-required="required"
        :aria-invalid="!!error || invalid"
        :aria-describedby="error || invalid ? id + '-error' : undefined"
        :disabled="disabled"
        :placeholder="placeholder"
        :value="!multiple && !open ? (selected[0]?.label ?? '') : query"
        @focus="open = true"
        @click="open = true"
        @input="change"
        @compositionstart="composing = true"
        @compositionend="composing = false"
        @keydown="key"
      /><ChevronDown :size="17" aria-hidden="true" />
    </div>
    <template v-if="name"
      ><input
        v-for="item in selected"
        :key="item.value"
        type="hidden"
        :name="name"
        :value="item.value"
        :disabled="disabled"
    /></template>
    <input
      v-if="required"
      class="cheese-form-proxy"
      tabindex="-1"
      aria-hidden="true"
      :value="selected.length ? 'selected' : ''"
      required
      :disabled="disabled"
      @invalid.prevent="
        invalid = true;
        input?.focus();
      "
    />
    <div v-if="open && !disabled" class="cheese-combobox-popup">
      <div
        :id="id + '-list'"
        role="listbox"
        :aria-label="label"
        :aria-multiselectable="multiple || undefined"
        :aria-busy="loading"
        class="cheese-option-list"
      >
        <div
          v-for="(item, index) in results"
          :key="item.value"
          :id="id + '-option-' + index"
          role="option"
          :aria-selected="has(item)"
          :aria-disabled="blocked(item) || undefined"
          class="cheese-option"
          :data-active="active === index"
          @pointermove="!blocked(item) && (active = index)"
          @mousedown.prevent
          @click="choose(item)"
        >
          <span class="cheese-option-copy"
            >{{ item.label
            }}<small v-if="item.description">{{
              item.description
            }}</small></span
          ><Check v-if="has(item)" :size="17" aria-hidden="true" />
        </div>
      </div>
      <div v-if="failure" class="cheese-collection-empty">
        <p role="alert">검색에 실패했습니다.</p>
        <button
          type="button"
          class="cheese-button"
          data-variant="weak"
          @click="
            input?.focus();
            retry++;
          "
        >
          <RotateCcw :size="15" aria-hidden="true" />다시 검색
        </button>
      </div>
      <p v-else class="cheese-collection-empty" role="status">
        {{ resultStatus }}
      </p>
    </div>
    <p v-if="multiple" class="cheese-help" role="status">
      {{ selected.length }}개 선택 · 최대 {{ max }}개
    </p>
    <p
      v-if="error || invalid"
      :id="id + '-error'"
      class="cheese-help"
      role="alert"
    >
      {{ error || "항목을 선택해 주세요." }}
    </p>
  </div>
</template>
