<script setup lang="ts">
import {
  computed,
  nextTick,
  onBeforeUnmount,
  ref,
  useId,
  watch,
  watchEffect,
} from "vue";
import {
  PopoverRoot,
  PopoverTrigger,
  PopoverPortal,
  PopoverContent,
} from "reka-ui";
import { CalendarDays } from "@lucide/vue";
import { CalendarDate, type DateValue } from "@internationalized/date";
import Calendar from "./Calendar.vue";
import { useFieldBlur } from "./useFieldBlur";

defineOptions({ inheritAttrs: false });
const props = defineProps<{
  label: string;
  modelValue?: string;
  defaultValue?: string;
  name?: string;
  form?: string;
  id?: string;
  disabled?: boolean;
  readOnly?: boolean;
  required?: boolean;
  min?: string;
  max?: string;
  /** Days, anchored to min, defaultValue or 1970-01-01. */
  step?: number | "any";
  description?: string;
  error?: string;
}>();
const emit = defineEmits<{
  "update:modelValue": [value: string];
  blur: [event: FocusEvent];
  invalid: [event: Event];
  keydown: [event: KeyboardEvent];
}>();
const autoId = useId(),
  id = computed(() => props.id ?? autoId);
const input = ref<HTMLInputElement>();
const shouldRevealOnBlur = useFieldBlur(input);
const local = ref(props.defaultValue ?? "");
const current = computed(() =>
  props.modelValue === undefined ? local.value : props.modelValue,
);
const open = ref(false),
  revealed = ref(false);
const nativeError = ref("");
function parse(value: string): CalendarDate | undefined {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return;
  const [year, month, day] = value.split("-").map(Number);
  if (year < 1 || month < 1 || month > 12 || day < 1 || day > 31) return;
  const date = new CalendarDate(year, month, day);
  if (date.year === year && date.month === month && date.day === day)
    return date;
}
function dayNumber(date: DateValue): number {
  const utc = new Date(0);
  utc.setUTCFullYear(date.year, date.month - 1, date.day);
  return utc.getTime() / 86400000;
}
const minimum = computed(() => parse(props.min ?? ""));
const maximum = computed(() => parse(props.max ?? ""));
const invalidBounds = computed(
  () =>
    !!(
      minimum.value &&
      maximum.value &&
      dayNumber(minimum.value) > dayNumber(maximum.value)
    ),
);
function validationMessage(candidate: string): string {
  if (invalidBounds.value)
    return "날짜 범위 설정을 확인해 주세요. 최소 날짜가 최대 날짜보다 늦습니다.";
  if (!candidate) return props.required ? "날짜를 입력해 주세요." : "";
  const date = parse(candidate);
  if (!date) return "실제 존재하는 날짜를 YYYY-MM-DD 형식으로 입력해 주세요.";
  if (minimum.value && dayNumber(date) < dayNumber(minimum.value))
    return `${props.min} 이후 날짜를 입력해 주세요.`;
  if (maximum.value && dayNumber(date) > dayNumber(maximum.value))
    return `${props.max} 이전 날짜를 입력해 주세요.`;
  const base =
    minimum.value ?? parse(props.defaultValue ?? "") ?? parse("1970-01-01")!;
  const step = props.step ?? 1;
  const interval =
    step === "any" ? null : Number.isFinite(step) && step > 0 ? step : 1;
  if (interval !== null) {
    const delta = (dayNumber(date) - dayNumber(base)) / interval;
    if (Math.abs(delta - Math.round(delta)) > 1e-7)
      return `${base.toString()}부터 ${interval}일 간격의 날짜를 입력해 주세요.`;
  }
  return "";
}
const message = computed(
  () =>
    props.error ||
    (revealed.value
      ? validationMessage(current.value) || nativeError.value
      : ""),
);
const hint = computed(() => message.value || props.description);
watchEffect(
  () => {
    input.value?.setCustomValidity(
      props.disabled || props.readOnly
        ? ""
        : props.error || validationMessage(current.value),
    );
  },
  { flush: "post" },
);
watch(
  () => [props.disabled, props.readOnly],
  () => {
    if (props.disabled || props.readOnly) open.value = false;
  },
);
watch(
  [
    current,
    () => props.min,
    () => props.max,
    () => props.step,
    () => props.required,
    () => props.error,
  ],
  () => {
    nativeError.value = "";
  },
);
let timer: ReturnType<typeof setTimeout> | undefined;
watch(
  [input, () => props.form],
  (_, __, cleanup) => {
    const owner = input.value?.form;
    if (!owner) return;
    const reset = (event: Event) => {
      timer = setTimeout(() => {
        if (event.defaultPrevented) return;
        if (props.modelValue === undefined) {
          local.value = props.defaultValue ?? "";
          emit("update:modelValue", local.value);
        }
        // Native reset also changes the DOM when the controlled value is unchanged.
        if (input.value) {
          input.value.value = current.value;
          input.value.setCustomValidity(
            props.disabled || props.readOnly
              ? ""
              : props.error || validationMessage(current.value),
          );
        }
        revealed.value = false;
        nativeError.value = "";
        open.value = false;
      }, 0);
    };
    owner.addEventListener("reset", reset);
    cleanup(() => owner.removeEventListener("reset", reset));
  },
  { flush: "post" },
);
onBeforeUnmount(() => clearTimeout(timer));
function update(next: string) {
  if (props.disabled || props.readOnly) return;
  nativeError.value = "";
  if (props.modelValue === undefined) local.value = next;
  input.value?.setCustomValidity(props.error || validationMessage(next));
  emit("update:modelValue", next);
  void nextTick(() => {
    const node = input.value;
    if (!node || props.modelValue === undefined) return;
    // Keep the submitted value and validity tied to the owner's accepted value.
    if (node.value !== current.value) node.value = current.value;
    node.setCustomValidity(
      props.disabled || props.readOnly
        ? ""
        : props.error || validationMessage(current.value),
    );
  });
}
function invalid(event: Event) {
  event.preventDefault();
  revealed.value = true;
  nativeError.value = input.value?.validationMessage ?? "";
  const node = input.value;
  const first =
    node?.form &&
    Array.from(node.form.elements).find((element) => {
      const control = element as HTMLInputElement;
      return (
        control.willValidate && control.validity && !control.validity.valid
      );
    });
  if (!first || first === node) node?.focus();
  emit("invalid", event);
}
function blur(event: FocusEvent) {
  if (shouldRevealOnBlur(event)) revealed.value = true;
  emit("blur", event);
}
function keyboard(event: KeyboardEvent) {
  emit("keydown", event);
  if (
    !event.defaultPrevented &&
    event.altKey &&
    event.key === "ArrowDown" &&
    !props.disabled &&
    !props.readOnly
  ) {
    event.preventDefault();
    open.value = true;
  }
}
function select(date: DateValue | undefined) {
  if (date) update(date.toString());
  revealed.value = true;
  open.value = false;
}
function closeFocus(event: Event) {
  event.preventDefault();
  input.value?.focus();
}
defineExpose({ input, focus: () => input.value?.focus() });
</script>
<template>
  <div class="cheese-field">
    <label :for="id" class="cheese-label"
      >{{ label }}<span v-if="required" aria-hidden="true"> *</span></label
    >
    <PopoverRoot
      :open="open && !disabled && !readOnly && !invalidBounds"
      @update:open="
        (next) => {
          if (!disabled && !readOnly) open = next;
        }
      "
    >
      <div class="cheese-date-field-control">
        <input
          v-bind="$attrs"
          :id="id"
          ref="input"
          :name="name"
          :form="form"
          class="cheese-input cheese-date-field-input"
          type="text"
          inputmode="text"
          :autocomplete="($attrs.autocomplete as string) ?? 'off'"
          :placeholder="($attrs.placeholder as string) ?? 'YYYY-MM-DD'"
          :value="current"
          :disabled="disabled"
          :readonly="readOnly"
          :required="required"
          :aria-invalid="!!message || undefined"
          :aria-describedby="
            [$attrs['aria-describedby'], hint ? `${id}-hint` : undefined]
              .filter(Boolean)
              .join(' ') || undefined
          "
          @input="update(($event.target as HTMLInputElement).value)"
          @keydown="keyboard"
          @blur="blur"
          @invalid="invalid"
        />
        <PopoverTrigger
          type="button"
          class="cheese-field-action cheese-date-field-action"
          :disabled="disabled || readOnly || invalidBounds"
          :aria-label="`${label} 달력 열기`"
        >
          <CalendarDays :size="18" aria-hidden="true" />
        </PopoverTrigger>
      </div>
      <PopoverPortal>
        <PopoverContent
          class="cheese-popover cheese-root cheese-date-field-popover"
          as-child
          :side-offset="8"
          :collision-padding="12"
          @close-auto-focus="closeFocus"
        >
          <!-- Slot child props take precedence over Reka's trigger-based label. -->
          <div :aria-labelledby="`${id}-calendar-title`">
            <span :id="`${id}-calendar-title`" class="cheese-sr-only"
              >{{ label }} 달력</span
            >
            <Calendar
              :label="`${label} 달력`"
              :model-value="parse(current)"
              :min-value="minimum"
              :max-value="maximum"
              :default-placeholder="parse(current) ?? minimum"
              initial-focus
              prevent-deselect
              :is-date-disabled="
                (date: DateValue) => !!validationMessage(date.toString())
              "
              @update:model-value="select"
            />
          </div>
        </PopoverContent>
      </PopoverPortal>
    </PopoverRoot>
    <p
      v-if="hint"
      :id="`${id}-hint`"
      class="cheese-help"
      :data-error="!!message"
      :role="message ? 'alert' : undefined"
    >
      {{ hint }}
    </p>
  </div>
</template>
