export async function loadStyles() {
	return fetch('https://raw.githubusercontent.com/vakhovakho/clocktower-online-georgia-public/main/custom-css.css')
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

export function throwErrorAndResetState(text) {
	wrapper.innerHTML = '';
	wrapper.textContent = text;
	wrapper.classList.add('error');
	state = initialState;
}

