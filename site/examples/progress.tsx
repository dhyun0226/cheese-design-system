import { useState } from "react";
import { Progress, Button } from "@cheese/react";
export default function Example() {
  const [value, setValue] = useState(40);
  return (
    <div className="cheese-stack">
      <p role="status">완료율 {value}%</p>
      <Progress label="평가 완료율" value={value} />
      <Button
        variant="weak"
        onClick={() => setValue((v) => (v >= 100 ? 0 : v + 20))}
      >
        진행률 변경
      </Button>
    </div>
  );
}
