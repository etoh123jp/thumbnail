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
	// 設定ファイルを読み込む
	async loadConfigFile() {
		const BaseDirectory = await invoke('get_exe_directory');
		const configFilePath = await path.join(BaseDirectory,'config.json5');

		if (await fs.exists(configFilePath)) {
			console.log("exists config.json5");
			const configData = await readTextFile( configFilePath);
			this.configData = JSON.parse(configData);
			console.log('Config loaded:', this.configData);
		} else {
			console.log("does not exists config.json5");
			// ファイルが存在しない場合、作成する
			const defaultConfig = {
				thumb_setting: {
					aspectRatioEnabled: true,
					aspectRatio: 1,
					rect : {
						width: 240,
						height: 240
					},
					min: 240,
				}
			};
			const configData = JSON.stringify(defaultConfig);
			writeTextFile({ path: configFilePath, contents: configData }).then(() => {
				this.configData = defaultConfig;
				console.log('Config file created.');
			}).catch(error => {
				console.log(error);
			});
		}
		return this.configData;
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
		return this.configData.thumb_setting;
	}
	
}
export default AppConfig;
