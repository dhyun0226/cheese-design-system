# 패턴·템플릿 재정비 — 2026-09-29

## 변경 범위

- 기본 컴포넌트 72개 실행 예제를 유지했습니다.
- 패턴·템플릿 35개 문서 항목(공개 컴포넌트 36개)을 7개 분류로 통합했습니다.
- NavigationList, UserIdentity, SectionHeader, StatCard, StatGroup,
  RecordCollection을 React/Vue 패키지에 추가했습니다.
- AppShell은 NavigationList와 기존 Dialog를 조합하며, 좁은 화면에서
  메뉴를 열고 닫을 수 있습니다. 취소된 이동은 메뉴를 유지하고 승인된
  controlled activeId 변경은 메뉴를 닫습니다.
- 직원·지원자 관리가 같은 RecordCollection을 사용하고, 인사평가를 포함한
  모든 제품 예제가 공통 사용자 표시·화면 골격·지표 컴포넌트를 사용합니다.
- 인사평가의 고정 진행률과 임의 마감일, 가상 CHEESE PEOPLE 브랜드와 업무 간
  혼합 메뉴를 제거했습니다. 예제의 상태는 실제 입력이나 가상 데이터로 계산합니다.
- 닫기·이동·초기화 시 미저장 변경을 확인하고, 브라우저 저장이 실패하면 입력을
  유지합니다. 관리 화면의 변경은 여전히 메모리 기반 예제입니다.

## 검증 명령

```sh
npm run build
npm run typecheck
npm run test:unit
npm run verify:catalog
node scripts/generate-tokens.mjs --check
npm run test:consumer

npx playwright test tests/composition.spec.ts tests/groupware-patterns.spec.ts tests/groupware-products.spec.ts tests/evaluation-product-demo.spec.ts tests/route-guard.spec.ts tests/workflow.spec.ts tests/docs-site.spec.ts
```

서버 조회 실패·재시도, 검색/페이지/선택 제어, 모바일 탐색 취소와 포커스 복귀,
부분 실패 처리, 변경 취소·저장·복원, 문서 링크와 실제 패키지 사용을 검사합니다.
이전 구성요소의 일반/비동기 경계 검사는 groupware-foundation 및
groupware-foundation-edges 테스트에서 유지합니다.

독립 설치 검사는 workspace 외부에 실제 tarball을 설치하고 React 18/19 + Vue 3의
타입 검사, SSR, 프로덕션 번들을 확인합니다. 결과는
`artifacts/packages/consumer-verification.json`에 기록됩니다.

## 실행 결과

- 패키지/사이트 빌드와 React/Vue 전체 타입 검사를 통과했습니다.
- 단위 검사 33개, 기본 카탈로그 72개 대조, 생성 토큰 일치 검사를 통과했습니다.
- 별도 설치한 React 18/19 및 Vue 3.5.43 소비 프로젝트의 타입·SSR·프로덕션
  번들 검사를 통과했습니다. 기록 시각은 `2026-09-29T04:27:15.430Z`입니다.
- Chromium의 1차 관련 회귀 검사 133개 중 130개가 통과했습니다. 남은 문서
  링크 선택자 범위와 Windows 줄바꿈 비교를 보완한 뒤 다음 실행에서 통과했습니다.
- Chromium/Firefox/WebKit 210개 검사에서는 204개가 통과했습니다. 나머지는
  갤러리 영역의 접근성 이름 불일치 3개, 미저장 상태에서 Firefox 테스트 종료 지연
  2개, 650 ms 저장 응답과 순차 잠금 검증 사이의 시간 경쟁 1개였습니다.
  갤러리 이름을 맞추고, 실제 취소 절차로 테스트를 정리하며, 저장 잠금 검사 중에만
  테스트 시계를 멈추도록 보완했습니다. 잠금·접근성 검증 조건은 유지했습니다.
- 새 패턴·템플릿 11개 시나리오는 세 브라우저에서 모두 통과했습니다. 기존 foundation
  54개와 비동기 경계 20개 시나리오는 Chromium에서 통과했습니다.
- 30개 후속 검사에서는 27개가 통과했습니다. 갤러리와 저장 잠금 검사는
  세 브라우저에서 통과했습니다. Firefox 모바일 2개는 모든 화면 검증과 취소
  동작까지 완료했지만 브라우저 컨텍스트 종료가 계속 지연됐습니다. 추가한
  미표시 방문 이력 1개는 Firefox에서 초기 이력 설정 후 Back이 실제로
  이동하지 않아 실패했습니다. 이력 설정을 페이지 로드 이후로 옮겼습니다.
- 이어진 9개 검사에서는 방문 이력 보호가 세 브라우저에서 모두 통과했고,
  총 7개가 통과했습니다. Firefox 모바일 2개의 종료 지연은 남았습니다.
  단순한 미저장 경고 문제로 단정하지 않으며, 두 화면 크기를 같은 문서/컨텍스트에서
  반복 검사하는 대신 크기별 독립 테스트로 분리했습니다. 각 화면의 목록·편집·오류
  접근성 검사와 취소 확인은 동일하게 유지합니다.
- 최종 분리 검사 12개(React/Vue × 320/390px × Chromium/Firefox/WebKit)가
  모두 통과했습니다. Firefox도 컨텍스트 종료까지 정상 완료했습니다.
  테스트 생략·재시도 증가·제한시간 연장 없이 독립된 문서/컨텍스트로 검증했습니다.

위 회귀 검사에서 발견한 실패 항목은 각각 수정 후 재검증을 통과했습니다.
전체 210개를 마지막에 한 번 더 일괄 실행한 결과는 아니며, 변경 범위별 재실행
결과를 합쳐 기록한 것입니다. 모바일 분리 전후의 검사 개수도 다릅니다.

전체 기본 컴포넌트의 모든 브라우저 조합을 이번 변경에서 다시 실행한 것은 아닙니다.
아래 후속 검사 명령과 함께 판단해야 합니다.

```sh
npx playwright test tests/groupware-products.spec.ts tests/route-guard.spec.ts tests/workflow.spec.ts --grep "gallery opens|native Back|direct hash|ordinary route|initial native|preexisting history|list, edit and errors|filtered second-page edits" --workers=2
npx playwright test tests/route-guard.spec.ts tests/workflow.spec.ts --grep "preexisting history|list, edit and errors" --workers=2
npx playwright test tests/workflow.spec.ts --grep "list, edit and errors" --workers=2
```

## 시각 검토

- `artifacts/composition-catalog-desktop.png`: 통합 카탈로그와 내부 조합 링크.
- `artifacts/composition-record-desktop.png`: 실행 가능한 목록 조합과 API 계약.
- `artifacts/composition-employees-desktop.png`: 공통 컴포넌트를 사용한 직원 화면.
- `artifacts/composition-employees-mobile.png`: 좁은 화면과 표의 영역 내 스크롤.
- `artifacts/composition-navigation-mobile.png`: 모바일 메뉴.
- `artifacts/composition-examples-desktop.png`: 실제 컴포넌트로 만든 세 미리보기.
- `artifacts/composition-vue-desktop.png`: 공개 Vue 패키지 사용 예제.

산출물은 로컬 검증 자료이며 공개 사이트에는 포함하지 않습니다.

## 남는 경계

- 사내 인증·인가, 실제 저장 API·동시 수정 충돌·감사 이력은 구현된 것으로 간주하지 않습니다.
- 미저장 이동 보호는 예제 애플리케이션의 책임입니다. 라이브러리가 임의로 호스트
  라우터를 가로채지 않습니다.
- 문서 라우터가 기록한 방문 이력은 이동 취소 시 실제 위치를 복원합니다. 기존
  라우터 이전의 미표시 이력이나 직접 해시 변경처럼 방향을 알 수 없는 항목에서는
  입력·현재 주소를 유지하지만 이전 이력 위치의 완전한 복원은 보장하지 않습니다.
- React 18 SSR에서 기존 DataTable의 useLayoutEffect 경고가 남습니다. SSR 검사
  통과가 모든 SSR/hydration 사용 형태를 검증했다는 의미는 아닙니다.
- 전체 문서/전체 컴포넌트 소비 번들에는 500 kB 청크 경고가 남습니다.
- 실제 보조기술과 회사 사용자에 의한 사용성 검증은 별도로 필요합니다.
- 이 변경만으로 모든 종류의 그룹웨어 업무나 회사별 정책을 지원한다고 주장하지 않습니다.

설계 기준과 도입 연결 지점은 [COMPOSITION-MODEL.md](COMPOSITION-MODEL.md)를 참고하세요.
