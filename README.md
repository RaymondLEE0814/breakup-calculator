# 이혼 확률 계산기

연인·부부·황혼 부부를 위한 관계 위험 자가진단. Astro 정적 사이트 + Cloudflare Workers + Supabase.

**https://love.mycarebom.com**

계산은 전부 브라우저 안에서 끝납니다. 답변은 사용자가 직접 공유 버튼을 누르기 전까지 어떤 네트워크
요청에도 실리지 않으며, 공유하더라도 개별 응답이 아니라 지수·등급·축 점수만 익명으로 저장됩니다.

---

## 구조

```
src/
  lib/calc/          계산 모델 — 여기가 원본이다
    types.ts         공통 타입
    scales.ts        공용 응답 척도(5점 리커트, 역채점) + 안전 문항
    engine.ts        순수 채점 함수, 매개·상호작용 항, 위험 하한, 유형 분류
    breakup.ts       연애 심플 7문항      breakup-deep.ts   연애 심화 33문항
    divorce.ts       부부 심플 7문항      divorce-deep.ts   부부 심화 34문항
    twilight.ts      황혼 심플 7문항      twilight-deep.ts  황혼 심화 32문항
    factors.ts       v1 결과 카피(문항 id 키) + 등급 카피
    factors-v2.ts    v2 결과 카피(구성개념 키)
  lib/site.ts        메타·JSON-LD 빌더
  lib/share.ts       Supabase 읽기/쓰기 (키가 없으면 공유 기능만 꺼진다)
  lib/shared-registry.ts  구모델 공유 링크를 계속 렌더하기 위한 라벨 레지스트리
  lib/storage.ts     sessionStorage
  lib/result-view.ts 결과 렌더 헬퍼 (본인용/공유용 공통)
  components/        Quiz, Result, 헤더/푸터 등
  pages/             라우트
  content/guide/     아티클 마크다운
worker/index.js      /r/{slug} 라우팅과 404 처리
scripts/build-og.mjs OG 이미지 생성 (수동 실행, 결과물은 커밋)
scripts/clean.mjs    빌드 전 dist 정리 — 아래 "윈도우 주의" 참조
supabase/migrations/ 스키마
docs/PLAN.md         v1 기획서 (보존)
docs/PLAN-V2.md      현행 기획서 — 여섯 계산기의 이론 근거와 계산식
```

**문항이나 배점을 바꾸려면** `src/lib/calc/*.ts`만 고치면 됩니다. `/about` 페이지, 계산기 페이지의
문항 목록, 결과 계산이 모두 같은 config에서 나오므로 화면과 문서가 어긋나지 않습니다. 문항을 새로
추가할 때는 `factors-v2.ts`에 그 문항의 `factor` 키가 있어야 합니다 — 빠지면 테스트가 잡습니다.

계산 모델은 데이터로 표현됩니다: 차원 가중치, 매개 항(`mediation`), 상호작용 항(`interactions`),
위험 하한(`flags`), 유형 분류(`types`) 전부 config 객체의 필드입니다. 엔진은 그 위를 도는 순수
함수이므로, 모델을 바꾸면서 엔진을 고칠 일은 거의 없습니다. 자세한 배경은 `docs/PLAN-V2.md`.

calc 디렉터리 안의 상대 임포트에는 `.ts` 확장자가 붙어 있습니다. `npm test`가 번들러 없이 Node로
이 파일들을 직접 불러오기 때문입니다.

## 개발

```bash
npm install
npm run dev        # http://localhost:4321
npm test           # 계산 엔진 단위 테스트
npm run check      # 타입 검사
npm run build
```

`npm run og`는 OG 이미지를 다시 만듭니다. SVG 텍스트 렌더링은 머신에 설치된 폰트에 의존하므로
결과 PNG는 저장소에 커밋합니다 — CI나 다른 사람의 노트북에서 돌리면 조용히 다른 이미지가 나옵니다.

### 윈도우 주의

이 저장소의 로컬 경로에는 한글이 들어 있습니다. 그 경로에서 Node의 동기 `fs.rmSync(recursive)`는
프로세스를 그대로 죽입니다(exit 127, 에러 메시지 없음). `astro build`와 `wrangler deploy`가 둘 다
그 호출로 디렉터리를 지우기 때문에, `npm run build`는 비동기 `fs.rm`을 쓰는 `scripts/clean.mjs`를
먼저 돌려 지울 것을 남겨두지 않습니다.

- `wrangler deploy`는 **업로드를 마친 뒤** 정리 단계에서 127로 죽습니다. 종료 코드는 성공 신호가
  아니니 출력이나 실제 URL로 확인하세요. Cloudflare의 리눅스 빌더는 영향받지 않습니다.
- `wrangler dev`가 떠 있으면 `dist`를 잡고 있어 빌드가 실패합니다. 빌드 전에 종료하세요.

## Supabase

```bash
# 대시보드 SQL 편집기에 붙여넣거나
supabase db push
```

`supabase/migrations/20260824000000_shared_results.sql` 하나면 됩니다. 그다음 `.env`에:

```
PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
PUBLIC_SUPABASE_ANON_KEY=eyJ...
```

anon 키만 씁니다(RLS로 보호되는 공개 키). service_role 키는 이 저장소에도, 클라이언트 번들에도
절대 들어가서는 안 됩니다. 키가 없으면 사이트는 그대로 동작하고 공유 버튼만 숨겨집니다.

## 배포

```bash
npx wrangler login     # 최초 1회
npm run deploy
```

`love.mycarebom.com`은 Cloudflare에서 커스텀 도메인으로 바인딩됩니다(`wrangler.jsonc`). 정적 자산은
플랫폼이 직접 서빙하고, Worker는 파일이 없는 경로 — 공유 링크와 진짜 404 — 에만 실행됩니다.

빌드 시점에 `.env`의 `PUBLIC_*` 값이 번들에 들어갑니다. 배포 머신에 `.env`가 있어야 공유 기능이
살아납니다.

## 성격

오락 및 자기점검 목적의 도구입니다. 결과는 공개된 관계 연구와 통계 경향을 참고해 설계한 지수이며,
통계적 예측치나 진단이 아닙니다. 모델 전체는 `/about`에 공개되어 있습니다.
