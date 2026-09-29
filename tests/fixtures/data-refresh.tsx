import "@cheese/css";
import { useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  ExportDialog,
  OrganizationTreeSelect,
  SavedViews,
  type ExportColumn,
  type ExportFormat,
  type ExportScope,
  type ExportSelection,
  type OrganizationNode,
} from "@cheese/react";

function deferred() {
  let resolve!: () => void;
  let reject!: (reason: Error) => void;
  const promise = new Promise<void>((accept, fail) => {
    resolve = accept;
    reject = fail;
  });
  return { promise, resolve, reject, settled: false };
}

function SavedFixture() {
  const [selected, setSelected] = useState("a");
  const [events, setEvents] = useState<string[]>([]);
  const [labels, setLabels] = useState<string[]>([]);
  return (
    <section>
      <output data-testid="selected-view">{selected}</output>
      <output data-testid="select-events">{JSON.stringify(events)}</output>
      <output data-testid="saved-labels">{JSON.stringify(labels)}</output>
      <SavedViews
        label="Refresh views"
        views={[{ id: "a", label: "View A" }]}
        value={selected}
        onSelect={(id) => {
          setSelected(id);
          setEvents((current) => [...current, id]);
        }}
        onSave={async (label) => {
          setLabels((current) => [...current, label]);
        }}
      />
    </section>
  );
}

function organizationNodes(refreshed: boolean): OrganizationNode[] {
  return [
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
        refreshed
          ? {
              id: "fresh-branch",
              label: "Fresh branch",
              children: [{ id: "fresh-leaf", label: "Needle fresh" }],
            }
          : {
              id: "old-branch",
              label: "Old branch",
              children: [{ id: "old-leaf", label: "Needle old" }],
            },
      ],
    },
  ];
}

function OrganizationFixture() {
  const [revision, setRevision] = useState(0);
  const [selected, setSelected] = useState<string[]>([]);
  return (
    <section>
      <button
        type="button"
        data-testid="refresh-nodes"
        onClick={() => setRevision((value) => value + 1)}
      >
        Refresh organization nodes
      </button>
      <output data-testid="node-revision">{revision}</output>
      <output data-testid="selected-organizations">
        {JSON.stringify(selected)}
      </output>
      <OrganizationTreeSelect
        label="Refresh organization"
        nodes={organizationNodes(revision > 0)}
        value={selected}
        multiple
        onValueChange={setSelected}
      />
    </section>
  );
}

type ExportRequest = ReturnType<typeof deferred> & {
  signal: AbortSignal;
  selection: ExportSelection;
};
type ConfigKind = "columns" | "scopes" | "formats";

function ExportFixture() {
  const [open, setOpen] = useState(false);
  const [revision, setRevision] = useState(0);
  const [changed, setChanged] = useState<ConfigKind>();
  const [, refresh] = useState(0);
  const requests = useRef<ExportRequest[]>([]);
  const redraw = () => refresh((value) => value + 1);
  // Every parent render creates new arrays and new entries. Only their public
  // field values decide whether the export configuration actually changed.
  const columns: ExportColumn[] = [
    { id: "name", label: changed === "columns" ? "Display name" : "Name" },
    { id: "email", label: "Email" },
    { id: "team", label: "Team" },
  ];
  const scopes: ExportScope[] = [
    {
      value: "current",
      label: changed === "scopes" ? "Visible rows" : "Current rows",
    },
    { value: "selected", label: "Selected rows" },
    { value: "all", label: "All rows" },
  ];
  const formats: ExportFormat[] = [
    { value: "csv", label: changed === "formats" ? "Comma-separated" : "CSV" },
    { value: "xlsx", label: "Workbook" },
  ];
  function settle(first: boolean, reject = false) {
    const request = first ? requests.current[0] : requests.current.at(-1);
    if (!request || request.settled) return;
    request.settled = true;
    if (reject) request.reject(new Error("Stale export rejection"));
    else request.resolve();
    redraw();
  }
  return (
    <section>
      <button
        type="button"
        data-testid="open-export"
        onClick={() => setOpen(true)}
      >
        Open export
      </button>
      <button
        type="button"
        data-testid="rerender-config"
        onClick={() => setRevision((value) => value + 1)}
      >
        Recreate equivalent export options
      </button>
      {(["columns", "scopes", "formats"] as const).map((kind) => (
        <button
          key={kind}
          type="button"
          data-testid={`change-${kind}`}
          onClick={() => {
            setChanged(kind);
            setRevision((value) => value + 1);
          }}
        >
          Change {kind}
        </button>
      ))}
      <button
        type="button"
        data-testid="resolve-first-export"
        onClick={() => settle(true)}
      >
        Resolve first export
      </button>
      <button
        type="button"
        data-testid="reject-first-export"
        onClick={() => settle(true, true)}
      >
        Reject first export
      </button>
      <button
        type="button"
        data-testid="resolve-export"
        onClick={() => settle(false)}
      >
        Resolve latest export
      </button>
      <output data-testid="config-revision">{revision}</output>
      <output data-testid="config-change">
        {changed ? `${changed}:replace` : ""}
      </output>
      <output data-testid="export-count">{requests.current.length}</output>
      <output data-testid="export-aborted">
        {JSON.stringify(requests.current.map(({ signal }) => signal.aborted))}
      </output>
      <output data-testid="export-selections">
        {JSON.stringify(requests.current.map(({ selection }) => selection))}
      </output>
      <ExportDialog
        title="Refresh export"
        open={open}
        onOpenChange={setOpen}
        columns={columns}
        scopes={scopes}
        formats={formats}
        onExport={(selection, { signal }) => {
          // Deliberately ignore abort in the transport so stale completions
          // exercise the component's ownership guard, without any timers.
          const request = { ...deferred(), signal, selection };
          requests.current.push(request);
          signal.addEventListener("abort", redraw, { once: true });
          redraw();
          return request.promise;
        }}
      />
    </section>
  );
}

function ReactFixture() {
  const scenario = new URLSearchParams(location.search).get("case") ?? "saved";
  return (
    <main
      className="cheese-root cheese-stack"
      data-testid="data-refresh"
      data-framework="react"
      style={{ maxWidth: 900, margin: "24px auto", padding: 24 }}
    >
      <h1>Data refresh regressions</h1>
      {scenario === "saved" && <SavedFixture />}
      {scenario === "organization" && <OrganizationFixture />}
      {scenario === "export" && <ExportFixture />}
    </main>
  );
}

if (new URLSearchParams(location.search).get("framework") === "vue") {
  void import("./data-refresh-vue");
} else {
  createRoot(document.getElementById("root")!).render(<ReactFixture />);
}
