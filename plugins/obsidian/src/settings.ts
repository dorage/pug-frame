import { App, PluginSettingTab, Setting } from 'obsidian';
import PugFramePlugin from './main';

export interface PugFrameSettings {
	/** 코드블록 캔버스의 높이(px). */
	canvasHeight: number;
	/** 이동/줌 물리 버튼 표시 여부. */
	showControls: boolean;
}

export const DEFAULT_SETTINGS: PugFrameSettings = {
	canvasHeight: 480,
	showControls: true,
};

export class PugFrameSettingTab extends PluginSettingTab {
	plugin: PugFramePlugin;

	constructor(app: App, plugin: PugFramePlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;

		containerEl.empty();

		new Setting(containerEl)
			.setName('Canvas height')
			.setDesc('pug-frame 코드블록을 렌더링할 캔버스의 높이(px).')
			.addText((text) =>
				text
					.setPlaceholder(String(DEFAULT_SETTINGS.canvasHeight))
					.setValue(String(this.plugin.settings.canvasHeight))
					.onChange(async (value) => {
						const parsed = Number.parseInt(value, 10);
						if (Number.isFinite(parsed) && parsed > 0) {
							this.plugin.settings.canvasHeight = parsed;
							await this.plugin.saveSettings();
						}
					}),
			);

		new Setting(containerEl)
			.setName('Show controls')
			.setDesc('캔버스에 이동/줌 버튼을 표시합니다.')
			.addToggle((toggle) =>
				toggle
					.setValue(this.plugin.settings.showControls)
					.onChange(async (value) => {
						this.plugin.settings.showControls = value;
						await this.plugin.saveSettings();
					}),
			);
	}
}
