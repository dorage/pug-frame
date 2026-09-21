## 요약

<!-- 무엇을 왜 바꿨는지 -->

## npm 패키지 버전

<!-- 아래 중 하나에 표시한다. packages/render, canvas, cli 의 소스나 외부 의존성이 바뀌면
     세 패키지 버전을 함께 올려야 하며, CI 가 검사한다. main 머지 시 npm 에 자동 배포된다. -->

- [ ] 올림: `x.y.z` → `x.y.z` — 이유:
- [ ] 해당 없음 — 패키지 소스·의존성 변경 없음

<!-- 올릴 때: 리포 루트에서 `pnpm bump packages <patch|minor|major>` (Obsidian 도 함께면 `pnpm bump all`) -->

## Obsidian 플러그인 버전

<!-- 아래 중 하나에 표시한다. 플러그인 소스(plugins/obsidian/src)나 번들되는 코어 패키지
     (packages/render, packages/canvas)의 동작이 바뀌면 버전을 올려야 하며, CI 가 검사한다. -->

- [ ] 올림: `x.y.z` → `x.y.z` — 이유:
- [ ] 해당 없음 — 플러그인·코어 동작 변경 없음 (문서, 툴링, 테스트, CLI, playground 등)

<!-- 올릴 때: 리포 루트에서 `pnpm bump obsidian <patch|minor|major>` -->

## 확인

- [ ] `pnpm build` 통과
- [ ] 문서(`README.md`, `docs/*`) 갱신
