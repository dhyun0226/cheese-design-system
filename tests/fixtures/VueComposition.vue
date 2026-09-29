<script setup lang="ts">
import { ref } from "vue";
import {
  AppShell,
  Button,
  PageHeader,
  RecordCollection,
  UserIdentity,
  queryRows,
  type BulkActionResult,
  type DataRow,
  type NavigationItem,
  type RowsLoader,
  type TableColumn,
  type TableQuery,
} from "@cheese/vue";

const scenario = new URLSearchParams(location.search).get("case");
const items: NavigationItem[] = [
  { id: "current", label: "Current page", group: "Workspace" },
  {
    id: "leave",
    label: "Leave page",
    href: "#destination",
    group: "Workspace",
  },
  {
    id: "disabled",
    label: "Disabled page",
    href: "#disabled",
    disabled: true,
    group: "Administration",
  },
];
const activeId = ref("current");
const cancel = ref(true);
const events = ref({ id: "none", count: 0 });
function navigate(id: string, event: MouseEvent) {
  events.value = { id, count: events.value.count + 1 };
  if (cancel.value) event.preventDefault();
  else {
    if (id === "current") event.preventDefault();
    activeId.value = id;
  }
}

interface RecordRow extends DataRow {
  id: string;
  name: string;
  department: string;
  amount: number;
  selectable: boolean;
}
const rows: RecordRow[] = [
  {
    id: "alpha",
    name: "Alpha",
    department: "Operations",
    amount: 120,
    selectable: true,
  },
  {
    id: "beta",
    name: "Beta",
    department: "Finance",
    amount: 240,
    selectable: true,
  },
  {
    id: "gamma",
    name: "Gamma",
    department: "Operations",
    amount: 360,
    selectable: false,
  },
];
const columns: TableColumn[] = [
  { key: "name", label: "Name" },
  { key: "department", label: "Department" },
  { key: "amount", label: "Amount" },
];
const query = ref<TableQuery>({ page: 1, pageSize: 5, search: "", sort: null });
const selected = ref<string[]>([]);
const bulkResult = ref<BulkActionResult>();
const failNext = ref(true);
const requests = ref(0);
const loadRows: RowsLoader<RecordRow> = async (next, { signal }) => {
  const reject = failNext.value;
  failNext.value = false;
  requests.value += 1;
  await new Promise((resolve) => setTimeout(resolve, 25));
  if (signal.aborted) throw new DOMException("Aborted", "AbortError");
  if (reject) throw new Error("Fixture request failed");
  return queryRows(rows, columns, next);
};
const getRowId = (row: RecordRow) => row.id;
const rowLabel = (row: RecordRow) => row.name;
const isRowSelectable = (row: RecordRow) => row.selectable;
function renderCell(row: RecordRow, column: TableColumn) {
  return column.key === "amount"
    ? `${row.amount.toFixed(2)} credits`
    : String(row[column.key] ?? "");
}
function applyBulkAction() {
  bulkResult.value = { succeeded: selected.value.length, failed: 0 };
  selected.value = [];
}
</script>

<template>
  <AppShell
    v-if="scenario !== 'records'"
    variant="application"
    navigation-label="Fixture workspace"
    :items="items"
    :active-id="activeId"
    @navigate="navigate"
  >
    <template #brand>Fixture workspace</template>
    <template #user>
      <UserIdentity name="Alex Morgan" description="Workspace member" />
    </template>
    <main class="cheese-stack" style="padding: 24px">
      <PageHeader
        title="Navigation composition"
        description="The application controls the active destination."
      />
      <label>
        <input v-model="cancel" type="checkbox" />
        Cancel navigation
      </label>
      <output aria-label="Navigation events" data-testid="navigation-events"
        >{{ events.id }}:{{ events.count }}</output
      >
      <p id="destination">Destination content</p>
    </main>
  </AppShell>
  <main
    v-else
    class="cheese-root cheese-stack"
    style="max-width: 960px; margin: 24px auto; padding: 16px"
  >
    <PageHeader title="Record composition" />
    <label>
      <input v-model="failNext" type="checkbox" />
      Fail next request
    </label>
    <output aria-label="Request count" data-testid="request-count">{{
      requests
    }}</output>
    <output aria-label="Selected records" data-testid="selected-records">{{
      selected.join(",") || "none"
    }}</output>
    <output aria-label="Record query" data-testid="record-query">{{
      JSON.stringify(query)
    }}</output>
    <RecordCollection
      v-model:query="query"
      v-model:selected="selected"
      label="Fixture records"
      :columns="columns"
      :load-rows="loadRows"
      :get-row-id="getRowId"
      :row-label="rowLabel"
      :is-row-selectable="isRowSelectable"
      search-label="Record search"
      :bulk-result="bulkResult"
      @clear-selection="bulkResult = undefined"
    >
      <template #toolbar>
        <Button
          variant="weak"
          :disabled="!bulkResult"
          @click="bulkResult = undefined"
          >Dismiss bulk result</Button
        >
      </template>
      <template #bulk-actions>
        <Button :disabled="!selected.length" @click="applyBulkAction"
          >Apply bulk action</Button
        >
      </template>
      <template #cell="{ row, column }">{{ renderCell(row, column) }}</template>
    </RecordCollection>
  </main>
</template>
