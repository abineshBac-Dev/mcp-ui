"use client";
import { useState } from "react";

export default function Home() {
  const [message, setMessage] = useState("");
  const [chat, setChat] = useState([]);

  const sendMessage = async () => {
    if (!message) return;

    const userMsg = { role: "user", text: message };
    setChat([...chat, userMsg]);

    const res = await fetch("https://mcp-python-app-production.up.railway.app/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ user_input: message }),
    });

    const data = await res.json();

    const botMsg = {
      role: "bot",
      text: JSON.stringify(data),
    };

    setChat((prev) => [...prev, botMsg]);
    setMessage("");
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>AI DB Assistant</h1>

      <div style={{ marginBottom: "20px" }}>
        {chat.map((msg, i) => (
          <div key={i}>
            <b>{msg.role}:</b> {msg.text}
          </div>
        ))}
      </div>

      <input
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Ask something..."
      />
      <button onClick={sendMessage}>Send</button>
    </div>
  );
}
