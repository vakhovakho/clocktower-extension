
function showSTs() {
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

function showSTsAfterDelay() {
	setTimeout(showSTs, 0);
}

function hideSTs() {
	let chats = document.querySelectorAll('ul.storytellers .storyteller .chat')
	for (let i = 0; i < chats.length; i++) {
		chats[i].querySelector('.video')?.remove()
	}
}

const channels = document.getElementById('channels')
const observerOptions = {
	childList: true,
	subtree: true,
};

const observer = new MutationObserver((records, observer) => {
	for (let i = 0; i < records.length; i++) {
		let targetClasses = records[i].target.classList;
		if (targetClasses.contains('channel') || targetClasses.contains('list')) {
			hideSTs();
			showSTsAfterDelay();
		}
	}
});
observer.observe(channels, observerOptions);
