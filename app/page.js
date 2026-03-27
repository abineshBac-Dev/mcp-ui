"use client";

import { useState, useEffect, useRef } from "react";
import { marked } from "marked";
import "./globals.css";

export default function Home() {
  const [message, setMessage] = useState("");
  const [chats, setChats] = useState([
    { id: 1, messages: [] }
  ]);
  const [activeChat, setActiveChat] = useState(0);
  const [loading, setLoading] = useState(false);

  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chats]);

  const sendMessage = async () => {
    if (!message.trim()) return;

    const updatedChats = [...chats];
    updatedChats[activeChat].messages.push({
      role: "user",
      text: message,
    });

    setChats(updatedChats);
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

      // 🔥 Streaming-like effect
      let text = data.answer || "No response";
      let current = "";

      for (let i = 0; i < text.length; i++) {
        current += text[i];

        updatedChats[activeChat].messages = [
          ...updatedChats[activeChat].messages.filter(m => m.role !== "typing"),
          { role: "typing", text: current }
        ];

        setChats([...updatedChats]);
        await new Promise(r => setTimeout(r, 10));
      }

      updatedChats[activeChat].messages.pop();

      updatedChats[activeChat].messages.push({
        role: "bot",
        text: text,
        tool: data.tool_used,
      });

      setChats([...updatedChats]);

    } catch (err) {
      updatedChats[activeChat].messages.push({
        role: "bot",
        text: "⚠️ Error connecting to server",
      });
      setChats([...updatedChats]);
    }

    setLoading(false);
  };

  const newChat = () => {
    setChats([...chats, { id: Date.now(), messages: [] }]);
    setActiveChat(chats.length);
  };

  const currentMessages = chats[activeChat].messages;

  return (
    <div className="app">

      {/* Sidebar */}
      <div className="sidebar">
        <button className="newChat" onClick={newChat}>
          + New Chat
        </button>

        {chats.map((chat, i) => (
          <div
            key={chat.id}
            className="chatItem"
            onClick={() => setActiveChat(i)}
          >
            Chat {i + 1}
          </div>
        ))}
      </div>

      {/* Main */}
      <div className="main">
        <div className="header">🤖 AI DB Assistant</div>

        <div className="chat">
          {currentMessages.map((msg, i) => (
            <div
              key={i}
              className={`message ${
                msg.role === "user"
                  ? "user"
                  : msg.role === "bot"
                  ? "bot"
                  : "bot"
              }`}
            >
              <div
                dangerouslySetInnerHTML={{
                  __html: marked(msg.text),
                }}
              />

              {msg.tool && (
                <div className="tool">⚙️ Used: {msg.tool}</div>
              )}
            </div>
          ))}

          {loading && (
            <div className="message bot typing">
              <span></span>
              <span></span>
              <span></span>
            </div>
          )}

          <div ref={chatEndRef} />
        </div>

        <div className="inputBox">
          <input
            className="input"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Ask anything..."
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          />
          <button className="button" onClick={sendMessage}>
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
