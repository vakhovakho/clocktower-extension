const fs = require('fs');
const path = require('path');

// Directory where Vite outputs the build files
const distDir = path.join(__dirname, 'dist');

// Function to find the built [name].js file
function findBuilJs(name) {
	const files = fs.readdirSync(distDir + '/assets');
	for (const file of files) {
		if (file.startsWith(name) && file.endsWith('.js')) {
			return './assets/' + file;
		}
	}
	throw new Error('Built [name].js not found');
}

// Function to update the manifest.json file
function updateManifest(builtJs, key) {
	console.log('Updating manifest.json...', builtJs);
	const manifestPath = path.join(distDir, 'manifest.json');
	const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));

	switch (key) {
		case 'content_scripts':
			manifest[key] = [
				{
					matches: ["https://botc.app/*"],
					js: [builtJs]
				}
			];
			break;
		case 'background':
			manifest[key].service_worker = builtJs;
			break;
		default:
			throw new Error('Invalid key');

	}

	// Update the path to [name].js in manifest.json

	fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
}

// Running the script
try {
	const builtContentJs = findBuilJs('content');
	updateManifest(builtContentJs, 'content_scripts');
	const builtBackgroundJs = findBuilJs('background');
	updateManifest(builtBackgroundJs, 'background');
	console.log('manifest.json updated successfully.');
} catch (error) {
	console.error('Error updating manifest.json:', error.message);
}

