# 작업지시사항

## 모노레포 / 패키지 네이밍

- NX 모노레포로 구성하며, 모든 패키지는 `packages/*`에 둡니다.
- 패키지 이름은 `@pug-frame/*` 스코프를 사용합니다. (예: `@pug-frame/render`, `@pug-frame/cli`, `@pug-frame/canvas`)
- 패키지 디렉터리명은 스코프를 뺀 이름(`render`, `cli`, `canvas`)으로 하고, `project.json`의 `name`도 동일하게 맞춥니다.
- 코어 렌더 로직은 `@pug-frame/render`에 두고, 다른 패키지는 이를 의존해 재사용합니다.

## Git

- 원자적인 작업단위로 커밋을 남깁니다.
- conventional commit을 사용합니다.
- 브랜치 네이밍도 conventional commit과 동일한 `type/task` 컨벤션을 사용합니다.
