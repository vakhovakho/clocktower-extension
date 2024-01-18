const observerOptions = {
	childList: true,
	subtree: true,
};

const observer = new MutationObserver(records => {
	for (let i = 0; i < records.length; i++) {
		let targetClasses = records[i].target.classList;
		if (targetClasses.contains('channel') || targetClasses.contains('list')) {
			let storytellerDivs = document.querySelectorAll('#whispers li.video.storyteller')
			for (let i = 0; i < storytellerDivs.length; i++) {
				let video = storytellerDivs[i].querySelector('video');
				if (video) {
					hideSTVideo(i);
					moveSTVideoFromWhisperAfterDelay(i, video);
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

function moveSTVideoFromWhisper(index, video) {
	console.log('moveSTVideoFromWhisper', index);
	let storyTellerDivsOutside = document.querySelectorAll('ul.storytellers li.storyteller')
	for (let i = 0; i < storyTellerDivsOutside.length; i++) {
		if (i === index) {
			console.log("aaaa");
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
				console.log("bbbb")
				chat.querySelector('.video')?.remove()
				chat.appendChild(videoDiv);
			}
			break;
		}
	}

}

function moveSTVideoFromWhisperAfterDelay(index, video) {
	setTimeout(moveSTVideoFromWhisper, 0, index, video);
}

function hideSTVideo(index) {
	let chats = document.querySelectorAll('ul.storytellers .storyteller')
	for (let i = 0; i < chats.length; i++) {
		if (i === index) {
			chats[i].querySelector('.video')?.remove()
		}
	}
}

