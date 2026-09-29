<script setup lang="ts">
import Button from "../Button.vue";
import { computed } from "vue";
import { useFormLock } from "../form-state";

const props = withDefaults(
  defineProps<{
    submitLabel?: string;
    cancelLabel?: string;
    showCancel?: boolean;
    pending?: boolean;
    disabled?: boolean;
    submitDisabled?: boolean;
    form?: string;
  }>(),
  {
    submitLabel: "저장",
    cancelLabel: "취소",
    showCancel: true,
    pending: false,
    disabled: false,
    submitDisabled: false,
  },
);

const emit = defineEmits<{ cancel: [] }>();
const inheritedLock = useFormLock();
const blocked = computed(
  () => inheritedLock.value || props.pending || props.disabled,
);

function cancel() {
  if (!blocked.value) emit("cancel");
}

defineSlots<{
  status?(): unknown;
  default?(): unknown;
}>();
</script>

<template>
  <fieldset
    class="cheese-form-actions"
    :disabled="blocked"
    :aria-busy="pending || undefined"
  >
    <div v-if="$slots.status" class="cheese-form-actions-status">
      <slot name="status" />
    </div>
    <div class="cheese-form-actions-buttons">
      <slot />
      <Button
        v-if="showCancel"
        variant="weak"
        type="button"
        :disabled="blocked"
        @click="cancel"
      >
        {{ cancelLabel }}
      </Button>
      <Button
        type="submit"
        :form="form"
        :loading="pending"
        :disabled="blocked || submitDisabled"
      >
        {{ submitLabel }}
      </Button>
    </div>
  </fieldset>
</template>
