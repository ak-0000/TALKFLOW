import { Server } from "socket.io";
import http from "http";
import express from "express";

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: ["http://localhost:5173"],
    credentials: true,
  },
});

const userSocketMap = {}; // userId => socketId
const userChatMap = new Map(); // socket.id => chatId

io.on("connection", (socket) => {
  const userId = socket.handshake.query.userId;
  if (userId) userSocketMap[userId] = socket.id;

  io.emit("getOnlineUsers", Object.keys(userSocketMap));

  socket.on("join chat", (chatId) => {
    userChatMap.set(socket.id, chatId);
    socket.join(chatId);
  });

  socket.on("typing", ({ chatId, user }) => {
    socket.in(chatId).emit("typing", { chatId, user });
  });

  socket.on("stop typing", ({ chatId, userId }) => {
    socket.in(chatId).emit("stop typing", { chatId, userId });
  });

  socket.on("disconnect", () => {
    delete userSocketMap[userId];
    userChatMap.delete(socket.id);
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  });
});

// Helper to get socketId from userId
export function getRecieverSocketId(userId) {
  return userSocketMap[userId];
}

// Helper to check if user is viewing a chat
export function isUserViewingChat(userId, chatId) {
  const socketId = userSocketMap[userId];
  return socketId && userChatMap.get(socketId) === chatId;
}

export { app, server, io };
