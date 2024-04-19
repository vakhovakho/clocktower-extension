import { defineConfig } from 'vite';
import babel from '@rollup/plugin-babel';

export default defineConfig({
	build: {
		emptyOutDir: false,
		rollupOptions: {
			plugins: [
				babel({
					babelHelpers: 'bundled',
					presets: [['@babel/preset-env', { targets: "defaults" }]]
				})
			],
			input: {
				background: './src/background.js',
			},
			output: {
				dir: 'dist',
			}
		}
	}
});

