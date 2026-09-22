import {
  HoverCardRoot,
  HoverCardTrigger,
  HoverCardContent,
  Avatar,
  Badge,
} from "@cheese/react";
export default function Example() {
  return (
    <div className="cheese-stack">
      <HoverCardRoot openDelay={200}>
        <HoverCardTrigger asChild>
          <a href="#/components/avatar" className="cheese-navigation-link">
            김치즈 · 피플팀
          </a>
        </HoverCardTrigger>
        <HoverCardContent>
          <div className="cheese-stack">
            <div className="cheese-inline">
              <Avatar fallback="김" alt="김치즈" />
              <div>
                <strong>김치즈</strong>
                <p className="cheese-help">피플팀 · 인사평가 담당</p>
              </div>
            </div>
            <Badge tone="brand">담당자 정보</Badge>
            <p className="cheese-help">평가 일정과 제출 방법을 안내합니다.</p>
          </div>
        </HoverCardContent>
      </HoverCardRoot>
      <p className="cheese-help">
        링크에 마우스를 올리거나 키보드 포커스를 이동해 보세요. 필수 정보는
        링크를 통해서도 제공해야 합니다.
      </p>
    </div>
  );
}
