import { useState } from "react";
import {
  ArrowLeft,
  Bell,
  CalendarDays,
  CheckCircle2,
  ClipboardCheck,
  Clock3,
  FileText,
  Home,
  LockKeyhole,
  ShieldCheck,
  Users,
} from "lucide-react";
import {
  Badge,
  Button,
  Card,
  Field,
  Input,
  Progress,
  Select,
  Textarea,
} from "@cheese/react";
import Logo from "./Logo";
import "./evaluation-product-demo.css";

type Screen = "login" | "home" | "draft" | "review";

export default function EvaluationProductDemo() {
  const [screen, setScreen] = useState<Screen>("login");
  const [title, setTitle] = useState("하반기 주요 업무와 기여");
  const [summary, setSummary] = useState("");
  const [focus, setFocus] = useState("delivery");
  const [error, setError] = useState("");
  const [saved, setSaved] = useState("예시 초안 · 저장 전");

  const openDraft = () => {
    setError("");
    setScreen("draft");
  };

  return (
    <section className="evaluation-concept" aria-labelledby="evaluation-title">
      <header className="evaluation-concept-heading">
        <div>
          <span className="eyebrow">
            <span className="gold-dash" /> PRODUCT CONCEPT
          </span>
          <h1 id="evaluation-title">인사평가가 제품이 된다면.</h1>
          <p>
            CHEESE 컴포넌트로 구성한 최소 제품 예제입니다. 로그인부터 오늘 할 일
            확인, 평가 초안 작성까지 한 흐름만 연결했습니다.
          </p>
        </div>
        <Badge tone="brand">Interview prototype</Badge>
      </header>

      <div className="evaluation-assumption" role="note">
        <ShieldCheck aria-hidden="true" />
        <div>
          <strong>화면과 상호작용을 검토하기 위한 가상 데이터입니다.</strong>
          <span>
            실제 평가 항목·등급·승인 단계·SSO·권한 정책은 현행 프로세스 확인 후
            정의합니다.
          </span>
        </div>
      </div>

      <div className="evaluation-product-frame">
        {screen === "login" ? (
          <LoginScreen onContinue={() => setScreen("home")} />
        ) : (
          <ProductShell
            screen={screen}
            saved={saved}
            onHome={() => setScreen("home")}
            onDraft={openDraft}
            onLogout={() => setScreen("login")}
          >
            {screen === "home" ? (
              <EmployeeHome onDraft={openDraft} />
            ) : screen === "draft" ? (
              <DraftScreen
                title={title}
                summary={summary}
                focus={focus}
                error={error}
                saved={saved}
                onTitle={setTitle}
                onSummary={(value) => {
                  setSummary(value);
                  if (value.trim()) setError("");
                }}
                onFocus={setFocus}
                onBack={() => setScreen("home")}
                onSave={() => setSaved("방금 이 브라우저에 임시 저장됨")}
                onReview={() => {
                  if (!summary.trim()) {
                    setError("이번 기간의 업무와 기여를 간단히 작성해 주세요.");
                    return;
                  }
                  setScreen("review");
                }}
              />
            ) : (
              <ReviewScreen
                title={title}
                summary={summary}
                focus={focus}
                onBack={() => setScreen("draft")}
              />
            )}
          </ProductShell>
        )}
      </div>

      <footer className="evaluation-concept-footnote">
        이 예제는 특정 회사의 실제 평가 정책이나 내부 시스템을 재현하지
        않습니다. 제품 구조와 공통 컴포넌트의 적용 가능성만 보여줍니다.
      </footer>
    </section>
  );
}

function LoginScreen({ onContinue }: { onContinue: () => void }) {
  return (
    <div className="evaluation-login">
      <div className="evaluation-login-story">
        <span className="evaluation-product-brand">
          <Logo /> CHEESE PEOPLE
        </span>
        <div>
          <Badge tone="brand">2026 하반기 · 예시</Badge>
          <h2>평가보다 성장에 집중할 수 있도록.</h2>
          <p>
            해야 할 일과 남은 일정을 한눈에 확인하고, 작성하던 내용을 안전하게
            이어갑니다.
          </p>
        </div>
        <small>Demo only · No employee data</small>
      </div>
      <div className="evaluation-login-panel">
        <Card className="evaluation-login-card">
          <div className="evaluation-login-icon">
            <LockKeyhole aria-hidden="true" />
          </div>
          <div>
            <span className="eyebrow">EMPLOYEE ACCESS</span>
            <h2>사내 계정으로 시작하기</h2>
            <p>
              실제 서비스에서는 회사의 SSO·MFA와 연결합니다. 이 화면은 직원
              역할의 예시 흐름만 제공합니다.
            </p>
          </div>
          <Button variant="accent" size="lg" onClick={onContinue}>
            직원 데모로 계속하기
          </Button>
          <span className="evaluation-login-security">
            <ShieldCheck aria-hidden="true" /> 인증·권한 구조는 AS-IS 확인 후
            결정
          </span>
        </Card>
      </div>
    </div>
  );
}

function ProductShell({
  screen,
  saved,
  onHome,
  onDraft,
  onLogout,
  children,
}: {
  screen: Screen;
  saved: string;
  onHome: () => void;
  onDraft: () => void;
  onLogout: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="evaluation-app">
      <header className="evaluation-app-header">
        <span className="evaluation-product-brand">
          <Logo /> CHEESE PEOPLE
        </span>
        <div className="evaluation-user">
          <button type="button" aria-label="알림 예제">
            <Bell aria-hidden="true" />
          </button>
          <span aria-hidden="true">김</span>
          <div>
            <strong>김치즈</strong>
            <small>직원 데모</small>
          </div>
        </div>
      </header>
      <div className="evaluation-app-body">
        <aside className="evaluation-app-nav" aria-label="인사평가 예제 탐색">
          <button
            type="button"
            data-active={screen === "home"}
            onClick={onHome}
          >
            <Home aria-hidden="true" /> 홈
          </button>
          <button
            type="button"
            data-active={screen === "draft" || screen === "review"}
            onClick={onDraft}
          >
            <FileText aria-hidden="true" /> 내 평가
          </button>
          <button type="button" disabled title="요구사항 확인 후 설계">
            <Users aria-hidden="true" /> 관리자 영역 <small>TBD</small>
          </button>
          <div className="evaluation-nav-meta">
            <span>{saved}</span>
            <button type="button" onClick={onLogout}>
              데모 종료
            </button>
          </div>
        </aside>
        <main className="evaluation-app-main">{children}</main>
      </div>
    </div>
  );
}

function EmployeeHome({ onDraft }: { onDraft: () => void }) {
  return (
    <div className="evaluation-dashboard">
      <div className="evaluation-page-title">
        <div>
          <span className="eyebrow">MONDAY · EMPLOYEE HOME</span>
          <h2>안녕하세요, 김치즈 님.</h2>
          <p>오늘 처리할 평가 업무를 확인하세요.</p>
        </div>
        <Badge tone="brand">평가 진행 중</Badge>
      </div>

      <div className="evaluation-metrics" aria-label="평가 진행 요약">
        <Metric
          icon={<ClipboardCheck />}
          label="내 할 일"
          value="1"
          unit="건"
        />
        <Metric icon={<Clock3 />} label="마감까지" value="7" unit="일" />
        <Metric icon={<CheckCircle2 />} label="완료" value="0" unit="건" />
      </div>

      <div className="evaluation-dashboard-grid">
        <Card className="evaluation-task-card">
          <div className="evaluation-card-heading">
            <div>
              <span className="eyebrow">MY TASK</span>
              <h3>2026 하반기 자기평가</h3>
            </div>
            <Badge>작성 중</Badge>
          </div>
          <p>작성한 초안을 이어서 검토해 주세요.</p>
          <div className="evaluation-progress-copy">
            <span>예시 작성률</span>
            <strong>65%</strong>
          </div>
          <Progress value={65} label="자기평가 예시 작성률" />
          <div className="evaluation-task-meta">
            <span>
              <CalendarDays aria-hidden="true" /> 예시 마감일 10월 15일
            </span>
            <Button variant="accent" onClick={onDraft}>
              작성 이어가기
            </Button>
          </div>
        </Card>

        <Card className="evaluation-notice-card">
          <div className="evaluation-card-heading">
            <div>
              <span className="eyebrow">GUIDE</span>
              <h3>작성 전 확인</h3>
            </div>
          </div>
          <ul>
            <li>평가 항목과 문구는 예시입니다.</li>
            <li>임시저장·제출 권한은 실제 정책과 연결합니다.</li>
            <li>개인정보와 평가 데이터는 접근 이력을 남깁니다.</li>
          </ul>
        </Card>
      </div>
    </div>
  );
}

function Metric({
  icon,
  label,
  value,
  unit,
}: {
  icon: React.ReactElement;
  label: string;
  value: string;
  unit: string;
}) {
  return (
    <Card className="evaluation-metric">
      <span>{icon}</span>
      <div>
        <small>{label}</small>
        <strong>
          {value} <em>{unit}</em>
        </strong>
      </div>
    </Card>
  );
}

function DraftScreen({
  title,
  summary,
  focus,
  error,
  saved,
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
  saved: string;
  onTitle: (value: string) => void;
  onSummary: (value: string) => void;
  onFocus: (value: string) => void;
  onBack: () => void;
  onSave: () => void;
  onReview: () => void;
}) {
  return (
    <div className="evaluation-draft">
      <button type="button" className="evaluation-back" onClick={onBack}>
        <ArrowLeft aria-hidden="true" /> 홈으로
      </button>
      <div className="evaluation-page-title">
        <div>
          <span className="eyebrow">SELF REVIEW · EXAMPLE</span>
          <h2>자기평가 초안</h2>
          <p>필요한 만큼 작성하고 검토 화면에서 다시 확인합니다.</p>
        </div>
        <Badge>{saved}</Badge>
      </div>
      <div className="evaluation-draft-layout">
        <Card className="evaluation-form-card">
          <Field label="제목" required>
            <Input value={title} onChange={(e) => onTitle(e.target.value)} />
          </Field>
          <Field
            label="이번 기간의 업무와 기여"
            required
            error={error}
            description="구체적인 항목과 작성 가이드는 실제 평가 정책에 따라 달라집니다."
          >
            <Textarea
              value={summary}
              placeholder="예: 담당 업무, 개선한 점, 협업 과정에서 기여한 내용을 작성하세요."
              onChange={(e) => onSummary(e.target.value)}
            />
          </Field>
          <Select
            label="예시 분류 항목"
            description="점수·등급 체계가 아닌 UI 검토용 선택 항목입니다."
            value={focus}
            onValueChange={onFocus}
            options={[
              { value: "delivery", label: "업무 실행" },
              { value: "collaboration", label: "협업" },
              { value: "growth", label: "성장" },
            ]}
          />
          <div className="evaluation-form-actions">
            <Button variant="weak" onClick={onSave}>
              임시저장
            </Button>
            <Button variant="accent" onClick={onReview}>
              검토 화면 보기
            </Button>
          </div>
        </Card>
        <aside className="evaluation-draft-guide">
          <span className="eyebrow">ASSUMPTION</span>
          <h3>정책보다 먼저 정하지 않습니다.</h3>
          <p>
            평가 항목, 등급, 결재 단계, 수정 가능 시점은 내부 프로세스와 사용자
            인터뷰를 거쳐 정의합니다.
          </p>
          <div>
            <ShieldCheck aria-hidden="true" />
            <span>SSO · RBAC · 감사 이력 검토</span>
          </div>
          <div>
            <Clock3 aria-hidden="true" />
            <span>임시저장 · 마감 · 복구 정책 검토</span>
          </div>
        </aside>
      </div>
    </div>
  );
}

function ReviewScreen({
  title,
  summary,
  focus,
  onBack,
}: {
  title: string;
  summary: string;
  focus: string;
  onBack: () => void;
}) {
  const focusLabel =
    { delivery: "업무 실행", collaboration: "협업", growth: "성장" }[focus] ||
    focus;
  return (
    <div className="evaluation-review">
      <button type="button" className="evaluation-back" onClick={onBack}>
        <ArrowLeft aria-hidden="true" /> 수정 화면으로
      </button>
      <div className="evaluation-page-title">
        <div>
          <span className="eyebrow">REVIEW · NOT SUBMITTED</span>
          <h2>작성 내용을 확인하세요.</h2>
          <p>실제 제출과 승인 정책은 요구사항 확인 후 연결합니다.</p>
        </div>
        <Badge tone="brand">검토 중</Badge>
      </div>
      <Card className="evaluation-review-card">
        <div>
          <small>제목</small>
          <h3>{title}</h3>
        </div>
        <div>
          <small>업무와 기여</small>
          <p>{summary}</p>
        </div>
        <div>
          <small>예시 분류</small>
          <Badge>{focusLabel}</Badge>
        </div>
      </Card>
      <div className="evaluation-review-notice">
        <ShieldCheck aria-hidden="true" />
        <span>
          최종 제출 버튼은 의도적으로 구현하지 않았습니다. 제출 이후
          수정·회수·승인 규칙을 확인한 뒤 설계합니다.
        </span>
      </div>
    </div>
  );
}
