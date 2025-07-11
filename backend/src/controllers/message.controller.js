import User from "../models/user.model.js";
import Message from "../models/message.model.js";
import Chat from "../models/chat.model.js";
import cloudinary from "../lib/cloudinary.js";
import streamifier from "streamifier";
import { getRecieverSocketId, io } from "../lib/socket.js";

// ✅ Sidebar: Get users except logged-in
export const getUsersForSidebar = async (req, res) => {
  try {
    const loggedInUserId = req.user._id;
    const filteredUsers = await User.find({
      _id: { $ne: loggedInUserId },
    }).select("-password");
    res.status(200).json(filteredUsers);
  } catch (error) {
    console.error("Error fetching users for sidebar:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// ✅ Get all messages of a chat
export const getMessages = async (req, res) => {
  try {
    const { chatId } = req.params;
    const chat = await Chat.findById(chatId);

    // ❌ Check if chat exists and user is in chat
    if (!chat || !chat.users.includes(req.user._id)) {
      return res
        .status(403)
        .json({ message: "Access denied: Not a group member" });
    }

    const messages = await Message.find({ chatId })
      .populate("senderId", "fullName email profilepic")
      .sort({ createdAt: 1 });

    res.status(200).json(messages);
  } catch (error) {
    console.error("Error fetching messages:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// ✅ Send a message
export const sendMessage = async (req, res) => {
  try {
    const { text, chatId } = req.body;
    const senderId = req.user._id;
    let imageUrl = "";

    const chat = await Chat.findById(chatId);
    if (!chat || !chat.users.includes(senderId)) {
      return res
        .status(403)
        .json({ message: "Access denied: Not a group member" });
    }

    if (req.file) {
      const streamUpload = () =>
        new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            { folder: "chat_images" },
            (error, result) => {
              if (result) resolve(result);
              else reject(error);
            }
          );
          streamifier.createReadStream(req.file.buffer).pipe(stream);
        });

      const result = await streamUpload();
      imageUrl = result.secure_url;
    }

    const newMessage = new Message({
      senderId,
      chatId,
      text,
      image: imageUrl,
    });
    await newMessage.save();

    const populatedMessage = await Message.findById(newMessage._id)
      .populate("senderId", "fullName profilepic")
      .populate({
        path: "chatId",
        populate: {
          path: "users",
          select: "fullName profilepic _id",
        },
      });

    // ✅ Emit only to sender's Socket.IO
    io.emit("new message", populatedMessage); // Optional: used if backend handles socket routing
    res.status(201).json(populatedMessage);
  } catch (error) {
    console.error("❌ Error sending message:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

