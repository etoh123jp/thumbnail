"use client"


// import { invoke } from "@tauri-apps/api/tauri";
import VirtualArray from "../utils/VirtualArray";
import { appWindow,WebviewWindow } from '@tauri-apps/api/window';
import { app, window } from '@tauri-apps/api';
import { emit, listen } from '@tauri-apps/api/event'
// import { appwindow } from "../img";
import { convertFileSrc } from '@tauri-apps/api/tauri';
import { TauriEvent } from "@tauri-apps/api/event"
import { event, invoke } from '@tauri-apps/api';

import AppConfig from "./AppConfig";
let instance;

class TauriBridge {
  // コンストラクタ
	constructor() {
		if (TauriBridge.instance) {
			throw new Error("You can only create one instance!");
		} else {
			instance = this;
			this.App = null;
			this.Grid = null;
			this.dirList = null;
			this.dense = null;
			this.thumb_setting = {};
			this.dirData = null;
			this.storageDirectory = null;
			this.imgWindow = null;
			this.view_page_index = 0;
			this.history = []; // 履歴リストを保存するための配列
			this.historyIndex = -1; // 現在の履歴のインデックス
			this.in_history_action = false; // 履歴アクション中のフラグ
			this.config = new AppConfig();

			// load setting
			instance = this;
			document.addEventListener('mousedown', (event) => {
				let p = null;
				this.in_history_action = true;
				if (event.button === 3) { // 戻るボタン
					p = this.goBack();
				} else if (event.button === 4) { // 進むボタン
					p = this.goForward();
				}
				if (p) {
					p.then(() => {
						this.in_history_action = false;
					})
					.catch(error => {
						this.in_history_action = false;
						
					});
				} else {
					this.in_history_action = false;
				}
			});
			// localStorageから'favorites'キーで保存された配列を取得
			const favoritesFromStorage = localStorage.getItem('favorites');

			// JSON形式の文字列をJavaScriptの配列に変換
			const favoritesArray = favoritesFromStorage != 'undefined' && favoritesFromStorage != null ? JSON.parse(favoritesFromStorage) : [];

			this.favorites = favoritesArray;

			TauriBridge.instance = instance;

		}
		
	}
	async init() {
		await this.config.init();
	}
	getTheme() {
		this.config.configData.theme;
	}
	getThumbnailSetting() {
		return this.config.configData.thumbnail;
	}
	// #region Page
	/**
	 * Adds a directory to the history.
	 *
	 * @param {string} dir - The directory to be added.
	 * @return {undefined} This function does not return anything.
	 */
	addToHistory(dir) {
		// 現在のインデックス以降の履歴を削除
		this.history = this.history.slice(0, this.historyIndex + 1);

		// 履歴のサイズ制限
		if (this.history.length >= 50) { // 50は最大の履歴の数です
			this.history.shift();
		} else {
			this.historyIndex++;
		}

		// 履歴に追加
		this.history.push(dir);
	}
	/**
	 * Navigates back to the previous directory in the history.
	 *
	 * @return {null} If there is no previous directory in the history.
	 * @return {type} The result of calling the openFolder method with the previous directory.
	 */
	goBack() {
		if (this.historyIndex > 0) {
			this.historyIndex--;
			const previousDir = this.history[this.historyIndex];
			return this.openFolder(previousDir);
		} else {
			return null; // 戻る履歴がない場合
		}
	}

	/**
	 * Moves the user forward in the history of visited folders.
	 *
	 * @return {null} Returns null if there is no forward history.
	 */
	goForward() {
		if (this.historyIndex < this.history.length - 1) {
			this.historyIndex++;
			const nextDir = this.history[this.historyIndex];
			return this.openFolder(nextDir);
		} else {
			return null; // 進む履歴がない場合
		}
	}

	/**
	 * Sets the thumb rectangle.
	 *
	 * @param {Object} rect - The rectangle to set as the thumb rectangle.
	 */
	
	/**
	 * Set the directory list.
	 *
	 * @param {type} dirList - The list of directories.
	 */
	setDirList(dirList)
	{
		this.dirList = dirList;
	}
	/**
	 * Returns the directory list.
	 *
	 * @return {Array} The directory list.
	 */
	getDirList() {
		return this.dirList;
	}
	/**
	 * Set the value of the Grid property.
	 *
	 * @param {type} Grid - The new value for the Grid property.
	 */
	setGrid(Grid) {
		this.Grid = Grid;
	}
	setDense(dense) {
		this.dense = dense;
	}
	getGrid() {
		return this.Grid;
	}

	setApp(App) {
		this.App = App;
	}

	getApp() {
		return this.App;
	}
	setDirData(dirData)
	{
		console.log("setDirData::", dirData);
		this.dirData = dirData;
	}
	/**
	 * Gets the directory data.
	 *
	 * @return {any} The directory data.
	 */
	getDirData()
	{
		return this.dirData;
	}
	/**
	 * Returns the current folder path.
	 *
	 * @return {string} The current folder path, or an empty string if dirData is null.
	 */
	getCurrentFolder()
	{
		return this.dirData == null ? '' : this.dirData.path;
	}
	/**
	 * Saves the favorites array to local storage.
	 *
	 * No parameters.
	 *
	 * No return value.
	 */
	saveFavorites(favorites)
	{
		this.favorites = favorites;
		localStorage.setItem("favorites", JSON.stringify(this.favorites));
	}
	/**
	 * Retrieves the favorites.
	 *
	 * @return {Array} The list of favorite items.
	 */
	getFavorites()
	{
		return this.favorites;
	}
	/**
	 * Returns the instance of the class.
	 *
	 * @return {Object} The instance of the class.
	 */
	static getInstance() {
		return instance;
	}
	/**
	 * Update the directory path in the app.
	 *
	 * @return {void} - This function does not return a value.
	 */
	updateDirPathApp()
	{
		if (this.dirData == null) {
			console.log("updateDirPathApp:: dirData is null");
			return;
		}
		VirtualArray.getInstance().setData(this.dirData.files.concat(this.dirData.movies));
		
		
		this.Grid.setState({path: this.dirData.path, dirData: this.dirData});
		this.dirList.setState({path: this.dirData.path, dirData: this.dirData});
		this.dense.setState({path: this.dirData.path, dirData: this.dirData});

		emit('listen_event', { cmd: 'select_dir', message: this.dirData.path }); 
	}
	async getThumbnail(path)
	{
		let res = await invoke('get_thumbnail_data', { 'path' : path})
		.then(data => {
			return data;
		}).catch(error => {
			console.log(`getThumbnail::取得エラー: ${error}`);
		})
		return res;
	}
	//#endregion
	/**
	 * Asynchronously opens a folder and performs certain actions based on the returned data.
	 *
	 * @param {string} path - The path of the folder to be opened.
	 */
	async openFolder(path) 
	{
		if (this.dirList != null ) {
			this.dirList.setState({is_loading: true});
		}
		await invoke("process_selected_directory",{ 'selectedDir': path })
			.then(data => {
				if (data == null || data == undefined || data.path == "\"\"" || data.path == undefined) {
					localStorage.removeItem("view_dir");
					throw error;
				}
				console.log(data);
				data.path = data.path.replace(/\\\\/g, '\\');
				localStorage.setItem("view_dir", data.path);
				this.in_history_action || this.addToHistory(data.path);
				this.dirData = data;
				TauriBridge.instance.setDirData(data);

				TauriBridge.instance.updateDirPathApp();
			}).catch(error => {
				console.error(`process_selected_directory::取得エラー: ${error}`);
			});

			if (this.dirList != null ) {
				this.dirList.setState({is_loading: false});
			}
	}
	/**
	 * Selects a folder.
	 *
	 * @return {Promise<void>} A promise that resolves once the folder has been selected.
	 */
	async selectFolder() {
		await invoke("open_folder_dialog")
		.then(result => {
			console.log(result);
			localStorage.setItem("view_dir", JSON.stringify(result.path));
			let va = VirtualArray.getInstance();
			TauriBridge.instance.setDirData(result);
			va.setData(result.files);
			va.setData(result.files.concat(result.movies));
			
			TauriBridge.instance.updateDirPathApp();
			
		}).catch(error => {
			console.error(`open_folder_dialog::取得エラー: ${error}`);
		});
	}
	async getDrives() {
		let drives = await invoke("get_system_drives");
		if (drives != null && drives != undefined) {
			return drives;
		} else {
			throw error;
		}
	}
	/**
	 * Retrieves the storage directory from local storage.
	 *
	 * @return {Promise<void>} Returns nothing.
	 */
	async getStorageDirectory() {
		let view_dir = localStorage.getItem("view_dir");
		view_dir = view_dir ? view_dir.replace(/^"|"$/g, '') : null;
		if (view_dir == null || view_dir == "undefined") {
			let data = await invoke("get_user_home_dir");
			if (data != null && data != undefined) {
				localStorage.setItem("view_dir", data.path);
				TauriBridge.instance.setDirData(data);
				VirtualArray.getInstance().setData(data.files.concat(data.movies));

				console.log('view_dir::', data.path);
				this.updateDirPathApp();
				return;
			} else {
				throw error;
			}
		} else {
			TauriBridge.instance.openFolder(view_dir);
		}

	}
	
	/**
	 * Opens a new window and loads an image if an existing window is visible.
	 *
	 * @param {string} imgPath - The path of the image to be loaded.
	 * @return {Promise} Returns a Promise that resolves when the image is loaded.
	 */
	async openNewWindow(imgPath, page_numbar) {
		let va = VirtualArray.getInstance();
		if ( page_numbar < 0) {
			page_numbar = va.getLength() -1;
		} else if (page_numbar > va.getLength() -1 ) {
			page_numbar = 0;
		}
		this.view_page_index = page_numbar;
		imgPath = "https://asset.localhost/" + va.getItemIndex(this.view_page_index);
		let w = null;
		let unlisten, lady_listen = null;
		let _this = this;

			if (this.imgWindow == null) {
			if (w == null) {
				w = await new WebviewWindow('w2', {
					url: './w2/',
					decorations: true,
				});
			}
			
			lady_listen = await event.listen('img-window-ready', async ({ event, payload }) => {
				console.log('update-status');
				await w.emit('load-image', { imgPath });
			});
			w.once(TauriEvent.WINDOW_CLOSE_REQUESTED,function () {
				console.log('WINDOW_CLOSE_REQUESTED');
				unlisten();
				lady_listen();
				_this.imgWindow = null;
				return false;
			});
			async function f() {
				unlisten = await event.listen('img_move', ({ event, payload }) => {
						// const msg = payload.message.replace(/"/g, '');
						//imgPath = convertFileSrc(va.getItemIndex(_this.view_page_index));
						const msg = payload.payload;
						console.log(`img_move ${payload.message} ${new Date()}`);
						switch(msg) {
							case "next_img":
								TauriBridge.getInstance().openNewWindow(imgPath, ++_this.view_page_index);
								break;
							case "prev_img":
								TauriBridge.getInstance().openNewWindow(imgPath, --_this.view_page_index);
								break;
						}
					});
				}
			await f();

		} else {
			let aa = await WebviewWindow.getByLabel('w2');
			console.log('imgWindow exists', aa);
			w = this.imgWindow;
			w.show();
			
			//imgPath =  convertFileSrc(va.getItemIndex(page_numbar));
			await w.emit('load-image', { imgPath });

		}
		
				
		//listen('send_message_wheel', (message) => { console.log('Received message:', message); });
		this.imgWindow = w;
		w.show();
		
	}
	   
}
instance = new TauriBridge();
export default TauriBridge;
