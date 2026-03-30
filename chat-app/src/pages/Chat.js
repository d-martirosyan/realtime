import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
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
  const [selectedFile, setSelectedFile] = useState(null);
  const fileInputRef = useRef(null);
  const messagesEndRef = useRef(null);
  const [isUploading, setIsUploading] = useState(false);
  const navigate = useNavigate();

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

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
  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() && !selectedFile) return;
    if (!activeConversation) return;

    let fileUrl = "";
    let fileName = "";
    let fileType = "";

    if (selectedFile) {
      setIsUploading(true);
      const formData = new FormData();
      formData.append("file", selectedFile);

      try {
        const res = await fetch("http://localhost:5000/api/users/upload", {
          method: "POST",
          credentials: "include",
          body: formData
        });
        const data = await res.json();
        
        if (res.ok) {
          fileUrl = data.fileUrl;
          fileName = data.fileName;
          fileType = data.fileType;
        }
      } catch (err) {
        console.error("Upload failed", err);
      }
      setIsUploading(false);
    }

    socket.emit("sendMessage", {
      conversationId: activeConversation,
      senderId: user._id,
      text: input,
      fileUrl,
      fileName,
      fileType
    });

    setInput("");
    setSelectedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
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
    <div className="flex h-screen bg-gray-50 dark:bg-darkBg font-sans transition-colors duration-300">
      {/* Sidebar */}
      <div className="w-1/4 bg-white dark:bg-darkCard border-r border-gray-200 dark:border-slate-800 flex flex-col p-6 transition-colors duration-300 shadow-xl z-10">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400">Aknthart</h2>
          <button onClick={() => navigate("/settings")} className="text-gray-500 hover:text-purple-600 dark:text-gray-400 dark:hover:text-purple-400 transition transform hover:rotate-90" title="Settings">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>
        </div>
        {user && (
          <div className="flex items-center mb-6 p-3 bg-gray-50 dark:bg-darkInput rounded-xl border border-gray-100 dark:border-slate-700">
            {user.avatar ? (
              <img src={`http://localhost:5000${user.avatar}`} alt="You" className="w-10 h-10 rounded-full object-cover border-2 border-purple-500" />
            ) : (
              <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-300 flex items-center justify-center font-bold border-2 border-purple-300 dark:border-purple-600">
                {user.username.charAt(0).toUpperCase()}
              </div>
            )}
            <div className="ml-3">
              <p className="text-sm text-gray-500 dark:text-gray-400">Logged in as</p>
              <p className="font-semibold text-gray-900 dark:text-gray-100">{user.username}</p>
            </div>
          </div>
        )}

        {/* Search */}
        <form onSubmit={handleSearch} className="mb-4">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search people..."
            className="w-full px-4 py-2 bg-gray-50 dark:bg-darkInput border border-gray-200 dark:border-slate-700 rounded-lg text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors"
          />
        </form>
        <div className="mb-4">
          {searchResults.map((u) => (
            <div
              key={u._id}
              onClick={() => startConversation(u._id)}
              className="flex items-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg mb-2 cursor-pointer hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors border border-blue-100 dark:border-blue-900/30"
            >
              {u.avatar ? (
                <img src={`http://localhost:5000${u.avatar}`} alt="Avatar" className="w-8 h-8 rounded-full object-cover mr-3" />
              ) : (
                <div className="w-8 h-8 rounded-full bg-blue-200 dark:bg-blue-800 text-blue-700 dark:text-blue-200 flex items-center justify-center font-bold mr-3">{u.username.charAt(0).toUpperCase()}</div>
              )}
              <div>
                <p className="text-gray-900 dark:text-gray-100 font-medium">{u.username}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{u.email}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Conversations */}
        <div className="flex-1 overflow-y-auto pr-2 space-y-2">
          {conversations.map((conv) => {
            if (!user) return null;
            const otherUser = conv.participants?.find(p => p._id !== user._id);
            if (!otherUser) return null;

            return (
              <div
                key={conv._id}
                onClick={() => openConversation(conv._id)}
                className={`flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all border ${
                  activeConversation === conv._id 
                  ? "bg-purple-100 dark:bg-purple-900/40 border-purple-200 dark:border-purple-700/50 shadow-sm" 
                  : "bg-transparent hover:bg-gray-50 dark:hover:bg-darkInput border-transparent"
                }`}
              >
                <div className="flex items-center">
                  {otherUser.avatar ? (
                    <img src={`http://localhost:5000${otherUser.avatar}`} alt="Avatar" className="w-10 h-10 rounded-full object-cover shadow-sm bg-white" />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 dark:from-slate-700 dark:to-slate-600 flex items-center justify-center font-bold text-gray-600 dark:text-gray-300 shadow-sm">
                      {otherUser.username.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <p className={`ml-3 font-medium ${activeConversation === conv._id ? "text-purple-700 dark:text-purple-300" : "text-gray-700 dark:text-gray-300"}`}>
                    {otherUser.username}
                  </p>
                </div>
                {conv.unreadCount > 0 && (
                  <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full shadow-sm font-bold animate-pulse">
                    {conv.unreadCount}
                  </span>
                )}
              </div>
            );
          })}
        </div>

        <button
          onClick={handleLogout}
          className="mt-6 flex items-center justify-center py-2 px-4 rounded-lg text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/40 border border-red-100 dark:border-red-900/30 font-medium transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          Logout
        </button>
      </div>

      {/* Chat Window */}
      <div className="flex-1 flex flex-col relative">
        <div className="flex-1 p-6 overflow-y-auto bg-slate-50 dark:bg-darkBg/95">
          {messages.length === 0 ? (
            <div className="flex h-full items-center justify-center text-gray-400 dark:text-gray-500">
              <p className="text-lg">No messages yet. Select a conversation to start chatting.</p>
            </div>
          ) : (
            <div className="max-w-4xl mx-auto w-full">
              {messages.map((msg, idx) => {
                const isOwnMessage = msg.sender?._id === user?._id || msg.sender?.username === user?.username;
                return (
                  <div
                    key={idx}
                    className={`flex items-end mb-4 ${isOwnMessage ? "justify-end" : "justify-start"}`}
                  >
                    {!isOwnMessage && (
                      <div className="mr-2 mb-1 flex-shrink-0">
                        {msg.sender?.avatar ? (
                          <img src={`http://localhost:5000${msg.sender.avatar}`} alt="Avatar" className="w-8 h-8 rounded-full object-cover shadow-sm bg-white" />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 dark:from-slate-700 dark:to-slate-600 flex items-center justify-center text-xs font-bold text-gray-600 dark:text-gray-300 shadow-sm">
                            {(msg.sender?.username || "U").charAt(0).toUpperCase()}
                          </div>
                        )}
                      </div>
                    )}
                    <div
                      className={`px-5 py-3 rounded-2xl max-w-md shadow-sm select-text ${
                        isOwnMessage
                          ? "bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-br-none"
                          : "bg-white dark:bg-darkCard text-gray-800 dark:text-gray-100 rounded-bl-none border border-gray-100 dark:border-slate-800"
                      }`}
                    >
                      {msg.fileUrl && (
                        <div className="mb-2">
                          {msg.fileType?.startsWith("image/") ? (
                            <img src={`http://localhost:5000${msg.fileUrl}`} alt="attachment" className="max-w-full min-w-[200px] bg-white bg-opacity-10 rounded-xl block" />
                          ) : msg.fileType?.startsWith("audio/") ? (
                            <audio controls src={`http://localhost:5000${msg.fileUrl}`} className="max-w-full w-[250px] outline-none" />
                          ) : msg.fileType?.startsWith("video/") ? (
                            <video controls src={`http://localhost:5000${msg.fileUrl}`} className="max-w-full w-[250px] rounded-xl" />
                          ) : (
                            <a href={`http://localhost:5000${msg.fileUrl}`} target="_blank" rel="noopener noreferrer" className={`flex items-center text-sm underline pb-1 break-all ${isOwnMessage ? 'text-purple-100' : 'text-purple-600 dark:text-purple-400'}`}>
                              📄 {msg.fileName}
                            </a>
                          )}
                        </div>
                      )}
                      {msg.text && <span className="leading-relaxed whitespace-pre-wrap word-break break-words">{msg.text}</span>}
                      {isOwnMessage && (
                        <div className="text-[10px] mt-1 text-purple-200 text-right opacity-80">
                          {msg.read ? "✓✓ Read" : "✓ Sent"}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {activeConversation && (
          <form onSubmit={handleSend} className="flex p-4 bg-white dark:bg-darkCard border-t border-gray-200 dark:border-slate-800 items-end shadow-lg z-10">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="mb-1 p-3 text-gray-500 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-gray-100 dark:hover:bg-darkInput rounded-full transition-colors focus:outline-none"
              title="Attach File"
            >
               <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
              </svg>
            </button>
            <input
              type="file"
              ref={fileInputRef}
              hidden
              onChange={(e) => setSelectedFile(e.target.files[0])}
            />
            
            <div className="flex-1 flex flex-col mx-3 relative">
              {selectedFile && (
                <div className="absolute -top-10 left-0 text-xs px-3 py-1 bg-white dark:bg-darkInput border border-gray-200 dark:border-slate-700 shadow-sm rounded-full text-purple-600 dark:text-purple-400 flex items-center">
                  <span className="truncate max-w-[200px]">Attached: {selectedFile.name}</span>
                  <button type="button" onClick={() => { setSelectedFile(null); if (fileInputRef.current) fileInputRef.current.value = ""; }} className="ml-2 text-red-500 font-bold hover:text-red-700 w-4 h-4 flex items-center justify-center rounded-full hover:bg-red-50">✕</button>
                </div>
              )}
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Message..."
                className="w-full px-5 py-3 bg-gray-100 dark:bg-darkInput text-gray-900 dark:text-gray-100 rounded-full focus:outline-none focus:ring-2 focus:ring-purple-500 border border-transparent transition-colors"
              />
            </div>

            <button
              type="submit"
              disabled={isUploading}
              className={`mb-1 p-3 flex items-center justify-center text-white rounded-full shadow-md transition-all ${
                isUploading 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-purple-600 hover:bg-purple-700 hover:shadow-lg hover:-translate-y-0.5'
              }`}
            >
              {isUploading ? "···" : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 transform rotate-90" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default Chat;