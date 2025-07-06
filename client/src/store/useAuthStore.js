import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";

export const useAuthStore = create((set) => ({
  authUser: null,
  isSigningUp: false,
  isLoggingIn: false,
  isCheckingAuth: true,
  isUpdatingProfile: false,
  onlineUsers: [],

  checkAuth: async () => {
    try {
      const res = await axiosInstance.get("/auth/check");
      set({
        authUser: res.data,
      });
    } catch (err) {
      set({
        authUser: null,
      });
      console.error("Error checking auth:", err);
    } finally {
      set({
        isCheckingAuth: false,
      });
    }
  },
  
  signup : async(data) => {
    set({ isSigningUp: true });
    try{
      const res = await axiosInstance.post("/auth/signup", data);
      toast.success("Account created successfully!");
      set({authUser: res.data});
    }catch(err) {
      console.error("Error signing up:", err);
    }finally{
      set({ isSigningUp: false });
    }
  }, 

  login : async(data) => {
    set({ isLoggingIn: true });
    try {
      const res = await axiosInstance.post("/auth/login", data);
      toast.success("Logged in successfully!");
      set({ authUser: res.data });
    } catch (err) {
      console.error("Error logging in:", err);
      toast.error("Failed to log in. Please try again.");
    } finally {
      set({ isLoggingIn: false });
    }
  },

  logout : async () => {
    try {
      await axiosInstance.post("/auth/logout");
      set({ authUser: null });
      toast.success("Logged out successfully!");
    } catch (err) {
      console.error("Error logging out:", err);
      toast.error("Failed to log out. Please try again.");
    }
  },

  updateProfile : async (data) => {
    set({ isUpdatingProfile: true });
    try {
      const res = await axiosInstance.put("/auth/update-profile", data);
      console.log("Profile update response:", res.data);
      set((state) => ({
        authUser: { ...state.authUser, ...res.data },
      }));
      toast.success("Profile updated successfully!");
    } catch (err) {
      console.error("Error updating profile:", err);
      toast.error("Failed to update profile. Please try again.");
    } finally {
      set({ isUpdatingProfile: false });
    }
  },
  


}));
