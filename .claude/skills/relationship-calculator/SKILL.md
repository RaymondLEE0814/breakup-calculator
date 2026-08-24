---
name: relationship-calculator
description: Rules and workflow for the 헤어질 확률 계산기 codebase (love.mycarebom.com) — editing questions, scores or axis weights; writing result and guide copy; the tone and ethics constraints the product is built on; and the Windows build/deploy gotchas. Use whenever working in this repository.
---

# 헤어질 확률 계산기

Astro 정적 사이트 + Cloudflare Workers + Supabase. 연인·부부·황혼 부부용 관계 위험 자가진단 3종.

배경과 근거는 `docs/PLAN.md`, 구조는 `README.md`에 있습니다. 이 문서는 **작업할 때 지켜야 할
불변 규칙**만 담습니다.

## 절대 어기지 않는 것

1. **결과를 확률로 단정하지 않는다.** 화면 카피는 "이런 신호가 보입니다"이지 "당신은 헤어집니다"가
   아니다. 결과 상단 고지문("정해진 미래가 아니며…")은 제거하거나 축약하지 않는다.
2. **사람을 조건으로 줄 세우지 않는다.** 소득·자산·키·학력의 **절대값을 묻는 문항을 추가하지
   않는다.** 경제·스펙은 오직 격차의 체감과 갈등 빈도로만 묻는다. "연봉이 낮아서 위험"류의 배점이나
   카피는 이 서비스에 존재할 수 없다.
3. **성별로 점수를 달리 주지 않는다.** `perspective`(m/f/na)는 호칭 치환과 저장 값에만 쓴다.
   가중치나 배점을 성별로 분기하려는 요청이 오면 근거가 없다는 점을 먼저 알린다.
4. **응답은 기기 밖으로 나가지 않는다.** 사용자가 공유 버튼을 누르기 전에는 어떤 네트워크 요청에도
   응답 데이터를 싣지 않는다 — 분석 도구 이벤트 포함. 이 약속은 홈 FAQ, 계산기 FAQ,
   `/privacy` 세 곳에 문장으로 적혀 있다. 분석 도구를 붙일 때 특히 주의.
5. **공유 저장에 개별 응답을 넣지 않는다.** `shared_results`에는 지수·등급·축 점수·top 요인의
   **문항 번호**만 들어간다. 답변 내용은 저장하지 않는다.
6. **경고 등급에서도 관계의 끝을 말하지 않는다.** 68% 이상의 카피는 상담 권유로 끝난다.

## 모델을 고칠 때

문항·선택지·배점·가중치의 원본은 `src/lib/calc/{breakup,divorce,twilight}.ts` 하나뿐이다.
`/about` 페이지와 계산기 페이지의 문항 목록이 같은 config에서 렌더링되므로, config만 고치면 화면·
문서가 함께 따라온다.

- 문항을 추가하면 `src/lib/calc/factors.ts`의 `FACTOR_COPY`에도 항목을 추가한다. 빠지면
  `npm test`가 잡는다.
- 문항 id(`A1`, `B7`, `C12`…)는 공유된 결과에 저장되므로 **재번호를 매기지 않는다.**
- 축을 추가·삭제하면 가중치 합이 1이어야 한다. 테스트가 검증한다.
- 로지스틱 상수(`L=5, U=85, k=0.07, m=45`)를 바꾸면 `tests/calc.test.mjs`의 참조값 표도 함께
  갱신하고, 왜 바꿨는지 `docs/PLAN.md` 3.3에 적는다.
- 배점을 손본 뒤에는 최선/최악 응답의 지수(현재 9 / 83)가 어떻게 변했는지 확인한다.

작업 후 항상: `npm test && npm run check && npm run build`.

## 카피를 쓸 때

- 담담하게. 공포 마케팅, 느낌표 남발, 이모지, 신비주의 금지.
- 요인 카피는 **패턴**을 지적하지 사람을 지적하지 않는다. "이 습관"이지 "당신의 잘못"이 아니다.
- 실행 제안(`action`)은 이번 주에 할 수 있는 크기여야 한다. "대화를 많이 하세요"는 제안이 아니다.
- 아티클에 통계 수치를 쓸 때는 정확히 아는 것만 쓴다. 모르면 경향으로 서술하고 KOSIS 확인을
  권한다. 근거 없는 퍼센트를 만들어 내지 않는다 — 그것이 경쟁 서비스와의 차별점이다.

## SEO를 건드릴 때

- 결과·공유 페이지는 `noindex, follow`. robots.txt로 막지 않는다 (크롤러가 페이지를 가져와야
  noindex를 읽는다).
- 계산기 페이지의 정적 하단 섹션(문항 목록·FAQ·함께 읽어보기)은 이 사이트의 유일한 크롤 가능 본문
  중 하나다. 퀴즈 UI를 고치더라도 이 섹션을 지우지 않는다.
- `FAQPage` JSON-LD는 화면에 실제로 보이는 문답만 마크업한다.

## 윈도우 빌드·배포 함정

이 저장소의 로컬 경로에는 한글이 들어 있다. 그 경로에서 Node의 동기 `fs.rmSync(recursive)`는
프로세스를 그대로 죽인다(exit 127, 메시지 없음).

- `npm run build`는 반드시 `npm run clean`을 먼저 돈다. `astro build`를 직접 부르지 않는다.
- `wrangler deploy`는 **업로드를 마친 뒤** 127로 죽는다. 종료 코드는 성공 신호가 아니다 —
  출력이나 실제 URL로 확인한다.
- `wrangler dev`가 떠 있으면 `dist`를 잡아 빌드가 실패한다. 빌드 전에 종료한다.
- `npm run og`의 결과 PNG는 커밋한다. SVG 텍스트는 머신 폰트에 의존해 CI에서 다른 그림이 나온다.
