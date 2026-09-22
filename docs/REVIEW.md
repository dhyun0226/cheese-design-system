# CHEESE 0.2 기술 점검

기준일: 2026-09-22. 대상: cheese-design-system 저장소.
실제 회사 시스템이나 운영 인프라를 조사한 문서가 아닙니다.

## 발견한 문제와 변경

| 기존 상태                                     | 변경                                                                                                   |
| --------------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| 문서 HTML 데모와 React/Vue 패키지 구현이 분리 | 문서에서 빌드된 React 패키지 import. Vue도 별도 실제 패키지 페이지로 검증                              |
| 정적 카탈로그 개수가 구현 완료 근거로 사용됨  | 예제 import/export 계약, 타입, 브라우저 동작을 검증. 후속 확장으로 69개 카탈로그 / 69개 실행 예제 연결 |
| root CSS와 package CSS의 중복                 | package 공통 스타일로 단일화. 레이아웃 유틸도 CSS 패키지로 이동                                        |
| 라벨·오류 메시지와 입력의 연결 부족           | ID, required, aria-invalid, aria-describedby 연결                                                      |
| 트리에 다수 Tab 진입점과 부분 방향키 지원     | 단일 Tab 진입점, ↑↓←→, Home/End, 선택·펼침 분리, React/Vue 양쪽 검증                                   |
| 모달·메뉴의 실제 포커스 동작 검증 부재        | 포커스 가두기·복귀, Esc, 취소 우선 포커스, 메뉴 선택 시나리오 추가                                     |
| 캘린더가 카탈로그에만 존재                    | React Calendar·DatePicker·기간 선택, Vue Calendar 구현 및 한국어/날짜 제한 검증                        |
| 폰트 외부 CDN 의존                            | Pretendard를 로컬 asset으로 묶고 원문 라이선스 포함                                                    |
| Pages에 저장소 전체 업로드                    | npm ci/빌드/타입/테스트 통과 후 dist만 배포                                                            |
| 운영 도입 범위가 불명확                       | 설치, 마이그레이션, 라이선스, 회사 도입 체크리스트 작성                                                |

## 검증 경로

- `npm ci`: lockfile 기반 설치 및 audit
- `npm run check`: 빌드 + React/Vue 패키지/문서 타입 + 카탈로그 export + SSR 계약 + 브라우저
- `node scripts/generate-tokens.mjs --check`: JSON 토큰과 CSS 동기화
- `npm pack --workspace @cheese/react --dry-run`, Vue 동일: 배포 파일/선언 포함 확인
- 후속 보강: `npm run test:consumer`로 실제 tarball을 저장소 밖에서 설치하고 React 18/19·Vue의 엄격한 타입, SSR, 제품 번들 검사. 이 검사에서 Vue 타입 선언과 누락 의존성 문제를 발견해 수정했습니다.
- `tests/contracts.test.mjs`: SSR, 버튼 기본 type/loading, 폼 연결, 트리 구조, progress 범위, 토큰·폰트·타입
- `tests/browser.spec.ts`: 전 예제 접근성 자동검사, 기본 업무 시나리오, 모바일
- `tests/extended.spec.ts`: 달력, Vue 모델 변경, 추가 인터랙션, 모든 문서 경로
- `tests/compositions.spec.ts`: 카드 모달, 빈 상태 행동, 키보드 컨텍스트 메뉴
- 최종 실행 결과와 스크린샷은 해당 커밋의 GitHub Actions `browser-evidence` artifact 확인

## 시각 확인

데스크톱 홈, 컴포넌트 상세, 모바일 업무 폼, 모바일 모달을 실제 브라우저로 확인합니다.
긴 한글 제목이 단어 중간에서 끊기지 않도록 정리하고, 낮은 대비의 작은 문구를 수정했습니다.
사이트가 컴포넌트 모양을 별도로 복제하지 않도록 홈의 미리보기에도 실제 패키지를 사용합니다.

## 남은 범위

- 고급 입력·날짜/시간·메뉴·레이아웃과 커스텀 Select를 구현했습니다. 후속으로 서버 검색·다중 선택·Data Table·업로드도 추가했습니다. 실제 회사 API와 대규모 데이터 성능 검증은 회사 환경에서 진행해야 합니다.
- Vue의 고수준 API는 React와 동등한 전체 세트가 아닙니다. 검증된 통합 예제와 명시적 primitive 조합부터 사용합니다.
- 후속 보강으로 Chromium·Firefox·WebKit 자동검사를 추가했습니다. 보조 기술/모바일 실기기/모든 브라우저의 적합성을 보증하지 않습니다.
- 실제 데이터 규모, 권한, SSO, 저장·복구, 감사 로그와 현업 승인 흐름은 회사 환경에서 검증해야 합니다.
- 따라서 이번 버전은 **검증 가능한 UI 도입 기반**이며, 즉시 운영 가능한 완성형 인사평가시스템이 아닙니다.
- 상세 우선순위: [상용화 점검과 남은 과제](PRODUCTION-READINESS.md).
