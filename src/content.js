import { LOAD_STYLES, UNLOAD_STYLES } from "./actions";
import { startCenterObserver, stopCenterObserver } from "./centerObserver";
import { loadStyles } from "./functions";

chrome.storage.local.get(["styleLoaded"]).then(async (result) => {
	if (result.styleLoaded === 1) {
		try {
			await loadStyles();
			startCenterObserver()
		} catch (e) {
			console.error(e);
		}
	}
});

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
	if (request.action === LOAD_STYLES) {
		loadStyles();
		stopCenterObserver();
	}

	if (request.action === UNLOAD_STYLES) {
		let style = document.getElementById('mastermind-style');
		if (style) {
			style.remove();
		}
		stopCenterObserver();
	}
});


