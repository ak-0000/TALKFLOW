// lib/socket.js
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

const userSocketMap = {};

io.on("connection", (socket) => {
  console.log("a user connected", socket.id);
  const userId = socket.handshake.query.userId;
  if (userId) userSocketMap[userId] = socket.id;

  io.emit("getOnlineUsers", Object.keys(userSocketMap));

  socket.on("disconnect", () => {
    console.log("a user disconnected", socket.id);
    delete userSocketMap[userId];
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  });
  socket.on("join chat", (chatId) => {
    socket.join(chatId);
    console.log(`User joined chat: ${chatId}`);
  });
  socket.on("typing", ({ chatId, user }) => {
    socket.in(chatId).emit("typing", { chatId, user }); // Send user object
  });

  socket.on("stop typing", ({ chatId, userId }) => {
    socket.in(chatId).emit("stop typing", { chatId, userId });
  });
  socket.on("new message", (message) => {
    const chatId =
      typeof message.chatId === "string" ? message.chatId : message.chatId._id;

    if (!chatId) return;

    // Send to others in the room
    socket.to(chatId).emit("newMessage", message);

    // 🎯 Send notification to each user except sender
    const chatUsers = message.chatId.users || [];

    chatUsers.forEach((user) => {
      if (user._id !== message.senderId._id) {
        const receiverSocketId = getRecieverSocketId(user._id);
        if (receiverSocketId) {
          io.to(receiverSocketId).emit("notification", {
            message: `New message from ${message.senderId.fullName}`,
            chatId: chatId,
          });
        }
      }
    });
  });
});

export function getRecieverSocketId(userId) {
  return userSocketMap[userId];
}

export { app, server, io };
