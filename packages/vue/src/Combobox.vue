<script setup lang="ts">
import { useId } from "vue";
import * as P from "reka-ui";
import { Search, ChevronDown, Check } from "@lucide/vue";
import { useFieldModel, type ChoiceOption } from "./fieldModel";
const props = defineProps<{
  label: string;
  options: ChoiceOption[];
  modelValue?: string;
  defaultValue?: string;
  placeholder?: string;
  name?: string;
  disabled?: boolean;
  error?: string;
}>();
const emit = defineEmits<{ "update:modelValue": [value: string] }>();
const { root, value } = useFieldModel(
  () => props.modelValue,
  () => props.defaultValue ?? "",
  (v) => emit("update:modelValue", v),
);
const id = useId();
</script>
<template>
  <div ref="root" class="cheese-field">
    <label class="cheese-label" :for="id">{{ label }}</label
    ><P.ComboboxRoot
      v-model="value"
      :name="name"
      :disabled="disabled"
      open-on-click
      class="cheese-combobox"
      ><P.ComboboxAnchor class="cheese-input-shell"
        ><Search :size="17" aria-hidden="true" /><P.ComboboxInput
          :id="id"
          class="cheese-input"
          :placeholder="placeholder || '검색하여 선택'"
          :display-value="
            (key: unknown) => options.find((o) => o.value === key)?.label || ''
          "
          :aria-invalid="!!error"
          :aria-describedby="error ? id + '-error' : undefined" /><ChevronDown
          :size="17"
          aria-hidden="true" /></P.ComboboxAnchor
      ><P.ComboboxContent class="cheese-combobox-popup" :aria-label="label"
        ><P.ComboboxViewport class="cheese-option-list"
          ><P.ComboboxEmpty class="cheese-collection-empty"
            >검색 결과가 없습니다.</P.ComboboxEmpty
          ><P.ComboboxItem
            v-for="option in options"
            :key="option.value"
            :value="option.value"
            :text-value="option.label"
            :disabled="option.disabled"
            class="cheese-option"
            ><span class="cheese-option-copy"
              >{{ option.label
              }}<small v-if="option.description">{{
                option.description
              }}</small></span
            ><P.ComboboxItemIndicator
              ><Check
                :size="17"
                aria-hidden="true" /></P.ComboboxItemIndicator></P.ComboboxItem></P.ComboboxViewport></P.ComboboxContent
    ></P.ComboboxRoot>
    <p v-if="error" :id="id + '-error'" role="alert" class="cheese-help">
      {{ error }}
    </p>
  </div>
</template>
