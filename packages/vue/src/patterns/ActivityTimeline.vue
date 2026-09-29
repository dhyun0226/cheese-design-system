<script setup lang="ts">
import { useId } from "vue";
import { Check, Circle, CircleAlert } from "@lucide/vue";

defineProps<{
  label?: string;
  items: readonly {
    id: string;
    title: string;
    description?: string;
    actor?: string;
    time?: string;
    status?: "done" | "current" | "pending" | "error";
  }[];
}>();

const id = useId();
const activityLabels = {
  done: "완료",
  current: "진행 중",
  pending: "대기",
  error: "실패",
};
</script>

<template>
  <section
    class="cheese-activity-timeline"
    :aria-labelledby="label ? id : undefined"
    :aria-label="label ? undefined : '처리 이력'"
  >
    <h2 v-if="label" :id="id">{{ label }}</h2>
    <ol>
      <li
        v-for="item in items"
        :key="item.id"
        :data-status="item.status || 'pending'"
        :aria-current="item.status === 'current' ? 'step' : undefined"
      >
        <span class="cheese-activity-marker" aria-hidden="true">
          <Check v-if="item.status === 'done'" :size="14" />
          <CircleAlert v-else-if="item.status === 'error'" :size="14" />
          <Circle v-else :size="10" />
        </span>
        <div class="cheese-activity-copy">
          <strong>
            {{ item.title }}
            <span class="cheese-sr-only">{{
              " · " + activityLabels[item.status || "pending"]
            }}</span>
          </strong>
          <p v-if="item.description">{{ item.description }}</p>
          <div v-if="item.actor || item.time" class="cheese-activity-meta">
            <span v-if="item.actor">{{ item.actor }}</span>
            <time v-if="item.time">{{ item.time }}</time>
          </div>
        </div>
      </li>
    </ol>
  </section>
</template>
