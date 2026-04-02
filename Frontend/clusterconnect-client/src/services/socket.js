import io from "socket.io-client";

const SOCKET_URL =
  import.meta.env.VITE_SOCKET_URL ||
  "http://localhost:5000";

const socket = io(SOCKET_URL, {
  auth: {
    token: localStorage.getItem("token")
  },
  autoConnect: false,
  reconnection: true,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
  reconnectionAttempts: 5
});

// Update token dynamically before each reconnect
socket.on("reconnect_attempt", () => {
  socket.auth = { token: localStorage.getItem("token") };
});

socket.on("connect", () => {
  console.log("✅ Connected to server:", socket.id);
});

socket.on("disconnect", () => {
  console.log("❌ Disconnected from server");
});

socket.on("connect_error", (error) => {
  console.error("🔴 Socket connection error:", error.message);
});

socket.on("error", (error) => {
  console.error("Socket error:", error);
});

export default socket;