import { useState, useEffect } from "react";
import { Settings } from "lucide-react";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";
import GroupSettingsModal from "./GroupSettingsModal";

const ChatHeader = () => {
  const { selectedChat, fetchGroupChats, setSelectedChat } = useChatStore();
  const { authUser, onlineUsers } = useAuthStore();
  const [showSettingsModal, setShowSettingsModal] = useState(false);

  useEffect(() => {
    if (!selectedChat || selectedChat.isGroupChat) return;

    // ✅ Manually compute chatPartner for 1-on-1 chats
    const partner = selectedChat.users?.find(
      (u) => u._id !== authUser._id
    );

    if (partner && !selectedChat.chatPartner) {
      setSelectedChat({
        ...selectedChat,
        chatPartner: partner,
      });
    }
  }, [selectedChat, authUser._id, setSelectedChat]);

  useEffect(() => {
    if (selectedChat?._id) {
      useChatStore.getState().clearNotificationsForChat(selectedChat._id);
    }
  }, [selectedChat?._id]);

  if (!selectedChat) return null;

  const isGroup = selectedChat?.isGroupChat;
  const isAdmin = isGroup && selectedChat.groupAdmin?._id === authUser._id;
  const isOnline = onlineUsers.includes(
    selectedChat?.chatPartner?._id || selectedChat?._id
  );

  return (
    <>
      <div className="border-b border-base-300 px-4 py-3 flex items-center gap-3 justify-between">
        {/* Left: Avatar & Info */}
        <div className="flex items-center gap-3">
          <div className="avatar">
            <div className="w-10 rounded-full ring ring-base-300">
              <img
                src={
                  isGroup
                    ? selectedChat.groupLogo || "/group-logo.webp"
                    : selectedChat.chatPartner?.profilepic || "/avatar.png"
                }
                alt="chat avatar"
              />
            </div>
          </div>
          <div>
            {/* Chat Name */}
            <div className="font-medium flex items-center gap-2">
              {isGroup
                ? selectedChat.chatName || "Group Chat"
                : selectedChat.chatPartner?.fullName || "Chat"}
              {isAdmin && (
                <span className="badge badge-sm badge-primary">Admin</span>
              )}
            </div>

            {/* Status or Group Description */}
            <div className="text-xs text-zinc-500">
              {isGroup
                ? selectedChat.description || "Group Chat"
                : isOnline
                ? "Online"
                : "Offline"}
            </div>
          </div>
        </div>

        {/* Right: Settings Button */}
        {isGroup && (
          <button
            onClick={() => setShowSettingsModal(true)}
            className="btn btn-sm btn-ghost"
          >
            <Settings className="size-5" />
          </button>
        )}
      </div>

      {/* Settings Modal */}
      {isGroup && showSettingsModal && (
        <GroupSettingsModal
          isOpen={showSettingsModal}
          onClose={() => setShowSettingsModal(false)}
          group={selectedChat}
          onGroupUpdated={async () => {
            await fetchGroupChats();
            const updated = useChatStore
              .getState()
              .groupChats.find((g) => g._id === selectedChat._id);
            if (updated) {
              setSelectedChat({ ...updated, isGroup: true });
            }
          }}
        />
      )}
    </>
  );
};

export default ChatHeader;
