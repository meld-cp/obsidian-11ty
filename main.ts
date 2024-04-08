import { App, Editor, MarkdownView, Modal, Notice, Plugin, PluginSettingTab, Setting, TFolder } from 'obsidian';


// TODO: add settings to configure eleventy.config.js (https://www.11ty.dev/docs/config/)
interface Meld11tyPluginSettings {
	//mySetting: string;
}

const DEFAULT_SETTINGS: Meld11tyPluginSettings = {
	//mySetting: 'default'
}

export default class Meld11tyPlugin extends Plugin {
	settings: Meld11tyPluginSettings;

	async onload() {
		await this.loadSettings();

		// This adds a settings tab so the user can configure various aspects of the plugin
		this.addSettingTab(new Meld11tySettingTab(this.app, this));

		this.registerEvent( this.app.workspace.on( 'file-menu', (menu, file, source) => {
			if (!(file instanceof TFolder)){
				return;
			}

			menu.addItem((item) => {
				item.setTitle('Build Static Site').onClick(async () => {
					await this.buildStaticSite(file);
				});
			});
		}))

		// // If the plugin hooks up any global DOM events (on parts of the app that doesn't belong to this plugin)
		// // Using this function will automatically remove the event listener when this plugin is disabled.
		// this.registerDomEvent(document, 'click', (evt: MouseEvent) => {
		// 	console.log('click', evt);
		// });

		// When registering intervals, this function will automatically clear the interval when the plugin is disabled.
		//this.registerInterval(window.setInterval(() => console.log('setInterval'), 5 * 60 * 1000));
	}

	async buildStaticSite(folder: TFolder) : Promise<void> {
		//TODO: convert ![[images]] to <img src..>
		new Notice( `Build Static Site: ${folder.path}` );
	}

	onunload() {

	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}


class Meld11tySettingTab extends PluginSettingTab {
	plugin: Meld11tyPlugin;

	constructor(app: App, plugin: Meld11tyPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const {containerEl} = this;

		containerEl.empty();

		// new Setting(containerEl)
		// 	.setName('Setting #1')
		// 	.setDesc('It\'s a secret')
		// 	.addText(text => text
		// 		.setPlaceholder('Enter your secret')
		// 		.setValue(this.plugin.settings.mySetting)
		// 		.onChange(async (value) => {
		// 			this.plugin.settings.mySetting = value;
		// 			await this.plugin.saveSettings();
		// 		}));
	}
}
