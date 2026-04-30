# AI_USAGE

## 사용한 도구/모델

- Codex coding agent / GPT 계열 모델

## 활용 목적

과제 요구사항과 OpenAPI 문서를 빠짐없이 대조하고, 구현 범위를 정리하며, 코드 구조 개선과 테스트/문서 보강을 위한 개발 보조 도구로 활용했습니다.

## 적용한 작업 범위

- `docs/requirement 1.md`, `docs/openapi 1.yaml` 요구사항 분석 보조
- React/TypeScript 화면 구성 방향 검토
- API mock 구조와 인증/refresh token 흐름 설계 보조
- `App.tsx`에 집중된 구현을 `pages`, `components`, `layout`, `auth`, `api`, `utils`로 분리하는 리팩터링 보조
- 로그인 validation, 가상 스크롤, 무한 스크롤, 삭제 확인 모달 구현 검토
- 테스트 케이스 보강 아이디어 도출
- README 제출 문서와 과제용 가정 정리 보조

## 사람이 최종 판단하고 검증한 내용

- 요구사항 충족 여부 최종 확인
- OpenAPI와 실제 mock 응답 타입 대조
- UI 동작과 라우팅 흐름 확인
- `npm run build` 실행 결과 확인
- `npm test -- --watchAll=false` 실행 결과 확인
- README와 코드 주석의 표현 검토
- 민감정보 포함 여부 확인

## 핵심 프롬프트 요약

- 과제 요구사항을 기준으로 부족한 점을 분석하도록 요청
- `App.tsx`에 집중된 구현을 역할별 파일 구조로 리팩터링하도록 요청
- OpenAPI 기준과 맞지 않는 부분을 찾아 수정하도록 요청
- `public/results` 이미지를 활용해 README를 과제 제출용 보고서 형태로 정리하도록 요청
- 프로덕션 환경과 다른 과제용 가정을 README와 코드 주석에 명시하도록 요청

## 프로덕션과 다른 과제용 가정

- 별도 API 서버 대신 함수 레벨 mock API 사용
- 실제 JWT/cookie 기반 인증 대신 localStorage 기반 mock token 사용
- `/api/refresh`는 OpenAPI의 cookie 방식 대신 저장된 refreshToken을 mock 함수 인자로 전달
- task/user/dashboard 데이터는 서버/DB가 아닌 메모리 mock 데이터 사용
- 결과 이미지는 mock API 기반 화면 캡처

## 민감정보 처리

- API 키, 개인 민감정보, 회사 내부정보는 포함하지 않았습니다.
