import { useState } from "react";
import { TagsInput } from "@cheese/react";
export default function Example() {
  const [tags, setTags] = useState(["인사평가", "2026"]);
  return (
    <div className="cheese-stack">
      <TagsInput
        label="프로젝트 태그"
        value={tags}
        onValueChange={setTags}
        max={5}
        name="tags"
      />
      <TagsInput label="고정 태그" defaultValue={["읽기 전용"]} disabled />
      <p className="cheese-help">현재 {tags.length}개 태그</p>
    </div>
  );
}
