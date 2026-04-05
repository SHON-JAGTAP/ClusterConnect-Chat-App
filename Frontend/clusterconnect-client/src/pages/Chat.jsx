import { useEffect, useState, useCallback, useRef, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import socket from "../services/socket";

// ─────────────────────────────────────────────
// Sub-components (prevent full re-renders)
// ─────────────────────────────────────────────

/** A single user item in the sidebar */
const UserItem = ({ chatUser, isSelected, onClick }) => (
  <div
    role="button"
    tabIndex={0}
    key={chatUser.id}
    onClick={() => onClick(chatUser)}
    onKeyDown={(e) => e.key === "Enter" && onClick(chatUser)}
    className={`p-4 cursor-pointer transition-all duration-200 border-b border-white/5 hover:bg-white/10 ${
      isSelected
        ? "bg-gradient-to-r from-purple-500/20 to-blue-500/20 border-l-4 border-purple-500"
        : ""
    }`}
  >
    <div className="flex items-center gap-3 relative">
      <div className="relative">
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
          {chatUser.name.charAt(0).toUpperCase()}
        </div>
        {chatUser.isOnline && (
          <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-[#1a1b26] shadow-[0_0_8px_rgba(34,197,94,0.6)]" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-white font-medium truncate">{chatUser.name}</p>
        <p className="text-gray-400 text-sm truncate">{chatUser.email}</p>
      </div>
    </div>
  </div>
);

/** A single chat bubble */
const MessageBubble = ({ msg, isMine }) => {
  const time = useMemo(() => {
    const d = msg.createdAt || msg.created_at;
    return d ? new Date(d).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "";
  }, [msg.createdAt, msg.created_at]);

  return (
    <div className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-sm lg:max-w-md px-4 py-3 rounded-2xl shadow-lg ${
          isMine
            ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-br-none"
            : "glass-effect text-white rounded-bl-none"
        }`}
      >
        <p className="break-words">{msg.message}</p>
        {time && <p className="text-xs mt-1 opacity-60 text-right">{time}</p>}
      </div>
    </div>
  );
};

/** Typing indicator dots */
const TypingIndicator = () => (
  <div className="flex justify-start">
    <div className="glass-effect px-4 py-3 rounded-2xl rounded-bl-none flex gap-1 items-center">
      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
    </div>
  </div>
);

// ─────────────────────────────────────────────
// Main Chat component
// ─────────────────────────────────────────────

function Chat() {
  const navigate = useNavigate();

  // Parse user once — avoid repeated JSON.parse on render
  const user = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("user")) || {};
    } catch {
      return {};
    }
  }, []);
  const token = localStorage.getItem("token");

  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [msgLoading, setMsgLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);       // peer is typing
  const [sendError, setSendError] = useState(null);

  const messagesEndRef = useRef(null);
  const typingTimerRef = useRef(null);

  // ── Auth guard ─────────────────────────────
  useEffect(() => {
    if (!token) navigate("/login");
  }, [token, navigate]);

  // ── Fetch user list ───────────────────────
  useEffect(() => {
    if (!token) return;

    const fetchUsers = async () => {
      try {
        const { data } = await api.get("/api/chat/users");
        // Server already filters out current user, but normalize _id→id for safety
        const normalized = data.map((u) => ({ ...u, id: u._id || u.id }));
        setUsers(normalized);
      } catch (err) {
        console.error("Failed to fetch users:", err);
      }
    };

    fetchUsers();
  }, [token]);

  // ── Socket lifecycle ──────────────────────
  useEffect(() => {
    if (!token) return;

    socket.auth = { token };
    socket.connect();

    // Receive message
    const onMessage = (data) => {
      setMessages((prev) => {
        // Deduplicate by _id if message already exists (e.g. from optimistic update)
        const exists = prev.some((m) => m._id && m._id === data._id);
        return exists ? prev : [...prev, data];
      });
      setIsTyping(false);
    };

    // Typing indicators
    const onTyping = () => setIsTyping(true);
    const onStopTyping = () => setIsTyping(false);

    // Message send failure
    const onFailed = () => setSendError("Message failed to send. Please retry.");

    // User Joined Live Update
    const onUserJoined = (newUser) => {
      // Don't add ourselves to the sidebar
      const myId = user.id || user._id;
      if (newUser.id === myId) return;
      
      setUsers((prev) => {
        // Prevent duplicates
        if (prev.some((u) => u.id === newUser.id)) return prev;
        return [...prev, newUser];
      });
    };

    const onUserOnline = ({ userId }) => {
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, isOnline: true } : u))
      );
    };

    const onUserOffline = ({ userId }) => {
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, isOnline: false } : u))
      );
    };

    socket.on("receive_message", onMessage);
    socket.on("user_typing", onTyping);
    socket.on("user_stopped_typing", onStopTyping);
    socket.on("message_failed", onFailed);
    socket.on("user_joined", onUserJoined);
    socket.on("user_online", onUserOnline);
    socket.on("user_offline", onUserOffline);

    return () => {
      socket.off("receive_message", onMessage);
      socket.off("user_typing", onTyping);
      socket.off("user_stopped_typing", onStopTyping);
      socket.off("message_failed", onFailed);
      socket.off("user_joined", onUserJoined);
      socket.off("user_online", onUserOnline);
      socket.off("user_offline", onUserOffline);
      socket.disconnect();
    };
  }, [token, user]);

  // ── Auto-scroll to latest message ────────
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  // ── Select a user & load conversation ────
  const handleSelectUser = useCallback(async (targetUser) => {
    setSelectedUser(targetUser);
    setMessages([]);
    setSendError(null);
    setMsgLoading(true);

    // Join the chat room over socket
    socket.emit("join_room", { chatRoom: targetUser.id });

    try {
      const { data } = await api.get(`/api/chat/messages/${targetUser.id}`);
      setMessages(data || []);
    } catch (err) {
      console.error("Failed to load messages:", err);
    } finally {
      setMsgLoading(false);
    }
  }, []);

  // ── Typing event throttle ────────────────
  const handleTyping = useCallback(() => {
    if (!selectedUser) return;
    socket.emit("typing_start", { chatRoom: selectedUser.id });

    clearTimeout(typingTimerRef.current);
    typingTimerRef.current = setTimeout(() => {
      socket.emit("typing_stop", { chatRoom: selectedUser.id });
    }, 1500);
  }, [selectedUser]);

  // ── Send message ─────────────────────────
  const handleSendMessage = useCallback(
    async (e) => {
      e.preventDefault();
      const trimmed = messageInput.trim();
      if (!trimmed || !selectedUser || loading) return;

      setSendError(null);
      setLoading(true);

      // Optimistic UI: show message immediately
      const optimistic = {
        _id: `optimistic-${Date.now()}`,
        sender_id: user.id || user._id,
        message: trimmed,
        chatRoom: selectedUser.id,
        createdAt: new Date().toISOString(),
        _optimistic: true,
      };
      setMessages((prev) => [...prev, optimistic]);
      setMessageInput("");

      socket.emit("send_message", {
        message: trimmed,
        chatRoom: selectedUser.id,
      });

      // Stop typing indicator after sending
      socket.emit("typing_stop", { chatRoom: selectedUser.id });
      clearTimeout(typingTimerRef.current);

      setLoading(false);
    },
    [messageInput, selectedUser, loading, user]
  );

  // ── Logout ───────────────────────────────
  const handleLogout = useCallback(() => {
    localStorage.clear();
    socket.disconnect();
    navigate("/login");
  }, [navigate]);

  // ── Helper: normalize sender ID ──────────
  const getSenderId = useCallback((msg) => {
    if (msg.sender_id) {
      return typeof msg.sender_id === "object"
        ? msg.sender_id._id || msg.sender_id.id
        : msg.sender_id;
    }
    return msg.senderId;
  }, []);

  const myId = user.id || user._id;

  // ─────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────

  return (
    <div className="min-h-screen flex flex-col" style={{ height: "100dvh" }}>
      {/* Navbar */}
      <nav className="glass-effect border-b border-white/10 px-6 py-4 flex-shrink-0">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
            ClusterConnect
          </h1>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-white font-medium">{user?.name}</p>
              <p className="text-gray-400 text-sm">{user?.email}</p>
            </div>
            <button
              id="logout-btn"
              onClick={handleLogout}
              className="btn-secondary px-4 py-2 text-sm"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      {/* Chat Container */}
      <div className="flex-1 flex overflow-hidden">
        {/* Users Sidebar */}
        <aside className="w-72 lg:w-80 glass-effect border-r border-white/10 flex flex-col flex-shrink-0">
          <div className="p-4 border-b border-white/10">
            <h2 className="text-xl font-semibold text-white">Chats</h2>
          </div>
          <div className="flex-1 overflow-y-auto">
            {users.length === 0 ? (
              <p className="text-gray-400 text-sm text-center mt-8 px-4">No other users found.</p>
            ) : (
              users.map((chatUser) => (
                <UserItem
                  key={chatUser.id}
                  chatUser={chatUser}
                  isSelected={selectedUser?.id === chatUser.id}
                  onClick={handleSelectUser}
                />
              ))
            )}
          </div>
        </aside>

        {/* Chat Area */}
        <main className="flex-1 flex flex-col overflow-hidden">
          {selectedUser ? (
            <>
              {/* Chat Header */}
              <div className="glass-effect border-b border-white/10 p-4 flex-shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white font-bold flex-shrink-0">
                    {selectedUser.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="text-white font-semibold">{selectedUser.name}</h3>
                    <p className="text-gray-400 text-sm">{selectedUser.email}</p>
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 lg:p-6 space-y-3">
                {msgLoading ? (
                  <div className="flex justify-center items-center h-full">
                    <div className="flex gap-2">
                      <div className="w-3 h-3 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                      <div className="w-3 h-3 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                      <div className="w-3 h-3 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                    </div>
                  </div>
                ) : messages.length === 0 ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-purple-500/20 to-blue-500/20 flex items-center justify-center">
                        <svg className="w-10 h-10 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                      </div>
                      <p className="text-gray-400">No messages yet. Start the conversation!</p>
                    </div>
                  </div>
                ) : (
                  messages.map((msg, index) => (
                    <MessageBubble
                      key={msg._id || index}
                      msg={msg}
                      isMine={getSenderId(msg)?.toString() === myId?.toString()}
                    />
                  ))
                )}

                {/* Typing indicator */}
                {isTyping && <TypingIndicator />}

                {/* Auto-scroll anchor */}
                <div ref={messagesEndRef} />
              </div>

              {/* Send Error */}
              {sendError && (
                <div className="px-4 py-2 bg-red-500/20 border-t border-red-500/30 text-red-300 text-sm text-center">
                  {sendError}{" "}
                  <button
                    className="underline ml-1"
                    onClick={() => setSendError(null)}
                  >
                    Dismiss
                  </button>
                </div>
              )}

              {/* Message Input */}
              <form
                onSubmit={handleSendMessage}
                className="glass-effect border-t border-white/10 p-4 flex-shrink-0"
              >
                <div className="flex gap-3">
                  <input
                    id="message-input"
                    type="text"
                    value={messageInput}
                    onChange={(e) => {
                      setMessageInput(e.target.value);
                      handleTyping();
                    }}
                    placeholder="Type a message…"
                    className="input-field flex-1"
                    disabled={loading}
                    autoComplete="off"
                    maxLength={2000}
                  />
                  <button
                    id="send-btn"
                    type="submit"
                    disabled={loading || !messageInput.trim()}
                    className="btn-primary px-5"
                    aria-label="Send message"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                  </button>
                </div>
              </form>
            </>
          ) : (
            /* Empty state */
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <div className="w-32 h-32 mx-auto mb-6 rounded-full bg-gradient-to-br from-purple-500/20 to-blue-500/20 flex items-center justify-center animate-float">
                  <svg className="w-16 h-16 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-semibold text-white mb-2">Select a chat</h3>
                <p className="text-gray-400">Choose a user from the sidebar to start messaging</p>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default Chat;
