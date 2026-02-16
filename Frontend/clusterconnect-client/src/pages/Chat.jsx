import { useEffect, useState } from "react";
import axios from "axios";
import socket from "../services/socket";
import Navbar from "../components/Navbar";
import "../styles/Chat.css";

function Chat() {
  const user = JSON.parse(localStorage.getItem("user"));
  const token = localStorage.getItem("token");
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState("");
  const [loading, setLoading] = useState(false);

  // Fetch all users
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/chat/users", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUsers(response.data);
      } catch (error) {
        console.error("Failed to fetch users:", error);
      }
    };

    if (token) {
      fetchUsers();
    }
  }, [token]);

  // Listen for incoming messages
  useEffect(() => {
    socket.on("receive_message", (data) => {
      setMessages((prev) => [...prev, data]);
    });

    return () => socket.off("receive_message");
  }, []);

  const handleSelectUser = (selectedUser) => {
    setSelectedUser(selectedUser);
    setMessages([]);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!messageInput.trim() || !selectedUser) return;

    try {
      setLoading(true);
      const response = await axios.post(
        "http://localhost:5000/api/chat/send-message",
        {
          senderId: user.id,
          message: messageInput,
          chatRoom: selectedUser.id,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      // Add message to chat
      setMessages((prev) => [...prev, response.data.data]);
      setMessageInput("");

      // Emit via socket for real-time
      socket.emit("send_message", {
        senderId: user.id,
        message: messageInput,
        chatRoom: selectedUser.id,
        sender: user,
      });
    } catch (error) {
      console.error("Failed to send message:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="chat-container">
      <Navbar />
      <div className="chat-wrapper">
        {/* Users List */}
        <div className="users-panel">
          <div className="users-header">
            <h3>Chats</h3>
          </div>
          <div className="users-list">
            {users.map((chatUser) => (
              <div
                key={chatUser.id}
                className={`user-item ${selectedUser?.id === chatUser.id ? "active" : ""}`}
                onClick={() => handleSelectUser(chatUser)}
              >
                <div className="user-avatar">
                  {chatUser.name.charAt(0).toUpperCase()}
                </div>
                <div className="user-info">
                  <div className="user-name">{chatUser.name}</div>
                  <div className="user-email">{chatUser.email}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Chat Window */}
        <div className="chat-panel">
          {selectedUser ? (
            <>
              {/* Chat Header */}
              <div className="chat-header">
                <div className="chat-user-info">
                  <div className="chat-avatar">
                    {selectedUser.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h4>{selectedUser.name}</h4>
                    <p>{selectedUser.email}</p>
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div className="messages-container">
                {messages.length === 0 ? (
                  <div className="no-messages">
                    <p>No messages yet. Start the conversation!</p>
                  </div>
                ) : (
                  messages.map((msg, index) => (
                    <div
                      key={index}
                      className={`message ${
                        msg.sender_id === user.id ? "sent" : "received"
                      }`}
                    >
                      <div className="message-content">{msg.message}</div>
                      <div className="message-time">
                        {new Date(msg.created_at).toLocaleTimeString()}
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Message Input */}
              <form onSubmit={handleSendMessage} className="message-input-form">
                <input
                  type="text"
                  className="message-input"
                  placeholder="Type a message..."
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  disabled={loading}
                />
                <button type="submit" className="send-btn" disabled={loading}>
                  {loading ? "..." : "Send"}
                </button>
              </form>
            </>
          ) : (
            <div className="chat-empty">
              <p>Select a user to start chatting</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Chat;
