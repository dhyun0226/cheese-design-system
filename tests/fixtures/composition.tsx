import "@cheese/css";
import { useCallback, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  AppShell,
  Button,
  PageHeader,
  RecordCollection,
  UserIdentity,
  queryRows,
  type BulkActionBarProps,
  type DataRow,
  type NavigationItem,
  type RowsLoader,
  type TableColumn,
  type TableQuery,
} from "@cheese/react";

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

function NavigationFixture() {
  const [activeId, setActiveId] = useState("current");
  const [cancel, setCancel] = useState(true);
  const [events, setEvents] = useState({ id: "none", count: 0 });

  return (
    <AppShell
      variant="application"
      brand="Fixture workspace"
      navigationLabel="Fixture workspace"
      items={items}
      activeId={activeId}
      user={<UserIdentity name="Alex Morgan" description="Workspace member" />}
      onNavigate={(id, event) => {
        setEvents((previous) => ({ id, count: previous.count + 1 }));
        if (cancel) event.preventDefault();
        else {
          if (id === "current") event.preventDefault();
          setActiveId(id);
        }
      }}
    >
      <main className="cheese-stack" style={{ padding: 24 }}>
        <PageHeader
          title="Navigation composition"
          description="The application controls the active destination."
        />
        <label>
          <input
            type="checkbox"
            checked={cancel}
            onChange={(event) => setCancel(event.target.checked)}
          />
          Cancel navigation
        </label>
        <output aria-label="Navigation events" data-testid="navigation-events">
          {events.id}:{events.count}
        </output>
        <p id="destination">Destination content</p>
      </main>
    </AppShell>
  );
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

function RecordsFixture() {
  const [query, setQuery] = useState<TableQuery>({
    page: 1,
    pageSize: 5,
    search: "",
    sort: null,
  });
  const [selected, setSelected] = useState<string[]>([]);
  const [bulkResult, setBulkResult] = useState<BulkActionBarProps["result"]>();
  const [failNext, setFailNext] = useState(true);
  const failure = useRef(true);
  const [requests, setRequests] = useState(0);
  const loadRows = useCallback<RowsLoader<RecordRow>>(
    async (next, { signal }) => {
      const reject = failure.current;
      failure.current = false;
      setFailNext(false);
      setRequests((count) => count + 1);
      await new Promise((resolve) => setTimeout(resolve, 25));
      if (signal.aborted) throw new DOMException("Aborted", "AbortError");
      if (reject) throw new Error("Fixture request failed");
      return queryRows(rows, columns, next);
    },
    [],
  );

  return (
    <main
      className="cheese-root cheese-stack"
      style={{ maxWidth: 960, margin: "24px auto", padding: 16 }}
    >
      <PageHeader title="Record composition" />
      <label>
        <input
          type="checkbox"
          checked={failNext}
          onChange={(event) => {
            failure.current = event.target.checked;
            setFailNext(event.target.checked);
          }}
        />
        Fail next request
      </label>
      <output aria-label="Request count" data-testid="request-count">
        {requests}
      </output>
      <output aria-label="Selected records" data-testid="selected-records">
        {selected.join(",") || "none"}
      </output>
      <output aria-label="Record query" data-testid="record-query">
        {JSON.stringify(query)}
      </output>
      <RecordCollection<RecordRow>
        label="Fixture records"
        columns={columns}
        loadRows={loadRows}
        getRowId={(row) => row.id}
        rowLabel={(row) => row.name}
        isRowSelectable={(row) => row.selectable}
        renderCell={(row, column) =>
          column.key === "amount"
            ? `${row.amount.toFixed(2)} credits`
            : String(row[column.key] ?? "")
        }
        query={query}
        onQueryChange={setQuery}
        selected={selected}
        onSelectedChange={setSelected}
        searchLabel="Record search"
        bulkResult={bulkResult}
        onClearSelection={() => setBulkResult(undefined)}
        toolbar={
          <Button
            variant="weak"
            disabled={!bulkResult}
            onClick={() => setBulkResult(undefined)}
          >
            Dismiss bulk result
          </Button>
        }
        bulkActions={
          <Button
            disabled={!selected.length}
            onClick={() => {
              setBulkResult({ succeeded: selected.length, failed: 0 });
              setSelected([]);
            }}
          >
            Apply bulk action
          </Button>
        }
      />
    </main>
  );
}

const parameters = new URLSearchParams(location.search);
if (parameters.get("framework") === "vue") {
  void import("./composition-vue");
} else {
  createRoot(document.getElementById("root")!).render(
    parameters.get("case") === "records" ? (
      <RecordsFixture />
    ) : (
      <NavigationFixture />
    ),
  );
}
