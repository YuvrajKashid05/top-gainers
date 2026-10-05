import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = path.dirname(fileURLToPath(import.meta.url));
export default defineConfig({ root: projectRoot, plugins: [react()], resolve: { alias: { '@': path.resolve(projectRoot, 'src') } }, server: { host: '127.0.0.1', port: 5173, strictPort: true, fs: { strict: true, allow: [projectRoot] }, proxy: { '/api': { target: 'http://127.0.0.1:5000', changeOrigin: true } } }, preview: { host: '127.0.0.1', port: 4173, strictPort: true }, build: { rollupOptions: { output: { manualChunks: { recharts: ['recharts'] } } } } });
