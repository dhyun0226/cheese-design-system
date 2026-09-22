<script lang="ts">
export interface ErrorSummaryItem {
  /** A stable, unique key for this error; it is not used as a DOM id. */
  id: string;
  message: string;
  /** The id of a visible input, trigger, or container that contains one. */
  targetId?: string;
}
</script>
<script setup lang="ts">
import { ref, useId } from "vue";
defineOptions({ inheritAttrs: false });
withDefaults(
  defineProps<{
    errors: readonly ErrorSummaryItem[];
    title?: string;
  }>(),
  { title: "입력 내용을 확인해 주세요." },
);
const emit = defineEmits<{
  /** Cancel the navigation event before focusing a custom composite control. */
  navigate: [item: ErrorSummaryItem, event: Event];
}>();
const root = ref<HTMLDivElement>();
const headingId = useId();
// Consumers call this after a failed submission. Updating errors never steals focus.
defineExpose({ focus: (options?: FocusOptions) => root.value?.focus(options) });

function navigate(item: ErrorSummaryItem, event: MouseEvent) {
  event.preventDefault();
  const navigation = new Event("navigate", { cancelable: true });
  emit("navigate", item, navigation);
  if (navigation.defaultPrevented || !item.targetId || !root.value) return;
  const document = root.value.ownerDocument;
  const target = document.getElementById(item.targetId);
  if (!target) return;
  const selector =
    'input:not([type="hidden"]), select, textarea, button, a[href], [tabindex], [contenteditable="true"]';
  const candidates = [
    target,
    ...target.querySelectorAll<HTMLElement>(selector),
  ];
  for (const candidate of candidates) {
    if (
      !candidate.matches(selector) ||
      candidate.matches(":disabled") ||
      candidate.closest(
        '[hidden], [inert], [aria-hidden="true"], [aria-disabled="true"]',
      )
    )
      continue;
    const rect = candidate.getBoundingClientRect();
    const style = document.defaultView?.getComputedStyle(candidate);
    // Native form proxies can have a layout box despite being clipped from view.
    if (
      rect.width <= 1 ||
      rect.height <= 1 ||
      style?.visibility === "hidden" ||
      style?.visibility === "collapse" ||
      style?.clip === "rect(0px, 0px, 0px, 0px)" ||
      style?.clipPath === "inset(50%)"
    )
      continue;
    candidate.focus({ preventScroll: true });
    if (document.activeElement === candidate) {
      candidate.scrollIntoView({ block: "nearest", inline: "nearest" });
      return;
    }
  }
}
</script>
<template>
  <div
    v-if="errors.length"
    ref="root"
    v-bind="$attrs"
    class="cheese-error-summary"
    role="region"
    :aria-labelledby="headingId"
    tabindex="-1"
  >
    <h2 :id="headingId" class="cheese-error-summary-title">{{ title }}</h2>
    <ul class="cheese-error-summary-list">
      <li v-for="item in errors" :key="item.id">
        <a
          v-if="item.targetId"
          class="cheese-error-summary-link"
          :href="`#${encodeURIComponent(item.targetId)}`"
          @click="navigate(item, $event)"
          >{{ item.message }}</a
        >
        <template v-else>{{ item.message }}</template>
      </li>
    </ul>
  </div>
</template>
