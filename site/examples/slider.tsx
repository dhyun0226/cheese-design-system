import { useState } from "react";
import { Slider } from "@cheese/react";
export default function Example() {
  const [value, setValue] = useState([60]);
  return (
    <div className="cheese-stack">
      <p>
        목표 달성률 <strong>{value[0]}%</strong>
      </p>
      <Slider
        label="목표 달성률"
        min={0}
        max={100}
        step={5}
        value={value}
        onValueChange={setValue}
      />
    </div>
  );
}
