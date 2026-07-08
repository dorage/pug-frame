import { MarkdownPostProcessorContext, MarkdownRenderChild, Plugin } from 'obsidian';
import { pugFrameCanvas, type PugFrameCanvas } from '@pug-frame/canvas';
import {
	DEFAULT_SETTINGS,
	PugFrameSettings,
	PugFrameSettingTab,
} from './settings';

/** 코드블록 언어 식별자. ```pug-frame 로 감싼 블록이 대상. */
const CODE_BLOCK_LANGUAGE = 'pug-frame';

export default class PugFramePlugin extends Plugin {
	settings!: PugFrameSettings;

	async onload() {
		await this.loadSettings();

		this.registerMarkdownCodeBlockProcessor(
			CODE_BLOCK_LANGUAGE,
			(source, el, ctx) => this.renderCodeBlock(source, el, ctx),
		);

		this.addSettingTab(new PugFrameSettingTab(this.app, this));
	}

	private renderCodeBlock(
		source: string,
		el: HTMLElement,
		ctx: MarkdownPostProcessorContext,
	): void {
		// 코드블록은 자체 높이가 없으므로 고정 높이 뷰포트를 만들어 준다.
		const container = el.createDiv({ cls: 'pug-frame-canvas' });
		container.style.height = `${this.settings.canvasHeight}px`;

		const canvas = pugFrameCanvas(container, {
			pugframe: source,
			controls: this.settings.showControls,
		});
		// 렌더는 비동기(URL 소스 대응)지만 실패는 canvas가 fallback으로 처리한다.
		void canvas.render();

		// 뷰 언로드/재렌더 시 리스너·DOM을 정리해 누수를 막는다.
		ctx.addChild(new PugFrameRenderChild(container, canvas));
	}

	onunload() {}

	async loadSettings() {
		this.settings = Object.assign(
			{},
			DEFAULT_SETTINGS,
			(await this.loadData()) as Partial<PugFrameSettings>,
		);
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}

/** 코드블록 하나의 생명주기를 캔버스 정리와 연결한다. */
class PugFrameRenderChild extends MarkdownRenderChild {
	constructor(
		containerEl: HTMLElement,
		private readonly canvas: PugFrameCanvas,
	) {
		super(containerEl);
	}

	onunload(): void {
		this.canvas.destroy();
	}
}
