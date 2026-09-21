# @pug-frame/canvas

웹페이지 안의 작은 영역에서 pug-frame 와이어프레임을 렌더링하고 드래그·휠·터치로 팬/줌하는 뷰어. 프레임워크에 종속되지 않는 vanilla TS 이며, `@pug-frame/render`와 Node 폴리필을 번들에 포함하므로 브라우저에서 추가 설정 없이 동작한다.

```bash
npm install @pug-frame/canvas
```

```ts
import { pugFrameCanvas } from "@pug-frame/canvas";

const canvas = pugFrameCanvas("#viewer", {
  pugframe: `mobile
    header
        div Rescene
    body
        div Ilsan!
        button Next`,
});
await canvas.render();
```

- 문법: [docs/syntax.md](https://github.com/dorage/pug-frame/blob/main/docs/syntax.md)
- API: [docs/canvas.md](https://github.com/dorage/pug-frame/blob/main/docs/canvas.md)
