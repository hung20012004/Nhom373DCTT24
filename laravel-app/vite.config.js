import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import react from '@vitejs/plugin-react';

export default defineConfig({
    plugins: [
        laravel({
            input: 'resources/js/app.jsx',
            refresh: true,
            // Thêm cấu hình này để Laravel biết vị trí build
            buildDirectory: '../../public_html/build'
        }),
        react(),
    ],
    build: {
        outDir: '../public_html/build',
        assetsDir: '',
        manifest: true,
        rollupOptions: {
            output: {
                manualChunks: undefined
            }
        }
    }
});
