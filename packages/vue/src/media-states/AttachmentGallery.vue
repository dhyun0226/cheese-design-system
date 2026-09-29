<script setup lang="ts">
import { computed, shallowRef, useId } from "vue";
import { Download, File, FileImage, Film } from "@lucide/vue";
import Button from "../Button.vue";
import FilePreview from "./FilePreview.vue";
import { previewFileSize, type PreviewFile } from "./types";

const props = withDefaults(
  defineProps<{
    label: string;
    items: readonly PreviewFile[];
    previewId: string | null;
    retryable?: boolean;
    downloadable?: boolean;
    emptyMessage?: string;
  }>(),
  { emptyMessage: "첨부 파일이 없습니다." },
);
const emit = defineEmits<{
  "update:previewId": [value: string | null];
  retry: [item: PreviewFile];
  download: [item: PreviewFile];
}>();
const id = useId();
const previewOpener = shallowRef<HTMLElement | null>(null);
function openPreview(event: MouseEvent, itemId: string) {
  previewOpener.value =
    event.currentTarget instanceof HTMLElement ? event.currentTarget : null;
  emit("update:previewId", itemId);
}
const current = computed(
  () => props.items.find((item) => item.id === props.previewId) ?? null,
);
</script>

<template>
  <section class="cheese-attachment-gallery" :aria-labelledby="id">
    <h3 :id="id">
      {{ label }}<span>{{ items.length }}</span>
    </h3>
    <p v-if="!items.length" class="cheese-attachment-gallery-empty">
      {{ emptyMessage }}
    </p>
    <ul v-else class="cheese-attachment-gallery-list">
      <li v-for="item in items" :key="item.id">
        <div class="cheese-attachment-gallery-icon">
          <component
            :is="
              item.kind === 'image'
                ? FileImage
                : item.kind === 'video'
                  ? Film
                  : File
            "
            :size="24"
            aria-hidden="true"
          />
        </div>
        <div class="cheese-attachment-gallery-copy">
          <strong>{{ item.name }}</strong
          ><span
            >{{ item.description ?? item.kind.toUpperCase()
            }}{{
              previewFileSize(item.size)
                ? ` · ${previewFileSize(item.size)}`
                : ""
            }}</span
          >
        </div>
        <div class="cheese-attachment-gallery-actions">
          <Button
            variant="ghost"
            size="sm"
            :aria-label="`${item.name} 미리보기`"
            @click="openPreview($event, item.id)"
            >미리보기</Button
          >
          <Button
            v-if="
              downloadable &&
              item.downloadable !== false &&
              item.status !== 'expired' &&
              item.status !== 'loading'
            "
            variant="ghost"
            size="sm"
            :aria-label="`${item.name} 다운로드`"
            @click="emit('download', item)"
            ><Download :size="16" aria-hidden="true"
          /></Button>
        </div>
      </li>
    </ul>
    <FilePreview
      :open="!!current"
      :item="current"
      :return-focus="previewOpener"
      :retryable="retryable"
      :downloadable="downloadable"
      @update:open="
        (next) => {
          if (!next) emit('update:previewId', null);
        }
      "
      @retry="emit('retry', $event)"
      @download="emit('download', $event)"
    />
  </section>
</template>
