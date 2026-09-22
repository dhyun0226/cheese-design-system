"use client";
import * as React from "react";
import { Popover } from "radix-ui";
import {
  ArrowUpDown,
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  SlidersHorizontal,
} from "lucide-react";
import { Button, CheckboxRoot } from "./index.js";
import { Select } from "./Collections.js";
import {
  queryRows,
  type DataRow,
  type TableColumn,
  type TableQuery,
  type TableResult,
  type RowsLoader,
} from "./business.js";

export interface DataTableProps<T extends DataRow = DataRow> {
  label: string;
  columns: TableColumn[];
  rows?: T[];
  loadRows?: RowsLoader<T>;
  getRowId: (row: T) => string;
  rowLabel?: (row: T) => string;
  isRowSelectable?: (row: T) => boolean;
  selected?: string[];
  defaultSelected?: string[];
  onSelectedChange?: (keys: string[]) => void;
  defaultPageSize?: number;
  onQueryChange?: (query: TableQuery) => void;
  debounceMs?: number;
  renderCell?: (row: T, column: TableColumn) => React.ReactNode;
}
export function DataTable<T extends DataRow>({
  label,
  columns,
  rows = [],
  loadRows,
  getRowId,
  rowLabel,
  isRowSelectable,
  selected: controlled,
  defaultSelected = [],
  onSelectedChange,
  defaultPageSize = 5,
  onQueryChange,
  debounceMs = 250,
  renderCell,
}: DataTableProps<T>) {
  const [query, setQuery] = React.useState<TableQuery>({
    page: 1,
    pageSize: Math.max(1, defaultPageSize),
    search: "",
    sort: null,
  });
  const [localSelected, setLocalSelected] = React.useState(defaultSelected),
    [hidden, setHidden] = React.useState<string[]>([]),
    [loading, setLoading] = React.useState(false),
    [error, setError] = React.useState(false),
    [retry, setRetry] = React.useState(0);
  const [remote, setRemote] = React.useState<TableResult<T>>({
      rows: [],
      total: 0,
    }),
    [search, setSearch] = React.useState(""),
    [composing, setComposing] = React.useState(false);
  const selected = controlled ?? localSelected,
    latest = React.useRef(onQueryChange),
    ticket = React.useRef(0),
    id = React.useId();
  latest.current = onQueryChange;
  const changeSelection = (keys: string[]) => {
    if (controlled === undefined) setLocalSelected(keys);
    onSelectedChange?.(keys);
  };
  React.useEffect(() => {
    if (composing) return;
    const timer = setTimeout(
      () =>
        setQuery((previous) =>
          previous.search === search
            ? previous
            : { ...previous, page: 1, search },
        ),
      Math.max(0, debounceMs),
    );
    return () => clearTimeout(timer);
  }, [search, composing, debounceMs]);
  React.useEffect(() => {
    latest.current?.(query);
  }, [query]);
  React.useEffect(() => {
    const request = ++ticket.current,
      controller = new AbortController();
    if (!loadRows) {
      setLoading(false);
      setError(false);
      return;
    }
    setLoading(true);
    setError(false);
    Promise.resolve()
      .then(() => loadRows(query, { signal: controller.signal }))
      .then((result) => {
        if (!controller.signal.aborted && ticket.current === request) {
          if (
            !Array.isArray(result.rows) ||
            !Number.isFinite(result.total) ||
            result.total < 0
          )
            throw Error("Invalid table response");
          setRemote({ ...result, total: Math.floor(result.total) });
          setLoading(false);
        }
      })
      .catch(() => {
        if (!controller.signal.aborted && ticket.current === request) {
          setError(true);
          setLoading(false);
        }
      });
    return () => controller.abort();
  }, [loadRows, query, retry]);
  const result = loadRows ? remote : queryRows(rows, columns, query),
    pages = Math.max(1, Math.ceil(result.total / query.pageSize));
  React.useEffect(() => {
    if (!loading && !error && query.page > pages)
      setQuery((previous) => ({ ...previous, page: pages }));
  }, [pages, loading, error, query.page]);
  const visible = columns.filter((column) => !hidden.includes(column.key));
  const selectable = result.rows
      .filter((row) => isRowSelectable?.(row) !== false)
      .map(getRowId),
    chosen = selectable.filter((key) => selected.includes(key));
  const all = selectable.length > 0 && chosen.length === selectable.length;
  const toggleAll = () =>
    changeSelection(
      all
        ? selected.filter((key) => !selectable.includes(key))
        : [...new Set([...selected, ...selectable])],
    );
  const sort = (key: string) =>
    setQuery((previous) => ({
      ...previous,
      page: 1,
      sort:
        previous.sort?.key === key
          ? previous.sort.direction === "asc"
            ? { key, direction: "desc" }
            : null
          : { key, direction: "asc" },
    }));
  return (
    <section className="cheese-data-table" aria-label={label}>
      <div className="cheese-table-toolbar">
        <div className="cheese-field">
          <label htmlFor={id + "-search"} className="cheese-label">
            {label} 검색
          </label>
          <input
            id={id + "-search"}
            className="cheese-input"
            value={search}
            placeholder="이름, 부서 등으로 검색"
            onChange={(event) => setSearch(event.target.value)}
            onCompositionStart={() => setComposing(true)}
            onCompositionEnd={() => setComposing(false)}
          />
        </div>
        <Popover.Root>
          <Popover.Trigger asChild>
            <Button variant="weak" className="cheese-column-menu">
              <SlidersHorizontal size={16} aria-hidden="true" />
              표시 열
            </Button>
          </Popover.Trigger>
          <Popover.Portal>
            <Popover.Content
              className="cheese-column-options cheese-root"
              aria-label={label + " 표시 열"}
              align="end"
              sideOffset={8}
              collisionPadding={12}
            >
              {columns.map((column) => (
                <label key={column.key} className="cheese-check-label">
                  <CheckboxRoot
                    checked={!hidden.includes(column.key)}
                    disabled={
                      visible.length === 1 && !hidden.includes(column.key)
                    }
                    onCheckedChange={() =>
                      setHidden((previous) =>
                        previous.includes(column.key)
                          ? previous.filter((key) => key !== column.key)
                          : [...previous, column.key],
                      )
                    }
                  />
                  {column.label}
                </label>
              ))}
            </Popover.Content>
          </Popover.Portal>
        </Popover.Root>
      </div>
      <div className="cheese-table-selection">
        <span role="status">{selected.length}개 행 선택</span>
        {selected.length > 0 && (
          <Button variant="ghost" size="sm" onClick={() => changeSelection([])}>
            전체 선택 해제
          </Button>
        )}
      </div>
      <div
        className="cheese-table-scroll"
        tabIndex={0}
        role="region"
        aria-label={label + " 표 영역"}
      >
        <table className="cheese-table" aria-busy={loading}>
          <caption>{label}</caption>
          <thead>
            <tr>
              <th scope="col" className="cheese-selection-cell">
                <CheckboxRoot
                  aria-label="현재 페이지 전체 선택"
                  disabled={loading || error || !selectable.length}
                  checked={all ? true : chosen.length ? "indeterminate" : false}
                  onCheckedChange={toggleAll}
                />
              </th>
              {visible.map((column) => (
                <th
                  key={column.key}
                  scope="col"
                  style={{ minWidth: column.width ?? 130 }}
                  aria-sort={
                    query.sort?.key === column.key
                      ? query.sort.direction === "asc"
                        ? "ascending"
                        : "descending"
                      : undefined
                  }
                >
                  {column.sortable === false ? (
                    column.label
                  ) : (
                    <button
                      type="button"
                      className="cheese-sort-button"
                      onClick={() => sort(column.key)}
                      aria-label={column.label + " 정렬"}
                    >
                      {column.label}
                      {query.sort?.key === column.key ? (
                        query.sort.direction === "asc" ? (
                          <ChevronUp size={15} aria-hidden="true" />
                        ) : (
                          <ChevronDown size={15} aria-hidden="true" />
                        )
                      ) : (
                        <ArrowUpDown size={15} aria-hidden="true" />
                      )}
                    </button>
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading || error || result.rows.length === 0 ? (
              <tr>
                <td colSpan={visible.length + 1} className="cheese-table-state">
                  {loading ? (
                    <span role="status">데이터를 불러오는 중…</span>
                  ) : error ? (
                    <div>
                      <p role="alert">데이터를 불러오지 못했습니다.</p>
                      <Button
                        variant="weak"
                        onClick={() => setRetry((value) => value + 1)}
                      >
                        다시 불러오기
                      </Button>
                    </div>
                  ) : (
                    <span role="status">검색 결과가 없습니다.</span>
                  )}
                </td>
              </tr>
            ) : (
              result.rows.map((row) => {
                const key = getRowId(row);
                return (
                  <tr key={key} data-selected={selected.includes(key)}>
                    <td className="cheese-selection-cell">
                      <CheckboxRoot
                        aria-label={(rowLabel?.(row) ?? key) + " 행 선택"}
                        checked={selected.includes(key)}
                        disabled={isRowSelectable?.(row) === false}
                        onCheckedChange={() =>
                          changeSelection(
                            selected.includes(key)
                              ? selected.filter((value) => value !== key)
                              : [...selected, key],
                          )
                        }
                      />
                    </td>
                    {visible.map((column) => (
                      <td key={column.key}>
                        {renderCell
                          ? renderCell(row, column)
                          : String(row[column.key] ?? "—")}
                      </td>
                    ))}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
      <div className="cheese-table-footer">
        <span className="cheese-help" role="status">
          총 {result.total}개 · {query.page} / {pages}페이지
        </span>
        <Select
          label="페이지 크기"
          value={String(query.pageSize)}
          options={[...new Set([5, 10, 20, 50, query.pageSize])]
            .sort((a, b) => a - b)
            .map((size) => ({ value: String(size), label: size + "개씩" }))}
          onValueChange={(value) =>
            setQuery((previous) => ({
              ...previous,
              page: 1,
              pageSize: Number(value),
            }))
          }
        />
        <div className="cheese-inline">
          <Button
            variant="weak"
            aria-label="이전 페이지"
            disabled={query.page <= 1 || loading}
            onClick={() =>
              setQuery((previous) => ({ ...previous, page: previous.page - 1 }))
            }
          >
            <ChevronLeft size={17} aria-hidden="true" />
          </Button>
          <Button
            variant="weak"
            aria-label="다음 페이지"
            disabled={query.page >= pages || loading}
            onClick={() =>
              setQuery((previous) => ({ ...previous, page: previous.page + 1 }))
            }
          >
            <ChevronRight size={17} aria-hidden="true" />
          </Button>
        </div>
      </div>
    </section>
  );
}
