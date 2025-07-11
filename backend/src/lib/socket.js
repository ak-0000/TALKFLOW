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

const userSocketMap = {}; // userId => socketId
const userChatMap = new Map(); // socket.id => chatId

io.on("connection", (socket) => {
  console.log("✅ A user connected:", socket.id);

  const userId = socket.handshake.query.userId;
  if (userId) userSocketMap[userId] = socket.id;

  io.emit("getOnlineUsers", Object.keys(userSocketMap));

  // ✅ Save the chat user is currently viewing
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

  socket.on("new message", (message) => {
    const chatId =
      typeof message.chatId === "string" ? message.chatId : message.chatId._id;
    if (!chatId) return;

    socket.to(chatId).emit("newMessage", message);

    // 🎯 Send notification only if user is NOT already viewing that chat
    const chatUsers = message.chatId.users || [];

    chatUsers.forEach((user) => {
      if (user._id !== message.senderId._id) {
        const receiverSocketId = getRecieverSocketId(user._id);

        if (receiverSocketId) {
          const isUserInSameChat =
            userChatMap.get(receiverSocketId) === chatId;

          if (!isUserInSameChat) {
            io.to(receiverSocketId).emit("notification", {
              message: `New message from ${message.senderId.fullName}`,
              chatId: chatId,
            });
          }
        }
      }
    });
  });

  socket.on("disconnect", () => {
    console.log("❌ A user disconnected:", socket.id);
    delete userSocketMap[userId];
    userChatMap.delete(socket.id);
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  });
});

// 🔍 Helper to get socketId from userId
export function getRecieverSocketId(userId) {
  return userSocketMap[userId];
}

export { app, server, io };
