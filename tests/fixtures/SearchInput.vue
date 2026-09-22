<script setup lang="ts">
import { computed, ref } from "vue";
import { SearchInput } from "@cheese/vue";

const props = defineProps<{ scenario: string; external: boolean }>();
const controlled = computed(() =>
  ["controlled", "reject", "normalize"].includes(props.scenario),
);
const value = ref("저장 업무");
const changes = ref<string[]>([]);
const searches = ref<string[]>([]);
const submits = ref(0);
const result = ref("");
const cancelReset = ref(false);
const resets = ref(0);
const escapes = ref<boolean[]>([]);
const keyCount = ref(0);
const compositions = ref([0, 0, 0]);
const searchListener = computed(() =>
  props.scenario === "native"
    ? {}
    : { search: (query: string) => searches.value.push(query) },
);
function change(next: string) {
  changes.value.push(next);
  if (props.scenario !== "reject")
    value.value = props.scenario === "normalize" ? next.toUpperCase() : next;
}
function submit(event: Event) {
  event.preventDefault();
  submits.value++;
  result.value = JSON.stringify([
    ...new FormData(event.currentTarget as HTMLFormElement),
  ]);
}
function reset(event: Event) {
  resets.value++;
  if (cancelReset.value) event.preventDefault();
}
function escape(event: KeyboardEvent) {
  if (event.key === "Escape") escapes.value.push(event.defaultPrevented);
}
</script>
<template>
  <main
    class="cheese-root cheese-stack"
    style="max-width: 560px; margin: 0 auto; padding: 16px"
    @keydown="escape"
  >
    <h1>검색 입력 계약</h1>
    <label><input v-model="cancelReset" type="checkbox" />초기화 취소</label>
    <form
      v-if="external"
      id="search-form"
      aria-label="검색 폼"
      @submit="submit"
      @reset="reset"
    ></form>
    <component
      :is="external ? 'div' : 'form'"
      :id="external ? undefined : 'search-form'"
      :aria-label="external ? undefined : '검색 폼'"
      class="cheese-stack"
      @submit="submit"
      @reset="reset"
    >
      <SearchInput
        label="업무 검색"
        name="query"
        :form="external ? 'search-form' : undefined"
        :default-value="scenario === 'native' ? '' : '기본 업무'"
        :model-value="controlled ? value : undefined"
        description="제목 또는 담당자로 검색하세요."
        placeholder="업무 제목 검색"
        autocomplete="off"
        :required="scenario === 'native'"
        :disabled="scenario === 'disabled'"
        :read-only="scenario === 'readonly'"
        @update:model-value="change"
        @keydown="keyCount++"
        @compositionstart="compositions[0]++"
        @compositionupdate="compositions[1]++"
        @compositionend="compositions[2]++"
        v-on="searchListener"
      />
    </component>
    <button type="submit" form="search-form">폼 제출</button>
    <button type="reset" form="search-form">검색 초기화</button>
    <output data-testid="changes">{{ JSON.stringify(changes) }}</output>
    <output data-testid="searches">{{ JSON.stringify(searches) }}</output>
    <output data-testid="submits">{{ submits }}</output>
    <output data-testid="resets">{{ resets }}</output>
    <output data-testid="result">{{ result }}</output>
    <output data-testid="escapes">{{ JSON.stringify(escapes) }}</output>
    <output data-testid="key-count">{{ keyCount }}</output>
    <output data-testid="compositions">{{
      JSON.stringify(compositions)
    }}</output>
  </main>
</template>
