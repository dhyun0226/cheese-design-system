<script setup lang="ts">
import { computed, reactive, ref } from "vue";
import {
  ExportDialog,
  OrganizationTreeSelect,
  SavedViews,
  type ExportColumn,
  type ExportFormat,
  type ExportScope,
  type ExportSelection,
  type ImportContext,
  type OrganizationNode,
  type SavedView,
} from "@cheese/vue";

const fixtureCase = new URLSearchParams(location.search).get("case") ?? "saved";

const views: SavedView[] = [{ id: "a", label: "View A" }];
const selectedView = ref("a");
const selectEvents = ref<string[]>([]);
const savedLabels = ref<string[]>([]);
function selectView(value: string) {
  selectedView.value = value;
  selectEvents.value.push(value);
}
function saveView(label: string) {
  savedLabels.value.push(label);
  return Promise.resolve();
}

const nodeRevision = ref(0);
const selectedOrganizations = ref<string[]>([]);
const organizationNodes = ref<OrganizationNode[]>([
  {
    id: "manual",
    label: "Manual root",
    children: [
      {
        id: "manual-branch",
        label: "Manual branch",
        children: [{ id: "manual-leaf", label: "Manual leaf" }],
      },
    ],
  },
  {
    id: "collapsed",
    label: "Collapsed root",
    children: [
      {
        id: "old-branch",
        label: "Old branch",
        children: [{ id: "old-leaf", label: "Needle old" }],
      },
    ],
  },
]);
function refreshNodes() {
  organizationNodes.value = organizationNodes.value.map((node) =>
    node.id === "collapsed"
      ? {
          ...node,
          children: [
            {
              id: "fresh-branch",
              label: "Fresh branch",
              children: [{ id: "fresh-leaf", label: "Needle fresh" }],
            },
          ],
        }
      : node,
  );
  nodeRevision.value++;
}

const exportOpen = ref(false);
const configRevision = ref(0);
const configChange = ref("");
const config: {
  columns: ExportColumn[];
  scopes: ExportScope[];
  formats: ExportFormat[];
} = {
  columns: [
    { id: "name", label: "Name" },
    { id: "email", label: "Email" },
    { id: "team", label: "Team" },
  ],
  scopes: [
    { value: "current", label: "Current rows" },
    { value: "selected", label: "Selected rows" },
    { value: "all", label: "All rows" },
  ],
  formats: [
    { value: "csv", label: "CSV" },
    { value: "xlsx", label: "Workbook" },
  ],
};
// Only an explicit config revision recreates the arrays; export progress does not.
// Reactive entries also let the mutation controls exercise deep prop changes.
const exportColumns = computed<ExportColumn[]>(() => {
  void configRevision.value;
  return reactive(config.columns.map((column) => ({ ...column })));
});
const exportScopes = computed<ExportScope[]>(() => {
  void configRevision.value;
  return reactive(config.scopes.map((scope) => ({ ...scope })));
});
const exportFormats = computed<ExportFormat[]>(() => {
  void configRevision.value;
  return reactive(config.formats.map((format) => ({ ...format })));
});
type ConfigKind = "columns" | "scopes" | "formats";
type ConfigMode = "replace" | "mutate";
const changedLabels: Record<ConfigKind, string> = {
  columns: "Display name",
  scopes: "Visible rows",
  formats: "Comma-separated",
};
function changeConfig(kind: ConfigKind, mode: ConfigMode) {
  const label = changedLabels[kind];
  config[kind][0].label = label;
  if (mode === "replace") configRevision.value++;
  else {
    const arrays = {
      columns: exportColumns,
      scopes: exportScopes,
      formats: exportFormats,
    };
    arrays[kind].value[0].label = label;
  }
  configChange.value = `${kind}:${mode}`;
}

type ExportRequest = {
  signal: AbortSignal;
  promise: Promise<void>;
  resolve: () => void;
  reject: (cause: unknown) => void;
  settled: boolean;
};
// Keep AbortSignals and deferred functions outside Vue's reactive proxies.
const exportRequests: ExportRequest[] = [];
const exportCount = ref(0);
const exportSelections = ref<ExportSelection[]>([]);
const requestRevision = ref(0);
const signalRevision = ref(0);
const exportAborted = computed(() => {
  void exportCount.value;
  void signalRevision.value;
  return exportRequests.map((request) => request.signal.aborted);
});
const firstExportPending = computed(() => {
  void requestRevision.value;
  return !!exportRequests[0] && !exportRequests[0].settled;
});
const latestExportPending = computed(() => {
  void requestRevision.value;
  const request = exportRequests.at(-1);
  return !!request && !request.settled;
});
function exportData(selection: ExportSelection, { signal }: ImportContext) {
  let resolve!: () => void;
  let reject!: (cause: unknown) => void;
  const promise = new Promise<void>((resolvePromise, rejectPromise) => {
    resolve = resolvePromise;
    reject = rejectPromise;
  });
  exportRequests.push({ signal, promise, resolve, reject, settled: false });
  exportSelections.value.push({
    ...selection,
    columns: [...selection.columns],
  });
  exportCount.value++;
  requestRevision.value++;
  signal.addEventListener("abort", () => signalRevision.value++, {
    once: true,
  });
  // Aborting is observable but deliberately does not settle the deferred promise.
  return promise;
}
function resolveExport(first = false) {
  const request = first ? exportRequests[0] : exportRequests.at(-1);
  if (!request || request.settled) return;
  request.settled = true;
  requestRevision.value++;
  request.resolve();
}
function resolveAndMutateColumns() {
  const request = exportRequests[0];
  if (!request || request.settled) return;
  request.settled = true;
  // Queue the old continuation before any reactive write schedules a Vue flush.
  request.resolve();
  changeConfig("columns", "mutate");
  requestRevision.value++;
}
function rejectFirstExport() {
  const request = exportRequests[0];
  if (!request || request.settled) return;
  request.settled = true;
  requestRevision.value++;
  request.reject(new Error("First export rejected"));
}
</script>

<template>
  <main
    class="cheese-root cheese-stack"
    data-testid="data-refresh"
    data-framework="vue"
    style="max-width: 880px; margin: 24px auto; padding: 16px"
  >
    <h1>Data refresh cases</h1>
    <section v-if="fixtureCase === 'saved'" data-testid="saved-fixture">
      <output data-testid="selected-view">{{ selectedView }}</output>
      <output data-testid="select-events">{{
        JSON.stringify(selectEvents)
      }}</output>
      <output data-testid="saved-labels">{{
        JSON.stringify(savedLabels)
      }}</output>
      <SavedViews
        label="Refresh views"
        :views="views"
        :model-value="selectedView"
        :save="saveView"
        @update:model-value="selectView"
      />
    </section>

    <section
      v-else-if="fixtureCase === 'organization'"
      data-testid="organization-fixture"
    >
      <button type="button" data-testid="refresh-nodes" @click="refreshNodes">
        Refresh nodes
      </button>
      <output data-testid="node-revision">{{ nodeRevision }}</output>
      <output data-testid="selected-organizations">{{
        JSON.stringify(selectedOrganizations)
      }}</output>
      <OrganizationTreeSelect
        label="Refresh organization"
        :nodes="organizationNodes"
        :multiple="true"
        v-model="selectedOrganizations"
      />
    </section>

    <section v-else-if="fixtureCase === 'export'" data-testid="export-fixture">
      <button
        type="button"
        data-testid="open-export"
        @click="exportOpen = true"
      >
        Open export
      </button>
      <button
        type="button"
        data-testid="rerender-config"
        @click="configRevision++"
      >
        Recreate equivalent config
      </button>
      <template
        v-for="kind in ['columns', 'scopes', 'formats'] as const"
        :key="kind"
      >
        <button
          type="button"
          :data-testid="`change-${kind}`"
          @click="changeConfig(kind, 'replace')"
        >
          Replace {{ kind }}
        </button>
        <button
          type="button"
          :data-testid="`mutate-${kind}`"
          @click="changeConfig(kind, 'mutate')"
        >
          Mutate {{ kind }}
        </button>
      </template>
      <button
        type="button"
        data-testid="resolve-first-export"
        :disabled="!firstExportPending"
        @click="resolveExport(true)"
      >
        Resolve first export
      </button>
      <button
        type="button"
        data-testid="resolve-and-mutate-columns"
        :disabled="!firstExportPending"
        @click="resolveAndMutateColumns"
      >
        Resolve first export and mutate columns
      </button>
      <button
        type="button"
        data-testid="reject-first-export"
        :disabled="!firstExportPending"
        @click="rejectFirstExport"
      >
        Reject first export
      </button>
      <button
        type="button"
        data-testid="resolve-export"
        :disabled="!latestExportPending"
        @click="resolveExport()"
      >
        Resolve export
      </button>
      <output data-testid="config-revision">{{ configRevision }}</output>
      <output data-testid="config-change">{{ configChange }}</output>
      <output data-testid="export-count">{{ exportCount }}</output>
      <output data-testid="export-aborted">{{
        JSON.stringify(exportAborted)
      }}</output>
      <output data-testid="export-selections">{{
        JSON.stringify(exportSelections)
      }}</output>
      <ExportDialog
        title="Refresh export"
        v-model:open="exportOpen"
        :columns="exportColumns"
        :scopes="exportScopes"
        :formats="exportFormats"
        :export-data="exportData"
      />
    </section>
  </main>
</template>
