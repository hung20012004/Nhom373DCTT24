import React from 'react';
import { usePage, useForm } from '@inertiajs/react';
import Layout from '@/Layouts/Layout';

export default function ApiKey({ apiKey }) {
    const { flash } = usePage().props;
    const { post } = useForm();

    const handleRegenerate = () => {
        post(route('api-key.regenerate'), {
            onSuccess: () => {
                console.log('API key regenerated');
            },
        });
    };

    return (
        <Layout
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">API Key</h2>}
        >
            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900">
                            <p><strong>Your API Key:</strong> {apiKey}</p>
                            {flash.success && <p className="text-green-600">{flash.success}</p>}
                            <button
                                onClick={handleRegenerate}
                                className="mt-4 bg-blue-500 text-white px-4 py-2 rounded"
                            >
                                Regenerate API Key
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
}
