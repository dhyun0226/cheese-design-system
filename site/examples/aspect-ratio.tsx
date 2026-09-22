import { AspectRatio } from "@cheese/react";
export default function Example() {
  return (
    <AspectRatio ratio={16 / 9}>
      <div className="ratio-demo">16 : 9 · 콘텐츠 영역</div>
    </AspectRatio>
  );
}
