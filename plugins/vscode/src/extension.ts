import * as vscode from 'vscode';
import type MarkdownIt from 'markdown-it';

/** 코드블록 언어 식별자. ```pug-frame 로 감싼 블록이 대상. */
const CODE_BLOCK_LANGUAGE = 'pug-frame';

/** canvasHeight 설정의 기본값(px). settings의 default와 일치시킨다. */
const DEFAULT_CANVAS_HEIGHT = 480;

/**
 * VS Code가 markdown 프리뷰를 렌더링할 때 호출한다.
 * `extendMarkdownIt`을 노출하면 호스트가 넘겨주는 markdown-it에 규칙을 추가할 수 있다.
 */
export function activate(): {
	extendMarkdownIt(md: MarkdownIt): MarkdownIt;
} {
	return {
		extendMarkdownIt(md: MarkdownIt): MarkdownIt {
			return extendMarkdownItWithPugFrame(md);
		},
	};
}

export function deactivate(): void {}

/**
 * fence 규칙을 가로채 pug-frame 코드블록을 프리뷰 스크립트가 채워 넣을
 * placeholder div로 바꾼다. 그 외 언어는 기본 fence 렌더러에 위임한다.
 */
function extendMarkdownItWithPugFrame(md: MarkdownIt): MarkdownIt {
	const defaultFence = md.renderer.rules.fence;

	md.renderer.rules.fence = (tokens, idx, options, env, self) => {
		const token = tokens[idx];
		const language = token?.info.trim().split(/\s+/)[0];
		if (token && language === CODE_BLOCK_LANGUAGE) {
			return renderPugFramePlaceholder(token.content);
		}
		return defaultFence
			? defaultFence(tokens, idx, options, env, self)
			: self.renderToken(tokens, idx, options);
	};

	return md;
}

/**
 * 코드블록 소스를 data 속성에 실어 placeholder를 만든다.
 * 실제 렌더링은 웹뷰의 프리뷰 스크립트(preview.ts)가 담당한다.
 * 소스는 웹뷰 DOM으로 안전하게 넘어가도록 encodeURIComponent로 인코딩한다.
 */
function renderPugFramePlaceholder(source: string): string {
	const config = vscode.workspace.getConfiguration('pugFrame');
	const height = normalizeHeight(config.get<number>('canvasHeight'));
	const controls = config.get<boolean>('showControls') ?? true;
	const encoded = encodeURIComponent(source);
	return (
		`<div class="pug-frame-canvas"` +
		` data-pugframe="${encoded}"` +
		` data-height="${height}"` +
		` data-controls="${controls}"></div>`
	);
}

/** 양의 정수만 높이로 인정하고, 그 외에는 기본값으로 되돌린다. */
function normalizeHeight(value: number | undefined): number {
	if (typeof value === 'number' && Number.isInteger(value) && value > 0) {
		return value;
	}
	return DEFAULT_CANVAS_HEIGHT;
}
