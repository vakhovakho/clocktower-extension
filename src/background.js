// import { loadStyles } from "./functions";

import { API_URL } from "./env";

// Background script (Service Worker)

chrome.storage.local.get(["translate"]).then((result) => {
	console.log("translate is " + result.translate);
	translateRoles(result.translate ? 'ka' : 'en');
});

chrome.runtime.onMessage.addListener(
	async function(message) {
		if (message.translate == null) return;
		translateRoles(message.translate ? 'ka' : 'en');
	}
);

async function fetchHombrewRoles(name, lang) {
	return fetch(`${API_URL}roles/${lang}/${name}`)
		.then((response) => response.json())
}

function updateRolesInStorage(roles) {
	executeScript(
		function(roles) {
			localStorage.setItem("roles", JSON.stringify(roles));
		},
		function() {
			console.log("Roles have been saved to local storage.");
		},
		[roles]
	);
}

function translateRoles(lang) {
	executeScript(
		async function() {
			const edition = JSON.parse(localStorage.getItem("edition")).edition;

			return edition;
		},
		async function(edition) {
			if (edition.id === "homebrew") {
				try {
					const data = await fetchHombrewRoles(edition.name, lang);
					updateRolesInStorage(data);
					console.log("Roles have been stored in the database.");
				} catch (error) {
					console.log(error);
				}
			}

			translateBaseRoles(lang);
			executeScript(() => window.location.reload());
		}
	);
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

function executeScript(scriptFunction, onResult, args = []) {
	console.log("executing script");
	return chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
		const activeTab = tabs[0];
		console.log(activeTab);
		if (!activeTab) return;

		if (!activeTab.url.includes('botc.app')) {
			console.log('You must be on the Blood on the Clocktower website to use this extension.');
		} else {
			chrome.scripting.executeScript(
				{
					target: { tabId: activeTab.id },
					function: scriptFunction,
					args: args
				},
				function(results) {
					console.log(results);
					onResult && onResult(results[0].result);
				}
			);
		}
	});
}
