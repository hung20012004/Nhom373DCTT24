import '../css/app.css';
import './bootstrap';

import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { createRoot } from 'react-dom/client';
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import AdminDashboard from "./Pages/Dashboard";
import LiveChat from "./Pages/Admin/LiveChat/Index";
import LiveChatUser from "./Pages/LiveChat/Index";

const appName = import.meta.env.VITE_APP_NAME || 'Laravel';

createInertiaApp({
    title: (title) => `${title} - ${appName}`,
    resolve: (name) =>
        resolvePageComponent(
            `./Pages/${name}.jsx`,
            import.meta.glob('./Pages/**/*.jsx'),
        ),
    setup({ el, App, props }) {
        const root = createRoot(el);

        root.render(
            <Router>
                <Routes>
                    <Route path="/admin" element={<AdminDashboard />} />
                    <Route path="/admin/live-chat" element={<LiveChat />} />
                    <Route path="/live-chat" element={<LiveChatUser />} />
                </Routes>
                <App {...props} />
            </Router>
        );
    },
    progress: {
        color: '#4B5563',
    },
});
