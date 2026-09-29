<script setup lang="ts" generic="T extends DataRow">
import DataTable from "./DataTable.vue";
import FilterBar from "./patterns/FilterBar.vue";
import BulkActionBar from "./patterns/BulkActionBar.vue";
import type { DataRow, RowsLoader, TableColumn, TableQuery } from "./business";
import type { BulkActionResult, FilterBarFilter } from "./patterns/types";

/**
 * The feature owns query, selection, filter values and operation results.
 * Apply facets to local rows or capture them in loadRows. DataTable retains
 * local querying and remote cancellation; this composition never filters a
 * remote result. Query changes retain selection until it is explicitly cleared.
 */
const props = defineProps<{
  label: string;
  columns: TableColumn[];
  rows?: T[];
  loadRows?: RowsLoader<T>;
  getRowId: (row: T) => string;
  rowLabel?: (row: T) => string;
  isRowSelectable?: (row: T) => boolean;
  query: TableQuery;
  selected: string[];
  filters?: FilterBarFilter[];
  searchLabel?: string;
  /** Optional authoritative count; omit while a server total is unknown. */
  resultCount?: number;
  bulkBusy?: boolean;
  bulkResult?: BulkActionResult;
  bulkRetryable?: boolean;
}>();
const emit = defineEmits<{
  "update:query": [query: TableQuery];
  "query-change": [query: TableQuery];
  "update:selected": [keys: string[]];
  "filter-change": [id: string, value: string];
  "reset-filters": [];
  "clear-selection": [];
  "retry-bulk-actions": [];
}>();
defineSlots<{
  toolbar?(): unknown;
  "bulk-actions"?(): unknown;
  cell?(props: { row: T; column: TableColumn }): unknown;
}>();

function changeQuery(query: TableQuery) {
  emit("update:query", query);
  emit("query-change", query);
}
function changeSearch(search: string) {
  changeQuery({ ...props.query, page: 1, search });
}
function changeFilter(id: string, value: string) {
  emit("filter-change", id, value);
  if (props.query.page !== 1) changeQuery({ ...props.query, page: 1 });
}
function resetFilters() {
  changeQuery({ ...props.query, page: 1, search: "" });
  // A feature may extend the default query reset in this callback.
  emit("reset-filters");
}
function clearSelection() {
  emit("update:selected", []);
  emit("clear-selection");
}
</script>

<template>
  <section class="cheese-record-collection" :aria-label="label">
    <FilterBar
      :label="`${label} 검색 및 필터`"
      :search="query.search"
      :search-label="searchLabel ?? `${label} 검색`"
      :filters="filters ?? []"
      :result-count="resultCount"
      @update:search="changeSearch"
      @filter-change="changeFilter"
      @reset="resetFilters"
    />
    <div v-if="$slots.toolbar" class="cheese-record-collection-toolbar">
      <slot name="toolbar" />
    </div>
    <div
      v-if="selected.length || bulkBusy || bulkResult"
      class="cheese-record-collection-selection"
    >
      <BulkActionBar
        :selected-count="selected.length"
        :actions="[]"
        :busy="bulkBusy"
        :result="bulkResult"
        :retryable="bulkRetryable"
        @clear="clearSelection"
        @retry="emit('retry-bulk-actions')"
      />
      <div
        v-if="$slots['bulk-actions']"
        class="cheese-record-collection-actions"
      >
        <slot name="bulk-actions" />
      </div>
    </div>
    <DataTable
      :label="label"
      :columns="columns"
      :rows="rows"
      :load-rows="loadRows"
      :get-row-id="getRowId"
      :row-label="rowLabel"
      :is-row-selectable="isRowSelectable"
      :query="query"
      :selected="selected"
      :show-search="false"
      :show-selection-summary="false"
      @update:query="changeQuery"
      @update:selected="emit('update:selected', $event)"
    >
      <template v-if="$slots.cell" #cell="{ row, column }">
        <slot name="cell" :row="row" :column="column" />
      </template>
    </DataTable>
  </section>
</template>
