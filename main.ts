import { exec } from 'child_process';
import { App, FileSystemAdapter, Notice, Plugin, PluginManifest, PluginSettingTab, TFolder, normalizePath } from 'obsidian';
import * as path from 'path';


// TODO: add settings to configure eleventy.config.js (https://www.11ty.dev/docs/config/)
interface Meld11tyPluginSettings {
	//mySetting: string;
}

const DEFAULT_SETTINGS: Meld11tyPluginSettings = {
	//mySetting: 'default'
}

export default class Meld11tyPlugin extends Plugin {
	settings: Meld11tyPluginSettings;

	constructor(app: App, manifest: PluginManifest) {
		super(app, manifest);
	}

	async onload() {
		await this.loadSettings();

		// This adds a settings tab so the user can configure various aspects of the plugin
		this.addSettingTab(new Meld11tySettingTab(this.app, this));

		this.registerEvent( this.app.workspace.on( 'file-menu', async (menu, folder, source) => {
			if (!(folder instanceof TFolder)){
				return;
			}

			// check for 11ty config file
			const configFilePath = normalizePath( path.join(folder.path, 'eleventy.config.js') );

			//console.debug({configFilePath});
			
			menu.addItem(async (item) => {
				const configFileExists = await this.app.vault.adapter.exists( configFilePath );

				//const menuItemLabel = configFileExists ? 'Build Static Site' : 'Init Static Site';

				if ( configFileExists ){
					item
						.setTitle('Build Static Site').onClick(async () => await this.buildStaticSite(folder) )
					;
				}else{
					item
						.setTitle('Init. as Static Site').onClick(async () => await this.initStaticSite(folder) )
					;
				}
			});

		}))


	}

	initStaticSite(folder: TFolder): any {
		// TODO: build eleventy.config.js
	}

	async buildStaticSite(folder: TFolder) : Promise<void> {
		
		if ( !(this.app.vault.adapter instanceof FileSystemAdapter) ) {
			return;
		}
		
		const basePath = this.app.vault.adapter.getBasePath();
		const fullFolderPath = path.join( basePath, folder.path );

		//console.debug( {basePath, fullFolderPath} );
		

		// run eleventy to build the static site
		
		new Notice( `Building Site: '${folder.path}'...` );

		exec( 'npx @11ty/eleventy', { cwd: fullFolderPath }, (err, stdout, stderr) => {
			if (err) {
			  console.error(err);
			  new Notice( `There was an error while building: '${folder.path}', see console` );
			  return;
			}
			console.log(stdout);
			new Notice( `Site: '${folder.path}' was built` );
		  });
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
