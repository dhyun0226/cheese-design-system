"use client";
import * as React from "react";
import { DataTable, type DataTableProps } from "./DataTable.js";
import {
  BulkActionBar,
  FilterBar,
  type BulkActionBarProps,
  type FilterBarProps,
} from "./patterns.js";
import type { DataRow, TableQuery } from "./business.js";

export interface RecordCollectionProps<
  T extends DataRow = DataRow,
> extends Pick<
  DataTableProps<T>,
  | "label"
  | "columns"
  | "rows"
  | "loadRows"
  | "getRowId"
  | "rowLabel"
  | "isRowSelectable"
  | "renderCell"
> {
  query: TableQuery;
  onQueryChange: (query: TableQuery) => void;
  selected: string[];
  onSelectedChange: (keys: string[]) => void;
  filters?: FilterBarProps["filters"];
  onFilterChange?: FilterBarProps["onFilterChange"];
  onResetFilters?: () => void;
  searchLabel?: string;
  /** Optional authoritative count. Omit while a server total is unknown. */
  resultCount?: number;
  toolbar?: React.ReactNode;
  bulkActions?: React.ReactNode;
  bulkBusy?: boolean;
  bulkResult?: BulkActionBarProps["result"];
  onRetryBulkActions?: () => void;
  /** Runs after requesting an empty selection, e.g. to dismiss bulk results. */
  onClearSelection?: () => void;
}

/**
 * The feature owns query, selection, filter values and operation results.
 * Facets are presentation data: apply them to local rows or capture them in
 * loadRows. DataTable alone owns local search/sort/pagination and remote request
 * cancellation; remote results are never filtered again by this composition.
 * Search, facet edits and reset request page 1. Selection survives query changes
 * until the feature changes it or the user explicitly clears it.
 */
export function RecordCollection<T extends DataRow>({
  label,
  columns,
  rows,
  loadRows,
  getRowId,
  rowLabel,
  isRowSelectable,
  renderCell,
  query,
  onQueryChange,
  selected,
  onSelectedChange,
  filters = [],
  onFilterChange,
  onResetFilters,
  searchLabel = `${label} 검색`,
  resultCount,
  toolbar,
  bulkActions,
  bulkBusy,
  bulkResult,
  onRetryBulkActions,
  onClearSelection,
}: RecordCollectionProps<T>) {
  const changeSearch = (search: string) =>
    onQueryChange({ ...query, page: 1, search });
  const changeFilter = (id: string, value: string) => {
    onFilterChange?.(id, value);
    if (query.page !== 1) onQueryChange({ ...query, page: 1 });
  };
  const resetFilters = () => {
    onQueryChange({ ...query, page: 1, search: "" });
    // Let the feature deliberately extend the reset (e.g. sort or page size).
    onResetFilters?.();
  };
  const clearSelection = () => {
    onSelectedChange([]);
    onClearSelection?.();
  };
  const showBulk = selected.length > 0 || bulkBusy || !!bulkResult;

  return (
    <section className="cheese-record-collection" aria-label={label}>
      <FilterBar
        label={`${label} 검색 및 필터`}
        search={query.search}
        onSearchChange={changeSearch}
        searchLabel={searchLabel}
        filters={filters}
        onFilterChange={changeFilter}
        onReset={resetFilters}
        resultCount={resultCount}
      />
      {toolbar && (
        <div className="cheese-record-collection-toolbar">{toolbar}</div>
      )}
      {showBulk && (
        <div className="cheese-record-collection-selection">
          <BulkActionBar
            selectedCount={selected.length}
            actions={[]}
            onClear={clearSelection}
            busy={bulkBusy}
            result={bulkResult}
            onRetry={onRetryBulkActions}
          />
          {bulkActions && (
            <div className="cheese-record-collection-actions">
              {bulkActions}
            </div>
          )}
        </div>
      )}
      <DataTable
        label={label}
        columns={columns}
        rows={rows}
        loadRows={loadRows}
        getRowId={getRowId}
        rowLabel={rowLabel}
        isRowSelectable={isRowSelectable}
        query={query}
        onQueryChange={onQueryChange}
        selected={selected}
        onSelectedChange={onSelectedChange}
        showSearch={false}
        showSelectionSummary={false}
        renderCell={renderCell}
      />
    </section>
  );
}
