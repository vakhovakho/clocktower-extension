const observerOptions = {
	childList: true,
	subtree: true,
};

const observer = new MutationObserver(records => {
	let stDivsInChat = document.querySelectorAll('#whispers li.video.storyteller');
	let stDivsOutside = document.querySelectorAll('ul.storytellers li.storyteller');
	for (let i = 0; i < stDivsOutside.length; i++) {
		let name = stDivsOutside[i].querySelector('div.name span')?.innerText;
		for (let j = 0; j < stDivsInChat.length; j++) {
			let inChatChat = stDivsInChat[j].querySelector('.chat');
			let inChatVideo = stDivsInChat[j].querySelector('.video');
			let inChatAudio = stDivsInChat[i].querySelector('.audio');
			let inChatNameDiv = stDivsInChat[j].querySelector('.name');
			let inChatTokenDiv = stDivsInChat[j].querySelector('.token');
			let inChatName = inChatNameDiv.innerText.trim();
			if (inChatName.startsWith(name)) {
				stDivsInChat[j].style.position = 'fixed';
				stDivsInChat[j].style.bottom = '106px';
				stDivsInChat[j].style.width = 'min(26vw, 26vh)';
				stDivsInChat[j].style[i === 0 ? 'left' : 'right'] = '80px';
				inChatChat.style.borderRadius = '50%';
				inChatVideo.style.borderRadius = '50%';
				inChatVideo.style.borderColor = '#6fbc6f';

				inChatNameDiv.style.display = 'none';
				inChatTokenDiv.style.display = 'none';
				inChatAudio.style.display = 'none';
				break;
			}
		}
	}
});


export function startCenterObserver() {
	let interval = setInterval(() => {
		const center = document.getElementById('center')
		if (center) {
			observer.observe(center, observerOptions);
			clearInterval(interval);
		}
	}, 2000);
}

export function stopCenterObserver() {
	observer.disconnect();
}

