import { useEffect, useState, useCallback, useRef, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import socket from "../services/socket";

// ─────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────

/** Avatar with initial letter + online indicator */
const Avatar = ({ name, isOnline, size = "md" }) => {
  const initial = name?.charAt(0)?.toUpperCase() || "?";
  const sizes = {
    sm: { outer: "w-8 h-8", dot: "w-2.5 h-2.5", text: "text-xs" },
    md: { outer: "w-11 h-11", dot: "w-3 h-3", text: "text-sm" },
    lg: { outer: "w-12 h-12", dot: "w-3.5 h-3.5", text: "text-base" },
  };
  const s = sizes[size];

  return (
    <div className={`relative flex-shrink-0 ${s.outer}`}>
      <div
        className={`${s.outer} rounded-full flex items-center justify-center font-semibold ${s.text} text-white`}
        style={{
          background: "linear-gradient(135deg, #4F8EF7 0%, #8B5CF6 100%)",
          boxShadow: "0 4px 12px rgba(79, 142, 247, 0.3), inset 0 1px 0 rgba(255,255,255,0.15)",
        }}
      >
        {initial}
      </div>
      {isOnline !== undefined && (
        <div
          className={`absolute bottom-0 right-0 ${s.dot} rounded-full border-2`}
          style={{
            background: isOnline ? "#22c55e" : "#6b7280",
            borderColor: "#111111",
            boxShadow: isOnline ? "0 0 0 0 rgba(34, 197, 94, 0.5)" : "none",
            animation: isOnline ? "online-pulse 2s ease-in-out infinite" : "none",
          }}
        />
      )}
    </div>
  );
};

/** A single user row in the sidebar */
const UserItem = ({ chatUser, isSelected, onClick }) => (
  <div
    role="button"
    tabIndex={0}
    onClick={() => onClick(chatUser)}
    onKeyDown={(e) => e.key === "Enter" && onClick(chatUser)}
    className="relative group cursor-pointer transition-all duration-200"
    style={{
      padding: "14px 16px",
      borderBottom: "1px solid rgba(255,255,255,0.04)",
      background: isSelected
        ? "linear-gradient(90deg, rgba(79,142,247,0.12) 0%, rgba(139,92,246,0.08) 100%)"
        : "transparent",
    }}
  >
    {/* Selected indicator bar */}
    {isSelected && (
      <div
        className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 rounded-r-full"
        style={{
          height: "55%",
          background: "linear-gradient(180deg, #4F8EF7, #8B5CF6)",
          boxShadow: "0 0 8px rgba(79, 142, 247, 0.5)",
        }}
      />
    )}

    {/* Hover bg */}
    {!isSelected && (
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
        style={{ background: "rgba(255,255,255,0.035)" }}
      />
    )}

    <div className="relative flex items-center gap-3">
      <Avatar name={chatUser.name} isOnline={chatUser.isOnline} size="md" />
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <p
            className="font-medium truncate"
            style={{
              fontSize: "0.875rem",
              color: isSelected ? "#EAEAEA" : "rgba(234,234,234,0.85)",
            }}
          >
            {chatUser.name}
          </p>
          {chatUser.isOnline && (
            <span
              className="text-[10px] font-medium flex-shrink-0 ml-2"
              style={{ color: "#22c55e" }}
            >
              online
            </span>
          )}
        </div>
        <p
          className="text-xs truncate mt-0.5"
          style={{ color: "rgba(234,234,234,0.38)" }}
        >
          {chatUser.email}
        </p>
      </div>
    </div>
  </div>
);

/** 3D Chat bubble */
const MessageBubble = ({ msg, isMine }) => {
  const time = useMemo(() => {
    const d = msg.createdAt || msg.created_at;
    return d ? new Date(d).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "";
  }, [msg.createdAt, msg.created_at]);

  return (
    <div
      className={`flex animate-message-pop ${isMine ? "justify-end" : "justify-start"}`}
    >
      <div
        className="relative max-w-xs lg:max-w-sm xl:max-w-md"
        style={{
          padding: "10px 15px",
          borderRadius: isMine ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
          background: isMine
            ? "linear-gradient(135deg, #4F8EF7 0%, #8B5CF6 100%)"
            : "rgba(255,255,255,0.06)",
          border: isMine ? "none" : "1px solid rgba(255,255,255,0.08)",
          boxShadow: isMine
            ? "0 4px 16px rgba(79, 142, 247, 0.35), 0 1px 0 rgba(255,255,255,0.15) inset"
            : "0 4px 16px rgba(0,0,0,0.4), 0 1px 0 rgba(255,255,255,0.04) inset",
          backdropFilter: isMine ? "none" : "blur(12px)",
        }}
      >
        <p
          className="break-words leading-relaxed"
          style={{
            fontSize: "0.875rem",
            color: isMine ? "#fff" : "rgba(234,234,234,0.9)",
          }}
        >
          {msg.message}
        </p>
        {time && (
          <p
            className="text-right mt-1"
            style={{
              fontSize: "0.68rem",
              color: isMine ? "rgba(255,255,255,0.55)" : "rgba(234,234,234,0.3)",
            }}
          >
            {time}
          </p>
        )}
      </div>
    </div>
  );
};

/** Typing indicator */
const TypingIndicator = () => (
  <div className="flex justify-start animate-fade-in">
    <div
      style={{
        padding: "12px 16px",
        borderRadius: "18px 18px 18px 4px",
        background: "rgba(255,255,255,0.06)",
        border: "1px solid rgba(255,255,255,0.08)",
        backdropFilter: "blur(12px)",
        display: "flex",
        gap: "4px",
        alignItems: "center",
      }}
    >
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className={`rounded-full animate-typing-${i + 1}`}
          style={{ width: 6, height: 6, background: "rgba(234,234,234,0.5)" }}
        />
      ))}
    </div>
  </div>
);

// ─────────────────────────────────────────────
// Main Chat Component
// ─────────────────────────────────────────────

function Chat() {
  const navigate = useNavigate();

  const user = useMemo(() => {
    try { return JSON.parse(localStorage.getItem("user")) || {}; }
    catch { return {}; }
  }, []);
  const token = localStorage.getItem("token");

  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [msgLoading, setMsgLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [sendError, setSendError] = useState(null);

  const messagesEndRef = useRef(null);
  const typingTimerRef = useRef(null);
  const inputRef = useRef(null);

  // ── Auth guard ─────────────────────────────
  useEffect(() => { if (!token) navigate("/login"); }, [token, navigate]);

  // ── Fetch user list ───────────────────────
  useEffect(() => {
    if (!token) return;
    const fetchUsers = async () => {
      try {
        const { data } = await api.get("/api/chat/users");
        setUsers(data.map((u) => ({ ...u, id: u._id || u.id })));
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

    const onMessage = (data) => {
      setMessages((prev) => {
        const exists = prev.some((m) => m._id && m._id === data._id);
        return exists ? prev : [...prev, data];
      });
      setIsTyping(false);
    };
    const onTyping = () => setIsTyping(true);
    const onStopTyping = () => setIsTyping(false);
    const onFailed = () => setSendError("Message failed to send. Please retry.");

    const onUserJoined = (newUser) => {
      const myId = user.id || user._id;
      if (newUser.id === myId) return;
      setUsers((prev) => {
        if (prev.some((u) => u.id === newUser.id)) return prev;
        return [...prev, newUser];
      });
    };

    const onUserOnline = ({ userId }) =>
      setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, isOnline: true } : u)));

    const onUserOffline = ({ userId }) =>
      setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, isOnline: false } : u)));

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

  // ── Auto-scroll ───────────────────────────
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  // ── Select user ───────────────────────────
  const handleSelectUser = useCallback(async (targetUser) => {
    setSelectedUser(targetUser);
    setMessages([]);
    setSendError(null);
    setMsgLoading(true);
    socket.emit("join_room", { chatRoom: targetUser.id });
    try {
      const { data } = await api.get(`/api/chat/messages/${targetUser.id}`);
      setMessages(data || []);
    } catch (err) {
      console.error("Failed to load messages:", err);
    } finally {
      setMsgLoading(false);
      inputRef.current?.focus();
    }
  }, []);

  // ── Typing ────────────────────────────────
  const handleTyping = useCallback(() => {
    if (!selectedUser) return;
    socket.emit("typing_start", { chatRoom: selectedUser.id });
    clearTimeout(typingTimerRef.current);
    typingTimerRef.current = setTimeout(() => {
      socket.emit("typing_stop", { chatRoom: selectedUser.id });
    }, 1500);
  }, [selectedUser]);

  // ── Send message ──────────────────────────
  const handleSendMessage = useCallback(async (e) => {
    e.preventDefault();
    const trimmed = messageInput.trim();
    if (!trimmed || !selectedUser || loading) return;
    setSendError(null);
    setLoading(true);
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
    socket.emit("send_message", { message: trimmed, chatRoom: selectedUser.id });
    socket.emit("typing_stop", { chatRoom: selectedUser.id });
    clearTimeout(typingTimerRef.current);
    setLoading(false);
  }, [messageInput, selectedUser, loading, user]);

  // ── Logout ────────────────────────────────
  const handleLogout = useCallback(() => {
    localStorage.clear();
    socket.disconnect();
    navigate("/login");
  }, [navigate]);

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
    <div
      className="flex flex-col"
      style={{ height: "100dvh", background: "#0D0D0D", overflow: "hidden" }}
    >
      {/* ── Top Navbar ── */}
      <nav
        className="flex-shrink-0 flex items-center justify-between"
        style={{
          height: 64,
          padding: "0 24px",
          background: "rgba(13,13,13,0.9)",
          backdropFilter: "blur(24px)",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
          boxShadow: "0 1px 0 rgba(255,255,255,0.03), 0 8px 32px rgba(0,0,0,0.5)",
        }}
      >
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center"
            style={{
              background: "linear-gradient(135deg, #4F8EF7, #8B5CF6)",
              boxShadow: "0 2px 8px rgba(79,142,247,0.4)",
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
          </div>
          <span
            className="font-bold tracking-tight"
            style={{
              fontSize: "1.05rem",
              background: "linear-gradient(90deg, #EAEAEA 0%, rgba(234,234,234,0.7) 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Cluster Connect
          </span>
        </div>

        {/* User Info */}
        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <p className="font-medium" style={{ fontSize: "0.82rem", color: "#EAEAEA" }}>
              {user?.name}
            </p>
            <p style={{ fontSize: "0.72rem", color: "rgba(234,234,234,0.4)" }}>
              {user?.email}
            </p>
          </div>
          <Avatar name={user?.name} size="sm" />
          <button
            id="logout-btn"
            onClick={handleLogout}
            className="btn-secondary"
            style={{ padding: "6px 14px", fontSize: "0.78rem", borderRadius: 10 }}
          >
            Logout
          </button>
        </div>
      </nav>

      {/* ── Body ── */}
      <div className="flex flex-1 overflow-hidden">

        {/* ── Sidebar ── */}
        <aside
          className="flex flex-col flex-shrink-0"
          style={{
            width: 280,
            background: "rgba(17,17,17,0.95)",
            borderRight: "1px solid rgba(255,255,255,0.05)",
          }}
        >
          {/* Sidebar header */}
          <div
            className="flex items-center justify-between flex-shrink-0"
            style={{
              padding: "16px 16px 14px",
              borderBottom: "1px solid rgba(255,255,255,0.05)",
            }}
          >
            <h2 className="font-semibold" style={{ fontSize: "0.95rem", color: "#EAEAEA" }}>
              Messages
            </h2>
            <div
              className="w-5 h-5 rounded-full flex items-center justify-center"
              style={{
                background: "rgba(79,142,247,0.15)",
                border: "1px solid rgba(79,142,247,0.3)",
              }}
            >
              <span style={{ fontSize: "0.6rem", color: "#4F8EF7", fontWeight: 700 }}>
                {users.filter((u) => u.isOnline).length}
              </span>
            </div>
          </div>

          {/* Users list */}
          <div className="flex-1 overflow-y-auto">
            {users.length === 0 ? (
              <div
                className="flex flex-col items-center justify-center h-full gap-3"
                style={{ padding: 24 }}
              >
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center"
                  style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="rgba(234,234,234,0.3)" strokeWidth="1.5" strokeLinecap="round">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                  </svg>
                </div>
                <p style={{ fontSize: "0.8rem", color: "rgba(234,234,234,0.3)", textAlign: "center", lineHeight: 1.5 }}>
                  No other users yet.<br />Invite someone to join!
                </p>
              </div>
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

        {/* ── Main Chat Area ── */}
        <main className="flex-1 flex flex-col overflow-hidden">
          {selectedUser ? (
            <>
              {/* Chat header */}
              <div
                className="flex items-center gap-3 flex-shrink-0"
                style={{
                  padding: "12px 24px",
                  background: "rgba(17,17,17,0.8)",
                  backdropFilter: "blur(24px)",
                  borderBottom: "1px solid rgba(255,255,255,0.05)",
                  boxShadow: "0 4px 16px rgba(0,0,0,0.3)",
                }}
              >
                <Avatar name={selectedUser.name} isOnline={selectedUser.isOnline} size="md" />
                <div className="flex-1">
                  <h3 className="font-semibold" style={{ fontSize: "0.9rem", color: "#EAEAEA" }}>
                    {selectedUser.name}
                  </h3>
                  <p style={{ fontSize: "0.73rem", color: selectedUser.isOnline ? "#22c55e" : "rgba(234,234,234,0.35)" }}>
                    {selectedUser.isOnline ? "Active now" : selectedUser.email}
                  </p>
                </div>
              </div>

              {/* Messages */}
              <div
                className="flex-1 overflow-y-auto"
                style={{ padding: "24px 24px 16px", display: "flex", flexDirection: "column", gap: 10 }}
              >
                {msgLoading ? (
                  <div className="flex flex-col items-center justify-center h-full gap-3">
                    <div className="flex gap-2">
                      {[0, 1, 2].map((i) => (
                        <div
                          key={i}
                          className={`rounded-full animate-typing-${i + 1}`}
                          style={{ width: 8, height: 8, background: "rgba(79,142,247,0.6)" }}
                        />
                      ))}
                    </div>
                    <p style={{ fontSize: "0.8rem", color: "rgba(234,234,234,0.3)" }}>Loading messages…</p>
                  </div>
                ) : messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full gap-4 animate-fade-in">
                    <div
                      className="w-20 h-20 rounded-3xl flex items-center justify-center"
                      style={{
                        background: "rgba(79,142,247,0.08)",
                        border: "1px solid rgba(79,142,247,0.15)",
                        boxShadow: "0 0 32px rgba(79,142,247,0.1)",
                        animation: "float-up 4s ease-in-out infinite",
                      }}
                    >
                      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="rgba(79,142,247,0.7)" strokeWidth="1.5" strokeLinecap="round">
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                      </svg>
                    </div>
                    <div className="text-center">
                      <p className="font-medium mb-1" style={{ color: "rgba(234,234,234,0.7)", fontSize: "0.9rem" }}>
                        Start a conversation
                      </p>
                      <p style={{ color: "rgba(234,234,234,0.3)", fontSize: "0.8rem" }}>
                        Say hi to {selectedUser.name}!
                      </p>
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
                {isTyping && <TypingIndicator />}
                <div ref={messagesEndRef} />
              </div>

              {/* Send Error Banner */}
              {sendError && (
                <div
                  className="flex items-center justify-between flex-shrink-0"
                  style={{
                    padding: "8px 20px",
                    background: "rgba(239, 68, 68, 0.1)",
                    borderTop: "1px solid rgba(239,68,68,0.2)",
                  }}
                >
                  <p style={{ fontSize: "0.78rem", color: "rgba(252, 165, 165, 0.9)" }}>{sendError}</p>
                  <button
                    onClick={() => setSendError(null)}
                    style={{ fontSize: "0.72rem", color: "rgba(252,165,165,0.7)", textDecoration: "underline", background: "none", border: "none", cursor: "pointer" }}
                  >
                    Dismiss
                  </button>
                </div>
              )}

              {/* Input Area */}
              <form
                onSubmit={handleSendMessage}
                className="flex items-center gap-3 flex-shrink-0"
                style={{
                  padding: "14px 20px",
                  background: "rgba(13,13,13,0.9)",
                  backdropFilter: "blur(24px)",
                  borderTop: "1px solid rgba(255,255,255,0.05)",
                }}
              >
                <div className="flex-1 relative">
                  <input
                    id="message-input"
                    ref={inputRef}
                    type="text"
                    value={messageInput}
                    onChange={(e) => { setMessageInput(e.target.value); handleTyping(); }}
                    placeholder={`Message ${selectedUser.name}…`}
                    className="input-field"
                    style={{ paddingRight: "3.5rem", borderRadius: 14 }}
                    disabled={loading}
                    autoComplete="off"
                    maxLength={2000}
                  />
                </div>
                <button
                  id="send-btn"
                  type="submit"
                  disabled={loading || !messageInput.trim()}
                  className="btn-primary flex-shrink-0"
                  style={{ borderRadius: 14, padding: "10px 18px" }}
                  aria-label="Send message"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
                  </svg>
                </button>
              </form>
            </>
          ) : (
            /* ── Empty State ── */
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center animate-fade-in">
                <div
                  className="w-28 h-28 mx-auto mb-6 rounded-3xl flex items-center justify-center"
                  style={{
                    background: "rgba(79,142,247,0.07)",
                    border: "1px solid rgba(79,142,247,0.12)",
                    boxShadow: "0 0 48px rgba(79,142,247,0.08)",
                    animation: "float-up 5s ease-in-out infinite",
                  }}
                >
                  <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="rgba(79,142,247,0.6)" strokeWidth="1.5" strokeLinecap="round">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                  </svg>
                </div>
                <h3
                  className="font-semibold mb-2"
                  style={{ fontSize: "1.1rem", color: "rgba(234,234,234,0.8)" }}
                >
                  Your messages
                </h3>
                <p style={{ fontSize: "0.85rem", color: "rgba(234,234,234,0.3)", lineHeight: 1.6 }}>
                  Select a conversation from<br />the sidebar to start chatting.
                </p>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default Chat;
