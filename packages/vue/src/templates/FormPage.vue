<script setup lang="ts">
import PageHeader from "../patterns/PageHeader.vue";
import { provideFormLock } from "../form-state";

const props = withDefaults(
  defineProps<{
    id?: string;
    title: string;
    eyebrow?: string;
    description?: string;
    headingLevel?: 1 | 2 | 3 | 4 | 5 | 6;
    noValidate?: boolean;
    /** Locks native fields and connected CHEESE controls, including teleported UI. */
    pending?: boolean;
    /** Arbitrary consumer widgets still need their own disabled contract. */
    disabled?: boolean;
  }>(),
  { headingLevel: 1, noValidate: false, pending: false, disabled: false },
);

const emit = defineEmits<{ submit: [event: SubmitEvent] }>();
const blocked = provideFormLock(() => props.pending || props.disabled);

defineSlots<{
  actions?(): unknown;
  default?(): unknown;
  footer?(): unknown;
}>();

function submit(event: Event) {
  if (!blocked.value) emit("submit", event as SubmitEvent);
}
</script>

<template>
  <form
    :id="id"
    class="cheese-page-template cheese-form-page"
    :novalidate="noValidate"
    :aria-busy="pending || undefined"
    @submit.prevent="submit"
  >
    <PageHeader
      :title="title"
      :eyebrow="eyebrow"
      :description="description"
      :heading-level="headingLevel"
    >
      <template v-if="$slots.actions" #actions
        ><slot name="actions"
      /></template>
    </PageHeader>
    <fieldset class="cheese-form-page-fields" :disabled="blocked">
      <div class="cheese-page-content"><slot /></div>
      <div v-if="$slots.footer" class="cheese-page-footer">
        <slot name="footer" />
      </div>
    </fieldset>
  </form>
</template>
