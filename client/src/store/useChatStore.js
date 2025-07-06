import { create } from "zustand";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";
import { useAuthStore } from "./useAuthStore";

export const useChatStore = create((set, get) => ({
  // ✅ added `get`
  messages: [],
  users: [],
  selectedUser: null, // ✅ fixed typo from `selectedUsers` to `selectedUser`
  isUsersLoading: false,
  isMessagesLoading: false,

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

  getMessages: async (userId) => {
    set({ isMessagesLoading: true });
    try {
      const response = await axiosInstance.get(`/messages/${userId}`);
      set({ messages: response.data, isMessagesLoading: false });
    } catch (error) {
      console.error("Error fetching messages:", error);
      toast.error("Failed to load messages");
      set({ isMessagesLoading: false });
    }
  },

  setSelectedUser: (selectedUser) => {
    set({ selectedUser }); // ✅ make sure the property is spelled the same
  },

  sendMessage: async (messageData) => {
    const { selectedUser, messages } = get();

    try {
      let config = {};
      let payload = messageData;

      if (messageData instanceof FormData) {
        config.headers = {
          "Content-Type": "multipart/form-data",
        };
      }

      const response = await axiosInstance.post(
        `/messages/send/${selectedUser._id}`,
        payload,
        config
      );

      set({ messages: [...messages, response.data] });
    } catch (error) {
      console.error("Error sending message:", error?.response?.data || error);
      toast.error("Failed to send message");
    }
  },
  subscribeToMessages: () => {
    const { selectedUser } = get();
    if (!selectedUser) return;

    const socket = useAuthStore.getState().socket;

    socket.on("newMessage", (newMessage) => {
      const isFromSelectedUser = newMessage.senderId === selectedUser._id;
      const isToMeFromSelectedUser = newMessage.receiverId === selectedUser._id;

      // Append only if it's part of the current chat
      if (isFromSelectedUser || isToMeFromSelectedUser) {
        set({ messages: [...get().messages, newMessage] });
      }
    });
  },

  unSubscribeFromMessages: () => {
    const socket = useAuthStore.getState().socket;
    socket.off("newMessage");
  },
}));
