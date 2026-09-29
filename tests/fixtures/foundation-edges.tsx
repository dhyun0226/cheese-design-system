import "@cheese/css";
import { useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  CommentThread,
  ExportDialog,
  FilePreview,
  FormPage,
  FormSection,
  ImportWizard,
  OrganizationTreeSelect,
  SavedViews,
  SortableList,
  type ImportParsedData,
  type ImportResult,
  type ImportRow,
  type PreviewFile,
} from "@cheese/react";

// The fixture is deliberately timer-free. Every transport completion is driven
// by a labelled control, including transports that ignore AbortSignal.
function deferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (reason: Error) => void;
  const promise = new Promise<T>((accept, fail) => {
    resolve = accept;
    reject = fail;
  });
  return { promise, resolve, reject, settled: false };
}

function parsedRows(): ImportParsedData {
  return { columns: ["name"], rows: [{ name: "Alpha" }, { name: "Beta" }] };
}

function ImportFixture() {
  const [revision, setRevision] = useState(0);
  const [changed, setChanged] = useState(false);
  const [, refresh] = useState(0);
  const reads = useRef<
    Array<
      ReturnType<typeof deferred<ImportParsedData>> & { signal: AbortSignal }
    >
  >([]);
  const writes = useRef<
    Array<
      ReturnType<typeof deferred<ImportResult>> & {
        signal: AbortSignal;
        rows: ImportRow[];
      }
    >
  >([]);
  const redraw = () => refresh((value) => value + 1);
  const read = reads.current.at(-1);
  const write = writes.current.at(-1);
  const label = changed ? "Renamed person" : "Name";
  function settleImport(kind: "partial" | "reject" | "success") {
    if (!write || write.settled) return;
    write.settled = true;
    if (kind === "reject") write.reject(new Error("Uncertain import outcome"));
    else
      write.resolve(
        kind === "partial"
          ? {
              succeededRows: [1],
              failures: [{ row: 2, field: "name", message: "Retry Beta" }],
            }
          : { succeededRows: write.rows.map((row) => row.row), failures: [] },
      );
    redraw();
  }
  return (
    <section data-testid="import-fixture">
      <div>
        <button
          type="button"
          data-testid="rerender-fields"
          onClick={() => setRevision((value) => value + 1)}
        >
          Recreate equivalent fields
        </button>
        <button
          type="button"
          data-testid="change-schema"
          onClick={() => setChanged(true)}
        >
          Change schema
        </button>
        <button
          type="button"
          data-testid="resolve-parse"
          disabled={!read || read.settled}
          onClick={() => {
            if (!read || read.settled) return;
            read.settled = true;
            read.resolve(parsedRows());
            redraw();
          }}
        >
          Resolve parse
        </button>
        <button
          type="button"
          data-testid="resolve-import"
          disabled={!write || write.settled}
          onClick={() => settleImport("partial")}
        >
          Resolve partial import
        </button>
        <button
          type="button"
          data-testid="reject-import"
          disabled={!write || write.settled}
          onClick={() => settleImport("reject")}
        >
          Reject import
        </button>
        <button
          type="button"
          data-testid="resolve-retry"
          disabled={!write || write.settled}
          onClick={() => settleImport("success")}
        >
          Resolve import successfully
        </button>
      </div>
      <output data-testid="field-revision">{revision}</output>
      <output data-testid="schema-label">{label}</output>
      <output data-testid="parse-count">{reads.current.length}</output>
      <output data-testid="import-count">{writes.current.length}</output>
      <output data-testid="parse-aborted">
        {String(read?.signal.aborted ?? false)}
      </output>
      <output data-testid="import-aborted">
        {String(write?.signal.aborted ?? false)}
      </output>
      <output data-testid="import-batches">
        {JSON.stringify(
          writes.current.map((request) => request.rows.map((row) => row.row)),
        )}
      </output>
      <ImportWizard
        title="Edge import"
        fields={[{ id: "name", label, required: true }]}
        parse={(_file, { signal }) => {
          const request = { ...deferred<ImportParsedData>(), signal };
          reads.current.push(request);
          signal.addEventListener("abort", redraw, { once: true });
          redraw();
          return request.promise;
        }}
        validate={async () => []}
        importRows={(rows, { signal }) => {
          const request = { ...deferred<ImportResult>(), signal, rows };
          writes.current.push(request);
          signal.addEventListener("abort", redraw, { once: true });
          redraw();
          return request.promise;
        }}
      />
    </section>
  );
}

function SavedFixture() {
  const [views, setViews] = useState([
    { id: "a", label: "View A" },
    { id: "b", label: "View B" },
  ]);
  const [selected, setSelected] = useState("a");
  const [events, setEvents] = useState<string[]>([]);
  const [count, setCount] = useState(0);
  const request = useRef<ReturnType<typeof deferred<void>> | undefined>(
    undefined,
  );
  return (
    <section data-testid="saved-fixture">
      <button
        type="button"
        data-testid="select-b"
        onClick={() => setSelected("b")}
      >
        Parent selects B
      </button>
      <button
        type="button"
        data-testid="resolve-delete"
        onClick={() => request.current?.resolve()}
      >
        Resolve deletion
      </button>
      <output data-testid="selected-view">{selected}</output>
      <output data-testid="select-events">{JSON.stringify(events)}</output>
      <output data-testid="delete-count">{count}</output>
      <SavedViews
        label="Edge views"
        views={views}
        value={selected}
        onSelect={(value) => {
          setSelected(value);
          setEvents((current) => [...current, value]);
        }}
        onSave={() => {}}
        onDelete={async (id) => {
          const pending = deferred<void>();
          request.current = pending;
          setCount((value) => value + 1);
          await pending.promise;
          setViews((current) => current.filter((view) => view.id !== id));
        }}
      />
    </section>
  );
}

function ExportFixture() {
  const [open, setOpen] = useState(false);
  const [closes, setCloses] = useState(0);
  const [, refresh] = useState(0);
  const requests = useRef<
    Array<ReturnType<typeof deferred<void>> & { signal: AbortSignal }>
  >([]);
  const redraw = () => refresh((value) => value + 1);
  return (
    <section data-testid="export-fixture">
      <button
        type="button"
        data-testid="open-export"
        onClick={() => setOpen(true)}
      >
        Open export
      </button>
      <button
        type="button"
        data-testid="resolve-export"
        onClick={() => requests.current.at(-1)?.resolve()}
      >
        Resolve export
      </button>
      <button
        type="button"
        data-testid="resolve-first-export"
        onClick={() => requests.current[0]?.resolve()}
      >
        Resolve first export
      </button>
      <output data-testid="export-count">{requests.current.length}</output>
      <output data-testid="export-aborted">
        {String(requests.current[0]?.signal.aborted ?? false)}
      </output>
      <output data-testid="close-requests">{closes}</output>
      <ExportDialog
        open={open}
        onOpenChange={(next) => {
          if (!next) setCloses((value) => value + 1);
        }}
        title="Edge export"
        columns={[{ id: "name", label: "Name" }]}
        scopes={[{ value: "current", label: "Current rows" }]}
        formats={[{ value: "csv", label: "CSV" }]}
        onExport={(_selection, { signal }) => {
          const request = { ...deferred<void>(), signal };
          requests.current.push(request);
          signal.addEventListener("abort", redraw, { once: true });
          redraw();
          return request.promise;
        }}
      />
    </section>
  );
}

function CommentsFixture() {
  const [replies, setReplies] = useState(0);
  const [edits, setEdits] = useState(0);
  const [deletes, setDeletes] = useState(0);
  const request = useRef<ReturnType<typeof deferred<void>> | undefined>(
    undefined,
  );
  return (
    <section data-testid="comments-fixture">
      <button
        type="button"
        data-testid="reject-reply"
        onClick={() => request.current?.reject(new Error("Reply rejected"))}
      >
        Reject reply
      </button>
      <button
        type="button"
        data-testid="resolve-reply"
        onClick={() => request.current?.resolve()}
      >
        Resolve reply
      </button>
      <output data-testid="reply-count">{replies}</output>
      <output data-testid="edit-count">{edits}</output>
      <output data-testid="delete-count">{deletes}</output>
      <CommentThread
        label="Edge comments"
        items={[
          {
            id: "one",
            author: "Alex",
            body: "Original comment",
            time: "Today",
            canEdit: true,
            canDelete: true,
            canReply: true,
          },
        ]}
        onEdit={() => setEdits((value) => value + 1)}
        onDelete={() => setDeletes((value) => value + 1)}
        onReply={() => {
          const pending = deferred<void>();
          request.current = pending;
          setReplies((value) => value + 1);
          return pending.promise;
        }}
      />
    </section>
  );
}

function FormFixture() {
  const mode =
    new URLSearchParams(location.search).get("lock") ?? "page-pending";
  const [locked, setLocked] = useState(false);
  const [items, setItems] = useState([
    { id: "a", label: "Alpha" },
    { id: "b", label: "Beta" },
  ]);
  const [selected, setSelected] = useState<string[]>([]);
  const [orders, setOrders] = useState(0);
  const [organizations, setOrganizations] = useState(0);
  return (
    <section data-testid="form-fixture">
      <button
        type="button"
        data-testid="lock-form"
        onClick={() => setLocked(true)}
      >
        Lock form
      </button>
      <button
        type="button"
        data-testid="unlock-form"
        onClick={() => setLocked(false)}
      >
        Unlock form
      </button>
      <output data-testid="lock-state">{String(locked)}</output>
      <output data-testid="reorder-count">{orders}</output>
      <output data-testid="organization-count">{organizations}</output>
      <output data-testid="sort-order">
        {JSON.stringify(items.map((item) => item.id))}
      </output>
      <output data-testid="selected-organizations">
        {JSON.stringify(selected)}
      </output>
      <FormPage
        title="Edge form"
        pending={locked && mode === "page-pending"}
        disabled={locked && mode === "page-disabled"}
      >
        <FormSection
          title="Nested section"
          disabled={locked && mode === "section-disabled"}
        >
          <SortableList
            label="Edge order"
            items={items}
            onItemsChange={(next) => {
              setItems(next);
              setOrders((value) => value + 1);
            }}
          />
          <OrganizationTreeSelect
            label="Edge organization"
            nodes={[
              { id: "a", label: "Team A" },
              { id: "b", label: "Team B" },
            ]}
            multiple
            value={selected}
            onValueChange={(next) => {
              setSelected(next);
              setOrganizations((value) => value + 1);
            }}
          />
        </FormSection>
      </FormPage>
    </section>
  );
}

function MediaFixture() {
  const [open, setOpen] = useState(false);
  const [item, setItem] = useState<PreviewFile>({
    id: "media",
    name: "Edge media",
    kind: "image",
    url: new URL("/__foundation_edge_media__", location.origin).href,
    status: "ready",
  });
  return (
    <section data-testid="media-fixture">
      <button
        type="button"
        data-testid="open-preview"
        onClick={() => setOpen(true)}
      >
        Open preview
      </button>
      <button
        type="button"
        data-testid="correct-media-kind"
        onClick={() => setItem((current) => ({ ...current, kind: "video" }))}
      >
        Correct media kind
      </button>
      <button
        type="button"
        data-testid="update-media-description"
        onClick={() =>
          setItem((current) => ({
            ...current,
            description: "Updated description",
          }))
        }
      >
        Update description
      </button>
      <output data-testid="media-kind">{item.kind}</output>
      <FilePreview open={open} onOpenChange={setOpen} item={item} />
    </section>
  );
}

function ReactFixture() {
  const scenario = new URLSearchParams(location.search).get("case") ?? "import";
  return (
    <main
      data-testid="foundation-edges"
      data-framework="react"
      style={{ maxWidth: 900, margin: "24px auto", padding: 24 }}
    >
      <h1>Foundation edge cases</h1>
      {scenario === "import" && <ImportFixture />}
      {scenario === "saved" && <SavedFixture />}
      {scenario === "export" && <ExportFixture />}
      {scenario === "comments" && <CommentsFixture />}
      {scenario === "form" && <FormFixture />}
      {scenario === "media" && <MediaFixture />}
    </main>
  );
}

if (new URLSearchParams(location.search).get("framework") === "vue") {
  void import("./foundation-edges-vue");
} else {
  createRoot(document.getElementById("root")!).render(<ReactFixture />);
}
