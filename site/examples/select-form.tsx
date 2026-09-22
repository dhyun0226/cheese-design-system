import { Button, Select } from "@cheese/react";
import { useState } from "react";
export default function Example() {
  const [result, setResult] = useState("아직 제출하지 않았습니다.");
  return (
    <form
      className="cheese-stack"
      onReset={() => setResult("아직 제출하지 않았습니다.")}
      onSubmit={(event) => {
        event.preventDefault();
        setResult("제출 값: " + new FormData(event.currentTarget).get("team"));
      }}
    >
      <Select
        label="담당 조직"
        name="team"
        required
        placeholder="조직을 선택하세요"
        options={[
          { value: "people", label: "피플팀" },
          { value: "creative", label: "크리에이티브팀" },
          { value: "tech", label: "개발팀" },
        ]}
      />
      <div className="cheese-inline">
        <Button type="submit">조직 확인</Button>
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
