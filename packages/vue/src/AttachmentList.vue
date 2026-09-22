<script lang="ts">
export interface AttachmentItem {
  /** Stable, unique identifier supplied by the owner of the saved file. */
  id: string;
  name: string;
  size: number;
  href?: string;
}
export type AttachmentRemoveHandler = (
  item: AttachmentItem,
  context: { signal: AbortSignal },
) => Promise<void>;
</script>
<script setup lang="ts">
import {
  computed,
  nextTick,
  onBeforeUnmount,
  ref,
  shallowRef,
  useId,
  watch,
} from "vue";
import { Download, File, RotateCcw, Trash2 } from "@lucide/vue";
import { formatFileSize } from "./business";

const props = defineProps<{
  label: string;
  items: readonly AttachmentItem[];
  /** Delete remotely, then update items. Handle any confirmation before deleting. */
  remove?: AttachmentRemoveHandler;
}>();
type RemovalState = { pending: boolean; error?: string };
const id = useId();
const root = ref<HTMLDivElement>();
const heading = ref<HTMLSpanElement>();
const rows = new Map<string, HTMLLIElement>();
const operations = new Map<string, AbortController>();
const states = shallowRef(new Map<string, RemovalState>());
let focusedRow: string | null = null;
let previousIds = props.items.map((item) => item.id);
let mounted = true;
const pending = computed(() =>
  props.items.some((item) => states.value.get(item.id)?.pending),
);

watch(
  () => [props.items.map((item) => item.id), props.remove] as const,
  async () => {
    const ids = new Set(props.items.map((item) => item.id));
    for (const [key, controller] of operations) {
      if (!ids.has(key) || !props.remove) {
        controller.abort();
        operations.delete(key);
      }
    }
    states.value = new Map(
      [...states.value].filter(([key]) => ids.has(key) && props.remove),
    );
    const removedId = focusedRow;
    const previousIndex = removedId ? previousIds.indexOf(removedId) : -1;
    previousIds = props.items.map((item) => item.id);
    if (removedId && !ids.has(removedId)) {
      await nextTick();
      if (!mounted || focusedRow !== removedId) return;
      const nextItem =
        props.items[
          Math.min(Math.max(previousIndex, 0), props.items.length - 1)
        ];
      const row = nextItem ? rows.get(nextItem.id) : undefined;
      const action =
        row?.querySelector<HTMLElement>("button") ??
        row?.querySelector<HTMLElement>("a[href]");
      (action ?? heading.value)?.focus();
    }
  },
);
onBeforeUnmount(() => {
  mounted = false;
  operations.forEach((controller) => controller.abort());
  operations.clear();
});
function focus(event: FocusEvent) {
  focusedRow =
    (event.target as HTMLElement).closest<HTMLElement>("[data-attachment-id]")
      ?.dataset.attachmentId ?? null;
}
function blur(event: FocusEvent) {
  // Chromium dispatches focusout while a focused row is being removed. The
  // updated items already exclude it; preserve the pending nextTick restore.
  if (
    !event.relatedTarget &&
    focusedRow &&
    !props.items.some((item) => item.id === focusedRow)
  )
    return;
  if (!root.value?.contains(event.relatedTarget as Node | null))
    focusedRow = null;
}
function setRow(key: string, node: unknown) {
  if (node instanceof HTMLLIElement) rows.set(key, node);
  else rows.delete(key);
}
async function removeItem(item: AttachmentItem) {
  if (!props.remove || operations.has(item.id)) return;
  const controller = new AbortController();
  operations.set(item.id, controller);
  states.value = new Map(states.value).set(item.id, { pending: true });
  const isCurrent = () =>
    mounted &&
    !controller.signal.aborted &&
    operations.get(item.id) === controller &&
    props.items.some((current) => current.id === item.id);
  try {
    await props.remove(item, { signal: controller.signal });
  } catch (error) {
    if (isCurrent()) {
      const message =
        error instanceof Error && error.message.trim()
          ? error.message
          : "파일을 삭제하지 못했습니다. 다시 시도해 주세요.";
      states.value = new Map(states.value).set(item.id, {
        pending: true,
        error: message,
      });
    }
  } finally {
    if (isCurrent()) {
      operations.delete(item.id);
      states.value = new Map(states.value).set(item.id, {
        ...states.value.get(item.id),
        pending: false,
      });
    }
  }
}
</script>
<template>
  <div
    ref="root"
    class="cheese-attachment-list"
    role="group"
    :aria-labelledby="id + '-label'"
    @focusin="focus"
    @focusout="blur"
  >
    <span
      ref="heading"
      :id="id + '-label'"
      class="cheese-label cheese-attachment-label"
      tabindex="-1"
    >
      {{ label
      }}<span class="cheese-attachment-count" aria-hidden="true"
        >{{ items.length }}개</span
      >
    </span>
    <ul
      v-if="items.length"
      class="cheese-attachment-items"
      :aria-label="label + ' 파일 목록'"
    >
      <li
        v-for="(item, index) in items"
        :key="item.id"
        :ref="(node) => setRow(item.id, node)"
        class="cheese-attachment-item"
        :data-attachment-id="item.id"
        :data-pending="states.get(item.id)?.pending || undefined"
        :aria-busy="states.get(item.id)?.pending || undefined"
      >
        <File :size="20" aria-hidden="true" />
        <div class="cheese-attachment-copy">
          <strong>{{ item.name }}</strong>
          <span class="cheese-help">{{ formatFileSize(item.size) }}</span>
          <span
            v-if="states.get(item.id)?.error"
            :id="id + '-error-' + index"
            class="cheese-attachment-error"
            role="alert"
            >{{ states.get(item.id)?.error }}</span
          >
        </div>
        <div v-if="item.href || remove" class="cheese-attachment-actions">
          <a
            v-if="item.href"
            class="cheese-button"
            data-variant="ghost"
            data-size="sm"
            :href="item.href"
            :download="item.name"
            :aria-label="item.name + ' 다운로드'"
            ><Download :size="16" aria-hidden="true" />다운로드</a
          >
          <button
            v-if="remove"
            type="button"
            class="cheese-button"
            data-variant="ghost"
            data-size="sm"
            :aria-disabled="states.get(item.id)?.pending || undefined"
            :aria-label="
              item.name +
              (states.get(item.id)?.error ? ' 삭제 재시도' : ' 삭제')
            "
            :aria-describedby="
              states.get(item.id)?.error ? id + '-error-' + index : undefined
            "
            @click="removeItem(item)"
          >
            <RotateCcw
              v-if="states.get(item.id)?.error"
              :size="16"
              aria-hidden="true"
            /><Trash2 v-else :size="16" aria-hidden="true" />{{
              states.get(item.id)?.pending
                ? "삭제 중"
                : states.get(item.id)?.error
                  ? "재시도"
                  : "삭제"
            }}
          </button>
        </div>
      </li>
    </ul>
    <p v-else class="cheese-attachment-empty">첨부파일이 없습니다.</p>
    <span class="cheese-sr-only" role="status">{{
      pending ? "첨부파일을 삭제하고 있습니다." : ""
    }}</span>
  </div>
</template>
