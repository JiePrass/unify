const { io } = require("socket.io-client");

// https://unify-production-d351.up.railway.app

const socket = io("http://localhost:2304", {
  auth: { 
    token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwicm9sZSI6IlVTRVIiLCJpYXQiOjE3NjY2NDA0MDQsImV4cCI6MTc2NjY0NDAwNH0.yuxWu35rHUaJCwV2tPgLgF0NmaLmpjiSIfSZqpjT-sA"
  }
});

// Tunggu koneksi selesai
socket.on("connect", () => {
  console.log("Connected:", socket.id);

  // Join chat setelah koneksi siap
  socket.emit("join_chat", { userId: 1, helpId: 8 });
});

// Join / error handlers
socket.on("join_success", ({ chatRoomId }) => {
  console.log("Joined room:", chatRoomId);

  // Send test message
  socket.emit("send_message", { userId: 1, chatRoomId, content: "Hello!" });
});

socket.on("join_error", (err) => console.log("Join error:", err));
socket.on("send_error", (err) => console.log("Send error:", err));

// Listen incoming messages
socket.on("new_message", (msg) => console.log("New message:", msg));

// Handle connection errors
socket.on("connect_error", (err) => console.log("Connect error:", err));
