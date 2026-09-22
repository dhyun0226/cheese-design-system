<script setup lang="ts">
import { ref } from "vue";
import { AttachmentList } from "@cheese/vue";

type Item = { id: string; name: string; size: number; href?: string };
type Request = {
  id: string;
  signal: AbortSignal;
  resolve: (remove: boolean) => void;
  reject: (error: unknown) => void;
};
type Driver = {
  snapshot: () => { id: string; aborted: boolean }[];
  resolve: (index: number, remove: boolean) => void;
  reject: (index: number, message: string | null) => void;
  remove: (id: string) => void;
  reinsert: (id: string) => void;
  unmount: () => void;
};

const props = defineProps<{
  initialItems: Item[];
  readOnly: boolean;
  empty: boolean;
}>();
const items = ref<Item[]>(props.empty ? [] : props.initialItems);
const mounted = ref(true);
const requests: Request[] = [];

async function remove(item: Item, { signal }: { signal: AbortSignal }) {
  // An uncooperative transport lets tests settle requests after cancellation.
  const shouldRemove = await new Promise<boolean>((resolve, reject) => {
    requests.push({ id: item.id, signal, resolve, reject });
  });
  if (shouldRemove && !signal.aborted) {
    items.value = items.value.filter((entry) => entry.id !== item.id);
  }
}

(window as Window & { attachmentFixture?: Driver }).attachmentFixture = {
  snapshot: () =>
    requests.map(({ id, signal }) => ({ id, aborted: signal.aborted })),
  resolve: (index, shouldRemove) => requests[index].resolve(shouldRemove),
  reject: (index, message) =>
    requests[index].reject(
      message === null ? "transport failure" : new Error(message),
    ),
  remove: (id) => {
    items.value = items.value.filter((entry) => entry.id !== id);
  },
  reinsert: (id) => {
    items.value = [
      ...items.value.filter((entry) => entry.id !== id),
      { ...props.initialItems.find((entry) => entry.id === id)! },
    ];
  },
  unmount: () => {
    mounted.value = false;
  },
};
</script>

<template>
  <main
    class="cheese-root cheese-stack"
    style="max-width: 640px; margin: 24px auto; padding: 16px"
  >
    <h1>저장된 첨부파일</h1>
    <button type="button">목록 이전</button>
    <AttachmentList
      v-if="mounted"
      label="업무 첨부파일"
      :items="items"
      :remove="readOnly ? undefined : remove"
    />
    <button type="button">목록 다음</button>
  </main>
</template>
