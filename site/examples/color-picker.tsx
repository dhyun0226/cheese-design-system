import { ColorPicker } from "@cheese/react";
export default function Example() {
  return (
    <div className="cheese-stack">
      <ColorPicker label="브랜드 색상" />
      <p className="cheese-help">
        CHEESE의 골드와 중립색만 사용합니다. 선택 결과는 이름과 HEX 값으로도
        확인할 수 있습니다.
      </p>
    </div>
  );
}
