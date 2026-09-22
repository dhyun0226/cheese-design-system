import { useEffect, useRef, useState } from "react";
import {
  AttachmentList,
  Badge,
  Button,
  DataTable,
  DateField,
  ErrorSummary,
  Field,
  Input,
  Select,
  DialogRoot,
  DialogContent,
  DialogTitle,
  DialogDescription,
  type TableQuery,
  type AttachmentItem,
} from "@cheese/react";
import {
  defaultWorkflowQuery,
  demoWait,
  initialAttachments,
  initialRecords,
  readWorkflowLocation,
  saveWorkflow,
  statuses,
  teams,
  validateWorkflow,
  workflowColumns,
  WorkflowSaveError,
  writeWorkflowLocation,
  type WorkflowDraft,
  type WorkflowErrors,
  type WorkflowRecord,
} from "./workflow-demo";
import "./workflow-demo.css";

export default function WorkflowDemo() {
  const [initial] = useState(readWorkflowLocation);
  const [query, setQuery] = useState<TableQuery>(initial.query);
  const [filter, setFilter] = useState(initial.status);
  const [records, setRecords] = useState(initialRecords);
  const [editing, setEditing] = useState<WorkflowRecord | null>(null);
  const [draft, setDraft] = useState<WorkflowDraft | null>(null);
  const [errors, setErrors] = useState<WorkflowErrors>({});
  const [formError, setFormError] = useState("");
  const [phase, setPhase] = useState<"editing" | "saving" | "saved">("editing");
  const [mode, setMode] = useState("retry");
  const [confirmCancel, setConfirmCancel] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const [attachments, setAttachments] = useState<
    Record<string, AttachmentItem[]>
  >({});
  const summary = useRef<HTMLDivElement>(null);
  const title = useRef<HTMLHeadingElement>(null);
  const savedTitle = useRef<HTMLHeadingElement>(null);
  const firstInput = useRef<HTMLInputElement>(null);
  const cancelButton = useRef<HTMLButtonElement>(null);
  const request = useRef<AbortController | null>(null);
  const pending = useRef(false);
  const failNext = useRef(true);
  const failedDeletes = useRef(new Set<string>());
  const restoreListFocus = useRef(false);
  useEffect(() => {
    const restore = () => {
      const state = readWorkflowLocation();
      setQuery(state.query);
      setFilter(state.status);
    };
    window.addEventListener("popstate", restore);
    return () => {
      window.removeEventListener("popstate", restore);
      request.current?.abort();
    };
  }, []);
  useEffect(() => {
    writeWorkflowLocation(query, filter);
  }, [query, filter]);
  useEffect(() => {
    if (attempt) summary.current?.focus();
  }, [attempt]);
  useEffect(() => {
    if (phase === "saved") savedTitle.current?.focus();
  }, [phase]);
  useEffect(() => {
    if (editing) firstInput.current?.focus();
    else if (restoreListFocus.current) {
      title.current?.focus();
      restoreListFocus.current = false;
    }
  }, [editing]);
  const dirty =
    !!editing &&
    !!draft &&
    Object.keys(draft).some(
      (key) =>
        draft[key as keyof WorkflowDraft] !==
        editing[key as keyof WorkflowDraft],
    );
  const update = (field: keyof WorkflowDraft, value: string) => {
    setDraft((previous) => previous && { ...previous, [field]: value });
    setErrors((previous) => ({ ...previous, [field]: undefined }));
  };
  function open(record: WorkflowRecord) {
    setEditing(record);
    setDraft({
      name: record.name,
      team: record.team,
      deadline: record.deadline,
      status: record.status,
    });
    setErrors({});
    setFormError("");
    setPhase("editing");
    failNext.current = mode === "retry";
    setAttachments((previous) =>
      previous[record.id]
        ? previous
        : { ...previous, [record.id]: initialAttachments() },
    );
  }
  function back() {
    restoreListFocus.current = true;
    setEditing(null);
    setDraft(null);
    setConfirmCancel(false);
  }
  async function save() {
    if (pending.current || !draft || !editing) return;
    const validation = validateWorkflow(draft);
    setErrors(validation);
    setFormError("");
    if (Object.keys(validation).length) {
      setAttempt((value) => value + 1);
      return;
    }
    pending.current = true;
    const controller = new AbortController();
    request.current = controller;
    setPhase("saving");
    const id = editing.id;
    try {
      const result = await saveWorkflow(
        { ...draft },
        controller.signal,
        failNext.current,
      );
      if (controller.signal.aborted) return;
      setRecords((previous) =>
        previous.map((row) => (row.id === id ? { ...row, ...result } : row)),
      );
      setDraft(result);
      setPhase("saved");
    } catch (error) {
      if (controller.signal.aborted) return;
      if (
        error instanceof WorkflowSaveError &&
        Object.keys(error.fields).length
      )
        setErrors(error.fields);
      else
        setFormError(
          error instanceof Error
            ? error.message
            : "저장하지 못했습니다. 다시 시도해 주세요.",
        );
      setPhase("editing");
      setAttempt((value) => value + 1);
    } finally {
      failNext.current = false;
      pending.current = false;
    }
  }
  const summaryErrors = Object.entries(errors)
    .filter(([, message]) => message)
    .map(([key, message]) => ({
      id: key,
      message: message!,
      targetId: `workflow-${key}`,
    }));
  if (formError)
    summaryErrors.push({ id: "save", message: formError, targetId: "" });
  return (
    <section className="workflow-demo" aria-label="업무 흐름 체험">
      <div className="workflow-guide">
        <Badge tone="brand">목록 → 수정 → 저장 → 복귀</Badge>
        <p>
          가상 데이터로 실패와 복구를 체험합니다. 변경 내용은 이 화면에만
          남습니다.
        </p>
        <a href="./workflow-vue.html">같은 흐름을 Vue로 보기 ↗</a>
      </div>
      {!editing || !draft ? (
        <div className="workflow-panel">
          <h2 ref={title} tabIndex={-1}>
            평가 업무 목록
          </h2>
          <div className="workflow-toolbar">
            <Select
              label="상태 필터"
              value={filter}
              onValueChange={(value) => {
                setFilter(value);
                setQuery((previous) => ({ ...previous, page: 1 }));
              }}
              options={[{ value: "all", label: "전체 상태" }, ...statuses]}
            />
            <Button
              variant="weak"
              onClick={() => {
                setFilter("all");
                setQuery(defaultWorkflowQuery());
              }}
            >
              조건 초기화
            </Button>
          </div>
          <DataTable
            label="평가 업무"
            columns={workflowColumns}
            rows={records.filter(
              (row) => filter === "all" || row.status === filter,
            )}
            getRowId={(row) => row.id}
            rowLabel={(row) => row.name}
            query={query}
            onQueryChange={setQuery}
            renderCell={(row, column) =>
              column.key === "name" ? (
                <button
                  type="button"
                  className="workflow-cell-link"
                  aria-label={`${row.name} 수정`}
                  onClick={() => open(row)}
                >
                  {row.name}
                </button>
              ) : column.key === "status" ? (
                <Badge>{row.status}</Badge>
              ) : (
                row[column.key as keyof WorkflowRecord]
              )
            }
          />
          <p className="workflow-note">
            검색·정렬·페이지·상태 조건은 주소에 반영됩니다. 새로고침하거나 수정
            후 돌아와도 같은 조건을 유지합니다.
          </p>
        </div>
      ) : (
        <div className="workflow-panel">
          {phase === "saved" ? (
            <div className="workflow-success">
              <Badge tone="brand">저장됨</Badge>
              <h2 ref={savedTitle} tabIndex={-1}>
                저장 완료
              </h2>
              <p>{draft.name}의 변경 내용을 반영했습니다.</p>
              <Button onClick={back}>목록으로 돌아가기</Button>
            </div>
          ) : (
            <>
              <h2>업무 수정</h2>
              <ErrorSummary ref={summary} errors={summaryErrors} />
              <form
                aria-label="업무 수정"
                noValidate
                aria-busy={phase === "saving"}
                onSubmit={(event) => {
                  event.preventDefault();
                  void save();
                }}
              >
                <fieldset
                  className="workflow-form-grid"
                  disabled={phase === "saving"}
                >
                  <Field label="업무명" required error={errors.name}>
                    <Input
                      ref={firstInput}
                      id="workflow-name"
                      name="name"
                      value={draft.name}
                      maxLength={80}
                      onChange={(event) => update("name", event.target.value)}
                    />
                  </Field>
                  <Select
                    id="workflow-team"
                    name="team"
                    label="담당 조직"
                    value={draft.team}
                    onValueChange={(value) => update("team", value)}
                    options={teams}
                    required
                    error={errors.team}
                    disabled={phase === "saving"}
                  />
                  <DateField
                    id="workflow-deadline"
                    name="deadline"
                    label="업무 마감일"
                    value={draft.deadline}
                    onValueChange={(value) => update("deadline", value)}
                    required
                    error={errors.deadline}
                    disabled={phase === "saving"}
                  />
                  <Select
                    id="workflow-status"
                    name="status"
                    label="진행 상태"
                    value={draft.status}
                    onValueChange={(value) => update("status", value)}
                    options={statuses}
                    required
                    error={errors.status}
                    disabled={phase === "saving"}
                  />
                </fieldset>
                <div className="workflow-actions">
                  <Button
                    ref={cancelButton}
                    variant="weak"
                    disabled={phase === "saving"}
                    onClick={() => (dirty ? setConfirmCancel(true) : back())}
                  >
                    수정 취소
                  </Button>
                  <Button
                    type="submit"
                    variant="accent"
                    loading={phase === "saving"}
                  >
                    {phase === "saving"
                      ? "저장 중…"
                      : formError
                        ? "다시 저장"
                        : "변경 내용 저장"}
                  </Button>
                </div>
              </form>
              <details className="workflow-note">
                <summary>실패 복구 체험 안내</summary>
                <Select
                  label="저장 응답"
                  value={mode}
                  onValueChange={(value) => {
                    setMode(value);
                    failNext.current = value === "retry";
                  }}
                  options={[
                    { value: "retry", label: "첫 저장 실패 후 재시도" },
                    { value: "success", label: "정상 저장" },
                  ]}
                  disabled={phase === "saving"}
                />
                <p>
                  업무명을 “중복 평가”로 입력하면 서버 필드 오류를 확인할 수
                  있습니다. 각 파일의 첫 삭제는 실패하며, 다시 시도하면
                  삭제됩니다.
                </p>
              </details>
            </>
          )}
          <AttachmentList
            label="저장된 첨부"
            items={attachments[editing.id] ?? []}
            onRemove={
              phase === "saving"
                ? undefined
                : async (item, { signal }) => {
                    const recordId = editing.id;
                    await demoWait(signal);
                    const key = `${recordId}:${item.id}`;
                    if (!failedDeletes.current.has(key)) {
                      failedDeletes.current.add(key);
                      throw new Error("삭제하지 못했습니다.");
                    }
                    setAttachments((previous) => ({
                      ...previous,
                      [recordId]: previous[recordId].filter(
                        (file) => file.id !== item.id,
                      ),
                    }));
                  }
            }
          />
          <p className="workflow-note">
            첨부 삭제는 업무 저장과 별도로 반영됩니다. 수정 취소로 복원되지
            않습니다.
          </p>
          <DialogRoot open={confirmCancel} onOpenChange={setConfirmCancel}>
            <DialogContent
              onCloseAutoFocus={(event) => {
                event.preventDefault();
                requestAnimationFrame(() =>
                  (cancelButton.current ?? title.current)?.focus(),
                );
              }}
            >
              <DialogTitle>변경 내용을 버릴까요?</DialogTitle>
              <DialogDescription>
                저장하지 않은 입력이 사라집니다.
              </DialogDescription>
              <div className="workflow-actions">
                <Button variant="weak" onClick={() => setConfirmCancel(false)}>
                  계속 작성
                </Button>
                <Button onClick={back}>변경 사항 버리기</Button>
              </div>
            </DialogContent>
          </DialogRoot>
        </div>
      )}
    </section>
  );
}
