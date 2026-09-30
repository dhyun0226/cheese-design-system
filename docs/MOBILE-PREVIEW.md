# 모바일 확인 방법

## PC에서 빠르게 확인

1. Chrome에서 로컬 사이트의 `/#/business-patterns`를 연다.
2. `F12`로 개발자 도구를 열고 `Ctrl+Shift+M`으로 기기 툴바를 켠다.
3. Responsive에서 폭을 `390` 또는 `320`으로 설정한다. 태블릿은 `768`로 확인한다.
4. 세로·가로 화면에서 메뉴 열기, 입력, 오류 안내, 저장, 알림 창까지 직접 조작한다.

기기 모드는 근사치다. 실제 휴대폰의 소프트 키보드, 한국어 IME, 화면 읽기, 브라우저 주소창 변화까지 검증한 것으로 간주하지 않는다.
출처: [Chrome 기기 모드](https://developer.chrome.com/docs/devtools/device-mode).

## 실제 휴대폰에서 현재 로컬 수정본 확인

회사 보안정책이 허용하는 같은 Wi-Fi에서만 사용한다. 프로젝트 폴더에서:

```powershell
npm run build
npx vite preview --host 0.0.0.0 --port 4185 --strictPort
```

새 터미널에서 `ipconfig`로 현재 Wi-Fi 어댑터의 IPv4 주소를 확인한다.
휴대폰 브라우저에 `http://PC의-IPv4:4185/#/business-patterns`를 입력한다.
휴대폰의 `localhost`는 PC가 아닌 휴대폰 자신을 가리킨다.

- PC와 휴대폰이 다른 망이면 접속되지 않는다. 사내 Wi-Fi는 기기 간 통신을 막을 수 있다.
- 포트가 사용 중이면 다른 포트를 선택한다. `--strictPort`는 임의 포트 변경을 방지한다.
- 이 명령은 해당 PC의 네트워크 인터페이스에 미리보기 서버를 연다. 공유기 포트포워딩·인터넷 공개는 하지 않는다.
- 확인 후 서버 터미널에서 `Ctrl+C`로 종료한다. 방화벽 정책을 임의로 해제하지 않는다.
- 다른 기기의 저장 상태는 공유되지 않는다. 평가와 알림은 해당 브라우저 탭의 `sessionStorage` 기반 예제다.

출처: [Vite 미리보기 host·port 설정](https://vite.dev/config/preview-options).

## 배포된 버전 확인

[패턴과 템플릿](https://dhyun0226.github.io/cheese-design-system/#/business-patterns)을 휴대폰에서 열면 된다.
단, GitHub Pages에 배포가 끝난 커밋까지만 보인다. 아직 커밋·푸시하지 않은 로컬 수정은 포함되지 않는다.

## 확인할 흐름

- 문서 탐색: 메뉴 열기와 닫기, 검색, 줄바꿈과 가로 넘침.
- 기본 컴포넌트: 입력, 선택, 오류 안내, 대화창과 키보드 포커스.
- 패턴과 템플릿: 검색·필터·목록 스크롤, 저장 상태와 화면 키보드가 버튼을 가리지 않는지.
- 접근성: OS 글자 확대, 세로/가로 전환, VoiceOver/TalkBack에서 제목·버튼·오류 안내 확인.

자동 검사에서는 주요 문서와 실행 예제의 데스크톱·태블릿·모바일 레이아웃을 확인한다.
이는 실제 iPhone/Android 기기에서의 수동 검증을 대신하지 않는다.
