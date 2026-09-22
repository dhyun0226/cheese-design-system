<script setup lang="ts">
import { useId } from "vue";
import * as P from "reka-ui";
import { Check } from "@lucide/vue";
import { useFieldModel, type ChoiceOption } from "./fieldModel";
const props = defineProps<{
  label: string;
  options: ChoiceOption[];
  modelValue?: string;
  defaultValue?: string;
  name?: string;
  disabled?: boolean;
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
    <span :id="id" class="cheese-label">{{ label }}</span
    ><P.ListboxRoot
      v-model="value"
      :name="name"
      :disabled="disabled"
      class="cheese-listbox"
      ><P.ListboxContent :aria-labelledby="id"
        ><P.ListboxItem
          v-for="option in options"
          :key="option.value"
          :value="option.value"
          :disabled="option.disabled"
          class="cheese-option"
          ><span class="cheese-option-copy"
            >{{ option.label
            }}<small v-if="option.description">{{
              option.description
            }}</small></span
          ><P.ListboxItemIndicator
            ><Check
              :size="17"
              aria-hidden="true" /></P.ListboxItemIndicator></P.ListboxItem></P.ListboxContent
    ></P.ListboxRoot>
  </div>
</template>
