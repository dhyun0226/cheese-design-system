import { Carousel, Card, Badge } from "@cheese/react";
export default function Example() {
  return (
    <Carousel
      label="업무 시작 안내"
      items={[
        "목표를 정하세요",
        "진행 상황을 기록하세요",
        "피드백을 나누세요",
      ].map((title, i) => (
        <Card key={title}>
          <div className="cheese-stack">
            <Badge tone="brand">STEP {i + 1}</Badge>
            <h2>{title}</h2>
            <p className="cheese-help">
              함께 일하는 데 필요한 작은 기준을 만듭니다.
            </p>
          </div>
        </Card>
      ))}
    />
  );
}
