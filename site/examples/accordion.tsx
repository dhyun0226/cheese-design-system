import { Accordion } from "@cheese/react";
export default function Example() {
  return (
    <Accordion
      type="single"
      collapsible
      items={[
        {
          value: "deadline",
          title: "평가 마감일은 언제인가요?",
          content: "10월 30일 오후 6시까지 제출해 주세요.",
        },
        {
          value: "edit",
          title: "제출한 평가를 수정할 수 있나요?",
          content: "마감 전에는 인사 담당자에게 반려를 요청할 수 있습니다.",
        },
      ]}
    />
  );
}
