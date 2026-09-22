import { Timeline } from "@cheese/react";
export default function Example() {
  return (
    <Timeline
      items={[
        { title: "평가 생성", description: "9월 22일 · 인사 담당자" },
        { title: "대상자 확정", description: "9월 23일 · 24명" },
        { title: "평가 시작", description: "10월 1일 · 알림 발송" },
      ]}
    />
  );
}
