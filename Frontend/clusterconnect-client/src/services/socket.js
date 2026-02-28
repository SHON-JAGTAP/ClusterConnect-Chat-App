import io from "socket.io-client";

const token = localStorage.getItem("token");

const socket = io("http://localhost:5000", {
  auth: {
    token: token
  },
  autoConnect: false
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