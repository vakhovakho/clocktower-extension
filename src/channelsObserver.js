const observerOptions = {
	childList: true,
	subtree: true,
};

const observer = new MutationObserver(records => {
	for (let i = 0; i < records.length; i++) {
		let targetClasses = records[i].target.classList;
		if (targetClasses.contains('channel') || targetClasses.contains('list')) {
			let stNames = document.querySelectorAll('#whispers li.video.storyteller .name');
			for (let i = 0; i < stNames.length; i++) {
				let video = stNames[i].querySelector('video');
				let name = stNames[i].innerText;
				if (video && name) {
					hideSTVideo(name.trim());
					moveSTVideoFromWhisperAfterDelay(name, video);
				}
			}
			break;
		}
	}
});

export function startChannelsObserver() {
	let interval = setInterval(() => {
		const channels = document.getElementById('channels')
		if (channels) {
			observer.observe(channels, observerOptions);
			clearInterval(interval);
		}
	}, 2000);
}

export function stopChannelsObserver() {
	observer.disconnect();
}

function moveSTVideoFromWhisper(name, video) {
	console.log('moveSTVideoFromWhisper', name);
	let storyTellerDivsOutside = document.querySelectorAll('ul.storytellers li.storyteller')
	for (let i = 0; i < storyTellerDivsOutside.length; i++) {
		let bottomName = storyTellerDivsOutside[i].querySelector('div.name span')?.innerText;
		if (name.startsWith(bottomName)) {
			let newVideo = document.createElement('video')
			newVideo.autoplay = true;
			newVideo.playsInline = true;
			newVideo.disablePictureInPicture = true;
			newVideo.disableRemotePlayback = true;
			newVideo.srcObject = video.srcObject;
			let videoDiv = document.createElement('div')

			videoDiv.classList.add('video')

			videoDiv.appendChild(newVideo);
			let chat = storyTellerDivsOutside[i].querySelector('.chat');
			if (chat) {
				chat.querySelector('.video')?.remove()
				chat.appendChild(videoDiv);
			}
			break;
		}
	}

}

function moveSTVideoFromWhisperAfterDelay(name, video) {
	setTimeout(moveSTVideoFromWhisper, 200, name, video);
}

function hideSTVideo(index) {
	let chats = document.querySelectorAll('ul.storytellers .storyteller')
	for (let i = 0; i < chats.length; i++) {
		if (i === index) {
			chats[i].querySelector('.video')?.remove()
		}
	}
}

