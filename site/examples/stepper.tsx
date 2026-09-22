import { useState } from "react";
import { Stepper, Button } from "@cheese/react";
export default function Example() {
  const [step, setStep] = useState(0);
  return (
    <div className="cheese-stack">
      <Stepper
        steps={["기본 정보", "대상자 선택", "검토 및 제출"]}
        current={step}
      />
      <div className="cheese-inline">
        <Button
          variant="weak"
          disabled={step === 0}
          onClick={() => setStep(step - 1)}
        >
          이전 단계
        </Button>
        <Button disabled={step === 2} onClick={() => setStep(step + 1)}>
          다음 단계
        </Button>
      </div>
    </div>
  );
}
