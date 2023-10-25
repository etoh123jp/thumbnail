import { invoke, tauri,path, } from "@tauri-apps/api";
import { listen } from "@tauri-apps/api/event";
import { resolveResource, resourceDir  } from "@tauri-apps/api/path";
import { basename} from "@tauri-apps/api/path";
import { Command, open  } from '@tauri-apps/api/shell';
import TauriBridge from "./TauriBridge";
// Listen to the event emitted when the first menu item is clicked
// listen("item1clicked", () => {

(async () => {
	const unlisten_ot = await listen('ot_clicked', (event) => {
		console.log('ot_clicked');
		if (window.is_f) {
			let dirData = TauriBridge.getInstance().getDirData();
			let path = dirData.path + "\\" + dirData.dirs[window.select_index];
			console.log(path);
			TauriBridge.getInstance().openFolder(path);
		}
	});

	const unlisten_oe = await listen('oe_clicked', (event) => {
		console.log('oe_clicked');
		if (window.is_f) {
			let dirData = TauriBridge.getInstance().getDirData();
			let path = dirData.path + "\\" + dirData.dirs[window.select_index];
			path = path.replace(/\\\\/g, '\\');
			invoke('open_explorer_and_select', { path: path , flag: false});
			console.log(path);
		}
		window.is_f = false;
	});
  })();


window.addEventListener("contextmenu", async (e) => {
    e.preventDefault();
	invoke("plugin:context_menu|show_context_menu", { items:[] });
	return false;
    const iconUrl = await resolveResource('assets/16x16.png');
	const targetElement = document.elementFromPoint(e.clientX, e.clientY);
	console.log(targetElement);
	const m = targetElement.getAttribute("m") || targetElement.id;

	switch(m) {
		case 'gc':
			break;
		case 'dir-name':
			show_context_dir();
			break;

	}
    
});
export async function show_context_dir() {
	const ss = await resourceDir();
	const res = await resolveResource("../resources/icons8-folder-16.png");
	invoke("plugin:context_menu|show_context_menu", { items: [
		
		{
			label: "Open Explorer",
			disabled: false,
			event: "oe_clicked",
			icon: {
				path: res
			},
		},
		{
			is_separator: true
		},
		{
			label: "Open Thunbnails",
			disabled: false,
			event: "ot_clicked",
			icon: {
				path: res
			},
		},
		
	]});
}
export function show_context_thumb() {
	invoke("plugin:context_menu|show_context_menu", { items: [
		{
			label: "Open Image",
			disabled: false,
			event: "ot_clicked",
			icon: {
				path: iconUrl
			}
		},
		{
			is_separator: true
		},
		{
			label: "Open Explorer",
			disabled: false,
			event: "oe_clicked",
			icon: {
				path: iconUrl
			}
		}
	]});
	
}
function openDirectory(path) {
	let command = "";
  
	if (process.platform === 'win32') {
	  command = `explorer ${path}`;
	} else if (process.platform === 'darwin') {
	  command = `open ${path}`;
	} else if (process.platform === 'linux') {
	  command = `xdg-open ${path}`;
	} else {
	  console.log('Unsupported OS');
	  return;
	}
  
	try {
	  execSync(command);
	} catch (err) {
	  console.error(err);
	}
  }
export default {  show_context_dir, show_context_thumb };