<script setup lang="ts">
import {
  computed,
  shallowRef,
  unref,
  type CSSProperties,
  type HTMLAttributes,
  type ComponentPublicInstance,
} from "vue";
import * as P from "reka-ui";

defineOptions({ inheritAttrs: false });
withDefaults(
  defineProps<{
    label?: string;
    orientation?: "vertical" | "horizontal" | "both";
    height?: CSSProperties["height"] | number;
    dir?: "ltr" | "rtl";
    viewportProps?: HTMLAttributes;
  }>(),
  { label: "스크롤 영역", orientation: "vertical", height: 180 },
);
const root = shallowRef<HTMLElement>();
const viewportComponent = shallowRef<Element | ComponentPublicInstance | null>(
  null,
);
// Reka forwards $el to its content child. The scroll container is exposed
// separately as viewportElement; using $el would silently scroll the wrong node.
const viewport = computed(() => {
  const node = viewportComponent.value;
  const value =
    node && "viewportElement" in node ? unref(node.viewportElement) : undefined;
  return value instanceof HTMLElement ? value : undefined;
});
function element(node: Element | ComponentPublicInstance | null) {
  const value = node && "$el" in node ? node.$el : node;
  return value instanceof HTMLElement ? value : undefined;
}
function captureRoot(node: Element | ComponentPublicInstance | null) {
  root.value = element(node);
}
function captureViewport(node: Element | ComponentPublicInstance | null) {
  viewportComponent.value = node;
}
defineExpose({
  root,
  viewport,
  focus: (options?: FocusOptions) => viewport.value?.focus(options),
  scrollTo: (options: ScrollToOptions) => viewport.value?.scrollTo(options),
});
</script>

<template>
  <P.ScrollAreaRoot
    :ref="captureRoot"
    type="auto"
    :dir="dir"
    :data-scroll-orientation="orientation"
    class="cheese-scroll-area"
    :style="{ height: typeof height === 'number' ? `${height}px` : height }"
    v-bind="$attrs"
  >
    <P.ScrollAreaViewport
      :ref="captureViewport"
      role="region"
      :aria-label="label"
      :tabindex="0"
      class="cheese-scroll-viewport"
      v-bind="viewportProps"
    >
      <slot />
    </P.ScrollAreaViewport>
    <P.ScrollAreaScrollbar
      v-if="orientation !== 'horizontal'"
      orientation="vertical"
      class="cheese-scrollbar"
    >
      <P.ScrollAreaThumb class="cheese-scroll-thumb" />
    </P.ScrollAreaScrollbar>
    <P.ScrollAreaScrollbar
      v-if="orientation !== 'vertical'"
      orientation="horizontal"
      class="cheese-scrollbar"
    >
      <P.ScrollAreaThumb class="cheese-scroll-thumb" />
    </P.ScrollAreaScrollbar>
    <P.ScrollAreaCorner class="cheese-scroll-corner" />
  </P.ScrollAreaRoot>
</template>
