# CHEESE Design System

STARSHIP의 사내 제품을 가정해 만든 개인 디자인 시스템 제안입니다. STARSHIP Entertainment의 공식 디자인 시스템이 아닙니다.

## Story

달이 치즈로 이루어졌다는 상상처럼 모든 제품은 작은 아이디어에서 시작합니다. CHEESE는 그 아이디어를 일관되고 안전하게 실제 제품으로 구현하기 위한 기반입니다.

## Color roles

- Space Black `#111111`: 기반, 텍스트, Primary Action
- Lunar White `#FFFFFF`: 화면과 카드
- Moon Gray `#F4F4F0`: 장시간 사용하는 업무 화면 배경
- Cheese Gold `#FFC928`: 로고와 작은 브랜드 서명
- Ignition Orange `#FFA200`: 출발과 중요한 행동. STARSHIP GreetingHR 채용페이지의 `brandColor`에서 착안

Gold와 Orange를 화면 전체에 사용하지 않습니다. Neutral이 대부분을 차지하고 브랜드색은 의미가 명확한 지점에만 제한합니다.

## Architecture

```text
Primitive Tokens
→ Semantic Tokens
→ CSS Components
→ Accessible Behavior
→ Business Patterns
→ Product UI
```

당근 SEED의 토큰 중심 구조, Headless 동작과 Styled Component 분리, 문서화 방식을 참고했습니다. SEED의 소스나 브랜드 스타일을 복제하지 않습니다.

## Included

- Foundations: Color, Typography, Spacing, Radius, Elevation
- Actions: Button, Icon Button, Toggle Button
- Forms: Input, Textarea, Select, Field Button
- Selection: Checkbox, Radio, Switch, Chip, Segmented Control
- Navigation: Tabs, Pagination, Breadcrumb, Accordion
- Feedback: Callout, Snackbar, Spinner, Progress, Skeleton, Result
- Overlay: Dialog, Alert Dialog, Tooltip, Menu, Side Panel
- Data Display: Badge, Avatar, Card, Table, List
- Patterns and accessibility checklist

## Local

```bash
python -m http.server 8080
```

## License

Personal portfolio prototype. STARSHIP and SEED trademarks belong to their respective owners.
