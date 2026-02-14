import React, { useEffect, useState } from "react";
import { io } from "socket.io-client";

const socket = io("http://localhost:5000", { withCredentials: true });

const Chat = () => {
  const [user, setUser] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);

  // ✅ Socket listeners (register once)
  useEffect(() => {
    socket.on("connect", () => {
      console.log("Connected to WebSocket:", socket.id);
    });

    socket.on("newMessage", (msg) => {
      if (msg.conversationId === activeConversation) {
        setMessages((prev) => [...prev, msg]);
      } else {
        // Update sidebar unread badge
        setConversations((prev) =>
          prev.map((c) =>
            c._id === msg.conversationId
              ? { ...c, unreadCount: (c.unreadCount || 0) + 1 }
              : c
          )
        );
      }
    });

    socket.on("messagesUpdated", (msgs) => {
      if (activeConversation && msgs[0]?.conversationId === activeConversation) {
        setMessages(msgs);
      }
    });


    socket.on("conversationUpdated", ({ conversationId }) => {
      fetch("http://localhost:5000/api/users/conversations", {
        credentials: "include",
      })
        .then((res) => res.json())
        .then((data) => setConversations(data));
    });

    return () => {
      socket.off("newMessage");
      socket.off("conversationUpdated");
      // ❌ don’t disconnect here, keep socket alive
    };
  }, [activeConversation]); // you can also use [] if you don’t need activeConversation inside

  // ✅ Fetch user + conversations initially
  useEffect(() => {
    const fetchUser = async () => {
      const res = await fetch("http://localhost:5000/api/auth/me", {
        credentials: "include",
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data);
      }
    };
    fetchUser();

    const fetchConversations = async () => {
      const res = await fetch("http://localhost:5000/api/users/conversations", {
        credentials: "include",
      });
      const data = await res.json();
      setConversations(data);

      // ✅ Join all conversations this user participates in
      data.forEach((conv) => {
        socket.emit("joinConversation", conv._id);
      });
    };
    fetchConversations();
  }, []);

  const handleSearch = async (e) => {
    e.preventDefault();
    const res = await fetch(
      `http://localhost:5000/api/users/search?q=${searchQuery}`,
      { credentials: "include" }
    );
    const data = await res.json();
    setSearchResults(data);
  };

  // ✅ Open conversation + mark as read
  const openConversation = async (id) => {
    setActiveConversation(id);
    socket.emit("joinConversation", id);

    await fetch(`http://localhost:5000/api/users/messages/read/${id}`, {
      method: "PUT",
      credentials: "include",
    });

    const res = await fetch(`http://localhost:5000/api/users/messages/${id}`, {
      credentials: "include",
    });
    const data = await res.json();
    setMessages(data);

    const convRes = await fetch("http://localhost:5000/api/users/conversations", {
      credentials: "include",
    });
    const convData = await convRes.json();
    setConversations(convData);
  };

  // ✅ Optimistic update when sending
  const handleSend = (e) => {
    e.preventDefault();
    if (!input.trim() || !activeConversation) return;

    socket.emit("sendMessage", {
      conversationId: activeConversation,
      senderId: user._id,
      text: input,
    });

    setInput("");
  };

  const handleLogout = async () => {
    await fetch("http://localhost:5000/api/auth/logout", {
      method: "POST",
      credentials: "include",
    });
    window.location.href = "/";
  };

  const startConversation = async (recipientId) => {
    const res = await fetch("http://localhost:5000/api/users/conversations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ recipientId }),
    });
    const conv = await res.json();
    setActiveConversation(conv._id);

    const msgRes = await fetch(
      `http://localhost:5000/api/users/messages/${conv._id}`,
      { credentials: "include" }
    );
    const msgs = await msgRes.json();
    setMessages(msgs);

    if (!conversations.find((c) => c._id === conv._id)) {
      setConversations([...conversations, conv]);
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-1/4 bg-gradient-to-b from-blue-500 to-purple-600 text-white flex flex-col p-6">
        <h2 className="text-2xl font-bold mb-6">Aknthart</h2>
        {user && <p className="mb-4">Logged in as <strong>{user.username}</strong></p>}

        {/* Search */}
        <form onSubmit={handleSearch} className="mb-4">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search people..."
            className="w-full px-3 py-2 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </form>
        <div className="mb-6">
          {searchResults.map((u) => (
            <div
              key={u._id}
              onClick={() => startConversation(u._id)}
              className="p-2 bg-white/10 rounded-lg mb-2 cursor-pointer hover:bg-white/20"
            >
              <p>{u.username} ({u.email})</p>
            </div>
          ))}
        </div>

        {/* Conversations */}
        <div className="flex-1 overflow-y-auto">
          {conversations.map((conv) => {
            if (!user) return null;
            const otherUser = conv.participants?.find(p => p._id !== user._id);

            return (
              <div
                key={conv._id}
                onClick={() => openConversation(conv._id)}
                className={`flex items-center justify-between p-2 rounded-lg mb-2 cursor-pointer hover:bg-white/20 ${activeConversation === conv._id ? "bg-white/20" : ""}`}
              >
                <p>{otherUser?.username || user.username}</p>
                {conv.unreadCount > 0 && (
                  <span className="ml-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                    {conv.unreadCount}
                  </span>
                )}
              </div>
            );
          })}
        </div>

        <button
          onClick={handleLogout}
          className="bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded-lg mt-4"
        >
          Logout
        </button>
      </div>

      {/* Chat Window */}
      <div className="flex-1 flex flex-col">
        <div className="flex-1 p-6 overflow-y-auto">
          {messages.length === 0 ? (
            <p className="text-gray-500">No messages yet. Select a conversation.</p>
          ) : (
            messages.map((msg, idx) => {
              const isOwnMessage = msg.sender?._id === user?._id || msg.sender?.username === user?.username;
              return (
                <div
                  key={idx}
                  className={`flex mb-2 ${isOwnMessage ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`px-4 py-2 rounded-lg max-w-xs ${
                      isOwnMessage
                        ? "bg-purple-600 text-white rounded-br-none"
                        : "bg-gray-200 text-gray-800 rounded-bl-none"
                    }`}
                  >
                    <span>{msg.text}</span>
                    {isOwnMessage && (
                      <div className="text-xs mt-1 text-gray-300">
                        {msg.read ? "✓✓ Read" : "✓ Sent"}
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {activeConversation && (
          <form onSubmit={handleSend} className="flex p-4 bg-white border-t">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type a message..."
              className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <button
              type="submit"
              className="ml-2 px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
            >
              Send
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default Chat;