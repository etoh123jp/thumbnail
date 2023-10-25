// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

// Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
use std::sync::Arc;
use tauri::Manager;
use tauri::State;
use tokio::sync::Mutex;
use anyhow::Result;

mod models;
mod ops;
use once_cell::sync::Lazy;
mod thumb_app;
use thumb_app::TaskManager;

// use thumb_app::{ThumbApp};

use crate::ops::{file_ops, common_ops};

pub static GLOBAL_APP: Lazy<Arc<Mutex<Option<tauri::AppHandle>>>> = Lazy::new(|| Arc::new(Mutex::new(None)));
pub static GLOBAL_TUMB: Lazy<Arc<Mutex<Option<TaskManager>>>> = Lazy::new(|| Arc::new(Mutex::new(None)));
use std::env;

#[tokio::main]
pub async fn main() -> Result<()>{
    env_logger::Builder::new()
        .filter_level(log::LevelFilter::Info)
        .init();
	let task_manager: Arc<Mutex<TaskManager>> = std::sync::Arc::new(tokio::sync::Mutex::new(TaskManager::new().await));
	// let thumb_app : ThumbApp = ThumbApp::new().unwrap();
	// let runtime = tokio::runtime::Runtime::new().unwrap();
	let tauri = tauri::Builder::default()
	.setup(  move |_app| {

		let app_handle = _app.handle();
        let global_app = GLOBAL_APP.clone();
        // async block
		tokio::task::spawn(async move {
			let mut lock = global_app.lock().await;
			*lock = Some(app_handle);
			
			
		});
		#[cfg(debug_assertions)]
		_app.get_window("w2").unwrap().open_devtools();
		Ok(())
	})
	.manage(task_manager);

    tauri.invoke_handler(tauri::generate_handler![
			file_ops::open_folder_dialog,
			file_ops::process_selected_directory,
			file_ops::get_system_drives,
			common_ops::get_user_home_dir,
			common_ops::open_explorer_and_select,
			read_archive,
			send_index
			//imgmove
		])
		.plugin(tauri_plugin_context_menu::init())
		.run(tauri::generate_context!())
		.expect("error while running tauri application");

	Ok(())
	
}
#[tauri::command]
async fn read_archive(path: String, task_manager: State<'_, Arc<Mutex<TaskManager>>>
)-> Result<bool, String> {
	let mut task_manager: tokio::sync::MutexGuard<'_, TaskManager> = task_manager.lock().await;
    if task_manager.open_new_file(&path).await.is_ok() {
		return Ok(true)
	}
	Err("Failed to open archive".to_string())
}
#[tauri::command]
async fn send_index(index: i32, task_manager: State<'_, Arc<Mutex<TaskManager>>>
)-> Result<String, String> {
	let mut task_manager: tokio::sync::MutexGuard<'_, TaskManager> = task_manager.lock().await;
    task_manager.send_task(index).await;

	let res =task_manager.receive_result().await;
	Ok(res)
}