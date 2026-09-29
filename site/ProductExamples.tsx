import { ArrowRight, CalendarDays } from "lucide-react";
import {
  Badge,
  Card,
  PageHeader,
  SectionHeader,
  StatCard,
  StatGroup,
} from "@cheese/react";
import GroupwareShell from "./GroupwareShell";
import { useGroupwareSession } from "./groupware-session";
import "./product-examples.css";

const initialTasks = [
  {
    id: "evaluation",
    title: "2026 하반기 자기평가 작성",
    description: "임시저장한 성과 기록을 확인하고 제출을 완료해 주세요.",
    meta: "제출 마감 · 10월 13일",
    badge: "D-14",
    href: "#/examples/evaluation",
  },
  {
    id: "employees",
    title: "신규 입사자 정보 확인",
    description: "오늘 입사한 구성원의 소속·직무·계정 정보를 확인해 주세요.",
    meta: "피플운영팀 · 3명",
    badge: "처리 필요",
    href: "#/examples/employees",
  },
  {
    id: "auditions",
    title: "오디션 지원서 검토",
    description: "새로 접수된 지원서와 제출 자료 누락 건을 분류해 주세요.",
    meta: "신규 4건 · 자료 확인 2건",
    badge: "6건",
    href: "#/examples/auditions",
  },
];

export default function ProductExamples() {
  const { evaluation, notifications } = useGroupwareSession();
  const submitted = evaluation?.status === "submitted";
  const unread = notifications.filter((item) => !item.read).length;
  const tasks = initialTasks
    .filter((task) => task.id !== "evaluation" || !submitted)
    .map((task) =>
      task.id === "evaluation"
        ? {
            ...task,
            description: evaluation
              ? "임시저장한 성과 기록을 확인하고 제출을 완료해 주세요."
              : "이번 기간에 수행한 업무와 기여를 작성해 주세요.",
          }
        : task,
    );
  return (
    <GroupwareShell activeId="home">
      <main
        className="groupware-main"
        aria-label="업무 홈"
        tabIndex={-1}
        autoFocus
      >
        <PageHeader
          eyebrow="2026년 9월 29일 화요일"
          title="안녕하세요, 김치즈님."
          description="오늘 확인하거나 처리해야 할 업무를 모았습니다."
        />

        <StatGroup columns={3}>
          <StatCard
            label="내 할 일"
            value={`${tasks.length}건`}
            description="오늘 처리 권장"
          />
          <StatCard
            label="자기평가"
            value={submitted ? "제출 완료" : evaluation ? "작성 중" : "시작 전"}
            description={
              submitted ? "내 인사평가에서 제출 내용 확인" : "제출까지 14일"
            }
          />
          <StatCard
            label="확인 필요한 알림"
            value={`${unread}건`}
            description="인사·오디션"
          />
        </StatGroup>

        <div className="groupware-dashboard-grid">
          <section
            className="groupware-dashboard-section"
            aria-label="오늘 처리할 업무"
          >
            <SectionHeader
              title="오늘 처리할 업무"
              description="마감과 처리 우선순위를 기준으로 정렬했습니다."
              headingLevel={2}
            />
            <ul className="groupware-task-list">
              {tasks.map((task) => (
                <li key={task.id}>
                  <a className="groupware-task-link" href={task.href}>
                    <span className="groupware-task-copy">
                      <span className="groupware-task-meta">
                        <Badge tone="brand">{task.badge}</Badge>
                        {task.meta}
                      </span>
                      <strong>{task.title}</strong>
                      <span>{task.description}</span>
                    </span>
                    <ArrowRight aria-hidden="true" />
                  </a>
                </li>
              ))}
            </ul>
          </section>

          <section
            className="groupware-dashboard-section"
            aria-label="이번 주 일정"
          >
            <SectionHeader
              title="이번 주 일정"
              description="내 업무와 연관된 주요 일정입니다."
              headingLevel={2}
            />
            <Card>
              <dl className="groupware-schedule">
                <div>
                  <dt>오늘 14:00</dt>
                  <dd>
                    플랫폼 주간 회의
                    <span>5층 프로젝트룸 A</span>
                  </dd>
                </div>
                <div>
                  <dt>10월 1일</dt>
                  <dd>
                    신규 입사자 온보딩
                    <span>계정·권한 확인</span>
                  </dd>
                </div>
                <div>
                  <dt>10월 2일</dt>
                  <dd>
                    오디션 1차 검토 마감
                    <span>미처리 지원서 6건</span>
                  </dd>
                </div>
              </dl>
            </Card>
            <a className="text-link" href="#/examples/evaluation">
              <CalendarDays aria-hidden="true" /> 평가 일정 확인
            </a>
          </section>
        </div>
      </main>
    </GroupwareShell>
  );
}
