import { Rating } from "@cheese/react";
export default function Example() {
  return (
    <div className="cheese-stack">
      <Rating label="업무 경험 만족도" defaultValue={3} />
      <Rating label="확정된 평가" defaultValue={4} disabled />
    </div>
  );
}
