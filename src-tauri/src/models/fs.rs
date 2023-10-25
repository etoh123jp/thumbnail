
use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, Debug, Clone, Default)]
pub struct DirData {
	pub path: String,
	pub movies : Vec<String>,
	pub files: Vec<String>,
	pub dirs: Vec<String>,
	pub comps: Vec<String>,
}

#[derive(Serialize, Deserialize, Debug, Clone, Default)]
pub struct Drives {
	pub label: String,
	pub system: String,
	pub drive: String,
	pub size: String,
	pub free: String,
}