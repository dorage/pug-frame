#!/usr/bin/env node
import { readFileSync, writeFileSync } from "node:fs";
import { basename, dirname, extname, join } from "node:path";
import { render } from "@pug-frame/render";

interface CliArgs {
  input: string;
  output?: string;
}

const USAGE = `사용법: pug-frame <input> [-o <output>]

  <input>       pug-frame 소스 파일
  -o, --output  출력 HTML 경로 (기본: 입력 파일명 + .html)`;

function parseArgs(argv: string[]): CliArgs {
  let input: string | undefined;
  let output: string | undefined;

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === "-o" || arg === "--output") {
      output = argv[++i];
      if (!output) {
        throw new Error(`${arg} 옵션에는 출력 경로가 필요합니다.`);
      }
    } else if (arg === "-h" || arg === "--help") {
      console.log(USAGE);
      process.exit(0);
    } else if (!input) {
      input = arg;
    } else {
      throw new Error(`알 수 없는 인자: ${arg}`);
    }
  }

  if (!input) {
    throw new Error("입력 파일을 지정하세요.");
  }

  return { input, output };
}

/** 입력 경로 기준 기본 출력 경로: 같은 디렉터리, 확장자를 .html로 교체 */
function defaultOutput(input: string): string {
  const base = basename(input, extname(input));
  return join(dirname(input), `${base}.html`);
}

function main(): void {
  let args: CliArgs;
  try {
    args = parseArgs(process.argv.slice(2));
  } catch (error) {
    console.error(`오류: ${(error as Error).message}\n`);
    console.error(USAGE);
    process.exit(1);
  }

  let source: string;
  try {
    source = readFileSync(args.input, "utf8");
  } catch {
    console.error(`오류: 입력 파일을 읽을 수 없습니다: ${args.input}`);
    process.exit(1);
  }

  const output = args.output ?? defaultOutput(args.input);

  let html: string;
  try {
    html = render(source, { title: basename(args.input) });
  } catch (error) {
    console.error(`오류: 렌더링에 실패했습니다.\n${(error as Error).message}`);
    process.exit(1);
  }

  writeFileSync(output, html, "utf8");
  console.log(`렌더 완료: ${output}`);
}

main();
