const channels = document.getElementById('channels')
const observerOptions = {
	childList: true,
	subtree: true,
};

const observer = new MutationObserver(records => {
	for (let i = 0; i < records.length; i++) {
		if (records[i].target.classList.contains('channel')) {
			hideSTVideos();
			moveSTVideoFromWhisperAfterDelay();
		}
	}
});

export function startChannelsObserver() {
	observer.observe(channels, observerOptions);
}

export function stopChannelsObserver() {
	observer.disconnect();
}

function moveSTVideoFromWhisper() {
	let storytellerDivs = document.querySelectorAll('#whispers li.video.storyteller')
	let chats = document.querySelectorAll('ul.storytellers .storyteller .chat')

	for (let i = 0; i < storytellerDivs.length; i++) {

		let video = storytellerDivs[i].querySelector('video');
		if (video) {
			let newVideo = document.createElement('video')
			newVideo.autoplay = true;
			newVideo.playsInline = true;
			newVideo.disablePictureInPicture = true;
			newVideo.disableRemotePlayback = true;
			newVideo.srcObject = video.srcObject;
			let videoDiv = document.createElement('div')

			videoDiv.classList.add('video')

			videoDiv.appendChild(newVideo);
			chats[i].querySelector('.video')?.remove()
			chats[i].appendChild(videoDiv);
		}
	}
}

function moveSTVideoFromWhisperAfterDelay() {
	setTimeout(moveSTVideoFromWhisper, 0);
}

function hideSTVideos() {
	let chats = document.querySelectorAll('ul.storytellers .storyteller .chat')
	for (let i = 0; i < chats.length; i++) {
		chats[i].querySelector('.video')?.remove()
	}
}

