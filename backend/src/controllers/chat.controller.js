import Chat from "../models/chat.model.js";
import User from "../models/user.model.js";
import { io, getRecieverSocketId } from "../lib/socket.js";
import cloudinary from "../lib/cloudinary.js";
import streamifier from "streamifier";

// Access or create private chat
const accessChat = async (req, res) => {
  const { userId } = req.body;
  if (!userId) return res.sendStatus(400);

  try {
    let isChat = await Chat.find({
      isGroupChat: false,
      $and: [
        { users: { $elemMatch: { $eq: req.user._id } } },
        { users: { $elemMatch: { $eq: userId } } },
      ],
    })
      .populate("users", "-password")
      .populate("latestMessage");

    isChat = await User.populate(isChat, {
      path: "latestMessage.sender",
      select: "fullName profilepic email",
    });

    if (isChat.length > 0) return res.send(isChat[0]);

    const newChat = await Chat.create({
      chatName: "sender",
      isGroupChat: false,
      users: [req.user._id, userId],
    });

    const fullChat = await Chat.findById(newChat._id).populate(
      "users",
      "-password"
    );
    res.status(200).json(fullChat);
  } catch (err) {
    console.error("Access Chat Error:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Fetch all chats of logged-in user
const fetchChats = async (req, res) => {
  try {
    let chats = await Chat.find({
      users: { $elemMatch: { $eq: req.user._id } },
    })
      .populate("users", "-password")
      .populate("groupAdmin", "-password")
      .populate("latestMessage")
      .sort({ updatedAt: -1 });

    chats = await User.populate(chats, {
      path: "latestMessage.sender",
      select: "fullName profilepic email",
    });

    res.status(200).json(chats);
  } catch (err) {
    console.error("Fetch Chats Error:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Get chat by ID
const getChatById = async (req, res) => {
  try {
    const { chatId } = req.params;
    const chat = await Chat.findById(chatId).populate("users", "-password");
    if (!chat) return res.status(404).json({ message: "Chat not found" });
    res.status(200).json(chat);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Create group chat
const createGroupChat = async (req, res) => {
  const { users, name } = req.body;
  if (!users || !name)
    return res.status(400).json({ message: "Fields required" });

  try {
    const parsedUsers = JSON.parse(users);
    if (parsedUsers.length < 2)
      return res.status(400).json({ message: "Minimum 2 users needed" });

    parsedUsers.push(req.user);

    const groupChat = await Chat.create({
      chatName: name,
      users: parsedUsers,
      isGroupChat: true,
      groupAdmin: req.user,
    });

    const fullGroupChat = await Chat.findById(groupChat._id)
      .populate("users", "-password")
      .populate("groupAdmin", "-password");

    io.emit("new_group", fullGroupChat);
    res.status(200).json(fullGroupChat);
  } catch (err) {
    console.error("Create Group Error:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Rename group
const renameGroup = async (req, res) => {
  const { chatId, chatName } = req.body;
  try {
    const updatedChat = await Chat.findByIdAndUpdate(
      chatId,
      { chatName },
      { new: true }
    )
      .populate("users", "-password")
      .populate("groupAdmin", "-password");

    if (!updatedChat)
      return res.status(404).json({ message: "Group not found" });

    io.emit("group_renamed", updatedChat);
    res.json(updatedChat);
  } catch (err) {
    console.error("Rename Error:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Add user to group
const addToGroup = async (req, res) => {
  const { chatId, userId } = req.body;

  try {
    const chat = await Chat.findByIdAndUpdate(
      chatId,
      { $addToSet: { users: userId } },
      { new: true }
    )
      .populate("users", "-password")
      .populate("groupAdmin", "-password");

    if (!chat) return res.status(404).json({ message: "Group not found" });

    // Notify all existing users except added one
    chat.users.forEach((user) => {
      const socketId = getRecieverSocketId(user._id.toString());
      if (user._id.toString() !== userId && socketId) {
        io.to(socketId).emit("notification", {
          message: `${chat.chatName}: A new member was added`,
          chatId: chat._id,
        });
      }
    });

    // Notify added user
    const addedSocket = getRecieverSocketId(userId);
    if (addedSocket) {
      io.to(addedSocket).emit("notification", {
        message: `You were added to group: ${chat.chatName}`,
        chatId: chat._id,
      });
    }

    res.json(chat);
  } catch (err) {
    console.error("Add Member Error:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Remove user from group
const removeFromGroup = async (req, res) => {
  const { chatId, userId } = req.body;

  try {
    const chat = await Chat.findByIdAndUpdate(
      chatId,
      { $pull: { users: userId } },
      { new: true }
    )
      .populate("users", "-password")
      .populate("groupAdmin", "-password");

    if (!chat) return res.status(404).json({ message: "Group not found" });

    const removedSocket = getRecieverSocketId(userId);
    if (removedSocket) {
      io.to(removedSocket).emit("notification", {
        message: `You were removed from group: ${chat.chatName}`,
        chatId: chat._id,
      });
    }

    chat.users.forEach((user) => {
      const socketId = getRecieverSocketId(user._id.toString());
      if (socketId) {
        io.to(socketId).emit("notification", {
          message: `${chat.chatName}: A member was removed`,
          chatId: chat._id,
        });
      }
    });

    res.json(chat);
  } catch (err) {
    console.error("Remove Member Error:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Leave group
const leaveGroup = async (req, res) => {
  try {
    const { chatId } = req.params;
    const userId = req.user._id;
    const group = await Chat.findById(chatId);

    if (!group || !group.isGroupChat)
      return res.status(404).json({ message: "Group not found" });

    if (group.groupAdmin.toString() === userId.toString()) {
      if (group.users.length === 1) {
        await Chat.findByIdAndDelete(chatId);
        io.emit("group_deleted", chatId);
        return res.status(200).json({ message: "Group deleted (admin left)" });
      } else {
        const newAdmin = group.users.find(
          (u) => u.toString() !== userId.toString()
        );
        group.groupAdmin = newAdmin;
      }
    }

    group.users = group.users.filter((u) => u.toString() !== userId.toString());
    await group.save();

    const updatedGroup = await Chat.findById(chatId)
      .populate("users", "-password")
      .populate("groupAdmin", "-password");

    updatedGroup.users.forEach((user) => {
      const socketId = getRecieverSocketId(user._id.toString());
      if (socketId) {
        io.to(socketId).emit("notification", {
          message: `${group.chatName}: A member left the group`,
          chatId,
        });
      }
    });

    res.json(updatedGroup);
  } catch (err) {
    console.error("Leave Group Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Update group logo
const updateGroupLogo = async (req, res) => {
  try {
    const { chatId } = req.body;
    const file = req.file;

    const chat = await Chat.findById(chatId);
    if (!chat || !chat.isGroupChat)
      return res.status(404).json({ message: "Group not found" });

    if (chat.groupAdmin.toString() !== req.user._id.toString())
      return res.status(403).json({ message: "Only admin can update logo" });

    if (!file) return res.status(400).json({ message: "No image provided" });

    const uploadStream = () =>
      new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: "group_logos" },
          (err, result) => {
            if (result) resolve(result);
            else reject(err);
          }
        );
        streamifier.createReadStream(file.buffer).pipe(stream);
      });

    const result = await uploadStream();
    chat.groupLogo = result.secure_url;
    await chat.save();

    res.json(chat);
  } catch (err) {
    console.error("Group logo upload failed:", err);
    res.status(500).json({ message: "Upload error" });
  }
};

// Delete group
const deleteGroup = async (req, res) => {
  try {
    const { id } = req.params;
    const chat = await Chat.findById(id);

    if (!chat || !chat.isGroupChat)
      return res.status(404).json({ message: "Group not found" });

    if (chat.groupAdmin.toString() !== req.user._id.toString())
      return res.status(403).json({ message: "Only admin can delete" });

    await Chat.deleteOne({ _id: id });
    io.emit("group_deleted", id);

    res.status(200).json({ message: "Group deleted" });
  } catch (err) {
    console.error("Delete group failed:", err);
    res.status(500).json({ message: "Server error" });
  }
};

export {
  accessChat,
  fetchChats,
  createGroupChat,
  renameGroup,
  addToGroup,
  removeFromGroup,
  leaveGroup,
  updateGroupLogo,
  deleteGroup,
  getChatById,
};
