import { useChatStore } from "../store/useChatStore";
import { useEffect, useRef, useState } from "react";

import ChatHeader from "./ChatHeader";
import MessageInput from "./MessageInput";
import MessageSkeleton from "./skeletons/MessageSkeleton";
import { useAuthStore } from "../store/useAuthStore";
import { formatMessageTime } from "../lib/utils";
import { useNavigate } from "react-router-dom";

const ChatContainer = () => {
  const {
    messages,
    getMessages,
    isMessagesLoading,
    selectedChat,
    subscribeToMessages,
    unSubscribeFromMessages,
  } = useChatStore();

  const { socket, authUser } = useAuthStore();

  const [newMessage, setNewMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [typingUsers, setTypingUsers] = useState([]);

  const messageEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const navigate = useNavigate();

  // ✅ Join selected chat room
  useEffect(() => {
    if (socket && selectedChat?._id) {
      socket.emit("join chat", selectedChat._id);
    }

    if (!selectedChat) {
      navigate("/"); // redirect to home or chat list
    }
  }, [socket, selectedChat]);

  // ✅ 🛡️ Check if user is still part of group
  useEffect(() => {
    if (!selectedChat) return;

    // If group and user is no longer a member
    if (selectedChat.isGroupChat && selectedChat.users) {
      const isStillMember = selectedChat.users.some(
        (u) => u._id === authUser._id
      );

      if (!isStillMember) {
        alert("❌ You were removed from the group.");

        // Clear the chat from Zustand
        useChatStore.setState({ selectedChat: null, messages: [] });

        navigate("/"); // go back to sidebar
      }
    }
  }, [selectedChat, authUser._id]);

  // ✅ Handle user typing
  const handleInputChange = (e) => {
    const value = e.target.value;
    setNewMessage(value);

    if (!socket || !selectedChat?._id) return;

    if (!isTyping) {
      setIsTyping(true);
      socket.emit("typing", {
        chatId: selectedChat._id,
        user: {
          _id: authUser._id,
          fullName: authUser.fullName,
          profilepic: authUser.profilepic,
        },
      });
    }

    clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit("stop typing", {
        chatId: selectedChat._id,
        userId: authUser._id,
      });
      setIsTyping(false);
    }, 2000);
  };

  // ✅ Listen for other users typing
  useEffect(() => {
    if (!socket || !selectedChat?._id) return;

    const handleTyping = ({ chatId, user }) => {
      if (
        chatId === selectedChat._id &&
        user._id !== authUser._id &&
        !typingUsers.some((u) => u._id === user._id)
      ) {
        setTypingUsers((prev) => [...prev, user]);
      }
    };

    const handleStopTyping = ({ chatId, userId }) => {
      if (chatId === selectedChat._id) {
        setTypingUsers((prev) => prev.filter((u) => u._id !== userId));
      }
    };

    socket.on("typing", handleTyping);
    socket.on("stop typing", handleStopTyping);

    return () => {
      socket.off("typing", handleTyping);
      socket.off("stop typing", handleStopTyping);
    };
  }, [socket, selectedChat, authUser._id, typingUsers]);

  // ✅ Load messages when chat is selected
  useEffect(() => {
    if (!selectedChat?._id) return;

    getMessages(selectedChat._id);
    subscribeToMessages();

    return () => unSubscribeFromMessages();
  }, [selectedChat?._id]);

  // ✅ Scroll to bottom when new messages arrive
  useEffect(() => {
    if (messageEndRef.current) {
      messageEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  if (isMessagesLoading) {
    return (
      <div className="flex-1 flex flex-col overflow-auto">
        <ChatHeader />
        <MessageSkeleton />
        <MessageInput value={newMessage} onChange={handleInputChange} />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-auto">
      <ChatHeader />

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => {
          const isMine = message.senderId._id === authUser._id;

          return (
            <div
              key={message._id}
              className={`chat ${isMine ? "chat-end" : "chat-start"}`}
            >
              <div className="chat-image avatar">
                <div className="size-10 rounded-full border">
                  <img
                    src={
                      isMine
                        ? authUser.profilepic || "/avatar.png"
                        : message.senderId?.profilepic || "/avatar.png"
                    }
                    alt="Sender"
                  />
                </div>
              </div>

              <div className="chat-header mb-1">
                {!isMine && (
                  <span className="text-xs mr-1 font-medium text-zinc-600">
                    {message.senderId?.fullName}
                  </span>
                )}
                <time className="text-xs opacity-50">
                  {formatMessageTime(message.createdAt)}
                </time>
              </div>

              <div className="chat-bubble flex flex-col">
                {message.image && (
                  <img
                    src={message.image}
                    alt="Attachment"
                    className="sm:max-w-[200px] rounded-md mb-2"
                  />
                )}
                {message.text && <p>{message.text}</p>}
              </div>
            </div>
          );
        })}

        {/* ✅ Typing Indicator */}
        {typingUsers.length > 0 && (
          <div className="italic text-sm text-gray-500 px-2">
            {typingUsers.map((u) => u.fullName).join(", ")}{" "}
            {typingUsers.length === 1 ? "is" : "are"} typing...
          </div>
        )}

        {/* 🔚 scroll anchor */}
        <div ref={messageEndRef} />
      </div>

      <MessageInput value={newMessage} onChange={handleInputChange} />
    </div>
  );
};

export default ChatContainer;
