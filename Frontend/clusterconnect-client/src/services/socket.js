import io from "socket.io-client";

const token = localStorage.getItem("token");

const SOCKET_URL =
  import.meta.env.VITE_SOCKET_URL ||
  "https://clusterconnect-chat-app-production.up.railway.app";

const socket = io(SOCKET_URL, {
  auth: {
    token: token
  },
  autoConnect: false,
  reconnection: true,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
  reconnectionAttempts: 5
});

socket.on("connect", () => {
  console.log(" Connected to server:", socket.id);
});

socket.on("disconnect", () => {
  console.log(" Disconnected from server");
});

socket.on("connect_error", (error) => {
  console.error(" Socket connection error:", error.message);
});

socket.on("error", (error) => {
  console.error("Socket error:", error);
});

export default socket;