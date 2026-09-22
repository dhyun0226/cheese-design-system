# 상용화 점검과 남은 과제

기준일: 2026-09-22. 대상은 **CHEESE UI 패키지와 문서 사이트**입니다.
STARSHIP의 실제 인프라·인사 데이터·보안 정책을 검증한 결과가 아닙니다.

## 판단

현재는 실제 애플리케이션에 통합해 검증할 수 있는 UI 기반입니다. 회사 운영 투입 승인이나 완성형 인사평가시스템은 아닙니다.
React 실행 예제는 47개이고, 카탈로그 64개 중 17개는 설계 중입니다. 예제에는 별도 export가 아닌 조합 패턴도 포함됩니다.
컴포넌트 개수를 늘리는 것과 운영에서 안전하게 사용하는 것은 서로 다른 완료 기준입니다.

## 이번에 보강한 출시 검증

| 영역 | 보강 내용 | 재현 방법 |
| --- | --- | --- |
| 실제 설치 | 저장소 밖 임시 폴더에 4개 tarball 설치. workspace 링크 없이 검사 | `npm run test:consumer` |
| 소비자 호환성 | React 18/19, Vue 3.5 소비자의 엄격한 타입 검사, SSR, Vite 제품 번들 | `tests/consumer/`, `artifacts/packages/consumer-verification.json` |
| Vue 타입 | 추론된 거대 내부 타입 대신 기반 컴포넌트 타입을 명시하고 누락된 타입 의존성 포함 | `packages/vue/src/styled.ts` |
| React 경계 | 빌드된 진입점의 `use client` 유지 | `tests/contracts.test.mjs` — Next.js 전체 앱 인증을 의미하지 않음 |
| 날짜 폼 | required, disabled/readOnly, 기본값 복원, 취소된 reset, 외부 form, 제어값과 ref | `tests/forms.spec.ts` |
| 브라우저 | 동일한 예제·상호작용·접근성 검사를 Chromium / Firefox / WebKit에서 실행 | `npm test` |
| 테스트 대상 | HMR 개발 서버가 아닌 제품 빌드 검사. 테스트 전용 화면은 공개 dist에서 제외 | `vite.test.config.ts` |
| 배포 | 위 검증을 통과한 빌드만 Pages에 배포. 실패 증거도 artifact 보존 | `.github/workflows/pages.yml` |
| 폰트 | 사이트뿐 아니라 CSS tarball에도 Pretendard OFL 원문 포함 | 계약 검사 + 패키지 파일 검사 |

실행 결과는 해당 커밋의 CI를 기준으로 확인합니다. 테스트 설정의 존재만으로 통과를 주장하지 않습니다.
WebKit 자동화는 실제 iPhone/Safari, Chromium은 모든 Edge 환경의 검증을 대체하지 않습니다.

## P0 — 첫 제품 착수/운영 전에 결정할 계약

| 과제 | 왜 필요한가 | 완료 기준 | 책임 범위 |
| --- | --- | --- | --- |
| 기준 프레임워크 | React와 Vue의 고수준 API·검증 범위가 다름 | 첫 제품이 사용하는 컴포넌트 목록과 프레임워크 확정. Vue면 해당 API와 동일 시나리오 구현 | UI 개발 |
| 폼 API 일관성 | 저장 데이터·오류 포커스·초기화가 컴포넌트마다 달라질 수 있음 | 사용하는 모든 입력에서 controlled/uncontrolled 또는 v-model, disabled/readOnly, reset, form 연동, 한국어 IME 검증 | UI 개발 |
| 배포·권리 | 공개 GitHub는 사용권 부여·회사 반입 승인·npm 배포가 아님 | 코드/브랜드/의존성 라이선스 및 반입 정책 승인, 패키지 배포 위치·이름·담당자 확정 | 본인 + 회사 |
| 릴리스 계약 | 0.x 변경으로 운영 화면이 깨질 수 있음 | 패키지 버전 고정, 변경 이력, 호환성 정책, 검증 후 승격, 이전 버전 복원 절차 시연 | UI 개발 + 운영 |

## P1 — 인사평가 Reference Application

| 과제 | 최소 완료 기준 |
| --- | --- |
| Combobox / 다중 선택 | 직원·조직 검색, 한글 IME, 키보드, 서버 검색 취소/중복 응답, loading/empty/error/disabled |
| Data Table | 행 선택, 정렬, 서버 페이지 이동, 로딩·실패·빈 상태. 실데이터 규모를 확인한 후 필요할 때 가상화 |
| File Upload | 파일 선택·삭제·진행·재시도·실패 UI. 크기/형식/권한은 반드시 서버에서도 검증 |
| 업무 폼 패턴 | 평가 생성 → 대상자 선정 → 작성 → 제출 → 반려/승인. 이탈 경고·중복 저장 방지·저장 실패 복구 |
| 접근성 수동 검증 | 키보드 전 과정, NVDA/VoiceOver, 확대 200%, 고대비·동작 감소, 한글 긴 문구와 오류 안내 |
| 시각적 회귀 | 핵심 컴포넌트의 상태별 기준 이미지와 검토 절차. 현재 스크린샷은 검토 증거이지 픽셀 회귀 기준이 아님 |
| 번들·성능 예산 | 최소 소비자/주요 화면의 전송 크기와 상호작용 시간을 측정하고, 합의한 예산 초과를 CI에서 차단 |
| SSR/hydration | 실제 채택 프레임워크(예: Next/Nuxt)가 정해지면 초기 렌더·hydration·포털·라우팅 검증 추가 |

회사에서 React만 쓴다면 Vue 전 컴포넌트 동등화를 첫 출시의 필수조건으로 삼을 필요는 없습니다. 반대로 Vue가 기준이면 동등화가 P0입니다.

## P2 — 카탈로그 확장 (현재 미구현 17개)

- 입력 7: Pin / OTP Input, Tags Input, Combobox, Listbox, Editable, Color Picker, Rating
- 날짜/시간 4: Date Range Field, Time Range Field, Month Picker, Year Picker
- 내비게이션 3: Navigation Menu, Menubar, Toolbar
- 오버레이 1: Hover Card
- 데이터/레이아웃 2: Splitter, Carousel

해당 기능이 첫 제품 요구사항에 포함되면 P1으로 올립니다. 기반 라이브러리에서 export된다는 이유만으로 CHEESE 지원 완료로 표시하지 않습니다.
각 항목은 **공개 타입/API → 공통 토큰 스타일 → 실행 예제/사용 안내 → 경계 상태 → 키보드·접근성·3개 브라우저 테스트**까지 있어야 완료입니다.

## 회사 환경에서만 닫을 수 있는 운영 승인

- 실제 SSO/MFA와 서버 권한 검증. 직원/조직 원천 데이터, 평가자 관계·이력·대리결재 규칙.
- 개인정보 처리/보존/삭제, 감사 이력, 공개 문서와 사내 데이터의 완전 분리.
- API 저장 트랜잭션, 중복 제출 방지, 장애 시 복구와 작성 내용 보존.
- 배포 승인, 모니터링·알림, 백업 복원, 운영 책임자·장애 연락·인수인계.
- 대표 사용자와 실제 평가 주기 시나리오 검증 및 승인.

이 항목을 UI 패키지의 인증 마크나 완료 체크로 대신하지 않습니다.

## 권장 진행 순서

1. 첫 제품의 프레임워크·핵심 화면·데이터 규모를 정한다.
2. 필요한 입력·표·첨부 컴포넌트를 먼저 완성하고 평가 작성 화면에 실제로 적용한다.
3. 오류·저장·권한 시나리오와 수동 접근성을 검증한다.
4. 버전 고정·패키지 전달·업데이트·롤백을 다른 환경에서 재현한다.
5. 회사 API 연동 후 현업 검증을 통과한 범위부터 제한적으로 운영한다.

## 참고

- [Playwright 다중 브라우저 프로젝트](https://playwright.dev/docs/test-projects)
- [React client boundary](https://react.dev/reference/rsc/use-client)
- [npm tarball 패키징](https://docs.npmjs.com/cli/v11/commands/npm-pack/)
- [사내 도입 승인 체크리스트](ADOPTION.md)
