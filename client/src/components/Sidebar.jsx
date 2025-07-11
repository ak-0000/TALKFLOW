import { useEffect, useState, useRef } from "react";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";
import SidebarSkeleton from "./skeletons/SidebarSkeleton";
import { Users, Search, X, PlusCircle } from "lucide-react";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";
import CreateGroupChat from "./CreateGroupChat";

const Sidebar = () => {
  const {
    getUsers,
    users,
    selectedChat,
    setSelectedChat,
    isUsersLoading,
    groupChats,
    fetchGroupChats,
  } = useChatStore();

  const { onlineUsers, socket } = useAuthStore();

  const [showOnlineOnly, setShowOnlineOnly] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [showCreateGroupModal, setShowCreateGroupModal] = useState(false);
  const [activeTab, setActiveTab] = useState("users");

  const searchRef = useRef(null);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    if (selectedChat?._id) {
      useChatStore.getState().clearNotificationsForChat(selectedChat._id);
    }
  }, [selectedChat?._id]);

  const filteredUsers = users.filter((user) => {
    const matchesOnline = showOnlineOnly
      ? onlineUsers.includes(user._id)
      : true;
    const matchesSearch = user.fullName
      .toLowerCase()
      .startsWith(debouncedQuery.toLowerCase());
    return matchesOnline && matchesSearch;
  });

  const handleSelectChat = async (user) => {
    try {
      const res = await axiosInstance.post("/chat/", {
        userId: user._id,
      });

      const chat = res.data;

      const { authUser } = useAuthStore.getState();
      const chatPartner = chat.users.find((u) => u._id !== authUser._id);
      setSelectedChat({ ...chat, chatPartner });
    } catch (err) {
      console.error("❌ Failed to access chat:", err);
      toast.error("Failed to start chat");
    }
  };

  const handleGroupCreated = (groupData) => {
    console.log("Group created:", groupData);
    setShowCreateGroupModal(false);
    fetchGroupChats();
    setSelectedChat({ ...groupData, isGroup: true });
  };
  useEffect(() => {
    getUsers();
    fetchGroupChats();

    if (!socket) return;

    socket.on("new_user", () => {
      console.log("🟢 New user joined!");
      getUsers();
    });

    socket.on("new_group", (group) => {
      console.log("🟣 New group created:", group);
      fetchGroupChats(); // You can also do setGroupChats([...groupChats, group]) for better perf
    });
    socket.on("group_user_added", (updatedGroup) => {
      useChatStore.setState((state) => ({
        groupChats: state.groupChats.map((g) =>
          g._id === updatedGroup._id ? updatedGroup : g
        ),
      }));
    });

    socket.on("group_user_removed", (updatedGroup) => {
      useChatStore.setState((state) => ({
        groupChats: state.groupChats.map((g) =>
          g._id === updatedGroup._id ? updatedGroup : g
        ),
      }));
    });

    socket.on("group_user_left", (updatedGroup) => {
      const { authUser } = useAuthStore.getState();
      if (!updatedGroup.users.some((u) => u._id === authUser._id)) {
        // You left the group
        useChatStore.setState((state) => ({
          groupChats: state.groupChats.filter(
            (g) => g._id !== updatedGroup._id
          ),
        }));
      } else {
        // Someone else left
        useChatStore.setState((state) => ({
          groupChats: state.groupChats.map((g) =>
            g._id === updatedGroup._id ? updatedGroup : g
          ),
        }));
      }
    });

    socket.on("group_deleted", (deletedGroupId) => {
      useChatStore.setState((state) => ({
        groupChats: state.groupChats.filter((g) => g._id !== deletedGroupId),
      }));
    });

    return () => {
      socket.off("new_user");
      socket.off("new_group");
      socket.off("group_user_added");
      socket.off("group_user_removed");
      socket.off("group_user_left");
      socket.off("group_deleted");
    };
  }, [socket]);

  if (isUsersLoading) return <SidebarSkeleton />;

  return (
    <>
      <aside className="h-full w-20 lg:w-72 border-r border-base-300 flex flex-col transition-all duration-200">
        {/* Header */}
        <div className="border-b border-base-300 w-full p-5 flex items-center gap-2">
          <Users className="size-6" />
          <span className="font-medium hidden lg:block">Contacts</span>
        </div>

        {/* Tabs */}
        <div className="px-5 pt-2 hidden lg:flex gap-3 border-b border-base-300">
          <button
            className={`text-sm py-2 px-3 rounded-t font-medium transition-all ${
              activeTab === "users"
                ? "bg-base-200 text-primary"
                : "text-zinc-500 hover:text-primary"
            }`}
            onClick={() => setActiveTab("users")}
          >
            Users
          </button>
          <button
            className={`text-sm py-2 px-3 rounded-t font-medium transition-all ${
              activeTab === "groups"
                ? "bg-base-200 text-primary"
                : "text-zinc-500 hover:text-primary"
            }`}
            onClick={() => setActiveTab("groups")}
          >
            Groups
          </button>
        </div>

        {/* Search input */}
        {activeTab === "users" && (
          <div className="px-5 pt-3 hidden lg:block">
            <div className="relative">
              <input
                ref={searchRef}
                type="text"
                placeholder="Search user..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-3 py-2 pr-10 border border-base-300 rounded text-sm bg-base-100"
              />
              <Search className="absolute right-2 top-2.5 size-4 text-zinc-400" />
              {searchQuery && (
                <X
                  className="absolute right-8 top-2.5 size-4 text-zinc-400 cursor-pointer hover:text-red-500"
                  onClick={() => {
                    setSearchQuery("");
                    setDebouncedQuery("");
                    searchRef.current?.focus();
                  }}
                />
              )}
            </div>
          </div>
        )}

        {/* Online Toggle */}
        {activeTab === "users" && (
          <div className="px-5 pt-2 hidden lg:flex items-center gap-2">
            <label className="cursor-pointer flex items-center gap-2">
              <input
                type="checkbox"
                checked={showOnlineOnly}
                onChange={(e) => setShowOnlineOnly(e.target.checked)}
                className="checkbox checkbox-sm"
              />
              <span className="text-sm">Show online only</span>
            </label>
            <span className="text-xs text-zinc-500">
              ({Math.max(onlineUsers.length - 1, 0)} online)
            </span>
          </div>
        )}

        {/* Users List */}
        <div className="overflow-y-auto w-full py-3 px-2">
          {activeTab === "users" &&
            filteredUsers.map((user) => (
              <button
                key={user._id}
                onClick={() => handleSelectChat(user)}
                className={`w-full p-3 flex items-center gap-3 hover:bg-base-300 transition-colors rounded ${
                  selectedChat?.chatPartner?._id === user._id
                    ? "bg-base-300 ring-1 ring-base-300"
                    : ""
                }`}
              >
                <div className="relative mx-auto lg:mx-0">
                  <img
                    src={user.profilepic || "/avatar.png"}
                    alt={user.fullName}
                    className="size-12 object-cover rounded-full"
                  />
                  {onlineUsers.includes(user._id) && (
                    <span className="absolute bottom-0 right-0 size-3 bg-green-500 rounded-full ring-2 ring-zinc-900" />
                  )}
                </div>
                <div className="hidden lg:block text-left min-w-0">
                  <div className="font-medium truncate">{user.fullName}</div>
                </div>
              </button>
            ))}

          {/* No user found message */}
          {activeTab === "users" && filteredUsers.length === 0 && (
            <div className="text-center text-zinc-500 py-4">No users found</div>
          )}

          {/* Groups List */}
          {activeTab === "groups" && (
            <div className="px-5 pb-3 flex items-center justify-between">
              <span className="text-sm font-medium text-zinc-600">
                Your Groups
              </span>
              <button
                onClick={() => setShowCreateGroupModal(true)}
                className="text-blue-500 hover:text-blue-700 flex items-center gap-1 text-sm"
              >
                <PlusCircle className="size-4" />
                <span className="hidden lg:inline">Create</span>
              </button>
            </div>
          )}

          {activeTab === "groups" && groupChats.length === 0 && (
            <div className="text-center text-zinc-500 py-8">No groups yet</div>
          )}

          {activeTab === "groups" &&
            groupChats.map((group) => (
              <button
                key={group._id}
                onClick={() => setSelectedChat({ ...group, isGroup: true })}
                className={`w-full p-3 flex items-center gap-3 hover:bg-base-300 transition-colors rounded ${
                  selectedChat?._id === group._id
                    ? "bg-base-300 ring-1 ring-base-300"
                    : ""
                }`}
              >
                <div className="relative mx-auto lg:mx-0">
                  <img
                    src="/group-logo.webp"
                    alt={group.groupName}
                    className="size-12 object-cover rounded-full"
                  />
                </div>
                <div className="hidden lg:block text-left min-w-0">
                  <div className="font-medium truncate">
                    {group.groupName || group.chatName}
                  </div>
                  <div className="text-xs text-zinc-500 truncate">
                    Group chat
                  </div>
                </div>
              </button>
            ))}
        </div>
      </aside>

      {/* Create Group Modal (Optional placeholder) */}
      {showCreateGroupModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-base-100 rounded-lg shadow-lg p-6 w-[90%] max-w-md relative">
            <button
              onClick={() => setShowCreateGroupModal(false)}
              className="absolute top-2 right-2 text-gray-400 hover:text-red-500"
            >
              <X className="size-5" />
            </button>
            <CreateGroupChat onGroupCreated={handleGroupCreated} />
          </div>
        </div>
      )}
    </>
  );
};

export default Sidebar;
