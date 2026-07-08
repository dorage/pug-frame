import lex from "pug-lexer";
import parse from "pug-parser";
import link from "pug-linker";
import generateCode from "pug-code-gen";
import wrap from "pug-runtime/wrap.js";

/**
 * pug 소스를 HTML로 컴파일한다.
 *
 * pug 메인 패키지 대신 하위 패키지(lexer→parser→linker→code-gen→runtime)를
 * 직접 조합한다. 메인 패키지가 의존하는 `pug-load`(fs, is-core-module)를 피해
 * Node 내장 모듈에 대한 의존을 최소화하기 위함이며, 이 덕분에 Node뿐 아니라
 * (assert/util 폴리필이 있는) 브라우저에서도 동작한다.
 */
export function compilePug(source: string): string {
  const filename = "pug-frame";
  const tokens = lex(source, { filename });
  const ast = link(parse(tokens, { filename, src: source }));
  const code = generateCode(ast, {
    compileDebug: false,
    pretty: true,
    inlineRuntimeFunctions: false,
    templateName: "tmpl",
  });
  const template = wrap(code, "tmpl");
  return template({});
}
