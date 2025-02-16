import React, { useState } from 'react';
import axios from 'axios';

export default function ChatForm({ onMessageSent }) {
    const [message, setMessage] = useState('');
    const [category, setCategory] = useState('support');

    const predefinedMessages = {
        support: 'I need technical support',
        return: 'I want to return an item',
    };

    const sendMessage = async (e) => {
        e.preventDefault();
        if (!message.trim()) return;

        try {
            await axios.post('/api/chat', { message, category, is_admin: true });
            setMessage('');
            onMessageSent();
        } catch (error) {
            console.error('Error sending message:', error);
        }
    };

    return (
        <form onSubmit={sendMessage} className="mt-4">
            <select
                value={category}
                onChange={(e) => {
                    setCategory(e.target.value);
                    setMessage(predefinedMessages[e.target.value]);
                }}
                className="p-2 border rounded mr-2"
            >
                <option value="support">Support</option>
                <option value="return">Return Request</option>
            </select>
            <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="p-2 border rounded w-2/3"
                placeholder="Type a message..."
            />
            <button type="submit" className="ml-2 bg-blue-500 text-white px-4 py-2 rounded">
                Send
            </button>
        </form>
    );
}
