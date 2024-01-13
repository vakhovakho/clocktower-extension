import { loadStyles } from "./functions";

chrome.storage.local.get(["styleLoaded"]).then((result) => {
	console.log('Background script', result)
	chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
		console.log(tabs[0].url)
	});
	if (result.styleLoaded === 1) {
		loadStyles();
	}
});

