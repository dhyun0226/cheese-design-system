# 그룹웨어 구성요소 구현·검증 기록

기준일: 2026-09-29. 이 기록은 이번 변경의 검증 범위를 설명하며 회사 시스템의
운영 승인이나 전체 제품의 무결함을 선언하지 않습니다.

## 구현 범위

- 기존 7개 업무 패턴 페이지와 8개 공개 구성요소를 유지하고 22개 구성요소를 추가했습니다.
- React/Vue 공개 패키지에 동일한 이름을 제공하며 공유 CSS와 토큰을 사용합니다.
- 문서의 업무 패턴은 총 29개 페이지, 공개 구성요소는 30개입니다. 기존 기초 카탈로그 72개와 구분합니다.
- 인사평가의 작성·검토, 직원 관리·지원자 관리 화면을 공통 화면 골격·폼으로 전환했습니다.
- 관리 예제의 알림과 첨부 미리보기도 공개 구성요소를 사용합니다.
- API·권한 판정·영속 저장은 제품에서 연결합니다. CSV/XLSX 파서나 실제 서버를 제공하는 작업은 아닙니다.

전체 목록과 연결 계약은 [GROUPWARE-FOUNDATION.md](GROUPWARE-FOUNDATION.md)를 참고합니다.

## 실행 검증

| 항목                                       | 결과                                                          |
| ------------------------------------------ | ------------------------------------------------------------- |
| 패키지·문서 production build 및 notices    | 통과                                                          |
| React/Vue 패키지 및 사이트 TypeScript 검사 | 통과                                                          |
| 카탈로그 import 계약                       | 72/72                                                         |
| 단위·SSR·공개 export 계약                  | 30/30                                                         |
| 독립 tarball 소비자                        | React 18·19 + Vue 3.5.43 타입·SSR·production bundle 통과      |
| 관련 브라우저 검사                         | 339개 중 335개 통과, 발견한 4개 수정 후 관련 42개 재검사 통과 |
| 코드 공백 검사                             | 통과                                                          |

브라우저 검사는 다음 6개 스위트를 선택해 실행했습니다. 저장소의 모든 테스트를
실행한 결과가 아니라 이번 변경과 직접 관련된 회귀 검사입니다.

```sh
npx playwright test tests/groupware-foundation.spec.ts tests/groupware-foundation-edges.spec.ts tests/groupware-patterns.spec.ts tests/groupware-products.spec.ts tests/evaluation-product-demo.spec.ts tests/docs-site.spec.ts
```

- 신규 구성요소 일반 시나리오: React/Vue 합계 54개.
- 비동기·설정 변경·폼 잠금 경계: React/Vue 합계 20개.
- 기존 패턴·제품·인사평가·문서 회귀: 39개.
- 각 브라우저에서 총 113개를 실행합니다.
- 신규 22종의 문서 진입·320px 수평 넘침, 키보드 조작, 팝업 닫기 및 포커스 복원을 포함합니다.
- 자동 접근성은 대표 폼·권한·댓글·열린 조직 선택과 기존 제품·패턴 화면을 대상으로 검사했습니다.

첫 전체 실행은 Chromium 113개·Firefox 113개·WebKit 109개가 통과했습니다.
WebKit의 미리보기 포커스 복원 2개는 실행 버튼을 명시하는 API와 사용 예제로 수정했고,
처리 중 상태 검사 2개는 짧은 타이머에 의존하지 않도록 테스트 시계를 제어했습니다.
검증 조건을 제거하지 않았으며 수정 후 아래 관련 42개가 3개 브라우저에서 모두 통과했습니다.

```sh
npx playwright test tests/groupware-foundation.spec.ts tests/groupware-foundation-edges.spec.ts --grep 'preview|gallery|dialogs|correcting failed media|form template preserves|pending reply'
```

독립 설치 결과는 `artifacts/packages/consumer-verification.json`에 기록합니다.
브라우저 HTML 보고서는 `playwright-report/`, 실패 시 trace는 `test-results/`에 생성합니다.
이 디렉터리들은 실행 산출물이며 버전 관리하지 않습니다.

## 검증 중 수정한 결함

- 가져오기 등록 요청 후 설정 변경이 처리 결과를 지우지 않도록 보완했습니다. 불확실한 결과는
  서버 처리 내역을 확인하기 전 재등록하지 못하게 하고, 성공한 행을 실패 행 재시도에서 제외합니다.
- 저장된 보기 삭제가 늦게 끝나도 새로 선택한 보기를 지우지 않도록 수정했습니다.
- 부모가 내보내기 창의 닫기를 거부해도 취소 후 버튼이 영구 잠기지 않게 했습니다.
- 답글 전송 중 수정·삭제로 작성창이 사라지지 않도록 했으며 실패한 초안을 보존합니다.
- FormPage/FormSection의 잠금을 조직·권한·정렬 컨트롤과 이미 열린 조직 팝업에도 전달합니다.
- Vue 조직 트리의 Escape 닫기와 확장 데이터를 유지하는 SortableList 타입을 수정했습니다.
- 파일 유형이 뒤늦게 정정되면 미리보기 오류 상태를 초기화합니다. 이름·설명만 바뀌면
  재생 요소를 유지합니다. 실제 브라우저별 PDF·영상 코덱 전체를 검증했다는 뜻은 아닙니다.
- Safari에서 버튼을 마우스로 실행해도 미리보기 종료 후 복귀하도록 `returnFocus`를 추가했습니다.
  첨부 갤러리는 버튼을 자동으로 연결하고, 독립 미리보기는 호출자가 실행 위치를 전달합니다.
- `data-disabled="false"`를 비활성으로 칠하던 공통 CSS를 수정했습니다.
- Vue Select 메뉴가 다이얼로그 배경 뒤에 가리지 않도록 공통 레이어 순서를 수정했습니다.

## 시각 검토 산출물

- `artifacts/foundation-overview-desktop.png`
- `artifacts/foundation-react-permissions-desktop.png`
- `artifacts/foundation-react-organization-mobile.png`
- `artifacts/foundation-react-list-mobile.png`
- `artifacts/groupware-employees-desktop.png`
- `artifacts/groupware-auditions-desktop.png`
- `artifacts/groupware-mobile.png`

PC 직원 관리·권한 편집, 모바일 조직 팝업·목록, 업무 패턴 개요를 직접 확인했습니다.

## 도입 시 남는 책임과 경고

- 인증·SSO·서버 인가, 실제 API, 감사 기록, 백업, 개인정보 보관 정책은 제품의 책임입니다.
- 자동 접근성 검사만으로 보조 기술·실사용자 검증을 대신할 수 없습니다.
- FormPage의 잠금은 네이티브 입력과 연결된 CHEESE 컨트롤에 적용됩니다.
  임의의 사용자 정의·포털 위젯에는 명시적인 disabled 연결이 필요합니다.
- React 18 SSR 소비 검사에는 기존 DataTable의 useLayoutEffect 경고가 남습니다.
  CSR 화면은 검증했지만 SSR 도입 시 hydration 동작을 별도로 확인해야 합니다.
- 전체 카탈로그를 포함한 문서/검증 번들에는 500 kB chunk 경고가 있습니다.
  이는 실패가 아니며 신규 React 문서 페이지는 별도 지연 로딩 청크로 분리했습니다.
- 이 작업에서 npm 공개 배포, Git 커밋·푸시, GitHub Pages 배포는 수행하지 않았습니다.
