import { TabsRoot, TabsList, TabsTrigger, TabsContent } from "@cheese/react";
export default function Example() {
  return (
    <TabsRoot defaultValue="overview">
      <TabsList aria-label="평가 정보">
        <TabsTrigger value="overview">개요</TabsTrigger>
        <TabsTrigger value="members">대상자</TabsTrigger>
        <TabsTrigger value="history">변경 이력</TabsTrigger>
      </TabsList>
      <TabsContent value="overview">
        2026 하반기 평가가 진행 중입니다.
      </TabsContent>
      <TabsContent value="members">평가 대상자는 24명입니다.</TabsContent>
      <TabsContent value="history">
        9월 22일 · 평가가 생성되었습니다.
      </TabsContent>
    </TabsRoot>
  );
}
