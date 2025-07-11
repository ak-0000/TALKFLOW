import { create } from "zustand";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";
import { useAuthStore } from "./useAuthStore";

export const useChatStore = create((set, get) => ({
  messages: [],
  users: [],
  groupChats: [],
  selectedChat: null,
  isUsersLoading: false,
  isMessagesLoading: false,

  fetchGroupChats: async () => {
    try {
      const res = await axiosInstance.get("/chat"); // filters done on backend
      const groups = res.data.filter((chat) => chat.isGroupChat);
      set({ groupChats: groups });
    } catch (err) {
      console.error("Failed to load group chats:", err);
    }
  },

  // 🟢 Fetch sidebar users
  getUsers: async () => {
    set({ isUsersLoading: true });
    try {
      const response = await axiosInstance.get("/messages/users");
      set({ users: response.data, isUsersLoading: false });
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Failed to load users");
      set({ isUsersLoading: false });
    }
  },

  // 🟢 Fetch all group chats
  getChats: async () => {
    try {
      const response = await axiosInstance.post("/chat");
      set({ groupChats: response.data });
    } catch (error) {
      console.error("Error fetching group chats:", error);
      toast.error("Failed to load group chats");
    }
  },

  // 🟢 Fetch messages for selected chat
  getMessages: async (chatId) => {
    set({ isMessagesLoading: true });
    try {
      const response = await axiosInstance.get(`/messages/${chatId}`);
      set({ messages: response.data, isMessagesLoading: false });
    } catch (error) {
      console.error("Error fetching messages:", error);
      toast.error("Failed to load messages");
      set({ isMessagesLoading: false });
    }
  },

  // 🟢 Set selected chat
  setSelectedChat: (chat) => {
    set({ selectedChat: chat });
  },

  // 🟢 Send message
  sendMessage: async (messageData) => {
    const { messages } = get();
    try {
      let config = {};
      if (messageData instanceof FormData) {
        config.headers = {
          "Content-Type": "multipart/form-data",
        };
        for (let pair of messageData.entries()) {
          console.log(pair[0] + ": ", pair[1]);
        }
      }

      const response = await axiosInstance.post(
        "/messages/send",
        messageData,
        config
      );
      set({ messages: [...messages, response.data] });
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Failed to send message");
    }
  },

  // 🟢 Socket listeners
  subscribeToMessages: () => {
    const socket = useAuthStore.getState().socket;

    socket.on("newMessage", (newMessage) => {
      const selectedChat = get().selectedChat;

      // ✅ Fix: Safely compare chatId values
      const incomingChatId =
        typeof newMessage.chatId === "string"
          ? newMessage.chatId
          : newMessage.chatId._id;

      if (selectedChat && selectedChat._id === incomingChatId) {
        set((state) => ({
          messages: [...state.messages, newMessage],
        }));
      }
    });
  },

  unSubscribeFromMessages: () => {
    const socket = useAuthStore.getState().socket;
    socket.off("newMessage");
  },

  // 🟢 Create group
  createGroupChat: async (groupData) => {
    try {
      const response = await axiosInstance.post("/chat/group", groupData);
      toast.success("Group created successfully");
      set((state) => ({ groupChats: [...state.groupChats, response.data] }));
    } catch (error) {
      console.error("Group creation failed:", error);
      toast.error("Failed to create group");
    }
  },

  // 🟢 Rename group
  renameGroup: async (chatId, chatName) => {
    try {
      const response = await axiosInstance.put("/chat/rename", {
        chatId,
        chatName,
      });
      toast.success("Group renamed");
      set((state) => ({
        groupChats: state.groupChats.map((group) =>
          group._id === chatId ? response.data : group
        ),
      }));
    } catch (error) {
      console.error("Rename group failed:", error);
      toast.error("Failed to rename group");
    }
  },

  // 🟢 Add user to group
  addToGroup: async (chatId, userId) => {
    try {
      await axiosInstance.put("/chat/groupadd", {
        chatId,
        userId,
      });
      toast.success("User added to group");
    } catch (error) {
      console.error("Add to group failed:", error);
      toast.error("Failed to add user");
    }
  },

  // 🟢 Remove user from group
  removeFromGroup: async (chatId, userId) => {
    try {
      await axiosInstance.put("/chat/groupremove", {
        chatId,
        userId,
      });
      toast.success("User removed from group");
    } catch (error) {
      console.error("Remove from group failed:", error);
      toast.error("Failed to remove user");
    }
  },
  setGroupDescription: async (chatId, description) => {
    try {
      const res = await axiosInstance.put("/chat/description", {
        chatId,
        description,
      });
      toast.success("Description updated");
      set((state) => ({
        groupChats: state.groupChats.map((group) =>
          group._id === chatId ? res.data : group
        ),
      }));
    } catch (error) {
      console.error("Set description failed:", error);
      toast.error("Failed to update description");
    }
  },
  updateGroupLogo: async (chatId, formData) => {
    try {
      const res = await axiosInstance.put("/chat/logo", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success("Group logo updated");
      set((state) => ({
        groupChats: state.groupChats.map((group) =>
          group._id === chatId ? res.data : group
        ),
      }));
    } catch (error) {
      console.error("Logo update failed:", error);
      toast.error("Failed to update logo");
    }
  },
  leaveGroup: async (chatId) => {
    try {
      const res = await axiosInstance.put(`/chat/leave/${chatId}`);
      set((state) => ({
        groupChats: state.groupChats.filter((g) => g._id !== chatId),
        selectedChat: null,
      }));
      toast.success("You left the group");
    } catch (err) {
      console.error("Leave group failed:", err);
      toast.error("Failed to leave group");
    }
  },

  deleteGroup: async (chatId) => {
    try {
      await axiosInstance.delete(`/chat/${chatId}`);
      toast.success("Group deleted");
      set((state) => ({
        groupChats: state.groupChats.filter((group) => group._id !== chatId),
        selectedChat: null, // clear selection if deleted
      }));
    } catch (error) {
      console.error("Delete group failed:", error);
      toast.error("Failed to delete group");
    }
  },
}));
