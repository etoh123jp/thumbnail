

use dirs;
use crate::file_ops;
use crate::models::fs;
use std::process::Command as StdCommand;


#[tauri::command]
pub async fn get_user_home_dir() -> Result<fs::DirData, tauri::InvokeError> {
    match dirs::home_dir() {
        Some(path) => file_ops::process_selected_directory(path).await,
        None => Ok(fs::DirData::default()),
    }
} 
#[tauri::command]
pub fn open_explorer_and_select(path: String, flag: bool) {
    if cfg!(target_os = "windows") {
		println!("path: {:?}", path);
		if flag  {
			StdCommand::new("explorer").arg("/select,").arg(path).spawn().expect("Failed to open explorer");
		} else {
			StdCommand::new("explorer").arg(path).spawn().expect("Failed to open explorer");
		}
    } else if cfg!(target_os = "macos") {
        StdCommand::new("open").arg(path).spawn().unwrap();
    } else if cfg!(target_os = "linux") {
        StdCommand::new("xdg-open").arg(path).spawn().unwrap();
    } else {
        // その他のOSの場合の処理
        println!("Unsupported OS");
    }
}
