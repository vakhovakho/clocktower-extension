export async function loadStyles() {
	const cssURL = chrome.runtime.getURL('custom-css.css');
	return fetch(cssURL)
		.then(response => response.text())
		.then(css => {
			let currentStyle = document.getElementById('mastermind-style');
			if (currentStyle) {
				currentStyle.remove();
			}
			var style = document.createElement('style');
			style.id = 'mastermind-style';
			style.type = 'text/css';
			style.innerHTML = css;
			document.head.appendChild(style);
		})
}


