<script setup lang="ts">
import { ref, shallowRef, computed, watch, useId, nextTick } from "vue";
import {
  PopoverRoot,
  PopoverTrigger,
  PopoverPortal,
  PopoverContent,
} from "reka-ui";
import {
  ArrowUpDown,
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  SlidersHorizontal,
  Check,
  Minus,
} from "@lucide/vue";
import Button from "./Button.vue";
import Select from "./Select.vue";
import SearchInput from "./SearchInput.vue";
import { CheckboxRoot, CheckboxIndicator } from "./styled";
import {
  queryRows,
  type DataRow,
  type TableColumn,
  type TableQuery,
  type TableResult,
  type RowsLoader,
} from "./business";
const props = withDefaults(
  defineProps<{
    label: string;
    columns: TableColumn[];
    rows?: DataRow[];
    loadRows?: RowsLoader;
    getRowId: (row: DataRow) => string;
    rowLabel?: (row: DataRow) => string;
    isRowSelectable?: (row: DataRow) => boolean;
    selected?: string[];
    defaultSelected?: string[];
    defaultPageSize?: number;
    query?: TableQuery;
    defaultQuery?: TableQuery;
    debounceMs?: number;
  }>(),
  { defaultPageSize: 5, debounceMs: 250 },
);
const emit = defineEmits<{
  "update:selected": [keys: string[]];
  "query-change": [query: TableQuery];
  "update:query": [query: TableQuery];
}>();
function copyQuery(query: TableQuery): TableQuery {
  return {
    page: Math.max(1, Math.floor(query.page) || 1),
    pageSize: Math.max(1, Math.floor(query.pageSize) || 1),
    search: query.search,
    sort: query.sort ? { ...query.sort } : null,
  };
}
function keyOf(query: TableQuery): string {
  return JSON.stringify([
    query.page,
    query.pageSize,
    query.search,
    query.sort?.key,
    query.sort?.direction,
  ]);
}
const localQuery = ref<TableQuery>(
    copyQuery(
      props.defaultQuery ?? {
        page: 1,
        pageSize: Math.max(1, props.defaultPageSize),
        search: "",
        sort: null,
      },
    ),
  ),
  localSelected = ref(props.defaultSelected ?? []),
  hidden = ref<string[]>([]),
  retry = ref(0);
const query = computed(() => copyQuery(props.query ?? localQuery.value));
const queryKey = computed(() => keyOf(query.value));
const search = ref(query.value.search),
  composing = ref(false);
const remote = shallowRef<{
    key: string;
    loader: RowsLoader;
    retry: number;
    status: "loading" | "success" | "error";
    result: TableResult;
  } | null>(null),
  id = useId();
let ticket = 0;
let canceledComposition = false;
function changeQuery(next: TableQuery) {
  const value = copyQuery(next);
  if (keyOf(value) === queryKey.value) return;
  if (props.query === undefined) localQuery.value = value;
  emit("update:query", copyQuery(value));
  emit("query-change", copyQuery(value));
}
watch(
  [() => props.query, queryKey],
  () => {
    if (composing.value) canceledComposition = true;
    search.value = query.value.search;
  },
  { flush: "sync" },
);
if (props.query === undefined) emit("query-change", copyQuery(query.value));
const selected = computed(() => props.selected ?? localSelected.value);
function changeSelection(keys: string[]) {
  if (props.selected === undefined) localSelected.value = keys;
  emit("update:selected", keys);
}
watch(
  [search, composing, queryKey, () => props.query, () => props.debounceMs],
  (_, __, cleanup) => {
    if (composing.value || search.value === query.value.search) return;
    const value = { ...query.value, page: 1, search: search.value };
    const timer = setTimeout(
      () => {
        changeQuery(value);
        if (props.query !== undefined)
          void nextTick(() => {
            search.value = query.value.search;
          });
      },
      Math.max(0, props.debounceMs),
    );
    cleanup(() => clearTimeout(timer));
  },
);
watch(
  [() => props.loadRows, queryKey, retry],
  (_, __, cleanup) => {
    const request = ++ticket,
      controller = new AbortController();
    cleanup(() => controller.abort());
    if (!props.loadRows) {
      return;
    }
    const loader = props.loadRows,
      value = copyQuery(query.value),
      source = { key: queryKey.value, loader, retry: retry.value };
    remote.value = {
      ...source,
      status: "loading",
      result: { rows: [], total: 0 },
    };
    Promise.resolve()
      .then(() => loader(value, { signal: controller.signal }))
      .then((result) => {
        if (!controller.signal.aborted && ticket === request) {
          if (
            !Array.isArray(result.rows) ||
            !Number.isFinite(result.total) ||
            result.total < 0
          )
            throw Error("Invalid table response");
          remote.value = {
            ...source,
            status: "success",
            result: { ...result, total: Math.floor(result.total) },
          };
        }
      })
      .catch(() => {
        if (!controller.signal.aborted && ticket === request) {
          remote.value = {
            ...source,
            status: "error",
            result: { rows: [], total: 0 },
          };
        }
      });
  },
  { immediate: true },
);
const currentRemote = computed(() =>
  remote.value?.key === queryKey.value &&
  remote.value.loader === props.loadRows &&
  remote.value.retry === retry.value
    ? remote.value
    : null,
);
const loading = computed(
  () =>
    !!props.loadRows &&
    (!currentRemote.value || currentRemote.value.status === "loading"),
);
const error = computed(
  () => !!props.loadRows && currentRemote.value?.status === "error",
);
const ready = computed(
  () => !props.loadRows || currentRemote.value?.status === "success",
);
const result = computed(() =>
  props.loadRows
    ? (currentRemote.value?.result ?? { rows: [], total: 0 })
    : queryRows(props.rows ?? [], props.columns, query.value),
);
const pages = computed(() =>
  ready.value
    ? Math.max(1, Math.ceil(result.value.total / query.value.pageSize))
    : query.value.page,
);
watch(
  [pages, ready, queryKey],
  () => {
    if (ready.value && query.value.page > pages.value)
      changeQuery({ ...query.value, page: pages.value });
  },
  { immediate: true },
);
const visible = computed(() =>
  props.columns.filter((column) => !hidden.value.includes(column.key)),
);
const selectable = computed(() =>
  result.value.rows
    .filter((row) => props.isRowSelectable?.(row) !== false)
    .map(props.getRowId),
);
const chosen = computed(() =>
  selectable.value.filter((key) => selected.value.includes(key)),
);
const all = computed(
  () =>
    selectable.value.length > 0 &&
    chosen.value.length === selectable.value.length,
);
function toggleAll() {
  changeSelection(
    all.value
      ? selected.value.filter((key) => !selectable.value.includes(key))
      : [...new Set([...selected.value, ...selectable.value])],
  );
}
function sort(key: string) {
  changeUserQuery({
    ...query.value,
    page: 1,
    sort:
      query.value.sort?.key === key
        ? query.value.sort.direction === "asc"
          ? { key, direction: "desc" }
          : null
        : { key, direction: "asc" },
  });
}
function changeUserQuery(next: TableQuery) {
  const nextSearch = composing.value ? query.value.search : search.value;
  changeQuery({
    ...next,
    search: nextSearch,
    page: nextSearch === query.value.search ? next.page : 1,
  });
  if (props.query !== undefined)
    void nextTick(() => {
      search.value = query.value.search;
    });
}
function changeSearch(value: string) {
  search.value =
    canceledComposition && value !== "" ? query.value.search : value;
}
function compositionEnd(event: CompositionEvent) {
  if (canceledComposition)
    (event.target as HTMLInputElement).value = query.value.search;
  search.value = canceledComposition
    ? query.value.search
    : (event.target as HTMLInputElement).value;
  composing.value = false;
}
function resumeInput() {
  if (!composing.value) canceledComposition = false;
}
function toggleRow(row: DataRow) {
  const key = props.getRowId(row);
  changeSelection(
    selected.value.includes(key)
      ? selected.value.filter((value) => value !== key)
      : [...selected.value, key],
  );
}
</script>
<template>
  <section class="cheese-data-table" :aria-label="label">
    <div class="cheese-table-toolbar">
      <SearchInput
        :id="id + '-search'"
        :label="label + ' 검색'"
        :model-value="search"
        placeholder="이름, 부서 등으로 검색"
        @update:model-value="changeSearch"
        @compositionstart="
          composing = true;
          canceledComposition = false;
        "
        @compositionend="compositionEnd"
        @keydown.capture="resumeInput"
        @pointerdown.capture="resumeInput"
      />
      <PopoverRoot>
        <PopoverTrigger as-child>
          <Button variant="weak" class="cheese-column-menu">
            <SlidersHorizontal :size="16" aria-hidden="true" />표시 열
          </Button>
        </PopoverTrigger>
        <PopoverPortal>
          <PopoverContent
            as-child
            align="end"
            :side-offset="8"
            :collision-padding="12"
          >
            <div
              class="cheese-column-options cheese-root"
              :aria-labelledby="id + '-column-title'"
            >
              <span :id="id + '-column-title'" class="cheese-sr-only"
                >{{ label }} 표시 열</span
              >
              <label
                v-for="column in columns"
                :key="column.key"
                class="cheese-check-label"
                ><CheckboxRoot
                  :model-value="!hidden.includes(column.key)"
                  :disabled="
                    visible.length === 1 && !hidden.includes(column.key)
                  "
                  @update:model-value="
                    hidden = hidden.includes(column.key)
                      ? hidden.filter((key) => key !== column.key)
                      : [...hidden, column.key]
                  "
                  ><CheckboxIndicator
                    ><Check
                      :size="14"
                      aria-hidden="true" /></CheckboxIndicator></CheckboxRoot
                >{{ column.label }}</label
              >
            </div>
          </PopoverContent>
        </PopoverPortal>
      </PopoverRoot>
    </div>
    <div class="cheese-table-selection">
      <span role="status">{{ selected.length }}개 행 선택</span
      ><Button
        v-if="selected.length"
        variant="ghost"
        size="sm"
        @click="changeSelection([])"
        >전체 선택 해제</Button
      >
    </div>
    <div
      class="cheese-table-scroll"
      tabindex="0"
      role="region"
      :aria-label="label + ' 표 영역'"
    >
      <table class="cheese-table" :aria-busy="loading">
        <caption>
          {{
            label
          }}
        </caption>
        <thead>
          <tr>
            <th scope="col" class="cheese-selection-cell">
              <CheckboxRoot
                aria-label="현재 페이지 전체 선택"
                :disabled="loading || error || !selectable.length"
                :model-value="
                  all ? true : chosen.length ? 'indeterminate' : false
                "
                @update:model-value="toggleAll"
                ><CheckboxIndicator
                  ><Check v-if="all" :size="14" aria-hidden="true" /><Minus
                    v-else
                    :size="14"
                    aria-hidden="true" /></CheckboxIndicator
              ></CheckboxRoot>
            </th>
            <th
              v-for="column in visible"
              :key="column.key"
              scope="col"
              :style="{ minWidth: (column.width ?? 130) + 'px' }"
              :aria-sort="
                query.sort?.key === column.key
                  ? query.sort.direction === 'asc'
                    ? 'ascending'
                    : 'descending'
                  : undefined
              "
            >
              <template v-if="column.sortable === false">{{
                column.label
              }}</template
              ><button
                v-else
                type="button"
                class="cheese-sort-button"
                :aria-label="column.label + ' 정렬'"
                @click="sort(column.key)"
              >
                {{ column.label
                }}<template v-if="query.sort?.key === column.key"
                  ><ChevronUp
                    v-if="query.sort.direction === 'asc'"
                    :size="15"
                    aria-hidden="true" /><ChevronDown
                    v-else
                    :size="15"
                    aria-hidden="true" /></template
                ><ArrowUpDown v-else :size="15" aria-hidden="true" />
              </button>
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="loading || error || !result.rows.length">
            <td :colspan="visible.length + 1" class="cheese-table-state">
              <span v-if="loading" role="status">데이터를 불러오는 중…</span>
              <div v-else-if="error">
                <p role="alert">데이터를 불러오지 못했습니다.</p>
                <Button variant="weak" @click="retry++">다시 불러오기</Button>
              </div>
              <span v-else role="status">검색 결과가 없습니다.</span>
            </td>
          </tr>
          <tr
            v-else
            v-for="row in result.rows"
            :key="getRowId(row)"
            :data-selected="selected.includes(getRowId(row))"
          >
            <td class="cheese-selection-cell">
              <CheckboxRoot
                :aria-label="(rowLabel?.(row) ?? getRowId(row)) + ' 행 선택'"
                :model-value="selected.includes(getRowId(row))"
                :disabled="isRowSelectable?.(row) === false"
                @update:model-value="toggleRow(row)"
                ><CheckboxIndicator
                  ><Check :size="14" aria-hidden="true" /></CheckboxIndicator
              ></CheckboxRoot>
            </td>
            <td v-for="column in visible" :key="column.key">
              <slot name="cell" :row="row" :column="column">{{
                String(row[column.key] ?? "—")
              }}</slot>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <div class="cheese-table-footer">
      <span class="cheese-help" role="status"
        >총 {{ result.total }}개 · {{ query.page }} / {{ pages }}페이지</span
      ><Select
        label="페이지 크기"
        :model-value="String(query.pageSize)"
        :options="
          [...new Set([5, 10, 20, 50, query.pageSize])]
            .sort((a, b) => a - b)
            .map((size) => ({ value: String(size), label: size + '개씩' }))
        "
        @update:model-value="
          changeUserQuery({ ...query, page: 1, pageSize: Number($event) })
        "
      />
      <div class="cheese-inline">
        <Button
          variant="weak"
          aria-label="이전 페이지"
          :disabled="query.page <= 1 || loading"
          @click="changeUserQuery({ ...query, page: query.page - 1 })"
          ><ChevronLeft :size="17" aria-hidden="true" /></Button
        ><Button
          variant="weak"
          aria-label="다음 페이지"
          :disabled="query.page >= pages || loading"
          @click="changeUserQuery({ ...query, page: query.page + 1 })"
          ><ChevronRight :size="17" aria-hidden="true"
        /></Button>
      </div>
    </div>
  </section>
</template>
