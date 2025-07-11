import User from "../models/user.model.js";
import Message from "../models/message.model.js";
import cloudinary from "../lib/cloudinary.js";

import streamifier from "streamifier";
import { getRecieverSocketId, io } from "../lib/socket.js";

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

// GET /api/messages/:chatId
export const getMessages = async (req, res) => {
  try {
    const { chatId } = req.params;

    const messages = await Message.find({ chatId })
      .populate("senderId", "fullName email profilepic") // Optional: show sender info
      .sort({ createdAt: 1 });

    res.status(200).json(messages);
  } catch (error) {
    console.error("Error fetching messages:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const sendMessage = async (req, res) => {
  try {
    console.log("req.body:", req.body);      // ✅ log incoming text & chatId
    console.log("req.file:", req.file);      // ✅ log image if present

    const { text, chatId } = req.body;
    const senderId = req.user._id;

    let imageUrl = "";

    // ✅ Upload image if exists
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

    // ✅ Save message
    const newMessage = new Message({
      senderId,
      chatId,
      text,
      image: imageUrl,
    });

    await newMessage.save();

    // ✅ Populate sender and chat's users
    const populatedMessage = await Message.findById(newMessage._id)
      .populate("senderId", "fullName profilepic")
      .populate({
        path: "chatId",
        populate: {
          path: "users",
          select: "fullName profilepic _id",
        },
      });

    // ✅ Log populated message for debugging
    console.log("📨 Populated Message:", JSON.stringify(populatedMessage, null, 2));

    // ✅ Validate chat and broadcast message via socket
    const chat = populatedMessage.chatId;

    if (chat && Array.isArray(chat.users)) {
      chat.users.forEach((user) => {
        if (user._id.toString() !== senderId.toString()) {
          const receiverSocketId = getRecieverSocketId(user._id);
          if (receiverSocketId) {
            io.to(receiverSocketId).emit("newMessage", populatedMessage);
          }
        }
      });
    } else {
      console.warn("⚠️ chat.users is missing or not an array", chat);
    }

    // ✅ Respond to sender
    res.status(201).json(populatedMessage);
  } catch (error) {
    console.error("❌ Error sending message:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
