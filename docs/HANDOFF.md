# CHEESE 작업 인수인계

최종 업데이트: 2026-09-22. 회사 PC → 집 PC에서 이어가기 위한 시작 문서입니다.

## 먼저 확인할 상태

- 아래 수정은 이 문서와 같은 커밋에 포함합니다. 소개 그림은 이전 전체 로고
  버전(`09b74c3`)에서 **A 모양 우주선만 보이는 버전**으로 변경했습니다.
- 로컬 검증과 원격 배포는 별개입니다. `git log -1`의 커밋에 해당하는
  [GitHub Actions 실행](https://github.com/dhyun0226/cheese-design-system/actions/workflows/pages.yml)에서
  `verify`와 `deploy`를 각각 확인하세요. 예전 커밋의 초록 체크는 새 배포의 증거가 아닙니다.
- 로컬 `artifacts/`, `test-results/`, `node_modules/`는 Git에 포함하지 않습니다.
  집 PC에는 자동으로 옮겨지지 않으며, 검증 자료는 CI artifact로도 확인합니다.

## 이번에 요청받은 범위

1. 소개 그림에서 STARSHIP 글자는 숨기고 원본의 A 모양 우주선만 크게 표시.
   짧게 한 번 상승 후 정지, 동작 줄이기에서는 정지 화면.
2. Stepper 숫자 굵기·아이콘 선 굵기를 공통 스타일에 맞춤.
3. Toast 본문과 닫기 버튼 배치, 여러 알림 간격, 긴 문장·모바일 화면 보강.
4. Pin OTP Input을 숫자별 6칸으로 표시하되 실제 입력은 하나로 유지.
   붙여넣기·선택·키보드·폼 제출·초기화·접근성 보존.
5. 전수 점검에서 발견한 검색 선택 필드의 첫 필수값 오류 포커스 보정.
6. 전체 카탈로그와 테스트를 확인하고 커밋·푸시.

**바꾸지 않을 것:** 기존 CHEESE 아이콘·파비콘, Cheese Gold 중심 팔레트,
Pretendard, 단순한 업무 UI. 달/C 모양의 새 CHEESE 아이콘 시안은 사용자가
거절했으므로 적용하지 않습니다. STARSHIP PNG 원본 파일도 변경하지 않습니다.

## 다음 작업과 우선순위

자세한 근거와 완료 기준은 [사내 시스템 점검](WORKPLACE-AUDIT-2026-09-22.md)을
읽으세요. 컴포넌트 수를 늘리는 것 자체가 목적은 아닙니다.

1. 사용할 프레임워크부터 확정. Vue라면 Stepper·Alert 등 실제 필요한 공개 API의
   지원 격차부터 메웁니다. React 예제가 있다는 사실은 Vue 지원 증거가 아닙니다.
2. 긴 평가 폼의 오류 요약과 해당 입력으로 이동하는 계약.
3. 필터 조건·페이지·정렬 복원과 DataTable 외부 상태 제어.
4. 저장 중·실패·재시도·이탈 확인을 연결한 실제 평가 폼 예제.
5. 기존 첨부파일 관리, 필요 시 조직 하위 선택을 지원하는 TreeSelect.

새 기능은 요구사항 확인 후 한 과제씩 구현합니다. 현재 작업 범위에 전부 추가하지 않습니다.

## 검증 기록

- `npm run build`, `npm run typecheck`, `npm run verify:catalog`: 통과.
- `npm run test:unit`: 21개 통과, 실패·건너뜀 없음.
- `npm run test:consumer`: React 18/19 + Vue 독립 tarball 설치·타입·SSR·번들 통과.
  이후 OTP paste 이벤트 보강은 다시 빌드·타입·단위·브라우저 검사를 수행했으며,
  최종 커밋의 독립 설치 검사는 CI의 `npm run check`가 재실행합니다.
- Toast/OTP 변경 후 69개 카탈로그 기본 렌더와 네 장의 검토 시트 확인.
  페이지·리소스 오류 없음. OTP 입력/제출/초기화·320px 화면, Stepper 완료 아이콘,
  두 개 Toast의 쌓임·개별 닫기도 직접 확인했습니다.
- 브라우저 회귀 최종 결과: 아래 점검 문서에 기록합니다.
- 전체 브라우저 회귀와 Pages 배포는 이 커밋의 GitHub Actions 결과가 기준입니다.
  `verify`가 실패하면 새 코드가 사이트에 배포되지 않습니다.

개별 테스트를 실행할 때도 먼저 `npm run build:packages`를 실행하세요.
문서와 테스트는 `packages/*/dist`를 소비하므로 소스만 수정하고 테스트하면
이전 빌드를 잘못 검사할 수 있습니다. 전체 `npm run check`는 이 순서를 포함합니다.

## 집 PC에서 재개

기존 clone이 있으면 해당 폴더에서 `git status`로 내 수정 여부를 먼저 확인하고
`git pull --ff-only`를 실행합니다. 로컬 변경을 강제로 덮어쓰거나 reset하지 마세요.
clone이 없다면 저장소를 새 폴더에 clone하세요.

```sh
git clone https://github.com/dhyun0226/cheese-design-system.git
cd cheese-design-system
npm ci
npx playwright install chromium firefox webkit
npm run check
```

브라우저 시스템 의존성이 없는 Linux 환경에서는 CI와 동일하게
`npx playwright install --with-deps chromium firefox webkit`를 사용합니다.
미리보기는 `npm run dev`입니다. 테스트는 48176/48179 포트를 사용하므로
동시에 여러 테스트 서버를 시작하지 마세요.

새 Codex에 전달할 문구:

> docs/HANDOFF.md와 docs/WORKPLACE-AUDIT-2026-09-22.md부터 읽어줘.
> 현재 git 상태와 최신 GitHub Actions 결과를 확인하고, 완료한 작업은 반복하지 마.
> 검증되지 않은 부분을 먼저 확인한 뒤 다음 우선순위 과제부터 이어가자.
> 기존 CHEESE 아이콘·파비콘과 Pretendard·Cheese Gold는 유지해줘.

진행 중인 Codex 세션·하위 에이전트·회사 PC의 로컬 서버는 집 PC로 이어지지 않습니다.
**인수인계 기준은 Git에 커밋된 코드, 이 문서, 실제 CI 결과입니다.**
