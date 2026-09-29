<script setup lang="ts">
import { computed, ref, watch } from "vue";
import {
  CircleAlert,
  Download,
  File,
  LoaderCircle,
  RotateCcw,
  X,
} from "@lucide/vue";
import { DialogRoot } from "reka-ui";
import { DialogContent, DialogDescription, DialogTitle } from "../styled";
import Button from "../Button.vue";
import { safePreviewUrl, previewFileSize, type PreviewFile } from "./types";

const props = defineProps<{
  open: boolean;
  item: PreviewFile | null;
  /** Explicit opener when pointer activation does not move browser focus. */
  returnFocus?: HTMLElement | null;
  retryable?: boolean;
  downloadable?: boolean;
}>();
const emit = defineEmits<{
  "update:open": [value: boolean];
  retry: [item: PreviewFile];
  download: [item: PreviewFile];
}>();
const loaded = ref(false);
const failed = ref(false);
const attempt = ref(0);
let capturedFocus: HTMLElement | null = null;
watch(
  [
    () => props.open,
    () => props.item?.id,
    () => props.item?.url,
    () => props.item?.status,
    () => props.item?.kind,
    () => props.item?.previewable,
  ],
  () => {
    loaded.value = false;
    failed.value = false;
    attempt.value++;
  },
);
const source = computed(() => safePreviewUrl(props.item?.url));
const status = computed(() => props.item?.status ?? "ready");
const unsupported = computed(
  () => props.item?.kind === "unsupported" || props.item?.previewable === false,
);
const error = computed(
  () =>
    status.value === "error" ||
    failed.value ||
    (!source.value && status.value === "ready" && !unsupported.value),
);
const expired = computed(() => status.value === "expired");
const loading = computed(
  () =>
    status.value === "loading" ||
    (!loaded.value && !error.value && !expired.value && !unsupported.value),
);
const canRender = computed(
  () =>
    status.value === "ready" &&
    !unsupported.value &&
    !error.value &&
    !!source.value,
);
const canDownload = computed(
  () =>
    props.downloadable &&
    props.item?.downloadable !== false &&
    !["expired", "loading"].includes(status.value),
);
function retry() {
  if (!props.item) return;
  loaded.value = false;
  failed.value = false;
  attempt.value++;
  emit("retry", props.item);
}
function captureFocus() {
  capturedFocus =
    document.activeElement instanceof HTMLElement
      ? document.activeElement
      : null;
}
function restoreFocus(event: Event) {
  const target = props.returnFocus?.isConnected
    ? props.returnFocus
    : capturedFocus;
  if (target?.isConnected) {
    event.preventDefault();
    target.focus();
  }
}
</script>

<template>
  <DialogRoot :open="open && !!item" @update:open="emit('update:open', $event)">
    <DialogContent
      v-if="item"
      class="cheese-file-preview"
      @open-auto-focus="captureFocus"
      @close-auto-focus="restoreFocus"
    >
      <header class="cheese-file-preview-header">
        <div>
          <DialogTitle>{{ item.name }}</DialogTitle
          ><DialogDescription
            >{{ item.description ?? "첨부 파일 미리보기"
            }}{{
              previewFileSize(item.size)
                ? ` · ${previewFileSize(item.size)}`
                : ""
            }}</DialogDescription
          >
        </div>
        <Button
          variant="ghost"
          aria-label="미리보기 닫기"
          @click="emit('update:open', false)"
          ><X :size="18" aria-hidden="true"
        /></Button>
      </header>
      <div class="cheese-file-preview-stage" :aria-busy="loading || undefined">
        <div v-if="canRender" :key="attempt" class="cheese-file-preview-media">
          <img
            v-if="item.kind === 'image'"
            :src="source"
            :alt="item.description ?? item.name"
            referrerpolicy="no-referrer"
            @load="loaded = true"
            @error="failed = true"
          />
          <video
            v-else-if="item.kind === 'video'"
            :src="source"
            :aria-label="item.name"
            controls
            preload="metadata"
            @loadedmetadata="loaded = true"
            @error="failed = true"
          >
            브라우저가 영상 미리보기를 지원하지 않습니다.
          </video>
          <iframe
            v-else-if="item.kind === 'pdf'"
            :src="source"
            :title="`${item.name} PDF 미리보기`"
            sandbox=""
            referrerpolicy="no-referrer"
            @load="loaded = true"
            @error="failed = true"
          />
        </div>
        <div v-if="loading" class="cheese-file-preview-message" role="status">
          <LoaderCircle
            class="cheese-media-spinner"
            :size="24"
            aria-hidden="true"
          /><span>파일을 불러오는 중입니다.</span>
        </div>
        <div
          v-if="unsupported || error || expired"
          class="cheese-file-preview-message"
          role="status"
        >
          <CircleAlert
            v-if="error || expired"
            :size="28"
            aria-hidden="true"
          /><File v-else :size="28" aria-hidden="true" />
          <strong>{{
            expired
              ? "미리보기 링크가 만료되었습니다."
              : error
                ? "파일을 불러오지 못했습니다."
                : "미리보기를 지원하지 않는 파일입니다."
          }}</strong>
          <p>
            {{
              expired
                ? "새 링크를 요청한 후 다시 시도해 주세요."
                : error
                  ? "접근 권한이나 연결 상태를 확인해 주세요."
                  : "다운로드가 허용된 경우 파일을 내려받아 확인할 수 있습니다."
            }}
          </p>
          <Button
            v-if="(error || expired) && retryable"
            variant="weak"
            @click="retry"
            ><RotateCcw :size="16" aria-hidden="true" />다시 시도</Button
          >
        </div>
      </div>
      <footer class="cheese-file-preview-footer">
        <p v-if="item.kind === 'pdf'">
          PDF 표시는 브라우저에 따라 다릅니다. 표시되지 않으면 다운로드해 확인해
          주세요.
        </p>
        <Button
          v-if="canDownload"
          variant="weak"
          @click="emit('download', item)"
          ><Download :size="16" aria-hidden="true" />다운로드</Button
        >
      </footer>
    </DialogContent>
  </DialogRoot>
</template>
