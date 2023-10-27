"use client"
import { invoke } from '@tauri-apps/api/tauri';
import {fs, path} from '@tauri-apps/api';
import { writeTextFile, BaseDirectory, readTextFile } from '@tauri-apps/api/fs';
class AppConfig {
	/**
	 * config data
	 * @type {@type{
	 * 		thumb_setting: {aspectRatioEnabled: boolean, aspectRatio: number, rect: {width: number, height: number}, min: number}}
	 * }
	 */
	configData = {};
	constructor()  {
		this.configData = null;
		
		
	}
	async init() {
		this.path = {};
		const BaseDirectory = await invoke('get_exe_directory');
		const configFilePath = await path.join(BaseDirectory,'config.json5');
		const thumb_settingPath = await path.join(BaseDirectory,'thumbnail.json5');
		const themeFilepath = await path.join(BaseDirectory,'theme.json5');
		const favoritePath = await path.join(BaseDirectory,'favorite.json5');
		this.path.base_dir = BaseDirectory;
		this.path.configData = configFilePath;
		this.path.favorite =  favoritePath;
		this.path.thumbnail = thumb_settingPath;
		this.configData = {};
		await this.load();
	}
	async load() {
		await this.loadThemeSeeting();
		await this.loadThumbnailSetting();
		console.log('Config loaded:', this.configData);
	}
	async loadThemeSeeting() 
	{
		this.configData.theme = {};
		await this.loadConfigFile("theme", 
		{
			theme:{
				typography: {
					fontSize: 12,
					fontWeightLight: 300,
					fontWeightRegular: 400,
					fontWeightMedium: 700,
				
					h1: { fontSize: 60 },
					h2: { fontSize: 48 },
					h3: { fontSize: 42 },
					h4: { fontSize: 36 },
					h5: { fontSize: 20 },
					h6: { fontSize: 12 },
					subtitle1: { fontSize: 13 },
					body1: { fontSize: 14 },
					button: { textTransform: 'none' },
				},
			}
			
		  });
	}
	async loadThumbnailSetting() {
		this.configData.thumbnail = {};
		await this.loadConfigFile('thumbnail',
		{
			thumbnail: {
				aspectRatioEnabled: true,
				aspectRatio: 1,
				rect : {
					width: 240,
					height: 240
				},
				min: 240,
			}
		});
	}
	// 設定ファイルを読み込む
	async loadConfigFile(fileName, defaultConfig={}) {
		const BaseDirectory = await invoke('get_exe_directory');
		const configFilePath = await path.join(BaseDirectory, fileName + '.json5');

		if (await fs.exists(configFilePath)) {
			console.log("exists ",fileName, ".json5");
			const configDataJson = await readTextFile( configFilePath);
			const configData = JSON.parse(configDataJson);
			this.configData[fileName] = {...configData};
			console.log('Config loaded:', this.configData[fileName]);
		} else {
			console.log("does not exists ",fileName,".json5");
	
			const configData = JSON.stringify(defaultConfig);
			writeTextFile({ path: configFilePath, contents: configData }).then(() => {
				this.configData[fileName] = {...configData};
				console.log('Config file created.');
			}).catch(error => {
				console.log(error);
			});
		}
		return this.configData[fileName];
	}
	
	// 設定ファイルを保存する
	saveConfigFile() {
		// データをJSON形式に変換して書き込む
		try {
			const fileData = JSON.stringify(this.configData);
			fs.writeFileSync(configPath, fileData, null, 2);
		}
		catch (error) {
			console.log(error);
		}
	}
		/**
	 * Retrieves the thumb setting from the config data.
	 *
	 * @return {@type{aspectRatioEnabled: boolean, aspectRatio: number, rect: {width: number, height: number}, min: number}} The thumb setting value.
	 */
	getThumbSetting(){
		return this.configData.thumbnail;
	}
	
}
export default AppConfig;
