# @pug-frame/render

pug-frame 문법(Pug 위에 와이어프레임 의미를 얹은 DSL)을 HTML로 렌더링하는 코어 라이브러리.

```bash
npm install @pug-frame/render
```

```ts
import { render, renderParts } from "@pug-frame/render";

const source = `mobile
    header
        div Rescene
    body
        div Ilsan!
        button Next`;

const html = render(source, { title: "wireframe" });          // 전체 문서
const { html: fragment, css } = renderParts(source, { embedded: true }); // 임베드용 조각
```

- 브라우저에서 쓰려면 번들러가 `assert`/`util`/`process`를 폴리필해야 한다(pug 하위 패키지가 요구). 설정 없이 바로 쓰려면 이 패키지를 번들해 둔 [`@pug-frame/canvas`](https://www.npmjs.com/package/@pug-frame/canvas)를 권한다.
- 문법: [docs/syntax.md](https://github.com/dorage/pug-frame/blob/main/docs/syntax.md)
- API: [docs/render.md](https://github.com/dorage/pug-frame/blob/main/docs/render.md)
