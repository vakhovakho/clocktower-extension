import { defineConfig } from 'vite';
import babel from '@rollup/plugin-babel';

export default defineConfig({
	build: {
		rollupOptions: {
			ex: 'index.html',
			plugins: [
				babel({
					babelHelpers: 'bundled',
					presets: [['@babel/preset-env', { targets: "defaults" }]]
				})
			],
			input: {
				index: 'index.html',
			},
			output: {
				dir: 'dist',
			}
		}
	}
});

