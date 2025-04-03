import '../css/app.css';
import './bootstrap';

import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { createRoot } from 'react-dom/client';
import { CartProvider } from '@/Contexts/CartContext';
import { WishlistProvider } from '@/Contexts/WishlistContext';
import { router } from '@inertiajs/react';

// Biến toàn cục để lưu API key
let globalApiKey = '';

const appName = import.meta.env.VITE_APP_NAME || 'Laravel';

// Đăng ký sự kiện before ở cấp độ toàn cục
router.on('before', (event) => {
    console.log('Before event triggered for URL:', event.detail.visit.url);
    if (globalApiKey) {
        event.detail.visit.headers['X-API-KEY'] = globalApiKey;
        console.log('Adding X-API-KEY header:', globalApiKey);
    } else {
        console.log('No API key available, skipping X-API-KEY header');
    }
});

createInertiaApp({
    title: (title) => `${title} - ${appName}`,
    resolve: (name) =>
        resolvePageComponent(
            `./Pages/${name}.jsx`,
            import.meta.glob('./Pages/**/*.jsx'),
        ),
    setup({ el, App, props }) {
        // Lấy API key từ props
        globalApiKey = props.initialPage.props.auth?.user?.api_key || '';
        console.log('API Key in app.jsx:', globalApiKey);

        const root = createRoot(el);

        root.render(
            <CartProvider>
                <WishlistProvider>
                    <App {...props} />
                </WishlistProvider>
            </CartProvider>
        );
    },
    progress: {
        color: '#4B5563',
    },
});
