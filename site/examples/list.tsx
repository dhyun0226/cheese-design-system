import { List, Avatar } from "@cheese/react";
export default function Example() {
  return (
    <List>
      <li>
        <Avatar alt="김치즈" fallback="치즈" />
        김치즈 · 피플팀
      </li>
      <li>
        <Avatar alt="이달" fallback="달" />
        이달 · 개발팀
      </li>
      <li>
        <Avatar alt="박우주" fallback="우주" />
        박우주 · 크리에이티브팀
      </li>
    </List>
  );
}
