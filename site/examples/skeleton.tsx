import { Skeleton } from "@cheese/react";
export default function Example() {
  return (
    <div
      className="cheese-stack"
      role="status"
      aria-label="콘텐츠를 불러오는 중"
    >
      <Skeleton width="38%" height={24} />
      <Skeleton />
      <Skeleton width="75%" />
    </div>
  );
}
