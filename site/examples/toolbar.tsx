import { useState } from "react";
import {
  ToolbarRoot,
  ToolbarButton,
  ToolbarToggleGroup,
  ToolbarToggleItem,
  ToolbarSeparator,
  Bold,
  Italic,
  Underline,
  Save,
} from "@cheese/react";
export default function Example() {
  const [formats, setFormats] = useState<string[]>([]),
    [saved, setSaved] = useState(false);
  return (
    <div className="cheese-stack">
      <ToolbarRoot aria-label="문서 서식">
        <ToolbarToggleGroup
          type="multiple"
          value={formats}
          onValueChange={setFormats}
          aria-label="문자 서식"
        >
          <ToolbarToggleItem value="굵게" aria-label="굵게">
            <Bold />
          </ToolbarToggleItem>
          <ToolbarToggleItem value="기울임" aria-label="기울임">
            <Italic />
          </ToolbarToggleItem>
          <ToolbarToggleItem value="밑줄" aria-label="밑줄">
            <Underline />
          </ToolbarToggleItem>
        </ToolbarToggleGroup>
        <ToolbarSeparator />
        <ToolbarButton aria-label="문서 저장" onClick={() => setSaved(true)}>
          <Save size={18} />
        </ToolbarButton>
      </ToolbarRoot>
      <p className="cheese-help" role="status">
        서식: {formats.join(", ") || "없음"}
        {saved ? " · 저장됨" : ""}
      </p>
    </div>
  );
}
