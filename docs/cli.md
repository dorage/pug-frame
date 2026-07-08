# @pug-frame/cli

pug-frame 파일을 HTML로 렌더링하는 커맨드라인 도구. 내부적으로 `@pug-frame/render`의 `render()`를 사용한다.

## 도메인

pug-frame 문법 파일을 읽어 자기완결적 HTML 문서로 변환·저장하는 것이 목적이다. pug-frame 문법 자체는 [render 문서](./render.md)를 참고한다.

## 설치 / 빌드

- 모노레포 루트에서 `npm install` 후 `npx nx run cli:build`로 빌드한다.
- 빌드 결과 `packages/cli/dist/cli.js`가 `pug-frame` bin으로 연결된다.
- 개발 중에는 `npx nx run cli:dev -- <input>`으로 빌드 없이 실행할 수 있다.

## 사용법

```
pug-frame <input> [-o <output>]
```

- `<input>` (필수): pug-frame 소스 파일 경로.
- `-o`, `--output` (선택): 출력 HTML 경로. 생략하면 입력 파일명의 확장자를 `.html`로 바꿔 같은 디렉터리에 저장한다.
- `-h`, `--help`: 사용법을 출력한다.

### 예시

- `pug-frame examples/first.pf` → `examples/first.html` 생성.
- `pug-frame examples/first.pf -o out.html` → `out.html` 생성.

## 동작

- 입력 파일을 읽어 `render(source, { title: <파일명> })`으로 문서를 만든 뒤 출력 경로에 쓴다.
- 완료 시 `렌더 완료: <경로>`를 출력한다.

## 종료 코드와 오류

- 정상 완료: 0.
- 입력 파일 미지정, 알 수 없는 인자, `-o` 값 누락: 오류 메시지와 사용법을 출력하고 1로 종료.
- 입력 파일을 읽을 수 없음: 오류 메시지를 출력하고 1로 종료.
- 렌더링 실패: 오류 메시지를 출력하고 1로 종료.
