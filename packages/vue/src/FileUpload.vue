<script setup lang="ts">
import { ref, shallowRef, onMounted, onBeforeUnmount, watch, useId } from "vue";
import {
  Upload,
  File,
  X,
  RotateCcw,
  CircleCheck,
  CircleAlert,
} from "@lucide/vue";
import Button from "./Button.vue";
import {
  UploadQueue,
  formatFileSize,
  type UploadHandler,
  type UploadItem,
} from "./business";
const props = withDefaults(
  defineProps<{
    label: string;
    upload: UploadHandler;
    disabled?: boolean;
    accept?: string;
    maxSize?: number;
    maxFiles?: number;
  }>(),
  { maxSize: 10 * 1024 * 1024, maxFiles: 5 },
);
const emit = defineEmits<{
  change: [items: UploadItem[]];
  complete: [item: UploadItem];
}>();
const items = shallowRef<UploadItem[]>([]),
  errors = ref<string[]>([]),
  drag = ref(false),
  input = ref<HTMLInputElement>(),
  root = ref<HTMLDivElement>(),
  id = useId();
const queue = new UploadQueue(
  (next) => {
    items.value = next;
    emit("change", next);
  },
  (item) => emit("complete", item),
);
const statusLabel = {
  queued: "대기",
  uploading: "업로드 중",
  success: "완료",
  error: "실패",
  canceled: "취소됨",
};
let form: HTMLFormElement | null | undefined;
const reset = (event: Event) =>
  queueMicrotask(() => {
    if (!event.defaultPrevented) {
      queue.clear();
      errors.value = [];
    }
  });
onMounted(() => {
  form = root.value?.closest("form");
  form?.addEventListener("reset", reset);
});
onBeforeUnmount(() => {
  form?.removeEventListener("reset", reset);
  queue.dispose();
});
watch(
  () => props.disabled,
  (value) => {
    if (value)
      for (const item of queue.items)
        if (item.status === "uploading") queue.cancel(item.id);
  },
);
function add(files: File[]) {
  if (!props.disabled) errors.value = queue.add(files, props);
}
function choose(event: Event) {
  const target = event.target as HTMLInputElement;
  add(Array.from(target.files ?? []));
  target.value = "";
}
function drop(event: DragEvent) {
  drag.value = false;
  add(Array.from(event.dataTransfer?.files ?? []));
}
function leave(event: DragEvent) {
  if (!root.value?.contains(event.relatedTarget as Node)) drag.value = false;
}
</script>
<template>
  <div
    ref="root"
    class="cheese-file-upload"
    role="group"
    :aria-labelledby="id + '-label'"
  >
    <span :id="id + '-label'" class="cheese-label">{{ label }}</span>
    <div
      class="cheese-dropzone"
      :data-dragging="drag && !disabled"
      :data-disabled="disabled || undefined"
      @dragover.prevent="!disabled && (drag = true)"
      @dragleave="leave"
      @drop.prevent="drop"
    >
      <Upload :size="28" aria-hidden="true" />
      <p>파일을 끌어 놓거나 직접 선택하세요.</p>
      <Button variant="weak" :disabled="disabled" @click="input?.click()"
        >파일 선택</Button
      ><input
        ref="input"
        type="file"
        class="cheese-sr-only"
        tabindex="-1"
        :aria-label="label + ' 파일 선택'"
        :accept="accept"
        :multiple="maxFiles > 1"
        :disabled="disabled"
        @change="choose"
      />
      <p class="cheese-help">
        최대 {{ maxFiles }}개 · 파일당 {{ formatFileSize(maxSize)
        }}{{ accept ? " · " + accept : "" }}
      </p>
    </div>
    <div v-if="errors.length" role="alert" class="cheese-upload-errors">
      <p v-for="(error, index) in errors" :key="index">{{ error }}</p>
    </div>
    <ul class="cheese-upload-list" :aria-label="label + ' 파일 목록'">
      <li v-for="item in items" :key="item.id" class="cheese-upload-item">
        <File :size="20" aria-hidden="true" />
        <div class="cheese-upload-copy">
          <strong>{{ item.file.name }}</strong
          ><span class="cheese-help"
            >{{ formatFileSize(item.file.size) }} ·
            {{ statusLabel[item.status] }}</span
          ><progress
            v-if="item.status === 'uploading'"
            class="cheese-upload-progress"
            :max="100"
            :value="item.progress"
            :aria-label="item.file.name + ' 업로드 진행률'"
          /><span v-if="item.error" role="alert" class="cheese-help">{{
            item.error
          }}</span>
        </div>
        <CircleCheck
          v-if="item.status === 'success'"
          :size="20"
          aria-label="업로드 완료"
        /><Button
          v-else-if="item.status === 'uploading'"
          variant="ghost"
          size="sm"
          :aria-label="item.file.name + ' 업로드 취소'"
          @click="queue.cancel(item.id)"
          >취소</Button
        ><Button
          v-else
          variant="weak"
          size="sm"
          :disabled="disabled"
          :aria-label="
            item.file.name + (item.status === 'queued' ? ' 업로드' : ' 재시도')
          "
          @click="queue.start(item.id, upload)"
          ><Upload
            v-if="item.status === 'queued'"
            :size="16"
            aria-hidden="true"
          /><RotateCcw v-else :size="16" aria-hidden="true" />{{
            item.status === "queued" ? "업로드" : "재시도"
          }}</Button
        ><Button
          variant="ghost"
          size="sm"
          :disabled="disabled"
          :aria-label="item.file.name + ' 삭제'"
          @click="queue.remove(item.id)"
          ><X :size="16" aria-hidden="true"
        /></Button>
      </li>
    </ul>
    <p class="cheese-help" role="status">
      {{ items.length }}개 파일 ·
      {{ items.filter((item) => item.status === "success").length }}개 완료
    </p>
    <p class="cheese-help">
      <CircleAlert :size="14" class="cheese-inline-icon" aria-hidden="true" />
      업로드 버튼을 눌러 전송합니다. 완료 파일의 삭제 버튼은 목록에서만
      제거합니다.
    </p>
  </div>
</template>
