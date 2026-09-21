# npm 배포

`@pug-frame/render`, `@pug-frame/canvas`, `@pug-frame/cli` 세 패키지를 npm 에 올리는 규칙과 흐름. Obsidian 플러그인의 릴리스는 [obsidian 문서](./obsidian.md)의 "버전과 릴리스"를 참고한다.

## 배포 대상과 설치

- `@pug-frame/render` — 코어. Node 에서는 그대로 쓴다. 브라우저에서 쓰려면 소비자의 번들러가 `assert`/`util`/`process`를 폴리필해야 한다(pug 하위 패키지가 요구). Vite 라면 `vite-plugin-node-polyfills` 같은 플러그인이 필요하다.
- `@pug-frame/canvas` — 브라우저용 뷰어. `render`와 폴리필을 하나의 ES 번들에 포함하므로 React 등 프론트엔드 프로젝트에서 추가 설정 없이 `npm install @pug-frame/canvas` 만으로 쓸 수 있다.
- `@pug-frame/cli` — `npx @pug-frame/cli <input>` 또는 전역 설치 후 `pug-frame <input>`.

`playground` 와 `plugins/*` 는 배포하지 않는다.

## 버전 규칙 (lockstep)

세 패키지는 **항상 같은 버전**을 쓴다. `canvas`·`cli` 가 `render`를 정확한 버전(`"0.1.0"`)으로 참조하고, `playground`·`plugins/obsidian`·`plugins/vscode` 도 `canvas`를 같은 방식으로 참조한다. pnpm 은 참조 버전과 워크스페이스 버전이 같을 때만 링크하므로(`pnpm-workspace.yaml`의 `linkWorkspacePackages`), 버전을 올릴 때 이 참조들을 반드시 함께 고쳐야 한다. 아래 스크립트가 이를 한 번에 처리한다.

### 버전을 올려야 하는 경우

다음 중 하나에 해당하는 PR 은 npm 패키지 버전을 올려야 한다. CI(`.github/workflows/release.yml`의 `version-check`)가 기준 브랜치와 비교해 검사하고, 올리지 않았으면 실패한다.

- `packages/render/src/**`, `packages/canvas/src/**`, `packages/cli/src/**` 가 바뀜(문서 `*.md`, 테스트 `*.test.ts` 제외).
- 세 패키지 `package.json`의 외부 의존성(`dependencies`/`devDependencies`/`peerDependencies`)이 바뀜. `@pug-frame/*` 끼리의 참조와 `scripts` 변경은 제외.

`render`·`canvas` 소스가 바뀌면 Obsidian 플러그인 버전도 같이 올려야 한다(플러그인이 둘을 번들하므로). 이 경우 `pnpm bump all` 을 쓴다. 예외적으로 검사를 건너뛰어야 하면 PR 에 `no-version-bump` 라벨을 붙인다.

### 올리는 방법

```bash
# 리포 루트에서
pnpm bump packages patch   # 또는 minor / major / 1.2.3
pnpm bump obsidian patch   # Obsidian 플러그인만
pnpm bump all patch        # 둘 다
```

`scripts/bump-version.ts`가 다음을 한 번에 처리한다. git 커밋·태그는 만들지 않는다.

- 세 패키지 `package.json`의 `version` 을 올린다.
- 워크스페이스 전체에서 `@pug-frame/*` 참조를 새 버전으로 바꾼다(`canvas`, `cli`, `playground`, `plugins/obsidian`, `plugins/vscode`).
- `pnpm install --lockfile-only` 로 `pnpm-lock.yaml`의 specifier 를 맞춘다. CI 가 `--frozen-lockfile` 로 설치하므로 이 갱신이 빠지면 설치가 실패한다.

로컬에서 검사만 미리 돌려보려면 `pnpm check-version` (기준 `origin/main`).

## 배포 흐름

- PR 마다 `version-check` 가 버전 규칙을 검사하고, `build` 가 세 패키지와 Obsidian 플러그인을 빌드한다.
- main 에 push 되면 `publish-npm` job 이 세 패키지를 빌드한 뒤 `scripts/publish-packages.ts`를 돌린다. 이 스크립트는 패키지마다 `npm view <name>@<version>` 으로 **레지스트리에 그 버전이 없을 때만** `npm publish --access public --provenance` 한다. 이미 있으면 건너뛰므로 같은 커밋을 다시 돌려도 안전하고, 일부만 실패했을 때 재실행하면 남은 것만 배포된다.
- 배포된 버전은 되돌릴 수 없다(npm 은 72시간 안에만 unpublish 를 허용하고, 그 뒤엔 deprecate 만 가능). 잘못 나갔으면 다음 버전을 올려 다시 배포한다.
- 로컬에서 흐름만 확인하려면 빌드 후 `pnpm publish-packages --dry-run`. 로그인 없이도 포함 파일과 크기를 볼 수 있다.

## 인증: Trusted Publishing

토큰 시크릿을 두지 않는다. npmjs.com 의 각 패키지 설정에서 GitHub Actions 를 신뢰 배포자(Trusted Publisher)로 등록하면, 워크플로가 OIDC 토큰으로 인증하고 provenance 증명이 자동으로 붙는다. `release.yml`의 `publish-npm` job 은 이를 위해 `id-token: write` 권한을 갖고, npm 11.5.1 이상을 쓰도록 `npm install -g npm@latest` 를 먼저 실행한다.

### 최초 설정 (한 번만)

신뢰 배포자 설정은 패키지 단위라, 패키지가 npm 에 먼저 존재해야 한다. 그래서 첫 버전은 사람이 로컬에서 올린다.

- npmjs.com 에 `pug-frame` 조직을 만든다(무료, 공개 패키지용). 스코프 `@pug-frame` 은 이 조직 이름과 같아야 한다.
- 로컬에서 `npm login` 후 리포 루트에서 다음을 실행한다. 빌드 산출물이 있어야 한다.

```bash
pnpm exec nx run-many -t build -p render,canvas,cli
pnpm publish-packages          # 레지스트리에 없는 패키지만 올린다
```

- 세 패키지 각각의 npmjs.com 페이지 → Settings → Trusted Publisher 에서 GitHub Actions 를 추가한다.
  - Organization or user: `dorage`
  - Repository: `pug-frame`
  - Workflow filename: `release.yml`
  - Environment name: 비워 둔다
- 같은 설정 화면에서 "Publishing access" 를 "Require two-factor authentication and disallow tokens" 로 두면 토큰 유출 경로가 닫힌다. 신뢰 배포자는 이 설정과 무관하게 동작한다.

이후부터는 버전을 올린 PR 이 main 에 머지되면 CI 가 자동으로 배포한다.

### 확인

- 배포 후 npmjs.com 패키지 페이지에 "Provenance" 배지가 보이면 OIDC 경로로 정상 배포된 것이다.
- `publish-npm` job 이 `ENEEDAUTH` 나 `E404` 로 실패하면 신뢰 배포자 등록(리포 이름·워크플로 파일명)이 잘못됐거나 아직 첫 수동 배포가 안 된 것이다.
