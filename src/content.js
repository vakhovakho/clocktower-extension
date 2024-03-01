import { jwtDecode } from "jwt-decode";
import { LOAD_STYLES, REMOVE_ACCESS_TOKEN, STORE_ACCESS_TOKEN, UNLOAD_STYLES } from "./actions";
import { startCenterObserver, stopCenterObserver } from "./centerObserver";
import { loadStyles } from "./functions";
import { API_URL } from "./env";

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

// when everything loads
window.onload = function() {
	if (!isAuthorized()) {
		setTimeout(() => {
			alert("You are not authorized to use this extension. Please log in and try again.");
		}, 5000);
		return;
	}
	if (isStoryteller()) {
		startTracking();
	}
}

let isTracking = false;
function startTracking() {
	if (isTracking) return;
	isTracking = true;

	let recentData = {
		phase: -1,
		ended: false,
		winner: '',
	}
	trackEndgame(recentData);

	setInterval(() => {
		console.log("tracking");
		let storageData = getLocalstorageData();
		if (storageData.game.history.length === 0) return;
		if (storageData.game.isRunning && storageData.game.phase !== recentData.phase) {
			recentData.phase = storageData.game.phase;
			recentData.ended = false;
			recentData.winner = ''
			sendData(storageData);
		} else if (gameEnded(storageData.game) && !recentData.ended) {
			storageData.winner = recentData.winner;
			recentData.ended = true;
			recentData.phase = -1;
			recentData.winner = '';
			sendData(storageData);
		}
	}, 5000);
}

function trackEndgame(recentData) {
	document.body.addEventListener('click', e => {
		if (e.target.tagName === 'LI') {
			if (e.target.textContent.trim().toLowerCase().startsWith('reveal grimoire')) {
				setTimeout(registerListeners, 0);
			}
		}

	})

	document.addEventListener('keyup', e => {
		if (e.key === "g") {
			setTimeout(registerListeners, 0)
		}
	});

	function registerListeners() {
		document.querySelectorAll('button').forEach(button => {
			button.addEventListener('click', () => {
				let buttonText = button.textContent.trim().toLowerCase();
				if (buttonText.startsWith('good won')) {
					recentData.winner = 'good';
				} else if (buttonText.startsWith('evil won')) {
					recentData.winner = 'evil'
				}
			})

		});
	}
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
	switch (request.action) {
		case LOAD_STYLES:
			loadStyles();
			startCenterObserver();
			break;
		case UNLOAD_STYLES:
			let style = document.getElementById('mastermind-style');
			if (style) {
				style.remove();
			}
			stopCenterObserver();
			break;
		case "ALERT":
			alert(request.message);
		case STORE_ACCESS_TOKEN:
			localStorage.setItem("mastermindAccessToken", request.token);
			startTracking();
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

