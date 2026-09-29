<script setup lang="ts">
import { computed, ref, useId } from "vue";
import { Bell, Check } from "@lucide/vue";
import Button from "../Button.vue";
import type { NotificationCenterProps, NotificationItem } from "./types";

const props = withDefaults(defineProps<NotificationCenterProps>(), {
  title: "알림",
  loading: false,
});
const titleId = useId();
const pending = ref(false);
const actionError = ref("");
const count = computed(() =>
  Math.max(
    0,
    props.unreadCount ?? props.items.filter((item) => !item.read).length,
  ),
);
async function perform(action: () => void | Promise<void>) {
  if (pending.value) return;
  pending.value = true;
  actionError.value = "";
  try {
    await action();
  } catch {
    actionError.value =
      "알림을 읽음으로 변경하지 못했습니다. 다시 시도해 주세요.";
  } finally {
    pending.value = false;
  }
}
function navigate(item: NotificationItem, event: MouseEvent) {
  if (props.onNavigate) {
    event.preventDefault();
    props.onNavigate(item);
  }
}
function notificationHref(value?: string) {
  if (!value || /[\u0000-\u001f\u007f]/u.test(value)) return undefined;
  try {
    const url = new URL(value, "https://cheese.invalid");
    return url.protocol === "http:" || url.protocol === "https:"
      ? value
      : undefined;
  } catch {
    return undefined;
  }
}
</script>

<template>
  <section
    class="cheese-notification-center cheese-root"
    :aria-labelledby="titleId"
  >
    <header class="cheese-collaboration-header">
      <h2 :id="titleId">
        {{ title
        }}<span
          class="cheese-notification-count"
          role="status"
          aria-live="polite"
          aria-atomic="true"
          :aria-label="`읽지 않은 알림 ${count}개`"
          >{{ count }}</span
        >
      </h2>
      <Button
        v-if="onReadAll"
        variant="ghost"
        size="sm"
        :disabled="pending || loading || count === 0"
        @click="perform(onReadAll)"
        ><Check :size="16" aria-hidden="true" />모두 읽음</Button
      >
    </header>
    <div
      v-if="error || actionError"
      class="cheese-collaboration-error"
      role="alert"
    >
      <p>{{ error || actionError }}</p>
      <Button
        v-if="error && onRetry"
        variant="ghost"
        size="sm"
        :disabled="loading"
        @click="onRetry"
        >다시 시도</Button
      >
    </div>
    <div :aria-busy="loading || pending">
      <p v-if="loading" class="cheese-collaboration-state" role="status">
        알림을 불러오는 중입니다.
      </p>
      <div
        v-if="!loading && !error && !items.length"
        class="cheese-collaboration-empty"
      >
        <Bell :size="24" aria-hidden="true" />
        <p>새로운 알림이 없습니다.</p>
      </div>
      <ul v-if="items.length" class="cheese-notification-list">
        <li
          v-for="item in items"
          :key="item.id"
          class="cheese-notification-item"
          :data-unread="!item.read || undefined"
        >
          <span
            class="cheese-notification-marker"
            role="img"
            :aria-label="item.read ? '읽음' : '읽지 않음'"
          />
          <div class="cheese-notification-copy">
            <a
              v-if="notificationHref(item.href)"
              class="cheese-notification-title"
              :href="notificationHref(item.href)"
              @click="navigate(item, $event)"
              >{{ item.title }}</a
            ><button
              v-else-if="onNavigate"
              class="cheese-notification-title"
              type="button"
              @click="onNavigate(item)"
            >
              {{ item.title }}</button
            ><strong v-else class="cheese-notification-title">{{
              item.title
            }}</strong>
            <p v-if="item.body">{{ item.body }}</p>
            <time :datetime="item.datetime">{{ item.time }}</time>
          </div>
          <Button
            v-if="!item.read && onRead"
            variant="ghost"
            size="sm"
            :disabled="pending || loading"
            :aria-label="`${item.title} 읽음으로 표시`"
            @click="perform(() => onRead!(item.id))"
            ><Check :size="16" aria-hidden="true" /><span>읽음</span></Button
          >
        </li>
      </ul>
    </div>
  </section>
</template>
