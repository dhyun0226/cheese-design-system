# CHEESE Design System

STARSHIP 업무 시스템을 가정해 만든 독립 디자인시스템 제안입니다. STARSHIP Entertainment의 공식 디자인시스템이 아닙니다.

## Brand note

- Black / White / Neutral: 공개된 STARSHIP CI를 기준으로 구성
- Moonlight Yellow `#FFD83D`: CHEESE가 제안하는 비공식 포인트 색상
- 파란색은 브랜드색으로 사용하지 않으며 정보성 상태에만 제한적으로 사용

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
