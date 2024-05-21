// import { loadStyles } from "./functions";

import { API_URL } from "./env";

// Background script (Service Worker)

chrome.storage.local.get(["translate"]).then((result) => {
	translateBaseRoles(result.translate ? 'ka' : 'en');
});

chrome.runtime.onMessage.addListener(
	async function(message) {
		if (message.translate == null) return;
		translateBaseRoles(message.translate ? 'ka' : 'en');
	}
);

async function fetchHombrewRoles(name, lang) {
	return fetch(`${API_URL}roles/${lang}/${name}`)
		.then((response) => response.json())
}

function translateBaseRoles(lang) {
	if (lang === 'ka') {
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
