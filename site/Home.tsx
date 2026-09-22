import { useState } from "react";
import {
  Avatar,
  Badge,
  Button,
  ChevronRight,
  Combobox,
  DateField,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogRoot,
  DialogTitle,
  DialogTrigger,
  Field,
  Input,
  Progress,
} from "@cheese/react";
import { ArrowUpRight } from "lucide-react";
import Logo from "./Logo";
import OriginIllustration from "./OriginIllustration";

export function EvaluationPreview() {
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

export default function Home({ exampleCount }: { exampleCount: number }) {
  return (
    <>
      <section className="home-hero" aria-labelledby="home-title">
        <div className="hero-copy">
          <div className="eyebrow">
            <span className="gold-dash" />
            CHEESE DESIGN SYSTEM
          </div>
          <h1 id="home-title">
            작은 발견에서,
            <br />
            같은 기준으로.
          </h1>
          <p>
            React와 Vue로 만드는 업무 화면의 공통 기준.
            <br />
            토큰과 컴포넌트를 재사용하고, 사용 가이드로 연결하세요.
          </p>
          <div className="hero-actions">
            <a className="cheese-button" href="#/getting-started">
              시작하기
              <ChevronRight aria-hidden="true" />
            </a>
            <a className="text-link" href="#/components">
              컴포넌트 둘러보기
              <ArrowUpRight className="cheese-inline-icon" aria-hidden="true" />
            </a>
          </div>
        </div>
        <OriginIllustration />
      </section>
      <dl className="home-scope" aria-label="제공 범위">
        <div>
          <dt>{exampleCount}개</dt>
          <dd>React 실행 예제</dd>
        </div>
        <div>
          <dt>React · Vue</dt>
          <dd>프레임워크별 사용 가이드</dd>
        </div>
        <div>
          <dt>공통 토큰</dt>
          <dd>색상 · 서체 · 간격</dd>
        </div>
      </dl>
      <section className="home-showcase" aria-labelledby="showcase-title">
        <div className="showcase-copy">
          <span className="eyebrow">PUT IT TOGETHER</span>
          <h2 id="showcase-title">
            부품을 연결하면,
            <br />
            업무가 보입니다.
          </h2>
          <p>
            입력, 진행 상태, 확인 대화창을 조합한 평가 화면입니다. 직접 눌러
            보고, 화면을 이루는 컴포넌트를 살펴보세요.
          </p>
          <a className="text-link" href="#/patterns">
            업무 화면 예제 보기
            <ArrowUpRight className="cheese-inline-icon" aria-hidden="true" />
          </a>
        </div>
        <EvaluationPreview />
      </section>
      <section className="home-section" aria-labelledby="home-components-title">
        <div className="section-heading">
          <div>
            <span className="eyebrow">COMPONENTS</span>
            <h2 id="home-components-title">필요한 것부터, 하나씩.</h2>
          </div>
          <a className="text-link" href="#/components">
            전체 보기
            <ArrowUpRight className="cheese-inline-icon" aria-hidden="true" />
          </a>
        </div>
        <div className="explore-grid">
          {[
            {
              id: "button",
              title: "Button",
              description: "다음 행동과 중요도를 명확하게 안내합니다.",
              preview: <Button>저장하기</Button>,
            },
            {
              id: "field",
              title: "Field",
              description: "입력에 레이블, 도움말, 오류를 연결합니다.",
              preview: (
                <div className="preview-inset">
                  <Field
                    label="회사 이메일"
                    description="업무용 이메일을 입력하세요."
                  >
                    <Input placeholder="name@company.com" readOnly />
                  </Field>
                </div>
              ),
            },
            {
              id: "date-field",
              title: "Date Field",
              description: "직접 입력하거나 달력에서 날짜를 선택합니다.",
              preview: (
                <div className="preview-inset">
                  <DateField label="평가 마감일" defaultValue="2026-09-22" />
                </div>
              ),
            },
            {
              id: "combobox",
              title: "Combobox",
              description: "검색과 선택을 하나의 컨트롤로 연결합니다.",
              preview: (
                <div className="preview-inset">
                  <Combobox
                    label="담당자 검색"
                    defaultValue="kim"
                    options={[
                      { value: "kim", label: "김치즈", description: "피플팀" },
                      { value: "lee", label: "이달", description: "개발팀" },
                    ]}
                  />
                </div>
              ),
            },
          ].map(({ id, title, description, preview }) => (
            <article className="explore-card" key={id}>
              <div className="explore-number" inert aria-hidden="true">
                {preview}
              </div>
              <h3 id={"home-component-" + id}>
                <a
                  href={"#/components/" + id}
                  aria-labelledby={"home-component-" + id}
                >
                  {title}
                </a>
                <ArrowUpRight
                  className="cheese-inline-icon"
                  aria-hidden="true"
                />
              </h3>
              <p>{description}</p>
            </article>
          ))}
        </div>
      </section>
      <nav className="home-paths" aria-label="문서 시작점">
        {[
          ["foundations", "01", "디자인 원칙", "색상, 서체, 간격의 공통 기준"],
          [
            "components",
            "02",
            "컴포넌트",
            `${exampleCount}개의 React 실행 예제와 사용 가이드`,
          ],
          ["patterns", "03", "업무 화면 예제", "컴포넌트로 연결한 업무 흐름"],
        ].map(([path, number, title, description]) => (
          <a key={path} href={"#/" + path}>
            <span className="path-number">{number}</span>
            <h2>
              {title}
              <ArrowUpRight aria-hidden="true" />
            </h2>
            <p>{description}</p>
          </a>
        ))}
      </nav>
      <section className="origin-story" aria-labelledby="origin-title">
        <div>
          <span className="eyebrow">WHY CHEESE?</span>
          <h2 id="origin-title">달에서 발견한, 우리의 첫 기준.</h2>
        </div>
        <div>
          <p>
            STARSHIP의 A 모양 우주선이 달에 착륙해 문을 열고 나와 보니, 달은
            치즈로 이루어져 있었습니다. 그 첫 발견을 함께 쓰는 디자인 기준의
            이름, <strong>CHEESE</strong>로 삼았습니다.
          </p>
          <span className="origin-note">
            CHEESE는 제작자의 상상에서 시작된 개인 프로젝트이며, STARSHIP의 공식
            제품은 아닙니다.
          </span>
          <a
            className="origin-source text-link"
            href="https://www.starship-ent.com/about"
            target="_blank"
            rel="noopener noreferrer"
          >
            우주선 원본 · STARSHIP 공식 CI
            <ArrowUpRight className="cheese-inline-icon" aria-hidden="true" />
            <span className="cheese-sr-only"> (새 창)</span>
          </a>
        </div>
      </section>
      <section className="home-note">
        <div>
          <h2>도입 전, 현재 범위를 확인하세요.</h2>
          <p>
            실행 예제와 구현 상태, 서비스에서 연결할 일을 함께 정리했습니다.
          </p>
        </div>
        <a className="text-link" href="#/readiness">
          도입 체크리스트
          <ArrowUpRight className="cheese-inline-icon" aria-hidden="true" />
        </a>
      </section>
    </>
  );
}
