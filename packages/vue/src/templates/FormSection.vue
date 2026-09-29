<script setup lang="ts">
import { useId } from "vue";
import { provideFormLock } from "../form-state";

const props = defineProps<{
  title: string;
  description?: string;
  /** Locks native fields and connected CHEESE controls; an ancestor lock remains effective. */
  disabled?: boolean;
}>();

defineSlots<{ default?(): unknown }>();

const descriptionId = `cheese-form-section-${useId()}`;
const blocked = provideFormLock(() => !!props.disabled);
</script>

<template>
  <fieldset
    class="cheese-form-section"
    :disabled="blocked"
    :aria-describedby="description ? descriptionId : undefined"
  >
    <legend class="cheese-form-section-legend">{{ title }}</legend>
    <p
      v-if="description"
      :id="descriptionId"
      class="cheese-form-section-description"
    >
      {{ description }}
    </p>
    <div class="cheese-form-section-content"><slot /></div>
  </fieldset>
</template>
