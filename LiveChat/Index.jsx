import React, { useEffect, useState } from 'react';
import { Head } from '@inertiajs/react';
import axios from 'axios';
import ChatForm from './ChatForm';

export default function Index() {
    const [messages, setMessages] = useState([]);

    const fetchMessages = async () => {
        try {
            const response = await axios.get('/api/chat');
            setMessages(response.data);
        } catch (error) {
            console.error('Error fetching chat messages:', error);
        }
    };

    useEffect(() => {
        fetchMessages();
    }, []);

    return (
        <div className="p-6 bg-white shadow rounded-md">
            <Head title="User Live Chat" />
            <h1 className="text-2xl font-bold mb-4">Live Chat</h1>
            <div className="border rounded-md p-4 h-96 overflow-y-auto">
                {messages.length > 0 ? (
                    messages.map((msg) => (
                        <div key={msg.id} className={`p-3 my-2 rounded ${msg.is_admin ? 'bg-blue-100' : 'bg-gray-100'}`}>
                            <strong>{msg.is_admin ? 'Admin' : 'You'}:</strong> {msg.message}
                        </div>
                    ))
                ) : (
                    <p>No messages yet.</p>
                )}
            </div>
            <ChatForm onMessageSent={fetchMessages} />
        </div>
    );
}
