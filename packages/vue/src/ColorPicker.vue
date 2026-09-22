<script setup lang="ts">
import { useId } from "vue";
import { RadioGroupRoot, RadioGroupItem, RadioGroupIndicator } from "reka-ui";
import { Check } from "@lucide/vue";
import { useFieldModel } from "./fieldModel";
const props = withDefaults(
  defineProps<{
    label: string;
    modelValue?: string;
    defaultValue?: string;
    name?: string;
    disabled?: boolean;
    swatches?: { value: string; label: string }[];
  }>(),
  {
    swatches: () => [
      { value: "#FFC928", label: "Cheese Gold" },
      { value: "#111111", label: "Space Black" },
      { value: "#FFFFFF", label: "Lunar White" },
      { value: "#F4F4F0", label: "Moon Gray" },
    ],
  },
);
const emit = defineEmits<{ "update:modelValue": [value: string] }>();
const { root, value } = useFieldModel(
    () => props.modelValue,
    () => props.defaultValue ?? "#FFC928",
    (v) => emit("update:modelValue", v),
  ),
  id = useId();
</script>
<template>
  <div ref="root" class="cheese-field">
    <span :id="id" class="cheese-label">{{ label }}</span
    ><RadioGroupRoot
      v-model="value"
      :name="name"
      :disabled="disabled"
      :aria-labelledby="id"
      class="cheese-swatches"
      orientation="horizontal"
      ><RadioGroupItem
        v-for="s in swatches"
        :key="s.value"
        :value="s.value"
        :aria-label="s.label"
        :style="{ '--swatch': s.value }"
        class="cheese-swatch"
        ><RadioGroupIndicator class="cheese-swatch-check"
          ><Check
            :size="14"
            aria-hidden="true" /></RadioGroupIndicator></RadioGroupItem
    ></RadioGroupRoot>
    <p class="cheese-help" role="status">
      {{ swatches.find((s) => s.value === value)?.label }} · {{ value }}
    </p>
  </div>
</template>
