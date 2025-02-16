import React from 'react';
import { Head } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import KanbanBoard from './KanbanBoard';

export default function Index() {
    return (
        <AdminLayout>
            <Head title="Live Chat Support" />
            <div className="p-6 bg-white shadow rounded-md">
                <h1 className="text-2xl font-bold mb-4">Live Chat Support</h1>
                <KanbanBoard />
            </div>
        </AdminLayout>
    );
}