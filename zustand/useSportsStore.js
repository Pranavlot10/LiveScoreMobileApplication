import { create } from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";

const SPORT_STORAGE_KEY = "@selected_sport";

const useSportsStore = create((set) => ({
  sports: [
    { id: "1", name: "Football" },
    { id: "2", name: "Cricket" },
    { id: "3", name: "Basketball" },
  ],
  selectedSport: "Football", // Initial default, will be overridden by persisted value

  // Set selected sport and persist it
  setSelectedSport: async (sportName) => {
    try {
      await AsyncStorage.setItem(SPORT_STORAGE_KEY, sportName);
      set({ selectedSport: sportName });
    } catch (error) {
      console.error("Failed to save selected sport:", error);
    }
  },

  // Load persisted sport on initialization
  initializeSport: async () => {
    try {
      const savedSport = await AsyncStorage.getItem(SPORT_STORAGE_KEY);
      if (savedSport) {
        set({ selectedSport: savedSport });
      }
    } catch (error) {
      console.error("Failed to load selected sport:", error);
    }
  },
}));

export default useSportsStore;
