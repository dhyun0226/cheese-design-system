<script setup lang="ts">
import { useId } from "vue";
import { MessageSquare } from "@lucide/vue";
import Button from "../Button.vue";
import CommentEntry from "./CommentEntry.vue";
import type { CommentThreadProps } from "./types";
withDefaults(defineProps<CommentThreadProps>(), {
  label: "댓글",
  loading: false,
});
const id = useId();
</script>

<template>
  <section class="cheese-comment-thread cheese-root" :aria-labelledby="id">
    <header class="cheese-collaboration-header">
      <h2 :id="id">{{ label }}</h2>
    </header>
    <div v-if="error" class="cheese-collaboration-error" role="alert">
      <p>{{ error }}</p>
      <Button
        v-if="onRetry"
        variant="ghost"
        size="sm"
        :disabled="loading"
        @click="onRetry"
        >다시 시도</Button
      >
    </div>
    <div :aria-busy="loading">
      <p v-if="loading" class="cheese-collaboration-state" role="status">
        댓글을 불러오는 중입니다.
      </p>
      <div
        v-if="!loading && !error && !items.length"
        class="cheese-collaboration-empty"
      >
        <MessageSquare :size="24" aria-hidden="true" />
        <p>아직 작성된 댓글이 없습니다.</p>
      </div>
      <ul v-if="items.length" class="cheese-comment-list">
        <CommentEntry
          v-for="item in items"
          :key="item.id"
          :item="item"
          :on-edit="onEdit"
          :on-delete="onDelete"
          :on-reply="onReply"
        />
      </ul>
    </div>
  </section>
</template>
