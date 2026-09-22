import { useState } from "react";
import { Select, Button } from "@cheese/react";
export default function Example() {
  const [result, setResult] = useState("아직 제출하지 않았습니다.");
  return (
    <form
      className="cheese-stack"
      onSubmit={(e) => {
        e.preventDefault();
        setResult("선택한 조직: " + new FormData(e.currentTarget).get("team"));
      }}
    >
      <Select
        label="담당 조직"
        name="team"
        defaultValue="people"
        options={[
          { value: "people", label: "피플팀", description: "인사 · 조직 문화" },
          {
            value: "creative",
            label: "크리에이티브팀",
            description: "콘텐츠 · 브랜드",
          },
          { value: "tech", label: "개발팀", description: "시스템 · 플랫폼" },
          { value: "archived", label: "보관된 조직", disabled: true },
        ]}
      />
      <Select
        label="변경할 수 없는 조직"
        disabled
        defaultValue="security"
        options={[{ value: "security", label: "정보보안팀" }]}
      />
      <div className="cheese-inline">
        <Button type="submit">선택 확인</Button>
        <Button type="reset" variant="weak">
          초기화
        </Button>
      </div>
      <p className="cheese-help" role="status">
        {result}
      </p>
    </form>
  );
}
