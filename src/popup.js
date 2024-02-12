import { jwtDecode } from "jwt-decode";
import { LOAD_STYLES, UNLOAD_STYLES } from "./actions";
import { API_URL } from "./env";

let PLAYER_TYPE = {
	PLAYER: 'player',
	STORYTELLER: 'storyteller',
	SPECTATOR: 'spectator'
}

let initialState = {
	loggedIn: false,
	bocToken: null,
	bocId: null,
	userType: null,
	players: [],
	storytellers: [],
	spectators: [],
};

let state = initialState;
let wrapper = document.querySelector('.wrapper');
let styleCheckbox = document.getElementById('style');

chrome.storage.local.get(['styleLoaded'], function(result) {
	if (result.styleLoaded) {
		styleCheckbox.checked = true;
	}
});

styleCheckbox.addEventListener('change', function() {
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
});

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
			playerNames: [...document.querySelectorAll('.nameplate span')].map(span => span.textContent),
		};
	},
	function(result) {
		main(result);
	}
);


function main({ token, game, players, storytellers, playerNames }) {
	if (!token) {
		throwErrorAndResetState('You must be logged in to rate players.');
		return;
	}

	let accessToken = localStorage.getItem('accessToken');

	state.loggedIn = Boolean(accessToken);
	state.bocToken = token;
	state.bocId = jwtDecode(token).id;
	state.game = game;
	state.players = players;
	state.storytellers = storytellers;
	state.playerNames = playerNames;

	if (players.find(player => player.id === state.bocId)) {
		state.userType = PLAYER_TYPE.PLAYER;
	} else {
		if (storytellers.find(st => st.id === state.bocId)) {
			state.userType = PLAYER_TYPE.STORYTELLER;
		}
	}

	if (!state.userType) {
		throwErrorAndResetState('You must be a player or storyteller to rate players.');
		return;
	}

	if (game.history[game.history.length - 1].type !== 'end') {
		throwErrorAndResetState('The game must be over to rate players.');
		return;
	}

	if (localStorage.getItem('lastVote') && Number(localStorage.getItem('lastVote')) > Date.now() - 1000 * 60 * 30) {
		throwErrorAndResetState('You can rate players once in every 30 minutes.');
		return;
	}

	if (!accessToken) {
		showAuth();
	} else {
		populate();
	}
}

function showAuth() {
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
			if (!response.ok) {
				alert('something went wrong');
			}
			return response.json();
		})
		.then(data => {
			localStorage.setItem('accessToken', data.accessToken);
			populate();
		})
		.catch(error => {
			alert('something went wrong: ' + error.message)
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
			if (!response.ok) {
				alert('something went wrong');
			}
			return response.json();
		})
		.then(data => {
			populate();
			localStorage.setItem('accessToken', data.accessToken);
		})
		.catch(error => {
			alert('something went wrong: ' + error.message)
		});

}

function logout() {
	localStorage.removeItem('accessToken');
	showAuth();
}

function populate() {
	wrapper.innerHTML = '';
	let logoutElement = document.createElement('span');
	logoutElement.classList.add('logout');
	logoutElement.textContent = 'Logout';
	logoutElement.addEventListener('click', logout);
	wrapper.appendChild(logoutElement);

	for (let index in state.players) {
		let playerId = state.players[index];
		let playerName = state.playerNames[index];

		let playerDiv = document.createElement('div');
		playerDiv.classList.add('player');

		let label = document.createElement('label');
		label.setAttribute('for', playerId + index);
		label.textContent = playerName;

		let input = document.createElement('input');
		input.type = 'radio';
		input.setAttribute('name', 'vote');
		input.id = playerId + index;


		playerDiv.appendChild(label);
		playerDiv.appendChild(input);
		wrapper.appendChild(playerDiv);
	}

	let button = document.createElement('button');
	button.textContent = 'Submit';
	button.addEventListener('click', submit);

	wrapper.appendChild(button);
}

function submit() {
	executeScript(
		function() {
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
		},
		function(result) {
			localStorage.setItem('lastVote', Date.now());
			console.log(result);
		}
	)
	success();
}

function success() {
}

function executeScript(scriptFunction, onResult) {
	chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
		const activeTab = tabs[0];
		if (!activeTab) return;

		if (!activeTab.url.includes('online.bloodontheclocktower.com')) {
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
	wrapper.innerHTML = '';
	wrapper.textContent = text;
	wrapper.classList.add('error');
	state = initialState;
}
