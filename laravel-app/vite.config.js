import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import react from '@vitejs/plugin-react';

export default defineConfig({
    plugins: [
        laravel({
            input: 'resources/js/app.jsx',
            refresh: true,
        }),
        react(),
    ],
    build: {
        // Chỉ định thư mục output
        outDir: 'public/build',
        // Đảm bảo manifest được tạo
        manifest: true,
    }
});
