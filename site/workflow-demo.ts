import type { TableColumn, TableQuery } from "@cheese/react";

export type WorkflowDraft = {
  name: string;
  team: string;
  deadline: string;
  status: string;
};
export type WorkflowRecord = WorkflowDraft & { id: string };
export type WorkflowErrors = Partial<Record<keyof WorkflowDraft, string>>;
export const teams = [
  { value: "피플팀", label: "피플팀" },
  { value: "개발팀", label: "개발팀" },
  { value: "디자인팀", label: "디자인팀" },
];
export const statuses = [
  { value: "진행 예정", label: "진행 예정" },
  { value: "진행 중", label: "진행 중" },
];
export const workflowColumns: TableColumn[] = [
  { key: "name", label: "업무명", width: 230 },
  { key: "team", label: "담당 조직" },
  { key: "deadline", label: "마감일" },
  { key: "status", label: "상태" },
];
export function initialRecords(): WorkflowRecord[] {
  return Array.from({ length: 12 }, (_, index) => ({
    id: `evaluation-${index + 1}`,
    name: `${String(index + 1).padStart(2, "0")} 하반기 평가 준비`,
    team: teams[index % teams.length].value,
    deadline: `2026-10-${String(15 + index).padStart(2, "0")}`,
    status: statuses[index % statuses.length].value,
  }));
}
export const defaultWorkflowQuery = (): TableQuery => ({
  page: 1,
  pageSize: 5,
  search: "",
  sort: null,
});
export function readWorkflowLocation() {
  const params = new URLSearchParams(window.location.search);
  const positive = (key: string, fallback: number, maximum: number) => {
    const value = Number(params.get(key));
    return Number.isInteger(value) && value > 0
      ? Math.min(value, maximum)
      : fallback;
  };
  const key = params.get("work-sort");
  return {
    query: {
      page: positive("work-page", 1, 10000),
      pageSize: positive("work-size", 5, 100),
      search: params.get("work-search") ?? "",
      sort: workflowColumns.some((column) => column.key === key)
        ? {
            key: key!,
            direction:
              params.get("work-order") === "desc"
                ? ("desc" as const)
                : ("asc" as const),
          }
        : null,
    },
    status: statuses.some((item) => item.value === params.get("work-status"))
      ? params.get("work-status")!
      : "all",
  };
}
export function writeWorkflowLocation(query: TableQuery, status: string) {
  const url = new URL(window.location.href);
  const values: Record<string, string> = {
    "work-page": query.page === 1 ? "" : String(query.page),
    "work-size": query.pageSize === 5 ? "" : String(query.pageSize),
    "work-search": query.search,
    "work-sort": query.sort?.key ?? "",
    "work-order": query.sort?.direction ?? "",
    "work-status": status === "all" ? "" : status,
  };
  for (const [key, value] of Object.entries(values)) {
    if (value) url.searchParams.set(key, value);
    else url.searchParams.delete(key);
  }
  window.history.replaceState(window.history.state, "", url);
}
export function validateWorkflow(draft: WorkflowDraft): WorkflowErrors {
  const errors: WorkflowErrors = {};
  if (!draft.name.trim()) errors.name = "업무명을 입력해 주세요.";
  else if (draft.name.trim().length > 80)
    errors.name = "업무명은 80자 이내로 입력해 주세요.";
  if (!teams.some((team) => team.value === draft.team))
    errors.team = "담당 조직을 선택해 주세요.";
  const parsed = new Date(`${draft.deadline}T00:00:00Z`);
  if (
    !/^\d{4}-\d{2}-\d{2}$/.test(draft.deadline) ||
    Number(draft.deadline.slice(0, 4)) < 1 ||
    !Number.isFinite(parsed.getTime()) ||
    parsed.toISOString().slice(0, 10) !== draft.deadline
  )
    errors.deadline = "마감일을 YYYY-MM-DD 형식의 실제 날짜로 입력해 주세요.";
  if (!statuses.some((status) => status.value === draft.status))
    errors.status = "진행 상태를 선택해 주세요.";
  return errors;
}
export function demoWait(signal: AbortSignal, duration = 650) {
  return new Promise<void>((resolve, reject) => {
    if (signal.aborted)
      return reject(new DOMException("Aborted", "AbortError"));
    const abort = () => {
      clearTimeout(timer);
      reject(new DOMException("Aborted", "AbortError"));
    };
    const timer = setTimeout(() => {
      signal.removeEventListener("abort", abort);
      resolve();
    }, duration);
    signal.addEventListener("abort", abort, { once: true });
  });
}
export class WorkflowSaveError extends Error {
  constructor(
    message: string,
    public fields: WorkflowErrors = {},
  ) {
    super(message);
  }
}
/** A deterministic in-memory service for the documentation, never a company API. */
export async function saveWorkflow(
  draft: WorkflowDraft,
  signal: AbortSignal,
  unavailable: boolean,
) {
  await demoWait(signal);
  if (draft.name.trim() === "중복 평가")
    throw new WorkflowSaveError("입력 내용을 확인해 주세요.", {
      name: "이미 사용 중인 업무명입니다. 다른 이름을 입력해 주세요.",
    });
  if (unavailable)
    throw new WorkflowSaveError(
      "저장하지 못했습니다. 작성한 내용은 유지됩니다. 잠시 후 다시 시도해 주세요.",
    );
  return { ...draft, name: draft.name.trim() };
}
export const sampleText =
  "CHEESE 평가 안내\n평가 항목과 마감일을 확인하고 작성 내용을 저장해 주세요.\n이 파일은 업무 흐름 체험을 위한 예제 자료입니다.\n";
export function initialAttachments() {
  return [
    {
      id: "guide",
      name: "평가 안내.txt",
      size: new TextEncoder().encode(sampleText).length,
      href: "./sample-evaluation.txt",
    },
  ];
}
