import { useSyncExternalStore } from "react";
import type { NotificationItem } from "@cheese/react";

export type EvaluationDraft = { title: string; summary: string; focus: string };
type EvaluationRecord = EvaluationDraft & {
  status: "draft" | "submitted";
  submittedAt: string | null;
};

const evaluationKey = "cheese-example-evaluation-draft";
const notificationsKey = "cheese-example-notifications-read";
const notifications: NotificationItem[] = [
  {
    id: "evaluation-deadline",
    title: "자기평가 제출 D-14",
    body: "2026 하반기 자기평가를 10월 13일까지 제출해 주세요.",
    time: "오늘 09:00",
    read: false,
    href: "#/examples/evaluation",
  },
  {
    id: "new-employees",
    title: "신규 입사자 3명",
    body: "계정과 소속 정보 확인이 필요한 구성원이 있습니다.",
    time: "어제 16:20",
    read: false,
    href: "#/examples/employees",
  },
  {
    id: "audition-materials",
    title: "오디션 자료 확인 필요",
    body: "제출 자료가 누락된 지원서 2건을 확인해 주세요.",
    time: "어제 11:40",
    read: true,
    href: "#/examples/auditions",
  },
];

function readJson(key: string): unknown {
  try {
    return JSON.parse(sessionStorage.getItem(key) || "null");
  } catch {
    return null;
  }
}

function restoreEvaluation(): EvaluationRecord | null {
  const value = readJson(evaluationKey);
  if (
    !value ||
    typeof value !== "object" ||
    !("title" in value) ||
    typeof value.title !== "string" ||
    !("summary" in value) ||
    typeof value.summary !== "string" ||
    !("focus" in value) ||
    typeof value.focus !== "string" ||
    !["delivery", "collaboration", "growth"].includes(value.focus)
  )
    return null;
  // Older examples stored only the fields; these remain valid drafts.
  const submittedAt =
    "submittedAt" in value &&
    typeof value.submittedAt === "string" &&
    Number.isFinite(Date.parse(value.submittedAt))
      ? value.submittedAt
      : null;
  const submitted =
    "status" in value && value.status === "submitted" && submittedAt !== null;
  return {
    title: value.title,
    summary: value.summary,
    focus: value.focus,
    status: submitted ? "submitted" : "draft",
    submittedAt: submitted ? submittedAt : null,
  };
}

type Session = {
  evaluation: EvaluationRecord | null;
  notifications: NotificationItem[];
};
let snapshot: Session | undefined;
const listeners = new Set<() => void>();

function getSnapshot(): Session {
  if (!snapshot) {
    const stored = readJson(notificationsKey);
    const readIds = new Set(
      Array.isArray(stored)
        ? stored.filter((id): id is string => typeof id === "string")
        : [],
    );
    snapshot = {
      evaluation: restoreEvaluation(),
      notifications: notifications.map((item) => ({
        ...item,
        read: item.read || readIds.has(item.id),
      })),
    };
  }
  return snapshot;
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function publish(next: Session) {
  snapshot = next;
  listeners.forEach((listener) => listener());
}

/** Session-only example adapter, not a backend or an authorization boundary. */
export function useGroupwareSession() {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}

export function saveEvaluation(draft: EvaluationDraft, submit = false) {
  const current = getSnapshot();
  if (current.evaluation?.status === "submitted")
    throw new Error("이미 제출한 평가입니다.");
  if (submit && (!draft.title.trim() || !draft.summary.trim()))
    throw new Error("필수 항목을 입력해 주세요.");
  const evaluation: EvaluationRecord = {
    ...draft,
    status: submit ? "submitted" : "draft",
    submittedAt: submit ? new Date().toISOString() : null,
  };
  // Publish only after a successful write: failed storage must never look saved.
  sessionStorage.setItem(evaluationKey, JSON.stringify(evaluation));
  publish({ ...current, evaluation });
  return evaluation;
}

export function markNotificationsRead(id?: string) {
  const current = getSnapshot();
  const items = current.notifications.map((item) =>
    !id || item.id === id ? { ...item, read: true } : item,
  );
  sessionStorage.setItem(
    notificationsKey,
    JSON.stringify(items.filter((item) => item.read).map((item) => item.id)),
  );
  publish({ ...current, notifications: items });
}

export function formatSubmissionTime(value: string) {
  const parts = new Intl.DateTimeFormat("ko-KR", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "numeric",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(new Date(value));
  const part = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((item) => item.type === type)?.value;
  return `${part("year")}년 ${part("month")}월 ${part("day")}일 ${part("hour")}:${part("minute")}`;
}
