<script setup lang="ts">
import {
  computed,
  nextTick,
  onBeforeUnmount,
  onMounted,
  ref,
  useId,
  watch,
  watchPostEffect,
} from "vue";
import {
  PopoverRoot,
  PopoverTrigger,
  PopoverPortal,
  PopoverContent,
  PopoverClose,
} from "reka-ui";
import { Clock } from "@lucide/vue";
import { useFieldBlur } from "./useFieldBlur";

defineOptions({ inheritAttrs: false });
const props = withDefaults(
  defineProps<{
    label: string;
    id?: string;
    modelValue?: string;
    defaultValue?: string;
    name?: string;
    form?: string;
    disabled?: boolean;
    readOnly?: boolean;
    required?: boolean;
    min?: string;
    max?: string;
    /** Whole seconds; step origin is min, then defaultValue, then midnight. */
    step?: number;
    description?: string;
    error?: string;
    placeholder?: string;
    onInvalid?: (event: Event) => void;
  }>(),
  { defaultValue: "", step: 60 },
);
const emit = defineEmits<{ "update:modelValue": [value: string] }>();
const autoId = useId(),
  id = computed(() => props.id || autoId);
const input = ref<HTMLInputElement>();
const shouldRevealOnBlur = useFieldBlur(input);
defineExpose({ input, focus: () => input.value?.focus() });
const local = ref(props.defaultValue),
  open = ref(false),
  touched = ref(false),
  draft = ref(0);
const current = computed(() => props.modelValue ?? local.value);
const lists = ref<(HTMLDivElement | null)[]>([]);
function seconds(value?: string) {
  if (!value || !/^(?:[01]\d|2[0-3]):[0-5]\d(?::[0-5]\d)?$/.test(value))
    return undefined;
  const [h, m, s = 0] = value.split(":").map(Number);
  return h * 3600 + m * 60 + s;
}
function format(value: number, withSeconds: boolean) {
  const parts = [Math.floor(value / 3600), Math.floor((value % 3600) / 60)];
  if (withSeconds) parts.push(value % 60);
  return parts.map((part) => String(part).padStart(2, "0")).join(":");
}
function part(value: number, column: number) {
  return column === 0
    ? Math.floor(value / 3600)
    : column === 1
      ? Math.floor((value % 3600) / 60)
      : value % 60;
}
const lower = computed(() => seconds(props.min) ?? 0);
const upper = computed(() => seconds(props.max) ?? 86399);
const origin = computed(
  () => seconds(props.min) ?? seconds(props.defaultValue) ?? 0,
);
const validConfig = computed(
  () =>
    Number.isInteger(props.step) &&
    props.step > 0 &&
    props.step <= 86400 &&
    (!props.min || seconds(props.min) !== undefined) &&
    (!props.max || seconds(props.max) !== undefined) &&
    lower.value <= upper.value,
);
const withSeconds = computed(
  () =>
    props.step % 60 !== 0 ||
    origin.value % 60 !== 0 ||
    (upper.value % 60 !== 59 && upper.value % 60 !== 0),
);
const times = computed(() => {
  if (!validConfig.value) return [];
  const first =
    lower.value +
    ((((origin.value - lower.value) % props.step) + props.step) % props.step);
  const result: number[] = [];
  for (let n = first; n <= upper.value; n += props.step) result.push(n);
  return result;
});
const validation = computed(() => {
  if (props.disabled || props.readOnly) return "";
  if (props.error) return props.error;
  if (!current.value) return props.required ? "시간을 입력해 주세요." : "";
  const n = seconds(current.value);
  if (n === undefined)
    return `${withSeconds.value ? "HH:mm:ss" : "HH:mm"} 형식의 24시간 시간을 입력해 주세요.`;
  if (!validConfig.value || !times.value.length)
    return "선택 가능한 시간 범위를 확인해 주세요.";
  if (n < lower.value || n > upper.value)
    return `${format(lower.value, withSeconds.value)}–${format(upper.value, withSeconds.value)} 사이의 시간을 입력해 주세요.`;
  if ((n - origin.value) % props.step !== 0)
    return `${format(origin.value, withSeconds.value)} 기준 ${props.step % 60 ? `${props.step}초` : `${props.step / 60}분`} 간격으로 입력해 주세요.`;
  return "";
});
const nativeError = ref("");
const visibleError = computed(
  () =>
    props.error || (touched.value ? validation.value || nativeError.value : ""),
);
const hint = computed(() => visibleError.value || props.description);
watchPostEffect(() => input.value?.setCustomValidity(validation.value));
watch(
  () => [props.disabled, props.readOnly],
  () => {
    if (props.disabled || props.readOnly) open.value = false;
  },
);
let owner: HTMLFormElement | null | undefined,
  timer: ReturnType<typeof setTimeout> | undefined;
function reset(event: Event) {
  timer = setTimeout(() => {
    if (event.defaultPrevented) return;
    if (props.modelValue === undefined) local.value = props.defaultValue;
    // Native reset mutates the DOM even when a controlled owner keeps its model.
    if (input.value) input.value.value = current.value;
    touched.value = false;
    nativeError.value = "";
    open.value = false;
  }, 0);
}
function bindForm() {
  owner?.removeEventListener("reset", reset);
  owner = input.value?.form;
  owner?.addEventListener("reset", reset);
}
onMounted(bindForm);
watch(
  () => props.form,
  () => nextTick(bindForm),
);
onBeforeUnmount(() => {
  owner?.removeEventListener("reset", reset);
  clearTimeout(timer);
});
function change(next: string) {
  nativeError.value = "";
  if (props.modelValue === undefined) local.value = next;
  emit("update:modelValue", next);
}
function show(next: boolean) {
  if (props.disabled || props.readOnly) return;
  if (next) {
    const n = seconds(current.value);
    draft.value =
      n !== undefined && times.value.includes(n)
        ? n
        : (times.value.find((t) => t >= (n ?? lower.value)) ??
          times.value[0] ??
          0);
  }
  open.value = next;
}
function optionsFor(column: number) {
  return Array.from(
    new Set(
      times.value
        .filter((n) => column === 0 || part(n, 0) === part(draft.value, 0))
        .filter((n) => column < 2 || part(n, 1) === part(draft.value, 1))
        .map((n) => part(n, column)),
    ),
  );
}
function selectPart(column: number, next: number) {
  const candidates = times.value.filter(
    (n) =>
      part(n, column) === next &&
      (column === 0 || part(n, 0) === part(draft.value, 0)) &&
      (column < 2 || part(n, 1) === part(draft.value, 1)),
  );
  const matching = candidates.find((n) =>
    column === 0
      ? part(n, 1) === part(draft.value, 1) &&
        part(n, 2) === part(draft.value, 2)
      : column === 1
        ? part(n, 2) === part(draft.value, 2)
        : true,
  );
  if (candidates.length) draft.value = matching ?? candidates[0];
}
function navigate(event: KeyboardEvent, column: number) {
  if (!["ArrowUp", "ArrowDown", "Home", "End"].includes(event.key)) return;
  event.preventDefault();
  const options = optionsFor(column),
    index = options.indexOf(part(draft.value, column));
  const next =
    event.key === "Home"
      ? 0
      : event.key === "End"
        ? options.length - 1
        : Math.max(
            0,
            Math.min(
              options.length - 1,
              index + (event.key === "ArrowDown" ? 1 : -1),
            ),
          );
  selectPart(column, options[next]);
}
watch(times, () => {
  if (open.value && times.value.length && !times.value.includes(draft.value))
    draft.value = times.value[0];
});
watch([open, draft], () =>
  nextTick(() => {
    if (open.value)
      lists.value.forEach((list) =>
        list
          ?.querySelector('[aria-selected="true"]')
          ?.scrollIntoView({ block: "nearest" }),
      );
  }),
);
function onOpenAutoFocus(event: Event) {
  if (times.value.length) {
    event.preventDefault();
    lists.value[0]?.focus();
    lists.value.forEach((list) =>
      list
        ?.querySelector('[aria-selected="true"]')
        ?.scrollIntoView({ block: "nearest" }),
    );
  }
}
function onBlur(event: FocusEvent) {
  if (shouldRevealOnBlur(event)) touched.value = true;
}
function onInvalid(event: Event) {
  props.onInvalid?.(event);
  const handled = event.defaultPrevented;
  event.preventDefault();
  nativeError.value = validation.value
    ? ""
    : input.value?.validationMessage || "";
  touched.value = true;
  const node = input.value;
  const first = Array.from(node?.form?.elements ?? []).find((element) => {
    const control = element as HTMLInputElement;
    return control.willValidate && !control.validity.valid;
  });
  if (!handled && (!first || first === node)) node?.focus();
}
function apply() {
  if (!times.value.includes(draft.value)) return;
  change(format(draft.value, withSeconds.value));
  touched.value = true;
  open.value = false;
}
</script>
<template>
  <div class="cheese-field cheese-time-field">
    <label class="cheese-label" :for="id"
      >{{ label }}<span v-if="required" aria-hidden="true"> *</span></label
    >
    <PopoverRoot :open="open" @update:open="show">
      <div class="cheese-time-control">
        <input
          v-bind="$attrs"
          :id="id"
          ref="input"
          type="text"
          inputmode="text"
          class="cheese-input cheese-time-input"
          :name="name"
          :form="form"
          :value="current"
          :disabled="disabled"
          :readonly="readOnly"
          :required="required"
          :placeholder="placeholder ?? (withSeconds ? 'HH:mm:ss' : 'HH:mm')"
          :aria-invalid="!!visibleError"
          :aria-describedby="
            [$attrs['aria-describedby'], hint ? id + '-hint' : undefined]
              .filter(Boolean)
              .join(' ') || undefined
          "
          @input="change(($event.target as HTMLInputElement).value)"
          @blur="onBlur"
          @invalid="onInvalid"
          @keydown="
            (event) => {
              if (
                !event.defaultPrevented &&
                !event.isComposing &&
                event.key === 'ArrowDown' &&
                !disabled &&
                !readOnly
              ) {
                event.preventDefault();
                show(true);
              }
            }
          "
        />
        <PopoverTrigger as-child>
          <button
            class="cheese-icon-button cheese-time-trigger"
            type="button"
            :disabled="disabled || readOnly"
            :aria-label="label + ' 시간 선택'"
          >
            <Clock :size="18" aria-hidden="true" />
          </button>
        </PopoverTrigger>
      </div>
      <PopoverPortal>
        <PopoverContent
          class="cheese-root cheese-time-popover"
          :side-offset="8"
          align="start"
          :collision-padding="12"
          :aria-label="label + ' 시간 선택'"
          @open-auto-focus="onOpenAutoFocus"
        >
          <div class="cheese-time-heading">
            <span>{{ label }}</span
            ><output aria-live="polite">{{
              times.length ? format(draft, withSeconds) : "—"
            }}</output>
          </div>
          <div v-if="times.length" class="cheese-time-columns">
            <div
              v-for="(title, column) in withSeconds
                ? ['시', '분', '초']
                : ['시', '분']"
              :key="title"
              class="cheese-time-column"
            >
              <span
                :id="`${id}-column-${column}`"
                class="cheese-time-column-label"
                >{{ title }}</span
              >
              <div
                :ref="
                  (node) => {
                    lists[column] = node as HTMLDivElement | null;
                  }
                "
                class="cheese-time-list"
                role="listbox"
                tabindex="0"
                :aria-labelledby="`${id}-column-${column}`"
                :aria-activedescendant="`${id}-option-${column}-${part(draft, column)}`"
                @keydown="navigate($event, column)"
              >
                <div
                  v-for="option in optionsFor(column)"
                  :id="`${id}-option-${column}-${option}`"
                  :key="option"
                  class="cheese-time-option"
                  role="option"
                  :aria-selected="part(draft, column) === option"
                  @click="
                    selectPart(column, option);
                    lists[column]?.focus();
                  "
                >
                  {{ String(option).padStart(2, "0") }}
                </div>
              </div>
            </div>
          </div>
          <p v-else class="cheese-help" role="status">
            선택 가능한 시간이 없습니다. 시간 범위와 간격을 확인해 주세요.
          </p>
          <div class="cheese-time-actions">
            <PopoverClose as-child
              ><button
                class="cheese-button"
                type="button"
                data-variant="ghost"
                data-size="sm"
              >
                취소
              </button></PopoverClose
            >
            <button
              class="cheese-button"
              type="button"
              data-variant="accent"
              data-size="sm"
              :disabled="!times.includes(draft)"
              @click="apply"
            >
              적용
            </button>
          </div>
        </PopoverContent>
      </PopoverPortal>
    </PopoverRoot>
    <p
      v-if="hint"
      :id="id + '-hint'"
      class="cheese-help"
      :data-error="!!visibleError"
      :role="visibleError ? 'alert' : undefined"
    >
      {{ hint }}
    </p>
  </div>
</template>
