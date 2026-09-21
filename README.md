# CHEESE Design System

STARSHIP의 사내 제품을 가정해 만든 개인 디자인 시스템 제안입니다. STARSHIP Entertainment의 공식 디자인 시스템이 아닙니다.

## Story

달이 치즈로 이루어졌다는 상상처럼 모든 제품은 작은 아이디어에서 시작합니다. CHEESE는 그 아이디어를 일관되고 안전하게 실제 제품으로 구현하기 위한 기반입니다.

## Color roles

- Space Black `#111111`: 기반, 텍스트, Primary Action
- Lunar White `#FFFFFF`: 화면과 카드
- Moon Gray `#F4F4F0`: 장시간 사용하는 업무 화면 배경
- Cheese Gold `#FFC928`: 로고와 작은 브랜드 서명
Cheese Gold를 화면 전체에 사용하지 않습니다. Neutral이 대부분을 차지하고 Gold는 브랜드를 기억시킬 작은 지점에만 제한합니다. Green과 Red는 성공·오류처럼 의미가 필요한 상태에만 사용합니다.

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

Vue 제품 구현에서는 Reka UI(구 Radix Vue)를 Headless Primitive 계층으로 사용합니다. Calendar, Date Picker, Dialog, Select처럼 접근성 동작이 복잡한 컴포넌트는 Reka UI가 상태·포커스·키보드·locale을 담당하고 CHEESE는 토큰, 스타일 Recipe와 업무 패턴을 담당합니다.

## Included

- Foundations: Color, Typography, Spacing, Radius, Elevation
- Actions: Button, Icon Button, Toggle Button
- Forms: Input, Textarea, Select, Field Button
- Advanced Forms: Search, Password, Number, Date, Time, Month, Range, Input Group, OTP
- Date: Calendar, Date Picker, Date Range Picker, Time Field
- Upload: Dropzone, File List, Upload Progress
- Selection: Checkbox, Radio, Switch, Chip, Segmented Control
- Navigation: Tabs, Pagination, Breadcrumb, Accordion
- Feedback: Callout, Snackbar, Spinner, Progress, Skeleton, Result
- Overlay: Dialog, Alert Dialog, Tooltip, Menu, Side Panel
- Data Display: Badge, Avatar, Card, Table, List
- Workflow & Utilities: Stepper, Banner, Empty State, Definition List, Timeline, Keyboard Hint, Divider
- Patterns and accessibility checklist

## Local

```bash
python -m http.server 8080
```

## License

Personal portfolio prototype. STARSHIP and SEED trademarks belong to their respective owners.
