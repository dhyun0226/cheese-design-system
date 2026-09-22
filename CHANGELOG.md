# 변경 이력

## Unreleased — 운영 도입 전 보강

### 수정

- Vue 배포 타입의 내부 제네릭 누출을 줄이고 기반 컴포넌트 타입을 명시. 소비자 검사에 필요한 누락 의존성 포함.
- React DatePicker의 비활성 제출 제외, 필수값·범위 검증, 오류 연결·포커스, 읽기 전용, uncontrolled 초기화 및 외부 form 지원.
- React의 패키지 진입점에 client boundary를 명시. 전체 Next/Nuxt 호환성을 인증하는 변경은 아님.
- CSS tarball에 Pretendard 원문 라이선스 포함.
- React/Vue ContextMenu의 Shift+F10 처리 보강. React Card ref와 Vue 스타일 래퍼의 ref 전달 수정.

### 검증/문서

- 실제 tarball을 저장소 외부에 설치해 React 18/19 + Vue 타입·SSR·제품 번들 검사.
- Chromium, Firefox, WebKit 회귀 검사와 브라우저별 스크린샷 증거 분리.
- 운영 도입의 우선순위, 책임 범위, 완료 기준을 문서 사이트와 별도 체크리스트에 명시.

### 도입 시 확인

- `DatePicker value={null}`은 제어된 빈 값이고, `value` 생략은 비제어 모드입니다.
- 제어 모드의 reset은 폼 `onReset`에서 부모 상태를 복원하세요.
- disabled 날짜는 FormData에서 제외됩니다. 기존에 제출되던 동작은 수정 대상 버그입니다.
- 브라우저 기본 검증을 사용하지 않을 경우 폼에 `noValidate`를 지정하고 `error`를 직접 전달하세요. 서버 검증은 별도로 필요합니다.
- 전체 지원/호환성 확대가 완료되기 전까지 0.x 도입 범위를 제한하고, 정확한 버전 또는 커밋을 고정하세요.

## 0.2.0 — 패키지 기반 문서

- 문서 사이트를 실제 패키지 기반으로 전환. React 47개 실행 예제와 Vue 통합 페이지, 토큰·CSS 단일화, Calendar와 Tree, 접근성 검사, 빌드 결과만 Pages 배포.
