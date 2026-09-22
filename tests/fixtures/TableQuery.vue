<script setup lang="ts">
import { ref } from "vue";
import {
  DataTable,
  queryRows,
  type TableQuery,
  type RowsLoader,
} from "@cheese/vue";

const props = defineProps<{
  remote: boolean;
  controlled: boolean;
  initialPage: number;
}>();
const defaults = (): TableQuery => ({
  page: 1,
  pageSize: 5,
  search: "",
  sort: null,
});
const columns = [
  { key: "name", label: "이름" },
  { key: "team", label: "팀" },
];
const rows = Array.from({ length: 30 }, (_, index) => ({
  id: String(index + 1),
  name: `구성원 ${String(index + 1).padStart(2, "0")}`,
  team: index % 2 ? "개발" : "디자인",
}));
const query = ref<TableQuery>({ ...defaults(), page: props.initialPage });
const reject = ref(false);
const proposals = ref<TableQuery[]>([]);
const legacy = ref<TableQuery[]>([]);
const requests = ref<TableQuery[]>([]);
const loader: RowsLoader = async (value) => {
  requests.value.push(value);
  await new Promise((resolve) =>
    setTimeout(resolve, value.search === "slow" ? 450 : 80),
  );
  return queryRows(value.search === "few" ? rows.slice(0, 2) : rows, columns, {
    ...value,
    search: ["slow", "fast", "few"].includes(value.search) ? "" : value.search,
  });
};
function change(next: TableQuery) {
  proposals.value.push(next);
  if (!reject.value && props.controlled) query.value = next;
}
</script>
<template>
  <main
    class="cheese-root cheese-stack"
    style="max-width: 850px; margin: 24px auto"
  >
    <h1>외부 테이블 쿼리</h1>
    <div class="cheese-inline">
      <button
        @click="
          query = {
            page: 3,
            pageSize: 5,
            search: '구성원',
            sort: { key: 'name', direction: 'desc' },
          }
        "
      >
        외부 복원
      </button>
      <button @click="query = defaults()">전체 초기화</button>
      <button
        @click="
          query = { ...query, sort: query.sort ? { ...query.sort } : null }
        "
      >
        동일 값 재렌더
      </button>
      <button @click="query = { ...defaults(), search: 'few' }">
        작은 결과
      </button>
      <button @click="query = { ...defaults(), page: 3, search: 'slow' }">
        느린 복원
      </button>
      <button @click="query = { ...defaults(), page: 2, search: 'fast' }">
        빠른 복원
      </button>
      <button @click="query = { ...defaults(), page: 9 }">범위 밖 복원</button>
      <label><input v-model="reject" type="checkbox" />변경 거절</label>
    </div>
    <DataTable
      label="직원"
      :columns="columns"
      :rows="rows"
      :load-rows="remote ? loader : undefined"
      :query="controlled ? query : undefined"
      :default-query="{ ...defaults(), page: initialPage }"
      :get-row-id="(row) => String(row.id)"
      :debounce-ms="200"
      @update:query="change"
      @query-change="legacy.push($event)"
    />
    <output data-testid="query">{{ JSON.stringify(query) }}</output>
    <output data-testid="proposals">{{ JSON.stringify(proposals) }}</output>
    <output data-testid="requests">{{ JSON.stringify(requests) }}</output>
    <output data-testid="proposal-count">{{ proposals.length }}</output>
    <output data-testid="legacy-count">{{ legacy.length }}</output>
    <output data-testid="request-count">{{ requests.length }}</output>
  </main>
</template>
