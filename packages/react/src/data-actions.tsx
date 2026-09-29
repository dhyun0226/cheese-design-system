"use client";

import * as React from "react";
import { Download, FileUp, Plus, Trash2 } from "lucide-react";
import {
  Button,
  Checkbox,
  DialogContent,
  DialogDescription,
  DialogRoot,
  DialogTitle,
  Input,
} from "./index.js";
import { Select } from "./Collections.js";

export interface SavedView {
  id: string;
  label: string;
}

export interface SavedViewsProps {
  views: SavedView[];
  value?: string;
  label?: string;
  disabled?: boolean;
  onSelect: (id: string) => void;
  /** The application captures its current filter state and owns persistence. */
  onSave: (label: string) => Promise<void> | void;
  onDelete?: (id: string) => Promise<void> | void;
}

function failureMessage(error: unknown, fallback: string) {
  return error instanceof Error && error.message ? error.message : fallback;
}

/** Named view controls, not a localStorage or server repository. */
export function SavedViews({
  views,
  value,
  label = "저장된 보기",
  disabled,
  onSelect,
  onSave,
  onDelete,
}: SavedViewsProps) {
  const inputId = React.useId();
  const [name, setName] = React.useState("");
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState("");
  const [status, setStatus] = React.useState("");
  const [deleteId, setDeleteId] = React.useState<string>();
  const pending = React.useRef(false);
  const composing = React.useRef(false);
  const alive = React.useRef(true);
  const latestSelection = React.useRef({ value, onSelect });
  latestSelection.current = { value, onSelect };
  React.useEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
    };
  }, []);
  const selected = views.find((item) => item.id === value);
  const validName =
    name.trim().length > 0 &&
    name.trim().length <= 80 &&
    !views.some(
      (view) =>
        view.label.trim().toLocaleLowerCase() ===
        name.trim().toLocaleLowerCase(),
    );
  async function act(action: "save" | "delete") {
    if (disabled || pending.current) return;
    if (action === "save" && !name.trim()) {
      setError("보기 이름을 입력해 주세요.");
      return;
    }
    if (
      action === "save" &&
      views.some(
        (view) =>
          view.label.trim().toLocaleLowerCase() ===
          name.trim().toLocaleLowerCase(),
      )
    ) {
      setError("같은 이름의 보기가 있습니다. 다른 이름을 입력해 주세요.");
      return;
    }
    const target = views.find((item) => item.id === deleteId);
    if (action === "delete" && (!target || !onDelete)) return;
    pending.current = true;
    setBusy(true);
    setError("");
    setStatus("");
    try {
      if (action === "save") await onSave(name.trim());
      else await onDelete!(target!.id);
      if (alive.current) {
        if (action === "save") setName("");
        if (action === "delete" && latestSelection.current.value === target?.id)
          latestSelection.current.onSelect("");
        setDeleteId(undefined);
        setStatus(
          action === "save" ? "보기를 저장했습니다." : "보기를 삭제했습니다.",
        );
      }
    } catch (error) {
      if (alive.current)
        setError(
          failureMessage(error, "변경하지 못했습니다. 다시 시도해 주세요."),
        );
    } finally {
      pending.current = false;
      if (alive.current) setBusy(false);
    }
  }
  return (
    <section
      className="cheese-data-actions cheese-data-actions-stack"
      aria-label={label}
    >
      <div className="cheese-data-actions-toolbar">
        <Select
          label={label}
          value={selected?.id ?? ""}
          options={views
            .filter((view) => view.id)
            .map((view) => ({ value: view.id, label: view.label }))}
          placeholder="보기를 선택하세요"
          disabled={disabled || busy || views.length === 0}
          onValueChange={(id) => {
            setDeleteId(undefined);
            setStatus("");
            onSelect(id);
          }}
        />
        {onDelete && selected && (
          <Button
            variant="ghost"
            disabled={disabled || busy}
            onClick={() => setDeleteId(selected.id)}
          >
            <Trash2 size={16} aria-hidden="true" /> 선택한 보기 삭제
          </Button>
        )}
      </div>
      <div className="cheese-data-actions-toolbar">
        <div className="cheese-field">
          <label className="cheese-label" htmlFor={inputId}>
            새 보기 이름
          </label>
          <Input
            id={inputId}
            value={name}
            maxLength={80}
            disabled={disabled || busy}
            onChange={(event) => setName(event.target.value)}
            onCompositionStart={() => {
              composing.current = true;
            }}
            onCompositionEnd={() => {
              composing.current = false;
            }}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                if (
                  composing.current ||
                  event.nativeEvent.isComposing ||
                  event.keyCode === 229
                )
                  return;
                if (validName) void act("save");
              }
            }}
            placeholder="예: 이번 달 진행 중"
          />
        </div>
        <Button
          variant="weak"
          disabled={disabled || busy || !validName}
          onClick={() => void act("save")}
        >
          <Plus size={16} aria-hidden="true" />
          현재 조건 저장
        </Button>
      </div>
      {deleteId && views.some((view) => view.id === deleteId) && (
        <div className="cheese-data-actions-summary">
          <p>
            ‘{views.find((view) => view.id === deleteId)?.label}’ 보기를
            삭제할까요? 실제 업무 데이터는 삭제하지 않습니다.
          </p>
          <div className="cheese-data-actions-toolbar">
            <Button
              variant="weak"
              disabled={disabled || busy}
              onClick={() => void act("delete")}
            >
              보기 삭제
            </Button>
            <Button
              variant="ghost"
              disabled={busy}
              onClick={() => setDeleteId(undefined)}
            >
              취소
            </Button>
          </div>
        </div>
      )}
      <p className="cheese-data-actions-muted">
        다른 보기와 겹치지 않는 이름을 입력해 주세요. 검색·정렬 등 실제 조건의
        저장과 복원은 연결한 서비스에서 처리합니다.
      </p>
      {busy && (
        <p role="status" className="cheese-data-actions-muted">
          변경 중…
        </p>
      )}
      {error && (
        <p role="alert" className="cheese-data-actions-error">
          {error}
        </p>
      )}
      {status && (
        <p role="status" className="cheese-data-actions-status">
          {status}
        </p>
      )}
    </section>
  );
}

export interface ImportField {
  id: string;
  label: string;
  required?: boolean;
}
export interface ParsedImport {
  columns: string[];
  rows: Record<string, string>[];
}
export type ImportParsedData = ParsedImport;
/** Row numbers start at 1 for the first data row, excluding the file header. */
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
export interface DataActionContext {
  signal: AbortSignal;
}
export type ImportContext = DataActionContext;
export interface ImportWizardProps {
  title?: string;
  fields: ImportField[];
  accept?: string;
  maxFileBytes?: number;
  maxRows?: number;
  /** CSV/XLSX decoding belongs to this adapter. It must enforce resource limits too. */
  parse: (file: File, context: DataActionContext) => Promise<ParsedImport>;
  /** Add business validation. No importing or other writes should happen here. */
  validate: (
    rows: ImportRow[],
    context: DataActionContext,
  ) => Promise<ImportIssue[]>;
  /** Must account for every submitted row; server writes should be idempotent. */
  importRows: (
    rows: ImportRow[],
    context: DataActionContext,
  ) => Promise<ImportResult>;
}

function checkParsed(parsed: ParsedImport, maxRows: number) {
  if (
    !Array.isArray(parsed.columns) ||
    !parsed.columns.length ||
    parsed.columns.some(
      (column) => typeof column !== "string" || !column.trim(),
    )
  )
    throw new Error("파일에 비어 있지 않은 열 이름이 필요합니다.");
  if (
    new Set(parsed.columns.map((column) => column.trim())).size !==
    parsed.columns.length
  )
    throw new Error(
      "파일에 중복된 열 이름이 있습니다. 열 이름을 수정해 주세요.",
    );
  if (!Array.isArray(parsed.rows) || parsed.rows.length === 0)
    throw new Error("등록할 데이터 행이 없습니다.");
  if (parsed.rows.length > maxRows)
    throw new Error(
      `한 번에 ${maxRows.toLocaleString()}개 행까지 처리할 수 있습니다.`,
    );
  if (
    parsed.rows.some(
      (row) =>
        !row ||
        Array.isArray(row) ||
        typeof row !== "object" ||
        Object.values(row).some((value) => typeof value !== "string"),
    )
  )
    throw new Error("파일 변환 결과는 문자열 값으로 구성된 행이어야 합니다.");
}

function checkIssues(issues: ImportIssue[], rows: ImportRow[]) {
  const ids = new Set(rows.map((row) => row.row));
  if (
    !Array.isArray(issues) ||
    issues.some(
      (issue) =>
        !issue ||
        !ids.has(issue.row) ||
        typeof issue.message !== "string" ||
        !issue.message.trim(),
    )
  )
    throw new Error("검증 결과의 행 번호 또는 오류 메시지를 확인해 주세요.");
}

function checkResult(result: ImportResult, rows: ImportRow[]) {
  if (!result || !Array.isArray(result.succeededRows))
    throw new Error("등록 결과의 성공 행 목록이 올바르지 않습니다.");
  checkIssues(result.failures, rows);
  const expected = new Set(rows.map((row) => row.row));
  const succeeded = new Set(result.succeededRows);
  const failed = new Set(result.failures.map((issue) => issue.row));
  if (
    succeeded.size !== result.succeededRows.length ||
    [...succeeded].some((row) => !expected.has(row) || failed.has(row)) ||
    succeeded.size + failed.size !== expected.size
  )
    throw new Error(
      "등록 결과가 요청한 모든 행의 처리 상태를 포함하지 않습니다. 중복 등록 방지를 위해 처리 내역을 확인해 주세요.",
    );
}

/** Controlled adapters, explicit writes, and bounded batches; no file decoder or API client. */
export function ImportWizard({
  title = "데이터 가져오기",
  fields,
  parse,
  validate,
  importRows,
  accept = ".csv,.xlsx",
  maxFileBytes = 10 * 1024 * 1024,
  maxRows = 10000,
}: ImportWizardProps) {
  const picker = React.useRef<HTMLInputElement>(null);
  const [file, setFile] = React.useState<File>();
  const [parsed, setParsed] = React.useState<ParsedImport>();
  const [mapping, setMapping] = React.useState<Record<string, string>>({});
  const [rows, setRows] = React.useState<ImportRow[]>([]);
  const [issues, setIssues] = React.useState<ImportIssue[]>([]);
  const [result, setResult] = React.useState<ImportResult>();
  const [phase, setPhase] = React.useState<
    "file" | "mapping" | "review" | "result"
  >("file");
  const [busy, setBusy] = React.useState<"" | "parse" | "validate" | "import">(
    "",
  );
  const [error, setError] = React.useState("");
  const [uncertain, setUncertain] = React.useState(false);
  const [configurationChanged, setConfigurationChanged] = React.useState(false);
  const [reconciled, setReconciled] = React.useState(false);
  const dispatched = React.useRef(false);
  const submittedSchema = React.useRef<ImportField[]>([]);
  const submittedSignature = React.useRef("");
  const validatedSignature = React.useRef("");
  const operation = React.useRef<{
    revision: number;
    controller?: AbortController;
  }>({ revision: 0 });
  const cancel = React.useCallback(() => {
    operation.current.controller?.abort();
    operation.current.revision += 1;
  }, []);
  React.useEffect(() => cancel, [cancel]);
  function start() {
    cancel();
    const controller = new AbortController();
    operation.current.controller = controller;
    return { signal: controller.signal, revision: operation.current.revision };
  }
  function isCurrent(ticket: { signal: AbortSignal; revision: number }) {
    return (
      !ticket.signal.aborted && operation.current.revision === ticket.revision
    );
  }
  function reset() {
    if (
      busy === "import" ||
      ((configurationChanged || uncertain) && !reconciled)
    )
      return;
    cancel();
    setBusy("");
    setFile(undefined);
    setParsed(undefined);
    setMapping({});
    setRows([]);
    setIssues([]);
    setResult(undefined);
    setError("");
    setUncertain(false);
    setConfigurationChanged(false);
    setReconciled(false);
    dispatched.current = false;
    submittedSchema.current = [];
    submittedSignature.current = "";
    validatedSignature.current = "";
    setPhase("file");
    if (picker.current) picker.current.value = "";
  }
  const schemaSignature = JSON.stringify([
    fields.map((field) => [field.id, field.label, Boolean(field.required)]),
    maxFileBytes,
    maxRows,
  ]);
  const previousSchema = React.useRef(schemaSignature);
  React.useEffect(() => {
    if (previousSchema.current !== schemaSignature) {
      previousSchema.current = schemaSignature;
      // Aborting a browser request cannot undo a server write. Preserve the
      // dispatched batch and let it settle against the schema it was sent with.
      if (dispatched.current) {
        setConfigurationChanged(true);
        setReconciled(false);
      } else reset();
    }
  }, [schemaSignature]);
  const schemaError =
    !fields.length ||
    fields.some((field) => !field.id.trim() || !field.label.trim()) ||
    new Set(fields.map((field) => field.id)).size !== fields.length
      ? "가져오기 필드에는 고유한 ID와 이름이 필요합니다."
      : "";
  const limitError =
    !Number.isFinite(maxFileBytes) ||
    maxFileBytes <= 0 ||
    !Number.isInteger(maxRows) ||
    maxRows <= 0
      ? "파일 크기와 행 제한은 양수로 설정해 주세요."
      : "";
  async function readFile(next: File) {
    if (busy === "import" || dispatched.current) return;
    const ticket = start();
    setFile(next);
    setParsed(undefined);
    setMapping({});
    setRows([]);
    setIssues([]);
    setResult(undefined);
    setError("");
    setUncertain(false);
    setPhase("file");
    setBusy("parse");
    try {
      if (schemaError || limitError) throw new Error(schemaError || limitError);
      if (!next.size) throw new Error("빈 파일은 가져올 수 없습니다.");
      if (next.size > maxFileBytes)
        throw new Error(
          `파일은 ${Math.ceil(maxFileBytes / 1024 / 1024)}MB 이하여야 합니다.`,
        );
      const output = await parse(next, { signal: ticket.signal });
      if (!isCurrent(ticket)) return;
      checkParsed(output, maxRows);
      setParsed({
        columns: [...output.columns],
        rows: output.rows.map((row) => ({ ...row })),
      });
      setMapping(
        Object.fromEntries(
          fields.map((field) => [
            field.id,
            output.columns.includes(field.id)
              ? field.id
              : output.columns.includes(field.label)
                ? field.label
                : "",
          ]),
        ),
      );
      setPhase("mapping");
    } catch (error) {
      if (isCurrent(ticket))
        setError(
          failureMessage(
            error,
            "파일을 읽지 못했습니다. 파일 형식과 내용을 확인해 주세요.",
          ),
        );
    } finally {
      if (isCurrent(ticket)) setBusy("");
    }
  }
  async function check() {
    if (!parsed || busy || schemaError || dispatched.current) return;
    const missing = fields.filter(
      (field) =>
        field.required && !parsed.columns.includes(mapping[field.id] ?? ""),
    );
    if (missing.length) {
      setError(
        `${missing.map((field) => field.label).join(", ")}에 연결할 열을 선택해 주세요.`,
      );
      return;
    }
    const ticket = start();
    setBusy("validate");
    setError("");
    setIssues([]);
    setResult(undefined);
    const nextRows: ImportRow[] = parsed.rows.map((row, index) => ({
      row: index + 1,
      values: Object.fromEntries(
        fields.map((field) => [
          field.id,
          Object.hasOwn(row, mapping[field.id]) ? row[mapping[field.id]] : "",
        ]),
      ),
    }));
    try {
      const basic: ImportIssue[] = nextRows.flatMap((row) =>
        fields
          .filter((field) => field.required && !row.values[field.id].trim())
          .map((field) => ({
            row: row.row,
            field: field.id,
            message: `${field.label} 값이 필요합니다.`,
          })),
      );
      const external = await validate(
        nextRows.map((row) => ({ row: row.row, values: { ...row.values } })),
        { signal: ticket.signal },
      );
      if (!isCurrent(ticket)) return;
      checkIssues(external, nextRows);
      setRows(nextRows);
      validatedSignature.current = schemaSignature;
      setIssues([...basic, ...external]);
      setPhase("review");
    } catch (error) {
      if (isCurrent(ticket))
        setError(
          failureMessage(
            error,
            "데이터를 검증하지 못했습니다. 다시 시도해 주세요.",
          ),
        );
    } finally {
      if (isCurrent(ticket)) setBusy("");
    }
  }
  async function execute(retry = false) {
    if (
      busy ||
      issues.length ||
      uncertain ||
      !rows.length ||
      configurationChanged ||
      validatedSignature.current !== schemaSignature ||
      (dispatched.current && submittedSignature.current !== schemaSignature)
    )
      return;
    const failed = new Set(result?.failures.map((issue) => issue.row) ?? []);
    const submitted = retry ? rows.filter((row) => failed.has(row.row)) : rows;
    if (!submitted.length) return;
    const ticket = start();
    setBusy("import");
    dispatched.current = true;
    submittedSchema.current = fields.map((field) => ({ ...field }));
    submittedSignature.current = schemaSignature;
    setError("");
    try {
      const output = await importRows(
        submitted.map((row) => ({ row: row.row, values: { ...row.values } })),
        { signal: ticket.signal },
      );
      if (!isCurrent(ticket)) return;
      checkResult(output, submitted);
      setResult({
        succeededRows: [
          ...new Set([
            ...(retry ? (result?.succeededRows ?? []) : []),
            ...output.succeededRows,
          ]),
        ],
        failures: output.failures,
      });
      setPhase("result");
    } catch (error) {
      if (isCurrent(ticket)) {
        setUncertain(true);
        setError(
          `${failureMessage(error, "등록 응답을 확인하지 못했습니다.")} 일부 데이터가 이미 저장되었을 수 있습니다. 처리 내역을 확인한 후 새로 시작해 주세요.`,
        );
      }
    } finally {
      if (isCurrent(ticket)) setBusy("");
    }
  }
  const steps = ["파일 선택", "열 연결", "검증 및 확인", "등록 결과"];
  const stepIndex = ["file", "mapping", "review", "result"].indexOf(phase);
  const displayedIssues =
    phase === "result" ? (result?.failures ?? []) : issues;
  const displayFields = dispatched.current ? submittedSchema.current : fields;
  return (
    <section
      className="cheese-data-actions cheese-data-actions-stack"
      aria-label={title}
      aria-busy={!!busy}
    >
      <h3 className="cheese-data-actions-title">{title}</h3>
      <ol className="cheese-data-actions-steps" aria-label="가져오기 단계">
        {steps.map((step, index) => (
          <li
            key={step}
            aria-current={stepIndex === index ? "step" : undefined}
            data-current={stepIndex === index}
          >
            <span aria-hidden="true">{index + 1}</span>
            {step}
          </li>
        ))}
      </ol>
      <div className="cheese-data-actions-file">
        <FileUp size={24} aria-hidden="true" />
        <div>
          <strong>{file?.name ?? "가져올 파일을 선택하세요"}</strong>
          <p className="cheese-data-actions-muted">
            {parsed
              ? `${parsed.rows.length.toLocaleString()}개 행 · ${parsed.columns.length}개 열`
              : `최대 ${Math.ceil(maxFileBytes / 1024 / 1024)}MB · ${maxRows.toLocaleString()}개 행`}
          </p>
          <p className="cheese-data-actions-muted">
            파일 해석과 실제 등록은 연결한 서비스에서 처리합니다.
          </p>
        </div>
        <Button
          variant="weak"
          disabled={
            !!schemaError ||
            !!limitError ||
            busy === "import" ||
            dispatched.current
          }
          onClick={() => picker.current?.click()}
        >
          {file ? "파일 변경" : "파일 선택"}
        </Button>
        <input
          ref={picker}
          type="file"
          accept={accept}
          hidden
          onChange={(event) => {
            const next = event.target.files?.[0];
            event.target.value = "";
            if (next) void readFile(next);
          }}
        />
      </div>
      {phase === "mapping" && parsed && (
        <>
          <div className="cheese-data-actions-map">
            {fields.map((field) => (
              <Select
                key={field.id}
                label={field.label}
                required={field.required}
                value={
                  parsed.columns.includes(mapping[field.id])
                    ? `column-${parsed.columns.indexOf(mapping[field.id])}`
                    : "unmapped"
                }
                options={[
                  { value: "unmapped", label: "연결하지 않음" },
                  ...parsed.columns.map((column, index) => ({
                    value: `column-${index}`,
                    label: column,
                  })),
                ]}
                disabled={!!busy}
                onValueChange={(value) => {
                  setMapping((current) => ({
                    ...current,
                    [field.id]:
                      value === "unmapped"
                        ? ""
                        : parsed.columns[Number(value.slice(7))],
                  }));
                  setError("");
                }}
              />
            ))}
          </div>
          <Button disabled={!!busy} onClick={() => void check()}>
            데이터 검증
          </Button>
        </>
      )}
      {phase === "review" && (
        <>
          <div className="cheese-data-actions-summary">
            <strong>
              등록 내용 미리보기 · 처음 {Math.min(rows.length, 5)}행
            </strong>
            <ol className="cheese-data-actions-list">
              {rows.slice(0, 5).map((row) => (
                <li key={row.row} className="cheese-data-actions-row">
                  <strong>{row.row}행</strong>
                  <span>
                    {displayFields
                      .map((field) => `${field.label}: ${row.values[field.id]}`)
                      .join(" · ")}
                  </span>
                </li>
              ))}
            </ol>
          </div>
          <p className="cheese-data-actions-summary">
            총 {rows.length.toLocaleString()}개 행 ·{" "}
            {issues.length
              ? `${new Set(issues.map((issue) => issue.row)).size}개 행에 오류가 있습니다. 파일 또는 열 연결을 수정해 주세요.`
              : "검증을 통과했습니다. 등록 버튼을 눌러야 실제 작업이 시작됩니다."}
          </p>
          <div className="cheese-data-actions-toolbar">
            <Button
              variant="weak"
              disabled={
                !!busy ||
                uncertain ||
                configurationChanged ||
                dispatched.current
              }
              onClick={() => {
                setPhase("mapping");
                setIssues([]);
                setError("");
              }}
            >
              열 연결 수정
            </Button>
            <Button
              disabled={
                !!busy || !!issues.length || uncertain || configurationChanged
              }
              onClick={() => void execute()}
            >
              등록 실행
            </Button>
          </div>
        </>
      )}
      {phase === "result" && result && (
        <div className="cheese-data-actions-result" role="status">
          <strong>
            등록 성공 {result.succeededRows.length}개 · 실패{" "}
            {new Set(result.failures.map((issue) => issue.row)).size}개
          </strong>
          {result.failures.length > 0 && (
            <Button
              variant="weak"
              disabled={!!busy || uncertain || configurationChanged}
              onClick={() => void execute(true)}
            >
              실패한 행만 다시 시도
            </Button>
          )}
        </div>
      )}
      {displayedIssues.length > 0 && (
        <div>
          <p className="cheese-label">확인이 필요한 항목</p>
          <ul className="cheese-data-actions-list">
            {displayedIssues.slice(0, 100).map((issue, index) => (
              <li
                key={`${issue.row}-${index}`}
                className="cheese-data-actions-row"
              >
                <strong>
                  {issue.row}행
                  {issue.field
                    ? ` · ${displayFields.find((field) => field.id === issue.field)?.label ?? issue.field}`
                    : ""}
                </strong>
                <span>{issue.message}</span>
              </li>
            ))}
          </ul>
          {displayedIssues.length > 100 && (
            <p className="cheese-data-actions-muted">
              처음 100개 오류를 표시했습니다. 파일 수정 후 다시 검증해 주세요.
            </p>
          )}
        </div>
      )}
      {busy && (
        <p role="status" className="cheese-data-actions-muted">
          {busy === "parse"
            ? "파일 읽는 중…"
            : busy === "validate"
              ? "데이터 검증 중…"
              : "데이터 등록 중…"}
        </p>
      )}
      {(error || schemaError || limitError) && (
        <p role="alert" className="cheese-data-actions-error">
          {error || schemaError || limitError}
        </p>
      )}
      {configurationChanged && (
        <p role="status" className="cheese-data-actions-summary">
          가져오기 설정이 변경되었습니다. 현재 등록 요청의 결과는 유지됩니다.
          서버 처리 내역을 확인한 뒤 새로 시작해 주세요.
        </p>
      )}
      {(configurationChanged || uncertain) && (
        <Checkbox
          label="서버 처리 내역을 확인했습니다"
          checked={reconciled}
          disabled={busy === "import"}
          onCheckedChange={(checked) => setReconciled(checked === true)}
        />
      )}
      {file && (
        <Button
          variant="ghost"
          disabled={
            busy === "import" ||
            ((configurationChanged || uncertain) && !reconciled)
          }
          onClick={reset}
        >
          새로 시작
        </Button>
      )}
    </section>
  );
}

export type ExportScopeValue = "current" | "selected" | "all";
export interface ExportColumn {
  id: string;
  label: string;
  disabled?: boolean;
}
export interface ExportScope {
  value: ExportScopeValue;
  label: string;
  disabled?: boolean;
}
export type ExportScopeOption = ExportScope;
export interface ExportFormat {
  value: string;
  label: string;
}
export interface ExportSelection {
  columns: string[];
  scope: ExportScopeValue;
  format: string;
}
export interface ExportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  columns: ExportColumn[];
  scopes: ExportScopeOption[];
  formats: ExportFormat[];
  /** Generate/download the file here. Resolve only after the app's export succeeds. */
  onExport: (
    selection: ExportSelection,
    context: DataActionContext,
  ) => Promise<void>;
}

export function ExportDialog({
  open,
  onOpenChange,
  title = "데이터 내보내기",
  columns,
  scopes,
  formats,
  onExport,
}: ExportDialogProps) {
  const [selected, setSelected] = React.useState<string[]>([]);
  const [scope, setScope] = React.useState<ExportScopeValue>("current");
  const [format, setFormat] = React.useState("");
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState("");
  const [done, setDone] = React.useState(false);
  const controller = React.useRef<AbortController | undefined>(undefined);
  const pending = React.useRef(false);
  const opening = React.useRef(false);
  const configSignature = JSON.stringify([columns, scopes, formats]);
  const previousConfig = React.useRef(configSignature);
  React.useEffect(() => {
    if (previousConfig.current !== configSignature) {
      previousConfig.current = configSignature;
      if (pending.current) {
        controller.current?.abort();
        pending.current = false;
        setBusy(false);
        setError(
          "내보내기 설정이 변경되었습니다. 처리 결과를 확인한 후 다시 선택해 주세요.",
        );
      }
      setDone(false);
    }
  }, [configSignature]);
  React.useEffect(() => {
    if (open && !opening.current) {
      setSelected(
        columns.filter((column) => !column.disabled).map((column) => column.id),
      );
      setScope(scopes.find((option) => !option.disabled)?.value ?? "current");
      setFormat(formats.find((option) => option.value.trim())?.value ?? "");
      setError("");
      setDone(false);
      setBusy(false);
    }
    if (!open) {
      controller.current?.abort();
      pending.current = false;
    }
    opening.current = open;
  }, [open, columns, scopes, formats]);
  React.useEffect(() => () => controller.current?.abort(), []);
  const allowedIds = new Set(
    columns.filter((column) => !column.disabled).map((column) => column.id),
  );
  const activeColumns = selected.filter((id) => allowedIds.has(id));
  const valid =
    activeColumns.length > 0 &&
    scopes.some((option) => option.value === scope && !option.disabled) &&
    formats.some((option) => option.value === format && option.value.trim());
  function close(next: boolean) {
    if (!next) {
      controller.current?.abort();
      pending.current = false;
      setBusy(false);
    }
    onOpenChange(next);
  }
  async function execute() {
    if (!valid || pending.current || done) return;
    pending.current = true;
    controller.current?.abort();
    const current = new AbortController();
    controller.current = current;
    setBusy(true);
    setError("");
    try {
      await onExport(
        { columns: activeColumns, scope, format },
        { signal: current.signal },
      );
      if (!current.signal.aborted) setDone(true);
    } catch (error) {
      if (!current.signal.aborted)
        setError(
          failureMessage(error, "내보내지 못했습니다. 다시 시도해 주세요."),
        );
    } finally {
      if (controller.current === current && !current.signal.aborted) {
        pending.current = false;
        setBusy(false);
      }
    }
  }
  return (
    <DialogRoot open={open} onOpenChange={close}>
      <DialogContent className="cheese-data-actions-dialog">
        <div
          className="cheese-data-actions cheese-data-actions-stack"
          aria-busy={busy}
        >
          <div>
            <DialogTitle>{title}</DialogTitle>
            <DialogDescription>
              내보낼 범위, 파일 형식과 항목을 선택하세요.
            </DialogDescription>
          </div>
          <div className="cheese-data-actions-map">
            <Select
              label="내보낼 범위"
              value={scope}
              options={scopes}
              disabled={
                busy || done || !scopes.some((option) => !option.disabled)
              }
              onValueChange={(value) => setScope(value as ExportScopeValue)}
            />
            <Select
              label="파일 형식"
              value={format}
              options={formats.filter((option) => option.value.trim())}
              disabled={busy || done || !formats.length}
              onValueChange={setFormat}
            />
          </div>
          <fieldset
            className="cheese-data-actions-fieldset"
            disabled={busy || done}
          >
            <legend className="cheese-label">내보낼 항목</legend>
            {columns.map((column) => (
              <Checkbox
                key={column.id}
                label={column.label}
                checked={activeColumns.includes(column.id)}
                disabled={column.disabled || busy || done}
                onCheckedChange={(checked) =>
                  setSelected((current) =>
                    checked === true
                      ? [...new Set([...current, column.id])]
                      : current.filter((id) => id !== column.id),
                  )
                }
              />
            ))}
          </fieldset>
          {!valid && !done && (
            <p className="cheese-data-actions-muted">
              사용 가능한 범위, 형식과 한 개 이상의 항목을 선택해 주세요.
            </p>
          )}
          {error && (
            <p role="alert" className="cheese-data-actions-error">
              {error}
            </p>
          )}
          {busy && <p role="status">내보내는 중…</p>}
          {done && (
            <p role="status" className="cheese-data-actions-status">
              내보내기가 완료되었습니다.
            </p>
          )}
          <div className="cheese-data-actions-toolbar">
            <Button variant="ghost" onClick={() => close(false)}>
              {done ? "닫기" : busy ? "취소하고 닫기" : "취소"}
            </Button>
            {!done && (
              <Button disabled={!valid || busy} onClick={() => void execute()}>
                <Download size={16} aria-hidden="true" />
                내보내기
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </DialogRoot>
  );
}
