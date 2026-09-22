<script setup lang="ts">
import { ref } from "vue";
import {
  Editable,
  TagsInput,
  Rating,
  MonthPicker,
  YearPicker,
} from "@cheese/vue";
defineProps<{ controlled: boolean }>();
const preventReset = ref(false);
const disabled = ref(false);
const fieldsetDisabled = ref(false);
const tags = ref(["기본"]);
const text = ref("기본 업무");
const month = ref("2026-09");
const year = ref(2026);
const requiredData = ref("");
const ratingSubmits = ref(0);
function reset(event: Event) {
  if (preventReset.value) event.preventDefault();
}
function submit(event: Event) {
  event.preventDefault();
  requiredData.value = JSON.stringify([
    ...new FormData(event.currentTarget as HTMLFormElement),
  ]);
}
</script>
<template>
  <main
    class="cheese-root cheese-stack"
    style="max-width: 720px; margin: 24px auto"
  >
    <h1>필드 제출 계약</h1>
    <label><input v-model="preventReset" type="checkbox" />초기화 취소</label>
    <label><input v-model="disabled" type="checkbox" />필드 비활성화</label>
    <label
      ><input v-model="fieldsetDisabled" type="checkbox" />폼 그룹
      비활성화</label
    >
    <form aria-label="필수 편집" class="cheese-stack" @submit="submit">
      <label>선행 필드<input name="first" required /></label>
      <Editable label="필수 제목" name="title" required :disabled="disabled" />
      <Editable label="필수 설명" required :disabled="disabled" />
      <button type="submit">편집 제출</button>
      <output data-testid="required-data">{{ requiredData }}</output>
    </form>
    <form
      aria-label="필수 평점"
      class="cheese-stack"
      @reset="reset"
      @submit.prevent="ratingSubmits++"
    >
      <Rating label="업무 평점" name="rating" required :disabled="disabled" />
      <Rating label="이름 없는 평점" required :disabled="disabled" />
      <button type="submit">평점 제출</button>
      <button type="reset">평점 초기화</button>
      <output data-testid="rating-submits">{{ ratingSubmits }}</output>
    </form>
    <form
      aria-label="임시 입력"
      class="cheese-stack"
      @submit.prevent
      @reset="reset"
    >
      <TagsInput
        label="업무 태그"
        name="tags"
        :default-value="['기본']"
        :model-value="controlled ? tags : undefined"
        @update:model-value="tags = $event"
      />
      <Editable
        label="업무 제목"
        name="title"
        default-value="기본 업무"
        :model-value="controlled ? text : undefined"
        @update:model-value="text = $event"
        required
      />
      <button type="reset">임시 입력 초기화</button>
    </form>
    <form aria-label="기간 제출" class="cheese-stack" @reset="reset">
      <fieldset :disabled="fieldsetDisabled">
        <MonthPicker
          label="계획 월"
          name="month"
          default-value="2026-09"
          :model-value="controlled ? month : undefined"
          @update:model-value="month = $event"
          :disabled="disabled"
        />
        <YearPicker
          label="계획 연도"
          name="year"
          :default-value="2026"
          :model-value="controlled ? year : undefined"
          @update:model-value="year = $event"
          :disabled="disabled"
        />
      </fieldset>
      <button type="reset">기간 초기화</button>
    </form>
  </main>
</template>
