import "@cheese/css";
import { useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import { createApp } from "vue";
import {
  DataTable,
  queryRows,
  type TableQuery,
  type RowsLoader,
} from "@cheese/react";
import TableQueryFixture from "./TableQuery.vue";

const params = new URLSearchParams(location.search);
const remote = params.get("remote") === "true";
const controlled = params.get("controlled") !== "false";
const initialPage = Number(params.get("initialPage") ?? 1);
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

function ReactFixture() {
  const [query, setQuery] = useState<TableQuery>(() => ({
    ...defaults(),
    page: initialPage,
  }));
  const [reject, setReject] = useState(false);
  const [proposals, setProposals] = useState<TableQuery[]>([]);
  const [requests, setRequests] = useState<TableQuery[]>([]);
  const loader = useMemo<RowsLoader>(
    () => async (value) => {
      setRequests((previous) => [...previous, value]);
      // Deliberately ignore abort: the component must also reject stale results.
      await new Promise((resolve) =>
        setTimeout(resolve, value.search === "slow" ? 450 : 80),
      );
      return queryRows(
        value.search === "few" ? rows.slice(0, 2) : rows,
        columns,
        {
          ...value,
          search: ["slow", "fast", "few"].includes(value.search)
            ? ""
            : value.search,
        },
      );
    },
    [],
  );
  return (
    <main
      className="cheese-root cheese-stack"
      style={{ maxWidth: 850, margin: "24px auto" }}
    >
      <h1>외부 테이블 쿼리</h1>
      <div className="cheese-inline">
        <button
          onClick={() =>
            setQuery({
              page: 3,
              pageSize: 5,
              search: "구성원",
              sort: { key: "name", direction: "desc" },
            })
          }
        >
          외부 복원
        </button>
        <button onClick={() => setQuery(defaults())}>전체 초기화</button>
        <button
          onClick={() =>
            setQuery({ ...query, sort: query.sort ? { ...query.sort } : null })
          }
        >
          동일 값 재렌더
        </button>
        <button onClick={() => setQuery({ ...defaults(), search: "few" })}>
          작은 결과
        </button>
        <button
          onClick={() => setQuery({ ...defaults(), page: 3, search: "slow" })}
        >
          느린 복원
        </button>
        <button
          onClick={() => setQuery({ ...defaults(), page: 2, search: "fast" })}
        >
          빠른 복원
        </button>
        <button onClick={() => setQuery({ ...defaults(), page: 9 })}>
          범위 밖 복원
        </button>
        <label>
          <input
            type="checkbox"
            checked={reject}
            onChange={(event) => setReject(event.target.checked)}
          />
          변경 거절
        </label>
      </div>
      <DataTable
        label="직원"
        columns={columns}
        rows={rows}
        loadRows={remote ? loader : undefined}
        query={controlled ? query : undefined}
        defaultQuery={{ ...defaults(), page: initialPage }}
        getRowId={(row) => String(row.id)}
        debounceMs={200}
        onQueryChange={(next) => {
          setProposals((previous) => [...previous, next]);
          if (!reject && controlled) setQuery(next);
        }}
      />
      <output data-testid="query">{JSON.stringify(query)}</output>
      <output data-testid="proposals">{JSON.stringify(proposals)}</output>
      <output data-testid="requests">{JSON.stringify(requests)}</output>
      <output data-testid="proposal-count">{proposals.length}</output>
      <output data-testid="request-count">{requests.length}</output>
    </main>
  );
}

if (params.get("framework") === "vue")
  createApp(TableQueryFixture, { remote, controlled, initialPage }).mount(
    "#root",
  );
else createRoot(document.getElementById("root")!).render(<ReactFixture />);
