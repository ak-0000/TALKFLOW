import { useState, useEffect } from "react";
import { axiosInstance } from "../lib/axios";

export default function SearchUser({ onSelectUser, hideEmail = false }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      handleSearch();
    }, 300);
    return () => clearTimeout(delayDebounce);
  }, [searchQuery]);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setLoading(true);
    try {
      const res = await axiosInstance.get(`/user?search=${searchQuery}`);
      setSearchResults(res.data);
    } catch (err) {
      console.error("Search failed:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (user) => {
    onSelectUser(user);
    setSearchQuery("");
    setSearchResults([]);
  };

  return (
    <div className="relative w-full">
      <input
        type="text"
        placeholder="Search users..."
        className="input input-bordered w-full"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />

      {/* Dropdown results */}
      {searchResults.length > 0 && (
        <ul className="absolute z-50 mt-2 w-full bg-base-100 border border-base-300 rounded shadow max-h-60 overflow-y-auto">
          {searchResults.map((user) => (
            <li
              key={user._id}
              onClick={() => handleSelect(user)}
              className="px-4 py-2 hover:bg-base-200 cursor-pointer flex items-center gap-2"
            >
              <img
                src={user.profilepic || "/avatar.png"}
                alt={user.fullName}
                className="w-6 h-6 rounded-full"
              />
              <div className="flex flex-col">
                <span className="font-medium">{user.fullName}</span>
                {!hideEmail && (
                  <span className="text-xs text-zinc-500">{user.email}</span>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
