<script setup lang="ts">
import { ref, useId } from "vue";
import { Pencil, Reply, Trash2 } from "@lucide/vue";
import {
  AlertDialogRoot,
  AlertDialogTrigger,
  AlertDialogCancel,
} from "reka-ui";
import {
  AlertDialogContent,
  AlertDialogTitle,
  AlertDialogDescription,
} from "../styled";
import Button from "../Button.vue";
import CommentComposer from "./CommentComposer.vue";
import type { CommentItem, CommentThreadProps } from "./types";

const props = defineProps<
  { item: CommentItem; nested?: boolean } & Pick<
    CommentThreadProps,
    "onEdit" | "onDelete" | "onReply"
  >
>();
const authorId = useId();
const editing = ref(false);
const replying = ref(false);
const confirming = ref(false);
const deleting = ref(false);
const deleteError = ref("");
function updateConfirm(open: boolean) {
  if (!deleting.value && (!open || (!editing.value && !replying.value))) {
    confirming.value = open;
    if (open) deleteError.value = "";
  }
}
async function remove() {
  if (!props.onDelete || deleting.value || editing.value || replying.value)
    return;
  deleting.value = true;
  deleteError.value = "";
  try {
    await props.onDelete(props.item.id);
    confirming.value = false;
  } catch {
    deleteError.value = "삭제하지 못했습니다. 다시 시도해 주세요.";
  } finally {
    deleting.value = false;
  }
}
async function edit(body: string) {
  if (!props.item.canEdit || !props.onEdit)
    throw new Error("Editing unavailable");
  await props.onEdit(props.item.id, body);
  editing.value = false;
}
async function reply(body: string) {
  if (!props.item.canReply || !props.onReply)
    throw new Error("Reply unavailable");
  await props.onReply(props.item.id, body);
  replying.value = false;
}
</script>

<template>
  <li class="cheese-comment-entry">
    <article :aria-labelledby="authorId">
      <header class="cheese-comment-meta">
        <strong :id="authorId">{{ item.author }}</strong
        ><time :datetime="item.datetime">{{ item.time }}</time
        ><span v-if="item.edited">수정됨</span>
      </header>
      <CommentComposer
        v-if="editing"
        label="댓글 수정"
        :default-value="item.body"
        submit-label="변경 저장"
        :disabled="!item.canEdit || !onEdit"
        :on-cancel="() => (editing = false)"
        :on-submit="edit"
      />
      <p v-else class="cheese-comment-body">{{ item.body }}</p>
      <div class="cheese-comment-actions">
        <Button
          v-if="!editing && !replying && item.canEdit && onEdit"
          variant="ghost"
          size="sm"
          :aria-label="`${item.author} 댓글 수정`"
          @click="editing = true"
          ><Pencil :size="14" aria-hidden="true" />수정</Button
        >
        <AlertDialogRoot
          v-if="item.canDelete && onDelete"
          :open="confirming"
          @update:open="updateConfirm"
          ><AlertDialogTrigger as-child
            ><Button
              variant="ghost"
              size="sm"
              :aria-label="`${item.author} 댓글 삭제`"
              :disabled="editing || replying"
              ><Trash2 :size="14" aria-hidden="true" />삭제</Button
            ></AlertDialogTrigger
          ><AlertDialogContent
            ><AlertDialogTitle>댓글을 삭제할까요?</AlertDialogTitle
            ><AlertDialogDescription
              >아래 댓글을 삭제합니다. 내용을 확인한 후 삭제해
              주세요.</AlertDialogDescription
            >
            <p class="cheese-comment-delete-preview">{{ item.body }}</p>
            <p
              v-if="deleteError"
              class="cheese-collaboration-error"
              role="alert"
            >
              {{ deleteError }}
            </p>
            <div class="cheese-comment-confirm-actions">
              <AlertDialogCancel as-child
                ><Button variant="ghost" :disabled="deleting"
                  >취소</Button
                ></AlertDialogCancel
              ><Button variant="critical" :loading="deleting" @click="remove"
                >삭제</Button
              >
            </div></AlertDialogContent
          ></AlertDialogRoot
        >
        <Button
          v-if="!nested && !editing && !replying && item.canReply && onReply"
          variant="ghost"
          size="sm"
          :aria-label="`${item.author} 댓글에 답글 작성`"
          @click="replying = true"
          ><Reply :size="14" aria-hidden="true" />답글</Button
        >
      </div>
      <CommentComposer
        v-if="replying"
        :label="`${item.author}님에게 답글 작성`"
        submit-label="답글 등록"
        :disabled="!item.canReply || !onReply"
        :on-cancel="() => (replying = false)"
        :on-submit="reply"
      />
    </article>
    <ul v-if="!nested && item.replies?.length" class="cheese-comment-replies">
      <CommentEntry
        v-for="itemReply in item.replies"
        :key="itemReply.id"
        :item="itemReply"
        nested
        :on-edit="onEdit"
        :on-delete="onDelete"
      />
    </ul>
  </li>
</template>
