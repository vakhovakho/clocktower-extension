let PLAYER_TYPE = {
	PLAYER: 'player',
	STORYTELLER: 'storyteller',
	SPECTATOR: 'spectator'
}

let initialState = {
	userId: null,
	userType: null,
	players: [],
	storytellers: [],
	spectators: [],
};

let state = initialState;
let wrapper = document.querySelector('.wrapper');


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


function throwErrorAndResetState(text) {
	wrapper.innerHTML = '';
	wrapper.textContent = text;
	wrapper.classList.add('error');
	state = initialState;
}

function onStorageChange(storage) {
	console.log(storage);
	console.log("changed!");
}

function main({ token, game, players, storytellers, playerNames }) {
	if (!token) {
		throwErrorAndResetState('You must be logged in to use this extension.');
		return;
	}

	state.userId = jwtDecode(token).id;
	state.game = game;
	state.players = players;
	state.storytellers = storytellers;
	state.playerNames = playerNames;

	if (players.find(player => player.id === state.userId)) {
		state.userType = PLAYER_TYPE.PLAYER;
	} else {
		if (storytellers.find(st => st.id === state.userId)) {
			state.userType = PLAYER_TYPE.STORYTELLER;
		}
	}

	if (!state.userType) {
		throwErrorAndResetState('You must be a player or storyteller to use this extension.');
		return;
	}

	if (game.history[game.history.length - 1].type !== 'end') {
		throwErrorAndResetState('The game must be over to use this extension.');
		return;
	}

	if(localStorage.getItem('lastVote') && Number(localStorage.getItem('lastVote')) > Date.now() - 1000 * 60 * 30) {
		throwErrorAndResetState('You can only use this extension once every 30 minutes.');
		return;
	}

	populate();

}

function populate() {
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
					onResult(results[0].result);
				}
			);
		}
	});
}
