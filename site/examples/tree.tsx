import { useState } from "react";
import { Tree } from "@cheese/react";
export default function Example() {
  const [selected, setSelected] = useState("없음");
  return (
    <div className="cheese-stack">
      <Tree
        label="조직 탐색"
        defaultExpanded={["company"]}
        nodes={[
          {
            id: "company",
            label: "CHEESE Studio",
            children: [
              {
                id: "people",
                label: "피플팀",
                children: [{ id: "ops", label: "인사 운영" }],
              },
              { id: "creative", label: "크리에이티브팀" },
              { id: "tech", label: "개발팀" },
            ],
          },
        ]}
        onSelect={(n) => setSelected(n.label)}
      />
      <p className="cheese-help" role="status">
        선택한 조직: {selected}
      </p>
    </div>
  );
}
