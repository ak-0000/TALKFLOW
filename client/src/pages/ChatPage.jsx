import { useParams } from "react-router-dom";
import { useEffect } from "react";
import { useChatStore } from "../store/useChatStore";
import Homepage from "./Homepage";

const ChatPage = () => {
  const { chatId } = useParams();
  const { setSelectedChat, getMessages, clearNotificationsForChat, loadChatById } =
    useChatStore();

  useEffect(() => {
    if (chatId) {
      // 🧠 Optional: fetch full chat info
      loadChatById(chatId);

      // 🟢 Set selected chat
      setSelectedChat({ _id: chatId }); // Even temporary is okay

      // 🟢 Clear existing notifications
      clearNotificationsForChat(chatId);

      // 🟢 Load messages
      getMessages(chatId);
    }
  }, [chatId]);

  return <Homepage />;
};

export default ChatPage;
