<script setup lang="ts">
import {
  useId,
  ref,
  shallowRef,
  watch,
  type ComponentPublicInstance,
} from "vue";
import { inertOutside } from "./inert";
import * as P from "reka-ui";
import { ChevronDown, ChevronUp, Check } from "@lucide/vue";
import { useFieldModel, type ChoiceOption } from "./fieldModel";
defineOptions({ inheritAttrs: false });
const props = defineProps<{
  label: string;
  options: ChoiceOption[];
  modelValue?: string;
  defaultValue?: string;
  placeholder?: string;
  name?: string;
  form?: string;
  disabled?: boolean;
  required?: boolean;
  error?: string;
  description?: string;
  id?: string;
}>();
const emit = defineEmits<{ "update:modelValue": [value: string] }>();
const auto = useId();
const validation = ref(""),
  content = shallowRef<HTMLElement>(),
  open = ref(false);
const { root, value } = useFieldModel(
  () => props.modelValue,
  () => props.defaultValue ?? "",
  (v) => {
    validation.value = "";
    emit("update:modelValue", v);
  },
  () => props.form,
);
function capture(node: Element | ComponentPublicInstance | null) {
  const el = node && "$el" in node ? node.$el : node;
  content.value = el instanceof HTMLElement ? el : undefined;
}
watch(
  [content, open],
  ([node, isOpen], _, cleanup) => {
    if (isOpen && node?.isConnected) cleanup(inertOutside(node));
  },
  { flush: "post" },
);
function invalid(event: Event) {
  event.preventDefault();
  validation.value = "항목을 선택해 주세요.";
  const input = event.target as HTMLInputElement;
  const first =
    input.form &&
    Array.from(input.form.elements).find((element) => {
      const control = element as HTMLInputElement;
      return (
        control.willValidate && control.validity && !control.validity.valid
      );
    });
  if (!first || first === input)
    root.value
      ?.querySelector<HTMLButtonElement>('button[role="combobox"]')
      ?.focus();
}
</script>
<template>
  <div ref="root" class="cheese-field" @invalid.capture="invalid">
    <label class="cheese-label" :for="id || auto"
      >{{ label }}<span v-if="required" aria-hidden="true"> *</span></label
    >
    <P.SelectRoot
      v-model="value"
      v-model:open="open"
      :name="form ? undefined : name"
      :disabled="disabled"
      :required="form ? false : required"
      ><P.SelectTrigger
        v-bind="$attrs"
        :id="id || auto"
        class="cheese-input cheese-select-trigger"
        :aria-invalid="!!(error || validation)"
        :aria-describedby="
          error || validation || description ? auto + '-hint' : undefined
        "
        ><P.SelectValue
          :placeholder="placeholder || '선택하세요'" /><P.SelectIcon
          ><ChevronDown
            :size="18"
            aria-hidden="true" /></P.SelectIcon></P.SelectTrigger
      ><P.SelectPortal
        ><P.SelectContent
          :ref="capture"
          class="cheese-select-content cheese-root"
          position="popper"
          :side-offset="6"
          :collision-padding="12"
          ><P.SelectScrollUpButton class="cheese-select-scroll"
            ><ChevronUp :size="16" /></P.SelectScrollUpButton
          ><P.SelectViewport
            ><P.SelectItem
              v-for="option in options"
              :key="option.value"
              :value="option.value"
              :disabled="option.disabled"
              class="cheese-option"
              ><span class="cheese-option-copy"
                ><P.SelectItemText>{{ option.label }}</P.SelectItemText
                ><small v-if="option.description">{{
                  option.description
                }}</small></span
              ><P.SelectItemIndicator
                ><Check
                  :size="17"
                  aria-hidden="true" /></P.SelectItemIndicator></P.SelectItem></P.SelectViewport
          ><P.SelectScrollDownButton class="cheese-select-scroll"
            ><ChevronDown
              :size="
                16
              " /></P.SelectScrollDownButton></P.SelectContent></P.SelectPortal
    ></P.SelectRoot>
    <!-- Reka's native proxy only associates with the nearest form. An explicit
         form owner needs its own hidden-but-validatable input, not a second value. -->
    <input
      v-if="form"
      class="cheese-sr-only"
      tabindex="-1"
      aria-hidden="true"
      type="text"
      :form="form"
      :name="name"
      :value="value"
      :required="required"
      :disabled="disabled"
    />
    <p
      v-if="error || validation || description"
      :id="auto + '-hint'"
      class="cheese-help"
      :role="error || validation ? 'alert' : undefined"
    >
      {{ error || validation || description }}
    </p>
  </div>
</template>
