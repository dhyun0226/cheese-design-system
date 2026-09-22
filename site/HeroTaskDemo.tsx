import { useEffect, useId, useRef, useState } from "react";
import { Avatar, Badge, Button, Field, Input, Select } from "@cheese/react";
import { ArrowRight, Check, Plus, RotateCcw } from "lucide-react";

const people = [
  { value: "kim", label: "김치즈", team: "피플팀" },
  { value: "lee", label: "이서준", team: "개발팀" },
  { value: "park", label: "박하린", team: "디자인팀" },
];
const initialTitle = "신규 입사자 온보딩 준비";

export default function HeroTaskDemo() {
  const id = useId();
  const [title, setTitle] = useState(initialTitle);
  const [assignee, setAssignee] = useState(people[0].value);
  const [error, setError] = useState("");
  const [task, setTask] = useState<{
    title: string;
    person: (typeof people)[number];
  } | null>(null);
  const input = useRef<HTMLInputElement>(null);
  const result = useRef<HTMLHeadingElement>(null);
  const returning = useRef(false);

  useEffect(() => {
    if (task) result.current?.focus({ preventScroll: true });
    else if (returning.current) {
      input.current?.focus({ preventScroll: true });
      returning.current = false;
    }
  }, [task]);

  return (
    <section className="hero-playground" aria-labelledby={`${id}-label`}>
      <div className="hero-playground-heading">
        <span className="eyebrow" id={`${id}-label`}>
          <span className="gold-dash" />
          MAKE IT WORK
        </span>
        <span className="hero-playground-live">
          <span className="status-dot" />
          직접 체험하기
        </span>
      </div>
      <div className="hero-task-card">
        <header className="hero-task-header">
          <span className="hero-task-symbol" aria-hidden="true">
            {task ? <Check size={20} /> : <Plus size={20} />}
          </span>
          <div>
            <span className="hero-task-overline">MY WORKSPACE</span>
            <h2>{task ? "업무 생성 완료" : "새 업무 만들기"}</h2>
          </div>
        </header>
        {task ? (
          <div className="hero-task-result">
            <div className="hero-task-created">
              <Badge tone="brand">진행 예정</Badge>
              <h3 ref={result} tabIndex={-1}>
                {task.title}
              </h3>
              <div className="hero-task-person">
                <Avatar
                  alt={task.person.label}
                  fallback={task.person.label[0]}
                />
                <div>
                  <strong>{task.person.label}</strong>
                  <span>{task.person.team} · 담당자</span>
                </div>
              </div>
            </div>
            <Button
              variant="weak"
              onClick={() => {
                returning.current = true;
                setTitle(initialTitle);
                setAssignee(people[0].value);
                setError("");
                setTask(null);
              }}
            >
              <RotateCcw size={16} aria-hidden="true" />
              다시 만들어 보기
            </Button>
          </div>
        ) : (
          <form
            className="hero-task-form"
            aria-label="새 업무 만들기"
            noValidate
            onSubmit={(event) => {
              event.preventDefault();
              if (!title.trim()) {
                setError("업무 이름을 입력해 주세요.");
                input.current?.focus();
                return;
              }
              setTask({
                title: title.trim(),
                person: people.find((person) => person.value === assignee)!,
              });
            }}
          >
            <Field label="업무 이름" required error={error}>
              <Input
                ref={input}
                name="task-title"
                value={title}
                maxLength={80}
                placeholder="어떤 일을 시작할까요?"
                autoComplete="off"
                onChange={(event) => {
                  setTitle(event.target.value);
                  setError("");
                }}
              />
            </Field>
            <Select
              label="담당자"
              name="assignee"
              value={assignee}
              onValueChange={setAssignee}
              options={people.map(({ value, label, team }) => ({
                value,
                label: `${label} · ${team}`,
              }))}
            />
            <Button type="submit" variant="accent">
              업무 만들기
              <ArrowRight size={16} aria-hidden="true" />
            </Button>
          </form>
        )}
        <div className="hero-task-footnote">
          이 화면에서만 체험하는 예제입니다.
        </div>
      </div>
      <p className="hero-playground-caption">
        작은 입력이, 하나의 업무가 되는 순간.
      </p>
    </section>
  );
}
