import React, { useEffect, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  Button,
  Input,
  Badge,
  Card,
  TabsRoot,
  TabsList,
  TabsTrigger,
  TabsContent,
  DialogRoot,
  DialogTrigger,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogClose,
  Field,
  Select,
  Checkbox,
  Switch,
  Progress,
  Avatar,
  Table,
  Alert,
  Search,
  Plus,
  Menu,
  Check,
  ChevronRight,
  ChevronLeft,
  ArrowUpRight,
} from "./ui";
import "@cheese/css";
import "./site.css";
import { entries, groups, type Entry } from "./catalog";
import VueDemoSource from "./VueDemo.vue?raw";
import { Tree } from "@cheese/react";
const modules = import.meta.glob<{ default: React.ComponentType }>(
  "./examples/*.tsx",
);
const examples = Object.fromEntries(
  Object.entries(modules).map(([path, loader]) => [path, React.lazy(loader)]),
);
const sources = import.meta.glob<string>("./examples/*.tsx", {
  eager: true,
  query: "?raw",
  import: "default",
});
const implemented = (id: string) => !!modules["./examples/" + id + ".tsx"];
const count = entries.filter((e) => implemented(e.id)).length;
const github = "https://github.com/dhyun0226/cheese-design-system";
function Logo() {
  return (
    <span className="logo-mark" aria-hidden="true">
      <svg viewBox="0 0 32 32">
        <path
          d="M6 9a3 3 0 0 1 3-3h14a3 3 0 0 1 3 3v14a3 3 0 0 1-3 3H9a3 3 0 0 1-3-3Z"
          fill="currentColor"
        />
        <circle cx="11" cy="12" r="2" fill="#fff" />
        <circle cx="22" cy="19" r="3" fill="#fff" />
        <circle cx="12" cy="23" r="1.5" fill="#fff" />
      </svg>
    </span>
  );
}
function useRoute() {
  const [route, setRoute] = useState(location.hash.slice(2) || "");
  useEffect(() => {
    const listener = () => {
      setRoute(location.hash.slice(2) || "");
      window.scrollTo(0, 0);
    };
    window.addEventListener("hashchange", listener);
    return () => window.removeEventListener("hashchange", listener);
  }, []);
  return route;
}
function CopyCode({ code }: { code: string }) {
  const [status, setStatus] = useState("복사");
  return (
    <div className="code-block">
      <div className="code-toolbar">
        <span>실행 예제 소스</span>
        <Button
          variant="ghost"
          size="sm"
          onClick={async () => {
            try {
              await navigator.clipboard.writeText(code);
              setStatus("복사됨");
            } catch {
              setStatus("복사 실패 · 직접 선택해 주세요");
            }
          }}
        >
          {status === "복사됨" && <Check aria-hidden="true" />}
          {status}
        </Button>
      </div>
      <pre tabIndex={0}>
        <code>{code}</code>
      </pre>
      <span className="cheese-sr-only" role="status">
        {status === "복사" ? "" : status}
      </span>
    </div>
  );
}
function Sidebar({
  route,
  onNavigate,
}: {
  route: string;
  onNavigate?: () => void;
}) {
  const [query, setQuery] = useState("");
  const active = entries.find((e) => route === "components/" + e.id);
  const [open, setOpen] = useState<Record<string, boolean>>({ 입력: true });
  useEffect(() => {
    if (active) setOpen({ [active.group]: true });
  }, [active]);
  return (
    <nav className="sidebar-content" aria-label="문서 탐색">
      <div className="nav-search">
        <Search aria-hidden="true" />
        <Input
          aria-label="컴포넌트 검색"
          placeholder="컴포넌트 검색"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>
      <div className="nav-intro">
        {[
          ["", "소개"],
          ["getting-started", "시작하기"],
          ["foundations", "디자인 원칙"],
          ["patterns", "업무 화면 예제"],
          ["components", "전체 컴포넌트"],
          ["readiness", "도입 체크리스트"],
        ].map(([id, label]) => (
          <a
            key={id}
            href={"#/" + id}
            aria-current={route === id ? "page" : undefined}
            onClick={onNavigate}
          >
            {label}
            {id === "components" && <span>{entries.length}</span>}
          </a>
        ))}
      </div>
      <div className="nav-caption">COMPONENTS</div>
      {groups.map(([label, english, items]) => {
        const filtered = items.filter((i) =>
          (i[1] + " " + i[2])
            .toLocaleLowerCase()
            .includes(query.toLocaleLowerCase()),
        );
        if (!filtered.length) return null;
        return (
          <div key={label} className="nav-group">
            <button
              type="button"
              aria-expanded={!!query || !!open[label]}
              aria-controls={"group-" + english.replace(/\W/g, "")}
              onClick={() => setOpen((v) => ({ ...v, [label]: !v[label] }))}
            >
              {label}
              <ChevronRight
                aria-hidden="true"
                data-open={!!query || !!open[label]}
              />
            </button>
            {(query || open[label]) && (
              <div id={"group-" + english.replace(/\W/g, "")}>
                {filtered.map((i) => (
                  <a
                    href={"#/components/" + i[0]}
                    key={i[0]}
                    aria-current={
                      route === "components/" + i[0] ? "page" : undefined
                    }
                    onClick={onNavigate}
                  >
                    {i[1]}
                    {!implemented(i[0]) && (
                      <span className="nav-planned" aria-label="설계 중">
                        ·
                      </span>
                    )}
                  </a>
                ))}
              </div>
            )}
          </div>
        );
      })}
      {!entries.some((e) =>
        (e.name + " " + e.description)
          .toLocaleLowerCase()
          .includes(query.toLocaleLowerCase()),
      ) && <p className="cheese-help search-empty">검색 결과가 없습니다.</p>}
      <div className="nav-footer">
        <span className="status-dot" />
        개인 제작 · 도입 검증 단계
      </div>
    </nav>
  );
}
function EvaluationPreview() {
  const [submitted, setSubmitted] = useState(false);
  return (
    <div className="product-preview">
      <div className="product-top">
        <span className="product-name">
          <Logo />
          cheese workspace
        </span>
        <Avatar alt="가상 사용자 김치즈" fallback="치즈" />
      </div>
      <div className="product-content">
        <div className="product-heading">
          <div>
            <span className="eyebrow">PEOPLE & GROWTH</span>
            <h2>함께 돌아보는 한 해.</h2>
            <p>2026 하반기 성과 평가</p>
          </div>
          <Badge tone="brand">진행 중</Badge>
        </div>
        <div className="product-stats">
          <div>
            <span>평가 대상</span>
            <strong>
              24<span>명</span>
            </strong>
          </div>
          <div>
            <span>제출 완료</span>
            <strong>
              {submitted ? 19 : 18}
              <span>명</span>
            </strong>
          </div>
          <div>
            <span>마감까지</span>
            <strong>
              7<span>일</span>
            </strong>
          </div>
        </div>
        <div className="product-progress">
          <span>팀 평가 진행률</span>
          <strong>{submitted ? 79 : 75}%</strong>
        </div>
        <Progress label="팀 평가 진행률" value={submitted ? 79 : 75} />
        <div className="product-task">
          <Avatar alt="본인 평가" fallback="나" />
          <div>
            <strong>나의 성과 돌아보기</strong>
            <p>
              {submitted
                ? "검토가 완료되었습니다."
                : "작성한 평가를 검토하고 제출해 주세요."}
            </p>
          </div>
          <DialogRoot>
            <DialogTrigger asChild>
              <Button variant="weak" size="sm">
                {submitted ? "다시 보기" : "검토하기"}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogTitle>평가 제출 전 확인</DialogTitle>
              <DialogDescription>
                실제 사내 데이터가 아닌 디자인 시스템 데모입니다. 제출하면 이
                화면의 예제 상태만 변경됩니다.
              </DialogDescription>
              <div className="cheese-dialog-actions">
                <DialogClose asChild>
                  <Button variant="weak">취소</Button>
                </DialogClose>
                <DialogClose asChild>
                  <Button variant="accent" onClick={() => setSubmitted(true)}>
                    예제 제출
                  </Button>
                </DialogClose>
              </div>
            </DialogContent>
          </DialogRoot>
        </div>
      </div>
      <div className="product-bottom">
        <span className="status-dot" />
        실제 CHEESE 컴포넌트로 만든 화면
      </div>
    </div>
  );
}
function Home() {
  return (
    <>
      <div className="home-hero">
        <div className="hero-copy">
          <div className="eyebrow">
            <span className="gold-dash" />
            CHEESE DESIGN SYSTEM
          </div>
          <h1>
            좋은 도구는,
            <br />
            일을 단순하게.
          </h1>
          <p>
            차분한 화면. 확실한 동작.
            <br />
            함께 만드는 제품을 위한 공통 언어.
          </p>
          <div className="hero-actions">
            <a className="cheese-button" href="#/getting-started">
              시작하기
              <ChevronRight aria-hidden="true" />
            </a>
            <a className="text-link" href="#/components">
              컴포넌트 둘러보기{" "}
              <ArrowUpRight className="cheese-inline-icon" aria-hidden="true" />
            </a>
          </div>
          <span className="hero-note">
            React · Vue · Framework-independent tokens
          </span>
        </div>
        <EvaluationPreview />
      </div>
      <div className="principle-strip">
        <div>
          <span>01 / FOUNDATION</span>
          <h2>하나의 기준.</h2>
          <p>
            색상, 타이포그래피, 여백을 토큰으로.
            <br />
            어떤 프레임워크에서도 같은 경험을.
          </p>
        </div>
        <div>
          <span>02 / COMPONENTS</span>
          <h2>작동하는 디테일.</h2>
          <p>
            입력부터 팝업, 키보드 탐색까지.
            <br />
            패키지로 가져다 쓰는 실제 컴포넌트.
          </p>
        </div>
        <div>
          <span>03 / PATTERNS</span>
          <h2>업무에 더 가까이.</h2>
          <p>
            폼, 평가, 권한 설정을 연결하는
            <br />
            다음 제품의 출발점.
          </p>
        </div>
      </div>
      <section className="home-section">
        <div className="section-heading">
          <div>
            <span className="eyebrow">EXPLORE THE SYSTEM</span>
            <h2>필요한 것부터, 하나씩.</h2>
          </div>
          <a className="text-link" href="#/components">
            전체 보기{" "}
            <ArrowUpRight className="cheese-inline-icon" aria-hidden="true" />
          </a>
        </div>
        <div className="explore-grid">
          {[
            ["button", "Button", "핵심 행동을 명확하게."],
            ["field", "Form & Field", "입력부터 오류 해결까지."],
            ["dialog", "Dialog & Overlay", "집중이 필요한 순간."],
            ["tree", "Tree & Navigation", "복잡한 구조도 간결하게."],
          ].map(([id, title, desc]) => (
            <article className="explore-card" key={id}>
              <div className="explore-number" inert aria-hidden="true">
                {id === "button" ? (
                  <Button variant="accent">저장하기</Button>
                ) : id === "field" ? (
                  <div className="preview-inset">
                    <Input
                      aria-label="회사 이메일"
                      placeholder="회사 이메일"
                      readOnly
                    />
                  </div>
                ) : id === "dialog" ? (
                  <Card>
                    <Badge tone="brand">집중이 필요한 순간</Badge>
                  </Card>
                ) : (
                  <Tree
                    nodes={[
                      {
                        id: "root",
                        label: "조직",
                        children: [{ id: "team", label: "피플팀" }],
                      },
                    ]}
                    defaultExpanded={["root"]}
                  />
                )}
              </div>
              <h3>
                <a href={"#/components/" + id}>{title}</a>
                <ArrowUpRight
                  className="cheese-inline-icon"
                  aria-hidden="true"
                />
              </h3>
              <p>{desc}</p>
            </article>
          ))}
        </div>
      </section>
      <section className="home-note">
        <span className="eyebrow">BUILT IN THE OPEN</span>
        <h2>보이는 것과 사용하는 것이 같도록.</h2>
        <p>
          이 문서의 실행 예제는 배포 패키지를 직접 사용합니다.
          <br />
          구현 상태와 남은 검증 범위도 함께 공개합니다.
        </p>
        <a className="text-link" href="#/readiness">
          도입 준비 상태 확인{" "}
          <ArrowUpRight className="cheese-inline-icon" aria-hidden="true" />
        </a>
      </section>
    </>
  );
}
function Catalog() {
  const [only, setOnly] = useState(false);
  return (
    <>
      <PageHeading
        eyebrow="LIBRARY"
        title="컴포넌트"
        description="각 항목에서 동작을 직접 확인하고, 실행 중인 예제의 소스를 가져가세요."
      />
      <div className="catalog-toolbar">
        <span>
          {count}개 실행 예제 / {entries.length}개 카탈로그 항목
        </span>
        <Switch
          label="실행 예제만 보기"
          checked={only}
          onCheckedChange={setOnly}
        />
      </div>
      {groups.map(([label, english]) => (
        <section className="catalog-section" key={label}>
          <h2>
            {label}
            <span>{english}</span>
          </h2>
          <div className="catalog-cards">
            {entries
              .filter((e) => e.group === label && (!only || implemented(e.id)))
              .map((e) => (
                <a
                  href={"#/components/" + e.id}
                  className="catalog-card"
                  key={e.id}
                >
                  <div>
                    <h3>{e.name}</h3>
                    <Badge tone={implemented(e.id) ? "neutral" : "brand"}>
                      {implemented(e.id) ? "실행 예제" : "설계 중"}
                    </Badge>
                  </div>
                  <p>{e.description}</p>
                  <ArrowUpRight
                    className="catalog-arrow cheese-inline-icon"
                    aria-hidden="true"
                  />
                </a>
              ))}
          </div>
        </section>
      ))}
    </>
  );
}
function PageHeading({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <header className="page-heading">
      <span className="eyebrow">{eyebrow}</span>
      <h1>{title}</h1>
      <p>{description}</p>
    </header>
  );
}
function ComponentPage({ entry }: { entry: Entry }) {
  const Example = examples["./examples/" + entry.id + ".tsx"];
  const source = sources["./examples/" + entry.id + ".tsx"];
  const [revision, setRevision] = useState(0);
  return (
    <>
      <div className="doc-crumb">
        <a href="#/components">컴포넌트</a>
        <span>/</span>
        {entry.group}
      </div>
      <PageHeading
        eyebrow={entry.group}
        title={entry.name}
        description={entry.description}
      />
      {Example ? (
        <>
          <div className="component-meta">
            <Badge>React package</Badge>
            <span>공통 CSS · Pretendard · 키보드 탐색</span>
          </div>
          <TabsRoot defaultValue="preview">
            <div className="preview-toolbar">
              <TabsList aria-label="예제 보기">
                <TabsTrigger value="preview">미리보기</TabsTrigger>
                <TabsTrigger value="code">코드</TabsTrigger>
              </TabsList>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setRevision((v) => v + 1)}
              >
                초기화
              </Button>
            </div>
            <TabsContent value="preview">
              <section
                className="demo-stage"
                aria-label={entry.name + " 실행 예제"}
              >
                <div
                  className={
                    "demo-content " +
                    ([
                      "table",
                      "data-table",
                      "file-upload",
                      "stepper",
                      "accordion",
                      "scroll-area",
                    ].includes(entry.id)
                      ? "demo-wide"
                      : "")
                  }
                >
                  <React.Suspense
                    fallback={
                      <p role="status" data-example-loading>
                        예제 불러오는 중…
                      </p>
                    }
                  >
                    <Example key={revision} />
                  </React.Suspense>
                </div>
                <span className="demo-watermark">CHEESE / LIVE COMPONENT</span>
              </section>
            </TabsContent>
            <TabsContent value="code">
              <CopyCode code={source} />
            </TabsContent>
          </TabsRoot>
          <div className="doc-details">
            <section>
              <h2>사용 가이드</h2>
              <p>{entry.accessibility}</p>
              <p className="cheese-help">
                현재 예제의 값은 브라우저 메모리에만 유지됩니다. 실제 저장·권한
                검사·서버 검증은 서비스에서 연결하세요.
              </p>
            </section>
            <section>
              <h2>주요 API</h2>
              <div className="api-list">
                {entry.api
                  .split(/\s*[·/]\s*/)
                  .filter(Boolean)
                  .map((s, index) => (
                    <Badge key={`${s}-${index}`}>{s}</Badge>
                  ))}
              </div>
              <p className="cheese-help">
                전체 타입은 패키지의 TypeScript 선언을 확인하세요. React는
                Radix, Vue는 Reka 기반으로 이벤트 API가 다릅니다.
              </p>
              <a
                className="text-link"
                href={github + "/tree/main/packages"}
                target="_blank"
                rel="noreferrer"
              >
                패키지 소스{" "}
                <ArrowUpRight
                  className="cheese-inline-icon"
                  aria-hidden="true"
                />
              </a>
            </section>
          </div>
        </>
      ) : (
        <div className="planned-panel">
          <Badge tone="brand">설계 중 · 프로덕션 지원 아님</Badge>
          <h2>이름만으로 완성을 약속하지 않습니다.</h2>
          <p>
            기존 카탈로그에는 있었지만, 독립적인 CHEESE 구현과 동작 검증이
            완료되지 않은 항목입니다. 모양만 있는 예제 대신 상태를 명확히
            표시합니다.
          </p>
          <p>
            설계 범위: 제어/비제어 상태, 키보드 탐색, 오류·비활성 상태,
            React·Vue 통합, 접근성 및 브라우저 테스트.
          </p>
          <a href="#/readiness" className="text-link">
            현재 도입 범위 확인{" "}
            <ArrowUpRight className="cheese-inline-icon" aria-hidden="true" />
          </a>
        </div>
      )}
      <div className="doc-bottom">
        <a href="#/components">
          <ChevronLeft className="cheese-inline-icon" aria-hidden="true" /> 전체
          컴포넌트
        </a>
        <a href="#/patterns">
          업무 화면에서 사용하기{" "}
          <ArrowUpRight className="cheese-inline-icon" aria-hidden="true" />
        </a>
      </div>
    </>
  );
}
function GettingStarted() {
  return (
    <>
      <PageHeading
        eyebrow="GETTING STARTED"
        title="작게 시작하세요."
        description="토큰부터 화면까지. 필요한 패키지를 선택하고, 공통 스타일을 한 번만 불러옵니다."
      />
      <Alert>
        현재 npm 공개 배포 전입니다. 저장소를 고정된 커밋으로 가져온 뒤
        workspace 또는 로컬 tarball로 연동하세요.
      </Alert>
      <section className="doc-section">
        <h2>01. 저장소 설치 및 검증</h2>
        <CopyCode
          code={
            "git clone " +
            github +
            ".git\ncd cheese-design-system\nnpm ci\nnpm run build\nnpx playwright install chromium\nnpm run check\nnpm run dev"
          }
        />
      </section>
      <section className="doc-section">
        <h2>02. 패키지 선택</h2>
        <Table
          caption="패키지 구성"
          headers={["패키지", "역할", "기반"]}
          rows={[
            [
              "@cheese/tokens",
              "타입이 있는 디자인 값",
              "Framework-independent",
            ],
            ["@cheese/css", "토큰 + 컴포넌트 스타일 + 로컬 폰트", "CSS"],
            ["@cheese/react", "React 컴포넌트", "Radix UI"],
            ["@cheese/vue", "Vue 컴포넌트", "Reka UI"],
          ]}
        />
      </section>
      <section className="doc-section">
        <h2>03. React에서 사용하기</h2>
        <CopyCode
          code={
            'import "@cheese/css"\nimport { Button, Field, Input } from "@cheese/react"\n\nexport function Profile() {\n  return (\n    <div className="cheese-root">\n      <Field label="이름" required>\n        <Input autoComplete="name" />\n      </Field>\n      <Button type="submit">저장</Button>\n    </div>\n  )\n}'
          }
        />
      </section>
      <section className="doc-section">
        <h2>04. Vue에서 사용하기</h2>
        <p>공통 스타일은 같고, 상태는 Vue의 v-model로 연결합니다.</p>
        <CopyCode
          code={
            '<script setup lang="ts">\nimport { ref } from "vue"\nimport "@cheese/css"\nimport { Field, Input, Button } from "@cheese/vue"\nconst name = ref("")\n</script>\n\n<template>\n  <form class="cheese-root" @submit.prevent>\n    <Field label="이름" required>\n      <Input v-model="name" />\n    </Field>\n    <Button type="submit">저장</Button>\n  </form>\n</template>'
          }
        />
        <p>
          <a className="text-link" href="./vue.html">
            실제 Vue 패키지 통합 예제 열기{" "}
            <ArrowUpRight className="cheese-inline-icon" aria-hidden="true" />
          </a>
        </p>
      </section>
      <section className="doc-section">
        <h2>연동할 때 지켜야 할 경계</h2>
        <p>
          UI의 disabled 상태는 권한 검사를 대신하지 않습니다. 인증·인가, 데이터
          저장, 개인정보 마스킹과 감사 로그는 애플리케이션과 서버에서 구현해야
          합니다. 이 프로젝트에는 STARSHIP의 내부 시스템이나 실제 직원 정보가
          포함되어 있지 않습니다.
        </p>
      </section>
    </>
  );
}
function Foundations() {
  return (
    <>
      <PageHeading
        eyebrow="FOUNDATIONS"
        title="조용하지만, 선명하게."
        description="장식보다 내용이 먼저. 같은 판단을 반복하지 않도록 작은 기준을 공유합니다."
      />
      <section className="doc-section">
        <h2>Color</h2>
        <p>
          넓은 면은 중성색, 강조색은 치즈골드 하나. 오류·성공은 색에만 의존하지
          않고 문구와 아이콘으로 구분합니다. 포커스도 같은 골드를 사용합니다.
        </p>
        <div className="swatches">
          {[
            ["Space Black", "#111111", "텍스트 · 기본 행동"],
            ["Lunar White", "#FFFFFF", "화면 · 카드"],
            ["Moon Gray", "#F4F4F0", "배경"],
            ["Cheese Gold", "#FFC928", "브랜드 · 강조 행동"],
          ].map(([name, color, role]) => (
            <div key={name}>
              <div className="swatch" style={{ background: color }} />
              <strong>{name}</strong>
              <code>{color}</code>
              <p>{role}</p>
            </div>
          ))}
        </div>
        <p className="cheese-help">
          CHEESE의 자체 팔레트입니다. STARSHIP 공식 CI 색상을 의미하지 않습니다.
        </p>
      </section>
      <section className="doc-section">
        <h2>Surfaces & boundaries</h2>
        <p>
          모든 요소를 선으로 감싸지 않습니다. 내용은 여백으로, 영역은 바탕으로,
          떠 있는 창은 그림자로 구분합니다. 입력창은 흰색 바탕과 은은한 1px
          테두리로 입력 위치를 알립니다. 하단선이나 그림자는 겹치지 않습니다. 이
          기준은 React와 Vue 공통 CSS에 들어 있습니다.
        </p>
        <Table
          caption="경계와 깊이의 역할"
          headers={["역할", "표현", "사용처"]}
          rows={[
            ["구분선", "옅은 separator · 넉넉한 간격", "표 · 목록 · 섹션"],
            [
              "입력",
              "흰색 · 은은한 1px 경계 · 그림자 없음",
              "Input · Select · Tags",
            ],
            ["콘텐츠 면", "흰 바탕 · 낮은 그림자", "Card · Calendar"],
            ["떠 있는 면", "깊이에 따른 그림자", "메뉴 · 팝오버 · Dialog"],
            [
              "선택",
              "골드 · 체크/밑줄 등 형태 표시",
              "Checkbox · Calendar · Toggle",
            ],
            [
              "포커스",
              "골드 링 + 중립색 대비선",
              "키보드로 이동하는 모든 요소",
            ],
          ]}
        />
        <p>
          읽기 전용은 내용처럼, 비활성은 조작할 수 없는 면처럼 표현합니다.
          고대비 설정에서는 경계를 강화하고 시스템 강제 색상을 따릅니다. 오류는
          안내 문구와 ARIA로 설명하고 중립색 경계로 위치를 표시합니다.
        </p>
      </section>
      <section className="doc-section">
        <h2>Typography</h2>
        <div className="type-specimen">
          <span className="type-display">
            명확한 생각,
            <br />
            편안한 읽기.
          </span>
          <div>
            <Badge>Pretendard Variable</Badge>
            <p>
              한글과 영문, 숫자가 같은 리듬으로.
              <br />
              모든 컴포넌트와 포털에 동일한 폰트를 적용합니다.
            </p>
            <span className="type-alphabet">Aa 가나다 0123456789</span>
          </div>
        </div>
        <Table
          caption="기본 타이포그래피 토큰"
          headers={["역할", "크기 / 굵기", "용도"]}
          rows={[
            ["Caption", "12–13px / 400–500", "배지 · 보조 설명"],
            ["Body", "14–16px / 400", "입력 · 읽는 본문"],
            ["Action", "13–14px / 600", "버튼 · 선택된 탭"],
            ["Heading", "20px / 600", "섹션 제목"],
            ["Title", "32–48px / 700", "페이지 제목"],
          ]}
        />
        <p>
          버튼·배지·입력 등 단일 행 컨트롤은 줄 높이를 normal로 두고, 높이와
          중앙 정렬로 위치를 맞춥니다. 여러 줄 본문은 1.5, 제목은 1.25를
          기본으로 사용합니다. 줄 높이를 글자를 위아래로 옮기는 보정값으로
          사용하지 않습니다.
        </p>
      </section>
      <section className="doc-section">
        <h2>Space & shape</h2>
        <p>
          4px 단위 간격, 입력 10px·카드 16px·대화창 20px 모서리. 화면 밀도는
          콘텐츠의 관계로 결정합니다.
        </p>
        <div className="space-bars">
          {[4, 8, 12, 16, 24, 32].map((n) => (
            <div key={n}>
              <span style={{ width: n * 4 }} />
              <code>{n}px</code>
            </div>
          ))}
        </div>
      </section>
      <section className="doc-section">
        <h2>Icons & accessibility</h2>
        <p>
          Lucide 아이콘을 사용합니다. 단독 아이콘 버튼에는 aria-label을, 장식
          아이콘에는 aria-hidden을 제공합니다. 모션 감소 설정을 존중하고 키보드
          포커스를 숨기지 않습니다.
        </p>
        <div className="cheese-inline">
          <Search />
          <Plus />
          <Check />
          <Menu />
        </div>
      </section>
    </>
  );
}
function Patterns() {
  const [error, setError] = useState(""),
    [saved, setSaved] = useState(false);
  return (
    <>
      <PageHeading
        eyebrow="PRODUCT PATTERN"
        title="작은 부품에서, 하나의 업무로."
        description="실제 컴포넌트를 조합한 인사평가 설정 예제입니다. 모든 데이터는 가상입니다."
      />
      <div className="pattern-layout">
        <Card>
          <h2>평가 기본 설정</h2>
          <p className="cheese-help">
            제출 전 필수 항목과 공개 범위를 확인하세요.
          </p>
          <form
            className="cheese-stack"
            noValidate
            onSubmit={(e) => {
              e.preventDefault();
              const name = new FormData(e.currentTarget).get("name") as string;
              if (!name.trim()) {
                setError("평가 이름을 입력해 주세요.");
                setSaved(false);
                e.currentTarget
                  .querySelector<HTMLInputElement>("input[name=name]")
                  ?.focus();
                return;
              }
              setError("");
              setSaved(true);
            }}
          >
            <Field label="평가 이름" required error={error}>
              <Input
                name="name"
                placeholder="예: 2026 하반기 평가"
                onChange={() => {
                  setError("");
                  setSaved(false);
                }}
              />
            </Field>
            <div className="form-columns">
              <Select
                label="대상 조직"
                name="team"
                defaultValue="all"
                options={[
                  { value: "all", label: "전체 조직" },
                  { value: "people", label: "피플팀" },
                  { value: "tech", label: "개발팀" },
                ]}
              />
              <Field label="마감일">
                <Input name="deadline" type="date" defaultValue="2026-10-30" />
              </Field>
            </div>
            <Checkbox label="마감 3일 전 알림 발송" defaultChecked />
            <Switch label="제출 후 본인 수정 허용" />
            <div className="form-actions">
              <Button
                type="reset"
                variant="weak"
                onClick={() => {
                  setSaved(false);
                  setError("");
                }}
              >
                초기화
              </Button>
              <Button type="submit" variant="accent">
                설정 저장
              </Button>
            </div>
            {saved && (
              <Alert>
                예제 설정이 저장되었습니다. 외부로 전송되지 않습니다.
              </Alert>
            )}
          </form>
        </Card>
        <aside className="pattern-guide" aria-label="업무 화면 연결 가이드">
          <span className="eyebrow">PATTERN NOTES</span>
          <h3>실무 연결 포인트</h3>
          <ol>
            <li>직원·조직 정보는 원천 시스템에서 가져옵니다.</li>
            <li>클라이언트와 서버 양쪽에서 입력을 검증합니다.</li>
            <li>권한 확인과 변경 이력은 서버에 기록합니다.</li>
            <li>실패하더라도 사용자가 작성한 내용은 유지합니다.</li>
          </ol>
          <Badge>UI demonstration · No backend</Badge>
        </aside>
      </div>
      <section className="doc-section">
        <h2>완성된 화면에서 확인하기</h2>
        <EvaluationPreview />
      </section>
    </>
  );
}
function Readiness() {
  return (
    <>
      <PageHeading
        eyebrow="ADOPTION"
        title="도입은, 근거를 가지고."
        description="작동하는 예제와 실제 운영 검증은 다릅니다. 현재 범위와 서비스에서 해야 할 일을 구분합니다."
      />
      <div className="readiness-summary">
        <Card>
          <strong>{count}</strong>
          <span>실제 React 실행 예제</span>
        </Card>
        <Card>
          <strong>2</strong>
          <span>프레임워크 · 공통 CSS</span>
        </Card>
        <Card>
          <strong>0</strong>
          <span>실제 사내 운영 검증</span>
        </Card>
      </div>
      <section className="doc-section">
        <h2>이번 기반에서 제공하는 것</h2>
        <Table
          caption="기술 기반 및 검증 항목"
          headers={["영역", "내용"]}
          rows={[
            ["실행 예제", "문서가 빌드된 React 패키지를 직접 사용"],
            ["Vue 통합", "입력·v-model·폼·모달·트리 실사용 예제"],
            ["스타일", "단일 토큰 소스, 공통 CSS, 로컬 Pretendard"],
            ["동작 검증", "Playwright 상호작용·접근성·반응형 테스트"],
            ["브라우저", "Chromium · Firefox · WebKit 회귀 검사"],
            [
              "패키지 설치",
              "외부 폴더에서 tarball 설치 → 엄격한 타입 검사 → SSR → 제품 빌드",
            ],
            ["폼 계약", "날짜 필수값·초기화·읽기 전용·비활성·제출 데이터 검사"],
            ["배포", "검증 통과 후 빌드 결과물만 GitHub Pages 배포"],
          ]}
        />
      </section>
      <section className="doc-section">
        <h2>상용화까지 남은 일</h2>
        <p>
          예제 개수보다 실제 업무에서 필요한 계약을 먼저 완성합니다. 아래 항목은
          완료 선언이 아니라 출시 전 통과해야 할 기준입니다.
        </p>
        <div className="cheese-stack">
          <Card className="cheese-stack">
            <Badge tone="brand">우선 1 · 도입을 막는 항목</Badge>
            <h3>프레임워크와 배포 계약 고정</h3>
            <p>
              React 또는 Vue 중 첫 제품의 기준을 정하고, 그 제품에서 사용하는 폼
              API와 연동 시나리오를 검증합니다. 코드 반입·라이선스, 사설 패키지
              배포, 버전 고정과 롤백도 결정합니다.
            </p>
          </Card>
          <Card className="cheese-stack">
            <Badge>우선 2 · 실제 업무 화면</Badge>
            <h3>직원 검색부터 저장 실패까지</h3>
            <p>
              서버 검색·다중 선택·데이터 표·파일 업로드와 API 연결 지점을
              제공합니다. 실제 사내 API에 연결해 평가 작성·검토·반려·승인 화면을
              구성하고, 한글 입력·오류·중복 제출·네트워크 단절을 검증합니다.
            </p>
          </Card>
          <Card className="cheese-stack">
            <Badge>우선 3 · 회사에서 승인</Badge>
            <h3>접근성·성능·실제 연동 검증</h3>
            <p>
              스크린리더, 확대 화면, iOS·Android 실기기와 실제 데이터 규모로
              점검합니다. 인증·서버 권한·감사 로그·저장·복구는 회사 시스템에서
              연결합니다. 이 UI 저장소만으로 완료할 수 있는 항목은 아닙니다.
            </p>
          </Card>
        </div>
        <p>
          <a
            href={github + "/blob/main/docs/PRODUCTION-READINESS.md"}
            target="_blank"
            rel="noreferrer"
          >
            상용화 과제와 완료 기준 전체 보기{" "}
            <ArrowUpRight className="cheese-inline-icon" aria-hidden="true" />
          </a>
        </p>
      </section>
      <section className="doc-section">
        <h2>실제 서비스 도입 전</h2>
        <div className="checklist">
          {[
            "현업 사용자와 핵심 업무 시나리오를 검증합니다.",
            "지원 대상 브라우저와 보조 기술로 수동 접근성 테스트를 진행합니다.",
            "인증·권한·감사 로그·개인정보 처리 정책을 서버에 연결합니다.",
            "폰트·아이콘·기반 라이브러리 라이선스를 사내 정책에 맞게 검토합니다.",
            "릴리스 버전을 고정하고 변경 승인·롤백 절차를 정합니다.",
            "실제 평가 데이터와 대량 테이블의 성능·오류 시나리오를 검증합니다.",
          ].map((s) => (
            <Checkbox key={s} label={s} />
          ))}
        </div>
      </section>
      <section className="doc-section">
        <h2>카탈로그와 운영 범위</h2>
        <p>
          현재 카탈로그의 모든 항목에 실행 예제가 있습니다. 색상 선택은 브랜드
          팔레트, 시간 범위는 같은 날, 캐러셀은 수동 이동으로 범위를 명확히
          했습니다. 실제 API·대량 데이터·권한·실기기 검증까지 완료했다는 의미는
          아닙니다.
        </p>
        <div className="planned-chips">
          {entries
            .filter((e) => !implemented(e.id))
            .map((e) => (
              <a key={e.id} href={"#/components/" + e.id}>
                {e.name}
              </a>
            ))}
        </div>
      </section>
      <section className="doc-section">
        <h2>Vue 패키지 검증</h2>
        <p>
          아래 페이지는 실제 @cheese/vue 배포 패키지를 로드합니다. React 예제를
          Vue 지원 증거로 대신하지 않습니다.
        </p>
        <a className="cheese-button" href="./vue.html">
          Vue 통합 예제{" "}
          <ArrowUpRight className="cheese-inline-icon" aria-hidden="true" />
        </a>
        <details className="source-details">
          <summary>Vue 예제 소스 보기</summary>
          <CopyCode code={VueDemoSource} />
        </details>
      </section>
    </>
  );
}
function App() {
  const route = useRoute();
  const [menu, setMenu] = useState(false);
  const main = useRef<HTMLElement>(null);
  const first = useRef(true);
  const entry = entries.find((e) => route === "components/" + e.id);
  useEffect(() => {
    document.title =
      (entry?.name ||
        (
          {
            "": "Design System",
            "getting-started": "시작하기",
            components: "컴포넌트",
            foundations: "디자인 원칙",
            patterns: "업무 화면 예제",
            readiness: "도입 체크리스트",
          } as Record<string, string>
        )[route] ||
        "문서") + " — CHEESE";
    if (first.current) {
      first.current = false;
      return;
    }
    main.current?.focus();
  }, [route, entry]);
  return (
    <div className="cheese-root">
      <a
        className="skip-link"
        href="#main-content"
        onClick={(e) => {
          e.preventDefault();
          main.current?.focus();
        }}
      >
        본문으로 건너뛰기
      </a>
      <header className="site-header">
        <a className="brand" href="#/" aria-label="CHEESE 홈">
          <Logo />
          <strong>CHEESE</strong>
          <span>Design System</span>
        </a>
        <div className="header-actions">
          <a className="header-link" href="#/getting-started">
            Documentation
          </a>
          <a
            className="header-link"
            href={github}
            target="_blank"
            rel="noreferrer"
          >
            GitHub{" "}
            <ArrowUpRight className="cheese-inline-icon" aria-hidden="true" />
          </a>
          <div className="mobile-menu">
            <DialogRoot open={menu} onOpenChange={setMenu}>
              <DialogTrigger asChild>
                <Button variant="ghost" aria-label="메뉴 열기">
                  <Menu aria-hidden="true" />
                </Button>
              </DialogTrigger>
              <DialogContent placement="right">
                <DialogTitle>문서 탐색</DialogTitle>
                <DialogDescription>
                  컴포넌트와 가이드를 찾아보세요.
                </DialogDescription>
                <DialogClose asChild>
                  <Button variant="weak" size="sm">
                    메뉴 닫기
                  </Button>
                </DialogClose>
                <Sidebar route={route} onNavigate={() => setMenu(false)} />
              </DialogContent>
            </DialogRoot>
          </div>
        </div>
      </header>
      <aside className="site-sidebar" aria-label="문서 사이드바">
        <Sidebar route={route} />
      </aside>
      <main
        ref={main}
        id="main-content"
        tabIndex={-1}
        className={"site-main " + (!route ? "is-home" : "")}
      >
        <div className="content-shell">
          {entry ? (
            <ComponentPage entry={entry} key={entry.id} />
          ) : route === "" ? (
            <Home />
          ) : route === "components" ? (
            <Catalog />
          ) : route === "getting-started" ? (
            <GettingStarted />
          ) : route === "foundations" ? (
            <Foundations />
          ) : route === "patterns" ? (
            <Patterns />
          ) : route === "readiness" ? (
            <Readiness />
          ) : (
            <>
              <PageHeading
                eyebrow="404"
                title="문서를 찾을 수 없습니다."
                description="주소를 확인하거나 전체 컴포넌트에서 다시 찾아보세요."
              />
              <a className="cheese-button" href="#/components">
                컴포넌트 보기
              </a>
            </>
          )}
          <footer className="site-footer">
            <span>
              <Logo />
              CHEESE · Small details. Shared standards.
            </span>
            <span>Independent project. Not an official STARSHIP product.</span>
          </footer>
        </div>
      </main>
    </div>
  );
}
createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
