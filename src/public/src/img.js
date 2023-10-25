import { emit, listen } from '@tauri-apps/api/event'
import { appWindow, WebviewWindow } from '@tauri-apps/api/window'
import { invoke } from "@tauri-apps/api/tauri";
import { event as event2 } from '@tauri-apps/api';
import { resolveResource, resourceDir  } from "@tauri-apps/api/path";

export const appwindow = WebviewWindow.getByLabel('main');
export const subwindow = WebviewWindow.getByLabel('w2');
const viewer = document.getElementById('image-viewer');
const video = document.getElementById('video-controller');

document.addEventListener('DOMContentLoaded', function(event1) {
	if (document.body.id != 'w2' ) {
		return;
	} 
	console.log('DOMContentLoaded w2', event1);

	document.getElementById('w2').addEventListener('wheel', async (event) => {
		console.log('wheel w2', event);
		event.stopPropagation();
		if (event.deltaY > 0) {
			console.log('next img');
			// await invoke('send_message', { cmd: 'send_message', payload: 'prev_img' });
			emit('img_move', { cmd: 'send', payload: 'next_img' }); 
		} else if (event.deltaY < 0) {
			console.log('prev img');
			emit('img_move', { cmd: 'send', payload: 'prev_img' }); 
		}
		// emit('img_move', { cmd: 'send', payload: 'Hello from the new window!' }); 
	});
	let fit = localStorage.getItem("viewer_fit");
	const image = document.getElementById('image-viewer');
	if (fit == null) {
		fit = 'fit';
		localStorage.setItem("viewer_fit", fit);
	}
	if (fit == 'fit') {
		image.className = 'fitContain';
	} else {
		image.className = 'fitNone';
	}

});

(async () => {
	const fit_none = await window.__TAURI__.event.listen('fit-none', (event) => {
		console.log('fit none');
		const image = document.getElementById('image-viewer');
		image.className = 'fitNone';
		localStorage.setItem("viewer_fit", 'none');
	});
	const fit_contain = await window.__TAURI__.event.listen('fit-contain', (event) => {
		console.log('fit contain');
		const image = document.getElementById('image-viewer');
		image.className = 'fitContain';
		localStorage.setItem("viewer_fit", 'fit');

	});
	
	mousedragscrollable('#image-viewer');
})();

export async function show_context_dir() {
	let fit = localStorage.getItem("viewer_fit");
	if (fit == null) {
		fit = 'fit';
		localStorage.setItem("viewer_fit", fit);
	}
	const ss = await resourceDir();
	const res = await resolveResource("../resources/check.png");
	window.__TAURI__.invoke("plugin:context_menu|show_context_menu", { items: [
		{
			label: "fit none",
			disabled: false,
			event: "fit-none", 
			icon: {
				path: fit == 'none' ? res : ""
			},
		},
		{
			is_separator: true
		},
		{
			label: "fit contain",
			disabled: false,
			event: "fit-contain",
			icon: {
				path: fit == 'fit' ? res : ""
			},
		},
	]});
}
document.show_context_dir = show_context_dir;