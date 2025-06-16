import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";

const useAuthStore = create((set) => ({
  token: null,
  userId: null,
  setToken: async (newToken, userId) => {
    set({ token: newToken, userId });
    await AsyncStorage.setItem("userToken", newToken);
    await AsyncStorage.setItem("userId", userId.toString());
  },
  logout: async () => {
    set({ token: null, userId: null });
    await AsyncStorage.multiRemove(["userToken", "userId"]);
  },
  restoreToken: async () => {
    const storedToken = await AsyncStorage.getItem("userToken");
    const storedUserId = await AsyncStorage.getItem("userId");
    if (storedToken && storedUserId) {
      set({ token: storedToken, userId: parseInt(storedUserId) });
    }
  },
}));

export default useAuthStore;
