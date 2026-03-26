"use client";

import { useState } from "react";
import { marked } from "marked";
import "./globals.css";

export default function Home() {
  const [message, setMessage] = useState("");
  const [chat, setChat] = useState([]);
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!message.trim()) return;

    const userMsg = { role: "user", text: message };
    setChat((prev) => [...prev, userMsg]);
    setMessage("");
    setLoading(true);

    try {
      const res = await fetch(
        "https://mcp-python-app-production.up.railway.app/chat",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ user_input: message }),
        }
      );

      const data = await res.json();

      const botMsg = {
        role: "bot",
        text: data.answer || "No response",
      };

      setChat((prev) => [...prev, botMsg]);
    } catch (err) {
      setChat((prev) => [
        ...prev,
        { role: "bot", text: "⚠️ Error connecting to server" },
      ]);
    }

    setLoading(false);
  };

  return (
    <div className="container">
      <div className="header">🤖 AI DB Assistant</div>

      <div className="chat">
        {chat.map((msg, i) => (
          <div
            key={i}
            className={`message ${msg.role === "user" ? "user" : "bot"}`}
          >
            <div
              dangerouslySetInnerHTML={{
                __html: marked(msg.text),
              }}
            />
          </div>
        ))}

        {loading && (
          <div className="message bot">Typing...</div>
        )}
      </div>

      <div className="inputBox">
        <input
          className="input"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Ask something..."
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
        />
        <button className="button" onClick={sendMessage}>
          Send
        </button>
      </div>
    </div>
  );
}
