import { LogOut, MessageSquare, Settings, User, Bell } from "lucide-react";
import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";
import { useChatStore } from "../store/useChatStore";

const Navbar = () => {
  const { authUser, logout, socket } = useAuthStore();
  const { clearNotificationsForChat, loadChatById } = useChatStore();
  const [notifications, setNotifications] = useState([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const navigate = useNavigate();

  // 🔔 Listen for incoming notifications from socket
  useEffect(() => {
    if (!socket) return;

    const handleNotification = (data) => {
      const currentChat = useChatStore.getState().selectedChat;
      const { chatId, message } = data;
      const resolvedChatId = typeof chatId === "string" ? chatId : chatId._id;

      // 🛑 If user is in the chat that was removed/deleted, clear it
      if (
        currentChat &&
        currentChat._id === resolvedChatId &&
        (message.includes("removed from group") ||
          message.includes("Group deleted") ||
          message.includes("member left the group"))
      ) {
        useChatStore.getState().setSelectedChat(null);
      }

      const audio = new Audio("/notifications.mp3");
      audio.play();
      setNotifications((prev) => [data, ...prev]);
    };

    socket.on("notification", handleNotification);

    return () => socket.off("notification", handleNotification);
  }, [socket]);

  const unreadCount = notifications.length;

  return (
    <header className="bg-base-100 border-b border-base-300 fixed w-full top-0 z-40 backdrop-blur-lg bg-base-100/80">
      <div className="container mx-auto px-4 h-16">
        <div className="flex justify-between items-center h-full">
          {/* 🧭 Left: Logo */}
          <Link
            to="/"
            className="flex items-center gap-2.5 hover:opacity-80 transition-all"
          >
            <div className="size-9 rounded-lg bg-primary/10 flex items-center justify-center">
              <MessageSquare className="w-5 h-5 text-primary" />
            </div>
            <h1 className="text-lg font-bold">TalkFlow</h1>
          </Link>

          {/* 🛠️ Right: Controls */}
          <div className="flex items-center gap-2 relative">
            {/* 🔔 Notification Bell */}
            <div className="relative">
              <button
                className="btn btn-sm btn-circle btn-ghost"
                onClick={() => setDropdownOpen(!dropdownOpen)}
              >
                <Bell className="size-5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* 📩 Notification Dropdown */}
              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-base-100 shadow-lg rounded-lg z-50 border border-base-300">
                  <div className="p-3 text-sm font-medium border-b">
                    Notifications
                  </div>
                  <ul className="max-h-60 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <li className="p-3 text-zinc-500 text-sm">
                        No new notifications
                      </li>
                    ) : (
                      notifications.map((n, i) => {
                        const chatId =
                          typeof n.chatId === "string"
                            ? n.chatId
                            : n.chatId._id;

                        return (
                          <li
                            key={i}
                            className="p-3 hover:bg-base-200 text-sm border-b last:border-none cursor-pointer"
                            onClick={async () => {
                              await loadChatById(chatId);

                              clearNotificationsForChat(chatId);

                              setNotifications((prev) =>
                                prev.filter((m) => {
                                  const id =
                                    typeof m.chatId === "string"
                                      ? m.chatId
                                      : m.chatId._id;
                                  return id !== chatId;
                                })
                              );

                              setDropdownOpen(false);
                              navigate(`/chat/${chatId}`);
                            }}
                          >
                            {n.message}
                          </li>
                        );
                      })
                    )}
                  </ul>
                  {notifications.length > 0 && (
                    <button
                      className="w-full text-xs p-2 hover:bg-red-100 text-red-500"
                      onClick={() => setNotifications([])}
                    >
                      Clear All
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* ⚙️ Settings */}
            <Link to="/settings" className="btn btn-sm gap-2">
              <Settings className="w-4 h-4" />
              <span className="hidden sm:inline">Settings</span>
            </Link>

            {/* 👤 Profile + Logout */}
            {authUser && (
              <>
                <Link to="/profile" className="btn btn-sm gap-2">
                  <User className="size-5" />
                  <span className="hidden sm:inline">Profile</span>
                </Link>
                <button className="flex gap-2 items-center" onClick={logout}>
                  <LogOut className="size-5" />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
