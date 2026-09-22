import { NumberField } from "@cheese/react";
export default function Example() {
  return (
    <NumberField
      label="평가 가중치"
      description="0부터 100까지, 5 단위로 입력합니다."
      min={0}
      max={100}
      step={5}
      defaultValue={30}
    />
  );
}
