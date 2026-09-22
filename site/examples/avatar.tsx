import { Avatar } from "@cheese/react";
export default function Example() {
  return (
    <div className="cheese-inline">
      <Avatar alt="김치즈" fallback="치즈" />
      <Avatar alt="이달" fallback="달" />
      <Avatar
        src="data:image/png;base64,invalid"
        alt="이미지 로딩 실패 시 대체 표시"
        fallback="CH"
      />
    </div>
  );
}
