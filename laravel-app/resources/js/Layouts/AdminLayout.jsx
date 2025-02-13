import React from 'react';
import Sidebar from '@/Components/Admin/Sidebar';
import Header from '@/Components/Admin/Header';
import { usePage, Head } from '@inertiajs/react';

export default function AdminLayout({ children }) {
    const { auth } = usePage().props;

    return (
        <div className="flex min-h-screen bg-gray-100">
            <Head>
                <title>Admin Panel</title>
                <meta name="description" content="Admin Dashboard" />
                <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            </Head>
            <Sidebar />

            <div className="flex-1">
                <Header user={auth.user} />
                <main className="p-6">
                    {children}
                </main>
            </div>
        </div>
    );
}
