import React, { useState, useEffect } from "react";
import axios from "axios";

function AdminChat() {
    const [messages, setMessages] = useState([]);
    const [reply, setReply] = useState("");
    const [selectedMessage, setSelectedMessage] = useState(null);

    useEffect(() => {
        fetchMessages();
    }, []);

    const fetchMessages = async () => {
        try {
            const response = await axios.get("/api/chat");
            setMessages(response.data);
        } catch (error) {
            console.error("Error fetching messages", error);
        }
    };

    const sendReply = async () => {
        if (!reply.trim() || !selectedMessage) return;

        try {
            await axios.post(`/api/chat/${selectedMessage.id}/reply`, {
                message: reply,
            });
            fetchMessages();
            setReply("");
        } catch (error) {
            console.error("Error sending reply", error);
        }
    };

    return (
        <div className="p-4 border rounded-md bg-white shadow-md">
            <h2 className="text-lg font-bold mb-2">Admin Chat Support</h2>
            <div className="h-60 overflow-y-auto border p-2 bg-gray-100">
                {messages.map((msg) => (
                    <div
                        key={msg.id}
                        className={`p-2 mb-2 border ${
                            selectedMessage?.id === msg.id
                                ? "bg-blue-100"
                                : "bg-gray-50"
                        }`}
                        onClick={() => setSelectedMessage(msg)}
                    >
                        <span className="font-semibold">{msg.user}: </span>
                        {msg.message}
                    </div>
                ))}
            </div>
            {selectedMessage && (
                <div className="mt-2">
                    <input
                        type="text"
                        value={reply}
                        onChange={(e) => setReply(e.target.value)}
                        className="border p-2 w-full"
                        placeholder="Type a reply..."
                    />
                    <button
                        onClick={sendReply}
                        className="bg-green-500 text-white px-4 py-2 mt-2 rounded"
                    >
                        Reply
                    </button>
                </div>
            )}
        </div>
    );
}

export default AdminChat;
