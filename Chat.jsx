import React, { useState, useEffect } from "react";
import axios from "axios";

function Chat() {
    const [messages, setMessages] = useState([]);
    const [message, setMessage] = useState("");
    const [category, setCategory] = useState("technical_support");

    useEffect(() => {
        axios.get("http://localhost:8000/api/v1/chat")
            .then((response) => setMessages(response.data))
            .catch((error) => console.error(error));
    }, []);

    const sendMessage = async () => {
        const response = await axios.post("http://localhost:8000/api/v1/chat", {
            message,
            category
        }, {
            headers: { Authorization: `Bearer YOUR_ACCESS_TOKEN` }
        });

        setMessages([...messages, response.data]);
        setMessage("");
    };

    return (
        <div className="chat-container">
            <h2>Live Chat</h2>
            <select value={category} onChange={(e) => setCategory(e.target.value)}>
                <option value="return_request">Return Request</option>
                <option value="technical_support">Technical Support</option>
            </select>
            <div className="chat-box">
                {messages.map((msg) => (
                    <p key={msg.id} className={`message ${msg.category}`}>
                        {msg.message}
                    </p>
                ))}
            </div>
            <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type your message..."
            />
            <button onClick={sendMessage}>Send</button>
        </div>
    );
}

export default Chat;
