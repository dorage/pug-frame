import { forceParsing, syntaxTreeAvailable } from '@codemirror/language';
import type { Text } from '@codemirror/state';
import { ViewPlugin, type EditorView, type ViewUpdate } from '@codemirror/view';

/**
 * Live Preview에서 긴 pug-frame 코드블록이 렌더링되지 않는 문제를 보정하는 CM6 확장.
 *
 * Obsidian은 Live Preview 데코레이션을 만들 때 `ensureSyntaxTree(state, viewport.to + 2000, 20)`
 * 로 문법 트리를 뷰포트 끝 +2000자까지만 파싱하고, 코드블록 위젯은 `HyperMD-codeblock-end`
 * (닫는 ``` 라인)을 만났을 때 비로소 생성한다. 따라서 코드블록이 그 범위보다 길면
 * 닫는 펜스가 파싱 범위에 들어올 때까지 위젯이 만들어지지 않고 원본 소스가 그대로 보인다.
 *
 * 여기서는 뷰포트에 걸쳐 있는 pug-frame 코드블록의 닫는 펜스까지 파싱을 미리 진행시켜
 * Obsidian이 같은 업데이트 주기에서 위젯을 만들 수 있게 한다.
 */

/** 이 언어 식별자의 코드블록만 미리 파싱한다. */
const CODE_BLOCK_LANGUAGE = 'pug-frame';

/** forceParsing 1회당 허용할 파싱 시간(ms). */
const PARSE_TIMEOUT_MS = 50;

/** 한 번의 뷰포트 변경에 대해 재시도할 최대 횟수. */
const MAX_PARSE_ATTEMPTS = 20;

/** 여는/닫는 펜스 라인. 리스트 안의 코드블록도 잡도록 앞쪽 공백은 제한하지 않는다. */
const FENCE_PATTERN = /^\s*(`{3,}|~{3,})\s*(\S*)/;

interface OpenFence {
	/** 펜스 문자(` 또는 ~) */
	char: string;
	/** 여는 펜스의 길이. 닫는 펜스는 이보다 짧을 수 없다. */
	length: number;
	/** 여는 펜스의 문서 오프셋 */
	start: number;
	/** pug-frame 코드블록인지 */
	isTarget: boolean;
}

/**
 * `viewportTo` 시점에 열려 있는 pug-frame 코드블록의 닫는 펜스 끝 오프셋을 구한다.
 * 뷰포트 안에서 이미 닫힌 블록은 그 위치까지 파싱이 끝나 있으므로 대상이 아니다.
 * 대상이 없으면 -1.
 */
export function pendingBlockEnd(doc: Text, viewportTo: number): number {
	let pos = 0;
	let open: OpenFence | null = null;

	for (const text of doc.iterLines()) {
		const lineStart = pos;
		const lineEnd = pos + text.length;
		pos = lineEnd + 1;

		const match = FENCE_PATTERN.exec(text);

		if (open === null) {
			// 뷰포트를 지났는데 열린 블록이 없으면 더 볼 필요가 없다.
			if (lineStart > viewportTo) return -1;
			if (match) {
				const marker = match[1] as string;
				open = {
					char: marker[0] as string,
					length: marker.length,
					start: lineStart,
					isTarget: match[2] === CODE_BLOCK_LANGUAGE,
				};
			}
			continue;
		}

		// 닫는 펜스는 같은 문자, 같거나 긴 길이, info string 없음.
		const marker = match?.[1];
		const isClosing =
			marker !== undefined &&
			marker[0] === open.char &&
			marker.length >= open.length &&
			!match?.[2];
		if (!isClosing) continue;

		if (open.isTarget && open.start <= viewportTo && lineEnd > viewportTo) {
			return lineEnd;
		}
		open = null;
	}

	return -1;
}

/** 뷰포트에 걸친 pug-frame 코드블록의 끝까지 문법 트리 파싱을 앞당긴다. */
class LivePreviewParseAhead {
	private timer = 0;
	private attempts = 0;

	constructor(private readonly view: EditorView) {
		this.schedule();
	}

	update(update: ViewUpdate): void {
		if (!update.viewportChanged && !update.docChanged) return;
		this.attempts = 0;
		this.schedule();
	}

	destroy(): void {
		if (this.timer) window.clearTimeout(this.timer);
		this.timer = 0;
	}

	/**
	 * forceParsing은 내부적으로 dispatch를 호출하므로 업데이트 주기 안에서 바로 실행할 수 없다.
	 * 타이머로 미뤄 다음 틱에 수행한다.
	 */
	private schedule(): void {
		if (this.timer) return;
		this.timer = window.setTimeout(() => {
			this.timer = 0;
			this.run();
		}, 0);
	}

	private run(): void {
		const { state } = this.view;
		const target = pendingBlockEnd(state.doc, this.view.viewport.to);
		if (target < 0) return;

		const upto = Math.min(target + 1, state.doc.length);
		if (syntaxTreeAvailable(state, upto)) return;

		forceParsing(this.view, upto, PARSE_TIMEOUT_MS);

		// 시간 예산 안에 끝나지 않으면 진행된 만큼을 유지한 채 다음 틱에 이어서 파싱한다.
		if (
			!syntaxTreeAvailable(this.view.state, upto) &&
			++this.attempts < MAX_PARSE_ATTEMPTS
		) {
			this.schedule();
		}
	}
}

/** 플러그인에서 `registerEditorExtension`으로 등록할 CM6 확장. */
export const livePreviewParseAhead = ViewPlugin.fromClass(LivePreviewParseAhead);
