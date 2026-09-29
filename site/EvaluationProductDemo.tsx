import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  Alert,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogRoot,
  AlertDialogTitle,
  Badge,
  Button,
  DescriptionList,
  DetailPage,
  Field,
  FormActions,
  FormGrid,
  FormPage,
  FormSection,
  Input,
  PageHeader,
  SaveStatus,
  SectionHeader,
  Select,
  StatCard,
  StatGroup,
  Textarea,
} from "@cheese/react";
import "./evaluation-product-demo.css";
import { registerWorkflowRouteBlocker } from "./workflow-navigation";
import GroupwareShell from "./GroupwareShell";
import {
  formatSubmissionTime,
  saveEvaluation,
  useGroupwareSession,
  type EvaluationDraft,
} from "./groupware-session";

type Screen = "home" | "draft" | "review";
type Draft = EvaluationDraft;
type SaveState = "idle" | "dirty" | "saved" | "error";
const emptyDraft: Draft = {
  title: "주요 업무와 기여",
  summary: "",
  focus: "delivery",
};

export default function EvaluationProductDemo() {
  const { evaluation } = useGroupwareSession();
  const [restored] = useState(evaluation);
  const [screen, setScreen] = useState<Screen>("home");
  const [title, setTitle] = useState(restored?.title ?? emptyDraft.title);
  const [summary, setSummary] = useState(
    restored?.summary ?? emptyDraft.summary,
  );
  const [focus, setFocus] = useState(restored?.focus ?? emptyDraft.focus);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(
    restored?.status === "submitted"
      ? "제출한 평가를 복원했습니다."
      : restored
        ? "이 탭에 저장된 초안을 복원했습니다."
        : "아직 저장하지 않았습니다.",
  );
  const [saveState, setSaveState] = useState<SaveState>(
    restored ? "saved" : "idle",
  );
  const submitted = evaluation?.status === "submitted";
  const root = useRef<HTMLDivElement>(null);
  const previousStep = useRef({ screen, submitted });
  const [pendingAction, setPendingAction] = useState<{
    run: () => void;
  } | null>(null);
  const allowLeave = useRef(false);
  const leaveTrigger = useRef<HTMLElement | null>(null);
  const dirty = saveState === "dirty" || saveState === "error";

  useEffect(() => {
    if (
      previousStep.current.screen === screen &&
      previousStep.current.submitted === submitted
    )
      return;
    previousStep.current = { screen, submitted };
    const heading = root.current?.querySelector<HTMLElement>("main h1");
    if (heading) {
      heading.tabIndex = -1;
      heading.focus();
    }
  }, [screen, submitted]);

  useEffect(() => {
    if (error)
      root.current
        ?.querySelector<HTMLElement>('main [aria-invalid="true"]')
        ?.focus();
  }, [error]);

  useEffect(() => {
    if (!dirty) return;
    allowLeave.current = false;
    const preventUnload = (event: BeforeUnloadEvent) => {
      if (allowLeave.current) return;
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", preventUnload);
    const unregister = registerWorkflowRouteBlocker((destination) => {
      if (allowLeave.current) return true;
      leaveTrigger.current =
        document.activeElement instanceof HTMLElement
          ? document.activeElement
          : null;
      setPendingAction({
        run: () => {
          allowLeave.current = true;
          window.location.assign(destination);
        },
      });
      return false;
    });
    return () => {
      window.removeEventListener("beforeunload", preventUnload);
      unregister();
    };
  }, [dirty]);

  const saveDraft = (submit = false) => {
    try {
      saveEvaluation({ title, summary, focus }, submit);
      setSaved(
        submit
          ? "이 탭에 제출 상태를 저장했습니다."
          : "이 탭에 임시저장했습니다.",
      );
      setSaveState("saved");
      return true;
    } catch {
      setSaved(
        "저장하지 못했습니다. 입력한 내용은 유지됩니다. 다시 시도해 주세요.",
      );
      setSaveState("error");
      return false;
    }
  };
  const markDirty = () => {
    setSaveState("dirty");
    setSaved("저장하지 않은 변경사항");
  };
  const discardChanges = () => {
    const stored = evaluation;
    const draft = stored ?? emptyDraft;
    setTitle(draft.title);
    setSummary(draft.summary);
    setFocus(draft.focus);
    setError("");
    setSaved(
      stored
        ? "이 탭에 저장된 초안을 복원했습니다."
        : "아직 저장하지 않았습니다.",
    );
    setSaveState(stored ? "saved" : "idle");
  };

  return (
    <div className="evaluation-standalone cheese-root" ref={root}>
      <ProductShell
        saved={saved}
        saveState={saveState}
        onSave={() => saveDraft()}
      >
        {screen === "home" ? (
          <EmployeeHome
            draft={{ title, summary, focus }}
            saveState={saveState}
            submitted={submitted}
            onOpen={() => setScreen(submitted ? "review" : "draft")}
          />
        ) : screen === "draft" ? (
          <DraftScreen
            title={title}
            summary={summary}
            focus={focus}
            error={error}
            onTitle={(value) => {
              setTitle(value);
              markDirty();
            }}
            onSummary={(value) => {
              setSummary(value);
              markDirty();
              if (value.trim()) setError("");
            }}
            onFocus={(value) => {
              setFocus(value);
              markDirty();
            }}
            onBack={() => setScreen("home")}
            onSave={() => saveDraft()}
            onReview={() => {
              if (!title.trim() || !summary.trim()) {
                setError(
                  !title.trim()
                    ? "제목과 업무 내용을 입력해 주세요."
                    : "이번 기간의 업무와 기여를 간단히 작성해 주세요.",
                );
                // Repeated submission with the same error must focus it too.
                root.current
                  ?.querySelector<HTMLElement>(
                    !title.trim() ? "main input" : "main textarea",
                  )
                  ?.focus();
                return;
              }
              setError("");
              setScreen("review");
            }}
          />
        ) : (
          <ReviewScreen
            title={title}
            summary={summary}
            focus={focus}
            submitted={submitted}
            submittedAt={evaluation?.submittedAt ?? null}
            onBack={() => setScreen("draft")}
            onSubmit={() => {
              saveDraft(true);
            }}
          />
        )}
      </ProductShell>
      <AlertDialogRoot
        open={pendingAction !== null}
        onOpenChange={(open) => {
          if (!open) setPendingAction(null);
        }}
      >
        <AlertDialogContent
          onCloseAutoFocus={(event) => {
            if (leaveTrigger.current?.isConnected) {
              event.preventDefault();
              leaveTrigger.current.focus();
            }
          }}
        >
          <AlertDialogTitle>작성 중인 내용을 저장할까요?</AlertDialogTitle>
          <AlertDialogDescription>
            다른 업무로 이동하기 전에 변경사항을 저장하거나 버릴 수 있습니다.
          </AlertDialogDescription>
          {saveState === "error" && <SaveStatus status="error" label={saved} />}
          <div className="cheese-dialog-actions">
            <AlertDialogCancel asChild>
              <Button variant="weak">계속 작성</Button>
            </AlertDialogCancel>
            <Button
              variant="ghost"
              onClick={() => {
                const action = pendingAction;
                discardChanges();
                setPendingAction(null);
                action?.run();
              }}
            >
              저장하지 않고 이동
            </Button>
            <Button
              variant="accent"
              onClick={() => {
                if (saveDraft()) {
                  const action = pendingAction;
                  setPendingAction(null);
                  action?.run();
                }
              }}
            >
              저장 후 이동
            </Button>
          </div>
        </AlertDialogContent>
      </AlertDialogRoot>
    </div>
  );
}

function ProductShell({
  saved,
  saveState,
  onSave,
  children,
}: {
  saved: string;
  saveState: SaveState;
  onSave: () => void;
  children: ReactNode;
}) {
  return (
    <GroupwareShell
      activeId="evaluation"
      footer={<SaveStatus status={saveState} label={saved} onRetry={onSave} />}
    >
      <main className="evaluation-main" tabIndex={-1} autoFocus>
        {children}
      </main>
    </GroupwareShell>
  );
}

function EmployeeHome({
  draft,
  saveState,
  submitted,
  onOpen,
}: {
  draft: Draft;
  saveState: SaveState;
  submitted: boolean;
  onOpen: () => void;
}) {
  const completed = [draft.title, draft.summary, draft.focus].filter((value) =>
    value.trim(),
  ).length;
  return (
    <div className="evaluation-content">
      <PageHeader
        eyebrow="2026 하반기"
        title="내 인사평가"
        description="평가 일정과 작성 상태를 확인하고 기한 안에 제출하세요."
      />
      <StatGroup columns={3}>
        <StatCard
          label="제출 마감"
          value="10월 13일"
          description="마감까지 14일"
        />
        <StatCard
          label="작성 진행"
          value={submitted ? "제출 완료" : completed + " / 3"}
          description={
            submitted
              ? "제출한 내용을 확인할 수 있습니다"
              : "제목, 업무 내용, 분류"
          }
        />
        <StatCard
          label="저장 상태"
          value={
            saveState === "saved"
              ? "저장됨"
              : saveState === "idle"
                ? "시작 전"
                : "저장 필요"
          }
          description="같은 브라우저 탭에서 유지"
        />
      </StatGroup>
      <section className="evaluation-section">
        <SectionHeader
          title="자기평가"
          description={
            submitted
              ? "자기평가가 제출되었습니다. 제출한 내용을 확인할 수 있습니다."
              : draft.summary.trim()
                ? "작성한 내용이 있습니다. 검토를 이어가세요."
                : "이번 기간에 수행한 업무와 기여를 기록하세요."
          }
          actions={
            <Button variant="accent" onClick={onOpen}>
              {submitted ? "제출 내용 보기" : "작성 이어가기"}
            </Button>
          }
        />
        <DescriptionList
          items={[
            { label: "제목", value: draft.title || "입력 전" },
            {
              label: "작성 상태",
              value: (
                <Badge tone={draft.summary.trim() ? "brand" : "neutral"}>
                  {submitted
                    ? "제출 완료"
                    : draft.summary.trim()
                      ? "작성 중"
                      : "입력 전"}
                </Badge>
              ),
            },
          ]}
        />
      </section>
    </div>
  );
}

function DraftScreen({
  title,
  summary,
  focus,
  error,
  onTitle,
  onSummary,
  onFocus,
  onBack,
  onSave,
  onReview,
}: {
  title: string;
  summary: string;
  focus: string;
  error: string;
  onTitle: (value: string) => void;
  onSummary: (value: string) => void;
  onFocus: (value: string) => void;
  onBack: () => void;
  onSave: () => void;
  onReview: () => void;
}) {
  return (
    <div className="evaluation-content">
      <FormPage
        eyebrow="2026 하반기 · 제출 마감 10월 13일"
        title="자기평가 작성"
        description="이번 평가 기간의 핵심 업무와 기여를 작성한 뒤 제출 전 내용을 검토하세요."
        noValidate
        onSubmit={onReview}
        footer={
          <FormActions
            cancelLabel="평가 개요"
            submitLabel="제출 전 검토"
            onCancel={onBack}
          >
            <Button variant="weak" onClick={onSave}>
              임시저장
            </Button>
          </FormActions>
        }
      >
        <FormSection title="업무 기록">
          <FormGrid columns={1}>
            <Field
              label="제목"
              required
              error={
                error && !title.trim() ? "제목을 입력해 주세요." : undefined
              }
            >
              <Input
                value={title}
                onChange={(event) => onTitle(event.target.value)}
              />
            </Field>
            <Field
              label="이번 기간의 업무와 기여"
              required
              error={error && !summary.trim() ? error : undefined}
              description="수행한 일, 개선한 점, 협업에 기여한 내용을 작성하세요."
            >
              <Textarea
                rows={7}
                value={summary}
                placeholder="업무와 결과를 구체적으로 기록해 주세요."
                onChange={(event) => onSummary(event.target.value)}
              />
            </Field>
            <Select
              label="분류"
              value={focus}
              onValueChange={onFocus}
              options={[
                { value: "delivery", label: "업무 수행" },
                { value: "collaboration", label: "협업" },
                { value: "growth", label: "성장" },
              ]}
            />
          </FormGrid>
        </FormSection>
      </FormPage>
    </div>
  );
}

function ReviewScreen({
  title,
  summary,
  focus,
  submitted,
  submittedAt,
  onBack,
  onSubmit,
}: {
  title: string;
  summary: string;
  focus: string;
  submitted: boolean;
  submittedAt: string | null;
  onBack: () => void;
  onSubmit: () => void;
}) {
  const focusLabel =
    { delivery: "업무 수행", collaboration: "협업", growth: "성장" }[focus] ||
    focus;
  return (
    <div className="evaluation-content">
      <DetailPage
        eyebrow="2026 하반기"
        title={submitted ? "제출한 자기평가" : "제출 전 확인"}
        description={
          submitted
            ? "제출한 자기평가 내용입니다."
            : "입력한 내용을 최종 확인한 뒤 평가를 제출하세요."
        }
        actions={
          <Badge tone="brand">{submitted ? "제출 완료" : "제출 전"}</Badge>
        }
        footer={
          submitted ? (
            <Alert>
              자기평가가 {submittedAt ? formatSubmissionTime(submittedAt) : ""}
              에 제출되었습니다. (한국 시간)
            </Alert>
          ) : (
            <div className="evaluation-review-actions">
              <Button variant="weak" onClick={onBack}>
                내용 수정
              </Button>
              <Button variant="accent" onClick={onSubmit}>
                자기평가 제출
              </Button>
            </div>
          )
        }
      >
        <DescriptionList
          items={[
            { label: "제목", value: title },
            {
              label: "업무와 기여",
              value: <span className="evaluation-summary">{summary}</span>,
            },
            { label: "분류", value: <Badge>{focusLabel}</Badge> },
          ]}
        />
      </DetailPage>
    </div>
  );
}
