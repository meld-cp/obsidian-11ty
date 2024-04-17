import { exec } from 'child_process';
import { App, FileSystemAdapter, Notice, Plugin, PluginManifest, PluginSettingTab, TFile, TFolder, normalizePath } from 'obsidian';
import * as path from 'path';

// TODO: instruct user to install eleventy `> npm install -g @11ty/eleventy`
// TODO: add option to enable/disable watch mode

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
			
			menu.addItem(async (item) => {
				//walk up parent folders looking for the config file
				const configFile = await this.getConfigFilePathRecursive( folder );

				if ( configFile != null ){
					item
						.setTitle('Build Static Site').onClick(async () => await this.buildStaticSite(configFile) )
					;
				}else{
					item
						.setTitle('Init. as Static Site').onClick(async () => await this.initStaticSite(folder) )
					;
				}
			});

		}))


	}

	async getConfigFilePathRecursive( startingFolder: TFolder ): Promise<TFile | null> {
		// check for 11ty config file
		const configFilePath = normalizePath( path.join(startingFolder.path, 'eleventy.config.js') );
		//console.debug( {configFilePath} );
		const configFileExists = await this.app.vault.adapter.exists( configFilePath );

		if ( configFileExists ){
			return this.app.vault.getAbstractFileByPath(configFilePath) as TFile;
		}

		if ( startingFolder.parent ){
			return await this.getConfigFilePathRecursive(startingFolder.parent);
		}

		return null;
	}

	initStaticSite(folder: TFolder): any {
		// TODO: build eleventy.config.js
		console.debug( `initStaticSite: ${folder.path}` );
	}

	async buildStaticSite(configFile: TFile) : Promise<void> {
		
		if ( !(this.app.vault.adapter instanceof FileSystemAdapter) ) {
			return;
		}

		if (configFile.parent == null){
			return;
		}
		
		const srcRootFolder = configFile.parent;

		const basePath = this.app.vault.adapter.getBasePath();
		const fullFolderPath = path.join( basePath, srcRootFolder.path );

		//console.debug( {basePath, fullFolderPath} );
		

		// run eleventy to build the static site
		
		new Notice( `Building Site: '${srcRootFolder.path}'...` );

		exec( 'eleventy', { cwd: fullFolderPath }, (err, stdout, stderr) => {
			if (err) {
			  console.error(err);
			  new Notice( `There was an error while building: '${srcRootFolder.path}', see console` );
			  return;
			}
			console.log(stdout);
			new Notice( `Site: '${srcRootFolder.path}' was built` );
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
