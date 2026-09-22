<script setup lang="ts">
import {
  ContextMenuTrigger,
  useForwardExpose,
  type ContextMenuTriggerProps,
} from "reka-ui";
defineOptions({ inheritAttrs: false });
const props = defineProps<ContextMenuTriggerProps>();
const { forwardRef } = useForwardExpose();
function keyboard(event: KeyboardEvent) {
  if (event.defaultPrevented || props.disabled) return;
  if (event.key !== "ContextMenu" && !(event.shiftKey && event.key === "F10"))
    return;
  event.preventDefault();
  const target = event.currentTarget as HTMLElement;
  const rect = target.getBoundingClientRect();
  target.dispatchEvent(
    new MouseEvent("contextmenu", {
      bubbles: true,
      cancelable: true,
      button: 2,
      clientX: rect.left + 8,
      clientY: rect.top + Math.min(rect.height, 32),
    }),
  );
}
</script>
<template>
  <ContextMenuTrigger
    :ref="forwardRef"
    :tabindex="props.disabled ? -1 : 0"
    aria-haspopup="menu"
    v-bind="{ ...props, ...$attrs }"
    @keydown="keyboard"
  >
    <slot />
  </ContextMenuTrigger>
</template>
