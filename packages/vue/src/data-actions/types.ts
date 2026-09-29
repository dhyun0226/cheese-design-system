export interface SavedView {
  id: string;
  label: string;
}

export interface ImportField {
  id: string;
  label: string;
  required?: boolean;
}
/** One-based data row; the header is not counted. */
export interface ImportRow {
  row: number;
  values: Record<string, string>;
}
export interface ImportIssue {
  row: number;
  field?: string;
  message: string;
}
export interface ImportResult {
  succeededRows: number[];
  failures: ImportIssue[];
}
export interface ImportParsedData {
  columns: string[];
  rows: Record<string, string>[];
}
export interface ImportContext {
  signal: AbortSignal;
}
export interface ExportColumn {
  id: string;
  label: string;
  disabled?: boolean;
}
export type ExportScopeValue = "current" | "selected" | "all";
export interface ExportScope {
  value: ExportScopeValue;
  label: string;
  disabled?: boolean;
}
export interface ExportFormat {
  value: string;
  label: string;
}
export interface ExportSelection {
  columns: string[];
  scope: ExportScopeValue;
  format: string;
}
