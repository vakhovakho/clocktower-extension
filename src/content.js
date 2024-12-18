import { jwtDecode } from "jwt-decode";
import { LOAD_STYLES, REMOVE_ACCESS_TOKEN, STORE_ACCESS_TOKEN, UNLOAD_STYLES } from "./actions";
import { loadStyles } from "./functions";
import { API_URL } from "./env";


// when everything loads
window.onload = function() {
	chrome.storage.local.get(["styleLoaded"]).then(async (result) => {
		if (isAuthorized() && result.styleLoaded === 1) {
			try {
				await loadStyles();
			} catch (e) {
				console.error(e);
			}
		}
	});

	// chrome.storage.local.get(["translate"]).then(async (result) => {
	// 	console.log(isAuthorized(), result.translate);
	// 	if (!isAuthorized() && result.translate) {
	// 		console.log("removing translate");
	// 		chrome.storage.local.set({ translate: false });
	// 		chrome.runtime.sendMessage({ translate: false });
	// 	}
	// });

	let interval = setInterval(() => {
		if (isStoryteller() && !isTracking) {
			startTracking();
			clearInterval(interval);
		}
	}, 60000);
}

let isTracking = false;
function startTracking() {
	isTracking = true;

	let recentData = {
		phase: -1,
		ended: false,
	}

	setInterval(() => {
		console.log("tracking");
		let storageData = getLocalstorageData();
		if (storageData.game.history.length === 0) return;
		if (storageData.game.isRunning && storageData.game.phase !== recentData.phase) {
			recentData.phase = storageData.game.phase;
			recentData.ended = false;
			populateVoteHistory(storageData);
			sendData(storageData);
		} else if (gameEnded(storageData.game) && !recentData.ended) {
			recentData.ended = true;
			recentData.phase = -1;
			populateVoteHistory(storageData);
			sendData(storageData);
		}
	}, 5000);
}

function populateVoteHistory(storageData) {
	storageData.voteHistory.forEach(entry => {
		let playerNames = [...document.querySelectorAll("#center .circle li .name span")].map(d => d.textContent);
		let nomineeIndex = playerNames.indexOf(entry.nominee);
		let nominatorIndex = playerNames.indexOf(entry.nominator);
		let nomineeId = storageData.players[nomineeIndex].id;
		let nominatorId = storageData.players[nominatorIndex].id;
		entry.nomineeId = nomineeId;
		entry.nominatorId = nominatorId;
	});
}

function gameEnded(game) {
	return game.history.length > 1 && game.history[game.history.length - 1].type === "end";
}

function isAuthorized() {
	let token = localStorage.getItem("mastermindAccessToken");
	if (token) {
		let decoded = jwtDecode(token);
		if (decoded.exp > Date.now()) {
			return true;
		}
		localStorage.removeItem("mastermindAccessToken");
	}

	return false;
}

function isStoryteller() {
	let token = localStorage.getItem("token");
	let id = jwtDecode(token).id;
	let storytellers = JSON.parse(localStorage.getItem("storytellers"));
	let isSt = storytellers.some(storyteller => storyteller.id === id);
	if (!isSt) {
		console.log("not a storyteller");
	}
	return isSt;
}

function sendData(data) {
	fetch(API_URL + 'save-phase', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			'Authorization': 'JWT ' + localStorage.getItem('mastermindAccessToken') || ''
		},
		body: JSON.stringify({ data })
	})
		.then(response => {
			if (!response.ok) {
				console.log('something went wrong: ' + response.status + ' ' + response.statusText);
				if (response.status === 401 || response.status === 403) {
					console.log("You are not authorized to use this extension. Please log in and try again.");
				}
			}
		})
}


chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
	switch (request.action) {
		case LOAD_STYLES:
			loadStyles();
			break;
		case UNLOAD_STYLES:
			let style = document.getElementById('mastermind-style');
			if (style) {
				style.remove();
			}
			break;
		case "ALERT":
			alert(request.message);
		case STORE_ACCESS_TOKEN:
			localStorage.setItem("mastermindAccessToken", request.token);
			if (isStoryteller() && !isTracking) {
				startTracking();
			}
			break;
		case REMOVE_ACCESS_TOKEN:
			localStorage.removeItem("mastermindAccessToken");
			break;
		default:
			break;
	}
});


function getLocalstorageData() {
	let allValues = {};
	for (let i = 0; i < localStorage.length; i++) {
		let key = localStorage.key(i);
		let value = localStorage.getItem(key);
		if (value.startsWith("{") || value.startsWith("[")) {
			value = JSON.parse(value);
		}
		allValues[key] = value;
	}
	return allValues;
}

