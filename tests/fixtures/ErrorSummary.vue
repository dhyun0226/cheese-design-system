<script setup lang="ts">
import { nextTick, ref } from "vue";
import { DateField, ErrorSummary, Input, Select } from "@cheese/vue";
type Item = { id: string; message: string; targetId?: string };
const props = defineProps<{ initialErrors: Item[] }>();
const errors = ref(props.initialErrors);
const summary = ref<{ focus: () => void }>();
async function submit(event: Event) {
  event.preventDefault();
  errors.value = props.initialErrors;
  await nextTick();
  summary.value?.focus();
}
function navigate(item: Item, event: Event) {
  if (item.id === "custom") {
    event.preventDefault();
    document.getElementById("custom-target")?.focus();
  }
}
</script>
<template>
  <main
    class="cheese-root cheese-stack"
    style="
      box-sizing: border-box;
      width: 100%;
      max-width: 600px;
      margin: 24px auto;
      padding: 20px;
    "
  >
    <h1>오류 요약</h1>
    <form
      class="cheese-stack"
      novalidate
      aria-label="업무 작성"
      @submit="submit"
    >
      <ErrorSummary ref="summary" :errors="errors" @navigate="navigate" />
      <label for="task-name">업무 이름</label>
      <Input id="task-name" name="name" />
      <Select
        id="assignee"
        label="담당자"
        name="assignee"
        :options="[{ value: 'kim', label: '김치즈' }]"
      />
      <DateField id="due-date" label="마감일" name="date" />
      <div id="group">
        <input
          aria-label="내부 제출 값"
          style="
            position: absolute;
            width: 1px;
            height: 1px;
            clip: rect(0px, 0px, 0px, 0px);
          "
          tabindex="-1"
        />
        <button type="button">연결 항목 선택</button>
      </div>
      <button id="custom-default" type="button">기본 복합 항목</button>
      <button id="custom-target" type="button">직접 지정한 복합 항목</button>
      <button id="disabled-target" type="button" disabled>사용 불가</button>
      <input id="hidden-target" type="hidden" value="proxy" />
      <button type="submit">제출 실패</button>
      <button type="button" @click="errors = []">오류 지우기</button>
      <button
        type="button"
        @click="
          errors = [
            ...initialErrors,
            { id: 'long', message: '긴오류메시지'.repeat(35) },
          ]
        "
      >
        오류 추가
      </button>
    </form>
  </main>
</template>
