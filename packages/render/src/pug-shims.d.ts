// pug 하위 패키지는 공식 타입 선언을 제공하지 않으므로 최소 선언을 둔다.
declare module "pug-lexer" {
  const lex: (source: string, options?: Record<string, unknown>) => unknown[];
  export default lex;
}
declare module "pug-parser" {
  const parse: (tokens: unknown[], options?: Record<string, unknown>) => unknown;
  export default parse;
}
declare module "pug-linker" {
  const link: (ast: unknown) => unknown;
  export default link;
}
declare module "pug-code-gen" {
  const generateCode: (ast: unknown, options?: Record<string, unknown>) => string;
  export default generateCode;
}
declare module "pug-runtime/wrap.js" {
  const wrap: (
    code: string,
    templateName?: string,
  ) => (locals?: Record<string, unknown>) => string;
  export default wrap;
}
