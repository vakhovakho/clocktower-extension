import { jwtDecode } from "jwt-decode";
import { LOAD_STYLES, REMOVE_ACCESS_TOKEN, STORE_ACCESS_TOKEN, UNLOAD_STYLES } from "./actions";
import { API_URL } from "./env";

let PLAYER_TYPE = {
	PLAYER: 'player',
	STORYTELLER: 'storyteller',
	SPECTATOR: 'spectator'
}

let initialState = {
	game: null,
	session: null,
	bocToken: null,
	bocId: null,
	userType: null,
	players: [],
	storytellers: [],
	spectators: [],
	reportedUsers: [],
	isModerator: false,
	loaderCount: 0,
};


let state = initialState;
let wrapper = document.querySelector('.wrapper');
let styleCheckbox = document.getElementById('style');
let translateCheckbox = document.getElementById('translate');
let backgroundCheckbox = document.getElementById('background');
let controls = document.querySelector('.controls');
let infoDiv = document.querySelector('.info');
let loaderWrapper = document.querySelector('.loader-wrapper');
controls.style.display = 'none';

chrome.storage.local.get(['styleLoaded'], function(result) {
	if (result.styleLoaded) {
		styleCheckbox.checked = true;
	}
});

chrome.storage.local.get(['translate'], function(result) {
	if (result.translate) {
		translateCheckbox.checked = true;
	}
});

chrome.storage.local.get(['background'], function(result) {
	if (result.background) {
		backgroundCheckbox.checked = true;
	}
});

styleCheckbox.addEventListener('change', checkStyles);

translateCheckbox.addEventListener('change', checkTranslate);

backgroundCheckbox.addEventListener('change', checkBackground);

chrome.runtime.onMessage.addListener(
	function(request, sender, sendResponse) {
		console.log('localStorage change detected', request.data);
		if (request.gameEnded) {
			console.log('localStorage change detected', request.data);
			// Handle the change
		}
	}
);

executeScript(
	function() {
		return {
			token: localStorage.getItem("token"),
			game: JSON.parse(localStorage.getItem("game")),
			players: JSON.parse(localStorage.getItem("players")),
			storytellers: JSON.parse(localStorage.getItem("storytellers")),
			session: localStorage.getItem("session"),
			playerNames: [...document.querySelectorAll('.nameplate span')].map(span => span.textContent),
		};
	},
	function(result) {
		main(result);
	}
);


function main({ token, game, players, storytellers, session, playerNames }) {
	if (!token) {
		throwErrorAndResetState('You must be logged in to rate players.');
		return;
	}

	state.bocToken = token;
	state.bocId = jwtDecode(token).id;
	state.game = game;
	state.players = players;
	state.session = session;
	state.storytellers = storytellers;
	state.playerNames = playerNames;

	if (localStorage.getItem('accessToken')) {
		state.isModerator = jwtDecode(localStorage.getItem('accessToken')).moderator;
		getReportedUsers();
		getMyReport();
	}

	if (players.find(player => player.id === state.bocId)) {
		state.userType = PLAYER_TYPE.PLAYER;
	} else {
		if (storytellers.find(st => st.id === state.bocId)) {
			state.userType = PLAYER_TYPE.STORYTELLER;
		}
	}

	if (!isAuthorized()) {
		showAuth();
	} else {
		populate();
	}
}

function checkStyles() {
	if (styleCheckbox.checked) {
		chrome.storage.local.set({ styleLoaded: 1 });
		chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
			chrome.tabs.sendMessage(tabs[0].id, { action: LOAD_STYLES });
		});
	} else {
		chrome.storage.local.set({ styleLoaded: 0 });
		chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
			chrome.tabs.sendMessage(tabs[0].id, { action: UNLOAD_STYLES });
		});
	}
}

function checkTranslate() {
	chrome.storage.local.set({ translate: Number(translateCheckbox.checked) });
	chrome.runtime.sendMessage({ translate: translateCheckbox.checked }, () => {
		executeScript(
			function() {
				window.location.reload();
			}
		);
	});
}

function checkBackground() {
	chrome.storage.local.set({ background: Number(backgroundCheckbox.checked) });
	if (backgroundCheckbox.checked) {
		executeScript(
			function() {
				localStorage.setItem('background', 'https://api.clocktower.ge/v1/background');
				window.location.reload();
			}
		);
	} else {
		executeScript(
			function() {
				localStorage.removeItem('background');
				window.location.reload();
			}
		);
	}
}

function isAuthorized() {
	let token = localStorage.getItem("accessToken");
	if (token) {
		if (token === 'undefined') {
			localStorage.removeItem("accessToken");
			return false;
		}
		let decoded = jwtDecode(token);
		if (decoded.exp > Date.now()) {
			return true;
		}
		localStorage.removeItem("accessToken");
	}

	return false;
}

function showAuth() {
	controls.style.display = 'none';
	wrapper.innerHTML = '';

	let authContainer = document.createElement('div');
	authContainer.classList.add('auth-container');

	let usernameDiv = document.createElement('div');
	let usernameLabel = document.createElement('label');
	usernameLabel.textContent = 'username';
	usernameLabel.for = 'username';
	let usernameInput = document.createElement('input');
	usernameInput.setAttribute('name', 'username');
	usernameInput.setAttribute('id', 'username');
	usernameDiv.appendChild(usernameLabel);
	usernameDiv.appendChild(usernameInput);

	let passwordDiv = document.createElement('div');
	let passwordLabel = document.createElement('label');
	passwordLabel.textContent = 'password';
	passwordLabel.for = 'password';
	let passwordInput = document.createElement('input');
	passwordInput.setAttribute('type', 'password');
	passwordInput.setAttribute('name', 'password');
	passwordInput.setAttribute('id', 'password');
	passwordDiv.appendChild(passwordLabel);
	passwordDiv.appendChild(passwordInput);


	let actionsDiv = document.createElement('div');
	let loginButton = document.createElement('button');
	loginButton.textContent = 'Login';
	let registerButton = document.createElement('button');
	registerButton.textContent = 'Register';
	actionsDiv.appendChild(loginButton);
	actionsDiv.appendChild(registerButton);

	authContainer.appendChild(usernameDiv);
	authContainer.appendChild(passwordDiv);
	authContainer.appendChild(actionsDiv);
	wrapper.appendChild(authContainer);

	loginButton.addEventListener('click', () => login(usernameInput.value, passwordInput.value, state.bocId));
	registerButton.addEventListener('click', () => register(usernameInput.value, passwordInput.value, state.bocId));
}

function login(username, password, bocId) {

	fetch(API_URL + 'auth/login', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({ username, password, bocId })
	})
		.then(response => {
			return response.json();
		})
		.then(data => {
			if (data.status === 'fail') {
				throw new Error(data.message);
			}
			localStorage.setItem('accessToken', data.accessToken);

			state.isModerator = jwtDecode(data.accessToken).moderator;
			if (state.isModerator) {
				getReportedUsers();
			}

			chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
				chrome.tabs.sendMessage(tabs[0].id, { action: STORE_ACCESS_TOKEN, token: data.accessToken });
			});

			checkStyles();
			checkTranslate();
			// checkBackground();

			populate();
		})
		.catch(error => {
			console.error('Error: ' + error.message)
		});
}

function register(username, password, bocId) {
	fetch(API_URL + 'auth/register', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({ username, password, bocId })
	})
		.then(response => {
			return response.json();
		})
		.then(data => {
			if (data.status === 'fail') {
				throw new Error(data.message);
			}
			localStorage.setItem('accessToken', data.accessToken);
			chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
				chrome.tabs.sendMessage(tabs[0].id, { action: STORE_ACCESS_TOKEN, token: data.accessToken });
			});
			populate();
		})
		.catch(error => {
			console.error('Error: ' + error.message)
		});

}

function sendVote(gameId, receiverId) {
	return fetch(API_URL + 'vote', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			'Authorization': 'JWT ' + localStorage.getItem('accessToken') || ''
		},
		body: JSON.stringify({ gameId, receiverId })
	})
		.then(response => {
			if (!response.ok) {
				if (response.status === 401 || response.status === 403) {
					localStorage.removeItem('accessToken');
					chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
						chrome.tabs.sendMessage(tabs[0].id, { action: REMOVE_ACCESS_TOKEN });
					});

					showAuth();
				} else {
					console.log(response);
				}
			}
			return response.json();
		})
		.then(data => {
			if (data.status === 'fail') {
				throw new Error(data.message);
			}
			alert('Vote sent');
		})
		.catch(error => {
			console.error('Error: ' + error.message)
		});
}

function logout() {
	localStorage.removeItem('accessToken');
	chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
		chrome.tabs.sendMessage(tabs[0].id, { action: REMOVE_ACCESS_TOKEN });
		translateCheckbox.checked = false;
		checkTranslate();
	});
}

function populate() {
	controls.style.display = 'block';
	wrapper.innerHTML = '';

	let logoutElement = document.createElement('span');
	logoutElement.classList.add('logout');
	logoutElement.textContent = 'Logout';
	logoutElement.addEventListener('click', logout);
	wrapper.appendChild(logoutElement);

	if (!state.userType && !state.isModerator) {
		throwErrorAndResetState('You must be a player, storyteller or moderator  to rate players.');
		return;
	}

	for (let index in state.players) {
		let playerId = state.players[index].id;
		let playerName = state.playerNames[index];

		let playerDiv = document.createElement('div');
		playerDiv.classList.add('player');

		let label = document.createElement('label');
		label.setAttribute('for', playerId + "_" + index);
		label.textContent = playerName;
		if (state.reportedUsers.find(userId => userId === playerId)) {
			label.style.color = 'red';
			label.style.fontWeight = 'bold';
		}

		let input = document.createElement('input');
		input.type = 'radio';
		input.setAttribute('name', 'vote');
		input.value = playerId;
		input.id = playerId + "_" + index;



		playerDiv.appendChild(label);
		playerDiv.appendChild(input);
		if (state.isModerator) {
			let reportButton = document.createElement('button');
			reportButton.textContent = 'Report';
			reportButton.addEventListener('click', () => report(playerId));
			playerDiv.appendChild(reportButton);
		}

		wrapper.appendChild(playerDiv);
	}

	let button = document.createElement('button');
	button.textContent = 'Rate';
	button.addEventListener('click', vote);

	wrapper.appendChild(button);
}

function report(playerId) {
	let reason = prompt('Please enter the reason for reporting this player', '');
	if (reason === null || reason === '') {
		return;
	}
	fetch(API_URL + 'report', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			'Authorization': 'JWT ' + localStorage.getItem('accessToken') || ''
		},
		body: JSON.stringify({
			reportedUserBocId: playerId,
			session: state.session,
			reason
		})
	}).then(response => {
		if (!response.ok) {
			console.error('Error: ' + response.statusText);
		}
		return response.json();
	}).then(data => {
		if (data.status !== 'success') {
			throw new Error(data.message);
		}
		alert('Report Sent');
	}).catch(error => {
		console.error('Error: ' + error.message)
	});
}

function getReportedUsers() {
	showLoader();
	fetch(API_URL + 'report/get-all', {
		method: 'GET',
		headers: {
			'Content-Type': 'application/json',
			'Authorization': 'JWT ' + localStorage.getItem('accessToken') || ''
		}
	}).then(response => {
		if (!response.ok) {
			console.error('Error: ' + response.statusText);
		}
		return response.json();
	}).then(res => {
		if (res.status !== 'success') {
			throw new Error(res.message);
		}
		state.reportedUsers = res.data;
		populate();
	}).catch(error => {
		console.error('Error: ' + error.message)
	}).finally(() => {
		hideLoader();
	});
}

function getMyReport() {
	showLoader();
	infoDiv.innerHTML = '';
	infoDiv.classList.add('hidden');
	fetch(API_URL + 'report/mine', {
		method: 'GET',
		headers: {
			'Content-Type': 'application/json',
			'Authorization': 'JWT ' + localStorage.getItem('accessToken') || ''
		}
	}).then(response => {
		if (!response.ok) {
			alert('Error: ' + response.statusText);
		}
		return response.json();
	}).then(res => {
		if (res.status !== 'success') {
			throw new Error(res.message);
		}
		if (!res.data) return;
		let h3 = document.createElement('h3');
		h3.textContent = 'You are reported!';
		let p1 = document.createElement('p');
		p1.textContent = `Reason: ${res.data.reason}`;
		let p2 = document.createElement('p');
		p2.textContent = `Until: ${new Date(res.data.reportedUntil).toLocaleString()}`;
		infoDiv.appendChild(h3);
		infoDiv.appendChild(p1);
		infoDiv.appendChild(p2);
		infoDiv.classList.remove('hidden');
	}).catch(error => {
		alert('Error: ' + error.message)
	}).finally(() => {
		hideLoader();
		console.error('Error: ' + error.message)
	});
}

function vote() {
	let selected = document.querySelector('input[name="vote"]:checked');
	if (!selected) {
		alert('Please select a player to vote');
		return;
	}
	let playerId = selected.value;
	sendVote(getGameId(state.game, state.session), playerId)
		.then(() => {
			wrapper.querySelector('button').disabled = true;
		})
}

function getGameId(game, session) {
	const phase = Array.isArray(game.history[0])
		? game.history[0][0]
		: game.history[0];

	return phase.time + ":" + session;
}

function executeScript(scriptFunction, onResult) {
	chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
		const activeTab = tabs[0];
		if (!activeTab) return;

		if (!activeTab.url.includes('botc.app')) {
			throwErrorAndResetState('You must be on the Blood on the Clocktower website to use this extension.');
		} else {
			chrome.scripting.executeScript(
				{
					target: { tabId: activeTab.id },
					function: scriptFunction,
				},
				function(results) {
					onResult && onResult(results[0].result);
				}
			);
		}
	});
}
export function throwErrorAndResetState(text) {
	let errorText = document.createElement('div');
	errorText.textContent = text;
	wrapper.appendChild(errorText);
	errorText.classList.add('error');
	state = initialState;
}

function showLoader() {
	state.loaderCount++;
	if (state.loaderCount > 0) {
		loaderWrapper.classList.remove('hidden');
	}
}

function hideLoader() {
	state.loaderCount--;
	if (state.loaderCount <= 0) {
		loaderWrapper.classList.add('hidden');
	}
}

