import { Dialog, DialogPanel, Transition } from "@headlessui/react";
import { Fragment, useEffect, useState } from "react";
import { X } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";
import { useChatStore } from "../store/useChatStore";
import SearchUser from "./SearchUser";

export default function GroupSettingsModal({
  isOpen,
  onClose,
  group,
  onGroupUpdated,
}) {
  const { authUser } = useAuthStore();
  const { renameGroup, addToGroup, removeFromGroup, leaveGroup, deleteGroup } =
    useChatStore();

  const [groupName, setGroupName] = useState("");
  const [groupDesc, setGroupDesc] = useState("");
  const [groupLogo, setGroupLogo] = useState(null);

  const isAdmin = group?.groupAdmin?._id === authUser._id;

  useEffect(() => {
    if (group) {
      setGroupName(group.chatName || group.name || "");
      setGroupDesc(group.description || "");
    }
  }, [group]);

  const handleRename = () => {
    if (groupName && groupName !== group.name) {
      renameGroup(group._id, groupName);
      onGroupUpdated();
    }
  };

  const handleUserAdd = (user) => {
    if (group.users.find((u) => u._id === user._id)) return;
    addToGroup(group._id, user._id);
    onGroupUpdated();
  };

  const handleRemove = (userId) => {
    removeFromGroup(group._id, userId);
    onGroupUpdated();
  };

  const handleLeave = () => {
    leaveGroup(group._id).then(() => {
      onGroupUpdated();
      onClose();
    });
  };

  const handleDelete = () => {
    deleteGroup(group._id);
    onGroupUpdated();
    onClose();
  };

  return (
    <Transition show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        {/* Overlay */}
        <Transition.Child
          as={Fragment}
          enter="transition-opacity duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="transition-opacity duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/40" />
        </Transition.Child>

        {/* Modal Content */}
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <Transition.Child
            as={Fragment}
            enter="transition-transform duration-300"
            enterFrom="scale-90 opacity-0"
            enterTo="scale-100 opacity-100"
            leave="transition-transform duration-200"
            leaveFrom="scale-100 opacity-100"
            leaveTo="scale-90 opacity-0"
          >
            <DialogPanel className="w-full max-w-2xl bg-base-100 rounded-lg p-6 shadow-lg">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-bold">Group Settings</h2>
                <X
                  className="size-5 cursor-pointer hover:text-red-500"
                  onClick={onClose}
                />
              </div>

              {/* Rename */}
              {isAdmin && (
                <div className="form-control mb-4">
                  <label className="label">Rename Group</label>
                  <input
                    className="input input-bordered"
                    value={groupName}
                    onChange={(e) => setGroupName(e.target.value)}
                  />
                  <button
                    onClick={handleRename}
                    className="btn btn-primary mt-2"
                  >
                    Save Name
                  </button>
                </div>
              )}

              {/* Add Members */}
              {isAdmin && (
                <div className="form-control mb-4">
                  <label className="label">Add Members</label>
                  <SearchUser onSelectUser={handleUserAdd} hideEmail />
                </div>
              )}

              {/* Members List */}
              <div className="form-control mb-4">
                <label className="label">Group Members</label>
                <ul className="space-y-2">
                  {group?.users?.map((user) => (
                    <li
                      key={user._id}
                      className="flex justify-between items-center p-2 border rounded"
                    >
                      <div className="flex items-center gap-2">
                        <img
                          src={user.profilepic || "/avatar.png"}
                          alt={user.fullName}
                          className="w-8 h-8 rounded-full"
                        />
                        <span>{user.fullName}</span>
                      </div>
                      {isAdmin && authUser._id !== user._id && (
                        <button
                          onClick={() => handleRemove(user._id)}
                          className="btn btn-error btn-xs"
                        >
                          Remove
                        </button>
                      )}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Leave/Delete Buttons */}
              <div className="flex justify-end gap-3">
                <button onClick={handleLeave} className="btn">
                  Leave Group
                </button>
                {isAdmin && (
                  <button onClick={handleDelete} className="btn btn-error">
                    Delete Group
                  </button>
                )}
              </div>
            </DialogPanel>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition>
  );
}
