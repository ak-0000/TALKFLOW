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
const userChatMap = {}; // userId => chatId

io.on("connection", (socket) => {
  console.log("✅ A user connected:", socket.id);

  const userId = socket.handshake.query.userId;
  if (userId) {
    userSocketMap[userId] = socket.id;
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  }

  // ✅ Track which chat user is viewing
  socket.on("join chat", (chatId) => {
    if (userId) {
      userChatMap[userId] = chatId;
      socket.join(chatId);
    }
  });

  // ✅ Typing Indicators
  socket.on("typing", ({ chatId, user }) => {
    socket.in(chatId).emit("typing", { chatId, user });
  });

  socket.on("stop typing", ({ chatId, userId }) => {
    socket.in(chatId).emit("stop typing", { chatId, userId });
  });

  // ✅ Message + Notification Handling
  socket.on("new message", (message) => {
    const chatId =
      typeof message.chatId === "string" ? message.chatId : message.chatId._id;
    if (!chatId) return;

    socket.to(chatId).emit("newMessage", message);

    const chatUsers = message.chatId.users || [];
    chatUsers.forEach((user) => {
      if (user._id !== message.senderId._id) {
        const receiverSocketId = getRecieverSocketId(user._id);
        const receiverChatId = userChatMap[user._id]; // ✅ now correct

        if (receiverSocketId) {
          const isUserInSameChat = receiverChatId === chatId;

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

  // ✅ Cleanup on disconnect
  socket.on("disconnect", () => {
    console.log("❌ A user disconnected:", socket.id);

    if (userId) {
      delete userSocketMap[userId];
      delete userChatMap[userId];
    }

    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  });
});

// 🔍 Helper to get socketId from userId
export function getRecieverSocketId(userId) {
  return userSocketMap[userId];
}

// 🧠 Optional helper to get user's active chat
export function getUserChatMap(userId) {
  return userChatMap[userId];
}

export { app, server, io };
