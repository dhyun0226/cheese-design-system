<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from "vue";
import { ChevronLeft, ChevronRight } from "@lucide/vue";

defineOptions({ inheritAttrs: false });
const props = withDefaults(
  defineProps<{
    page: number;
    count: number;
    disabled?: boolean;
    label?: string;
    previousLabel?: string;
    nextLabel?: string;
    getPageLabel?: (page: number) => string;
  }>(),
  {
    disabled: false,
    label: "페이지 탐색",
    previousLabel: "이전 페이지",
    nextLabel: "다음 페이지",
    getPageLabel: (page: number) => `${page}페이지`,
  },
);
const emit = defineEmits<{
  "update:page": [page: number];
  pageChange: [page: number];
}>();
const compact = ref(false);
let query: MediaQueryList | undefined;
const updateWidth = () => {
  compact.value = query?.matches ?? false;
};
onMounted(() => {
  query = window.matchMedia("(max-width: 479px)");
  updateWidth();
  query.addEventListener("change", updateWidth);
});
onUnmounted(() => query?.removeEventListener("change", updateWidth));
const total = computed(() =>
  Number.isFinite(props.count)
    ? Math.min(Number.MAX_SAFE_INTEGER, Math.max(0, Math.floor(props.count)))
    : 0,
);
const current = computed(() =>
  Math.min(
    total.value,
    Math.max(1, Number.isFinite(props.page) ? Math.floor(props.page) : 1),
  ),
);
const root = ref<HTMLElement>();
let pendingFocus: number | undefined;
watch(
  current,
  (page) => {
    if (pendingFocus === page) {
      root.value
        ?.querySelector<HTMLButtonElement>('[aria-current="page"]')
        ?.focus();
      pendingFocus = undefined;
    }
  },
  { flush: "post" },
);
// Keep the number of rendered elements independent from the total page count.
const items = computed(() => {
  const count = total.value;
  const page = current.value;
  const slots = compact.value ? 5 : 7;
  const range = (start: number, length: number) =>
    Array.from({ length }, (_, index) => start + index);
  if (count <= slots) return range(1, count);
  if (slots === 5) {
    if (page <= 3) return [...range(1, 4), "end-gap"];
    if (page >= count - 2) return ["start-gap", ...range(count - 3, 4)];
    return ["start-gap", page - 1, page, page + 1, "end-gap"];
  }
  if (page <= Math.ceil(slots / 2))
    return [...range(1, slots - 2), "end-gap", count];
  if (page >= count - Math.floor(slots / 2))
    return [1, "start-gap", ...range(count - slots + 3, slots - 2)];
  return [
    1,
    "start-gap",
    ...range(page - Math.floor((slots - 4) / 2), slots - 4),
    "end-gap",
    count,
  ];
});
function changePage(page: number, fromArrow = false) {
  if (
    !props.disabled &&
    page !== current.value &&
    page >= 1 &&
    page <= total.value
  ) {
    // An arrow disappears at the boundary; retain focus inside the navigation.
    pendingFocus =
      fromArrow && (page === 1 || page === total.value) ? page : undefined;
    emit("update:page", page);
    emit("pageChange", page);
  }
}
</script>

<template>
  <nav
    v-if="total > 1"
    ref="root"
    :aria-label="label"
    v-bind="$attrs"
    class="cheese-pagination"
    :aria-disabled="disabled || undefined"
  >
    <ol class="cheese-pagination-list">
      <li>
        <button
          type="button"
          class="cheese-pagination-item cheese-pagination-arrow"
          :aria-label="previousLabel"
          :data-unavailable="current === 1 || undefined"
          :disabled="disabled || current === 1"
          @click="changePage(current - 1, true)"
        >
          <ChevronLeft :size="16" aria-hidden="true" />
        </button>
      </li>
      <li v-for="item in items" :key="item">
        <button
          v-if="typeof item === 'number'"
          type="button"
          class="cheese-pagination-item"
          :aria-label="getPageLabel(item)"
          :aria-current="item === current ? 'page' : undefined"
          :disabled="disabled"
          @click="changePage(item)"
        >
          {{ item }}
        </button>
        <span v-else class="cheese-pagination-ellipsis" aria-hidden="true">…</span>
      </li>
      <li>
        <button
          type="button"
          class="cheese-pagination-item cheese-pagination-arrow"
          :aria-label="nextLabel"
          :data-unavailable="current === total || undefined"
          :disabled="disabled || current === total"
          @click="changePage(current + 1, true)"
        >
          <ChevronRight :size="16" aria-hidden="true" />
        </button>
      </li>
    </ol>
    <span class="cheese-sr-only" aria-live="polite" aria-atomic="true">
      {{ current }} / {{ total }}
    </span>
  </nav>
</template>
