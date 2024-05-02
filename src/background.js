// import { loadStyles } from "./functions";

// chrome.storage.local.get(["styleLoaded"]).then((result) => {
// 	console.log('Background script', result)
// 	chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
// 		console.log(tabs[0].url)
// 	});
// 	if (result.styleLoaded === 1) {
// 		loadStyles();
// 	}
// });

// chrome.storage.local.get(["translate"]).then((result) => {
// 	console.log("translate is" + result.translate);
// 	if (Number(result.translate) === 1) {
// 		console.log("translating")
// 		translate();
// 	}
// });

// Background script (Service Worker)

chrome.storage.local.get(["translate"]).then((result) => {
	console.log("translate is" + result.translate);
	enableOrDisableTranslation(result.translate);
});

chrome.runtime.onMessage.addListener(
	async function(message, sender, sendResponse) {
		console.log("Message received:", message);

		enableOrDisableTranslation(message.translate);
		sendResponse({ success: true });
		// Return true if you want to send a response asynchronously
		return true;
	}
);

function enableOrDisableTranslation(translate) {
	if (translate) {
		chrome.declarativeNetRequest.updateStaticRules({
			rulesetId: "ruleset_1",
			enableRuleIds: [1]
		})
	} else {
		chrome.declarativeNetRequest.updateStaticRules({
			rulesetId: "ruleset_1",
			disableRuleIds: [1]
		})
	}

}

