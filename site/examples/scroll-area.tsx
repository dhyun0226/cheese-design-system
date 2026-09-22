import { ScrollArea, List } from "@cheese/react";
export default function Example() {
  return (
    <ScrollArea height={220}>
      <List>
        {Array.from({ length: 15 }, (_, i) => (
          <li key={i}>업무 기록 {String(i + 1).padStart(2, "0")}</li>
        ))}
      </List>
    </ScrollArea>
  );
}
