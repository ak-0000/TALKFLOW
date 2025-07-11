import { useState } from "react";
import { X, UsersRound } from "lucide-react";
import { useChatStore } from "../store/useChatStore";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";

const CreateGroupChat = ({ onGroupCreated }) => {
  const { users } = useChatStore();
  const [groupName, setGroupName] = useState("");
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [isCreating, setIsCreating] = useState(false);

  const toggleUser = (userId) => {
    setSelectedUsers((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  const handleSubmit = async () => {
    if (!groupName || selectedUsers.length < 2) {
      toast.error("Group name and at least 2 users required");
      return;
    }

    setIsCreating(true);
    try {
      const res = await axiosInstance.post("/chat/group", {
        name: groupName,
        users: JSON.stringify(selectedUsers),
      });

      toast.success("Group created!");
      onGroupCreated(res.data);
    } catch (err) {
      console.error("Group creation error:", err);
      toast.error("Failed to create group");
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="bg-base-100 p-4 rounded-md shadow-md w-full max-w-md">
      <div className="flex justify-between items-center mb-3">
        <h2 className="text-lg font-semibold flex gap-2 items-center">
          <UsersRound className="size-5" />
          Create Group Chat
        </h2>
        <X
          onClick={onGroupCreated}
          className="cursor-pointer hover:text-red-500"
        />
      </div>

      <input
        type="text"
        placeholder="Enter group name"
        className="input input-bordered w-full mb-4"
        value={groupName}
        onChange={(e) => setGroupName(e.target.value)}
      />

      <div className="max-h-52 overflow-y-auto space-y-2 mb-4">
        {users.map((user) => (
          <label
            key={user._id}
            className="flex items-center gap-3 p-2 rounded hover:bg-base-200 cursor-pointer"
          >
            <input
              type="checkbox"
              className="checkbox checkbox-sm"
              checked={selectedUsers.includes(user._id)}
              onChange={() => toggleUser(user._id)}
            />
            <img
              src={user.profilepic || "/avatar.png"}
              className="size-8 rounded-full"
              alt={user.fullName}
            />
            <span>{user.fullName}</span>
          </label>
        ))}
      </div>

      <button
        className="btn btn-primary w-full"
        onClick={handleSubmit}
        disabled={isCreating}
      >
        {isCreating ? "Creating..." : "Create Group"}
      </button>
    </div>
  );
};

export default CreateGroupChat;
