import { Field, Input } from "@cheese/react";
export default function Example() {
  return (
    <div className="cheese-stack">
      <Field label="이름" description="조직에 표시할 이름을 입력하세요.">
        <Input placeholder="이름 입력" autoComplete="name" />
      </Field>
      <Field label="읽기 전용">
        <Input value="경영지원" readOnly />
      </Field>
      <Field label="비활성">
        <Input placeholder="입력할 수 없습니다" disabled />
      </Field>
    </div>
  );
}
