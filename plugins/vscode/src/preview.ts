import { pugFrameCanvas, type PugFrameCanvas } from '@pug-frame/canvas';

/** extension.ts가 심어 둔 placeholder를 찾는 셀렉터. */
const SELECTOR = '.pug-frame-canvas';

/** canvasHeight 기본값(px). data-height 파싱 실패 시 사용한다. */
const DEFAULT_CANVAS_HEIGHT = 480;

/** 이미 마운트한 placeholder와 그 소스·캔버스 인스턴스를 추적한다. */
interface Mounted {
	source: string;
	canvas: PugFrameCanvas;
}
const mounted = new WeakMap<HTMLElement, Mounted>();

/**
 * placeholder 하나를 캔버스로 렌더링한다.
 * 같은 소스로 이미 렌더된 요소는 건너뛰고, 소스가 바뀐 경우 기존 캔버스를 정리 후 다시 렌더한다.
 */
function mount(el: HTMLElement): void {
	const source = decodeURIComponent(el.getAttribute('data-pugframe') ?? '');

	const prev = mounted.get(el);
	if (prev) {
		if (prev.source === source) return;
		prev.canvas.destroy();
	}

	el.style.height = `${parseHeight(el.getAttribute('data-height'))}px`;
	const canvas = pugFrameCanvas(el, {
		pugframe: source,
		controls: el.getAttribute('data-controls') !== 'false',
	});
	// 렌더는 비동기(URL 소스 대응)지만 실패는 canvas가 fallback으로 처리한다.
	void canvas.render();

	mounted.set(el, { source, canvas });
}

function renderAll(): void {
	document.querySelectorAll<HTMLElement>(SELECTOR).forEach(mount);
}

function parseHeight(value: string | null): number {
	const parsed = Number.parseInt(value ?? '', 10);
	return Number.isFinite(parsed) && parsed > 0 ? parsed : DEFAULT_CANVAS_HEIGHT;
}

// 프리뷰는 편집마다 DOM을 다시 그리므로, 새로 나타난 placeholder를 계속 감시한다.
// 캔버스가 자기 하위 DOM을 추가하며 발생하는 추가 mutation은 rAF로 묶어 과호출을 막는다.
let scheduled = false;
function schedule(): void {
	if (scheduled) return;
	scheduled = true;
	requestAnimationFrame(() => {
		scheduled = false;
		renderAll();
	});
}

function main(): void {
	renderAll();
	new MutationObserver(schedule).observe(document.body, {
		childList: true,
		subtree: true,
	});
}

if (document.readyState === 'loading') {
	document.addEventListener('DOMContentLoaded', main);
} else {
	main();
}
