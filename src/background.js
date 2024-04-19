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
chrome.runtime.onMessage.addListener(
	async function(message, sender, sendResponse) {
		console.log("Message received:", message);


		if (message.translate) {
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

		sendResponse({ success: true });
		// Return true if you want to send a response asynchronously
		return true;
	}
);

function onBeforeRequestListener(details) {
	if (details.url.includes("backend/roles")) {
		return { redirectUrl: "https://api.clocktower.ge/v1/roles" };
	}
}

