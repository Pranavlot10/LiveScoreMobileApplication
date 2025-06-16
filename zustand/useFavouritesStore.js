import { create } from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";
import useAuthStore from "./useAuthStore";

const defaultStructure = {
  football: { teams: [], leagues: [], matches: [] },
  cricket: { teams: [], leagues: [], matches: [] },
  basketball: { teams: [], leagues: [], matches: [] },
};

export const useFavouritesStore = create((set, get) => ({
  favourites: defaultStructure,

  loadFavourites: async () => {
    const userId = useAuthStore.getState().userId;
    const stored = await AsyncStorage.getItem(`favourites_user_${userId}`);
    if (stored) {
      set({ favourites: JSON.parse(stored) });
    }
  },

  saveFavourites: async (updatedFavourites) => {
    const userId = useAuthStore.getState().userId;
    await AsyncStorage.setItem(
      `favourites_user_${userId}`,
      JSON.stringify(updatedFavourites)
    );
  },

  addFavourite: async (item, sport, type) => {
    const current = get().favourites;
    const updatedList = [...current[sport][type], item];

    const updatedFavourites = {
      ...current,
      [sport]: {
        ...current[sport],
        [type]: updatedList,
      },
    };

    set({ favourites: updatedFavourites });
    await get().saveFavourites(updatedFavourites);
  },

  removeFavourite: async (id, sport, type) => {
    const current = get().favourites;
    const updatedList = current[sport][type].filter((fav) => fav.id !== id);

    const updatedFavourites = {
      ...current,
      [sport]: {
        ...current[sport],
        [type]: updatedList,
      },
    };

    set({ favourites: updatedFavourites });
    await get().saveFavourites(updatedFavourites);
  },

  isFavourite: (id, sport, type) => {
    const sportFavourites = get().favourites[sport];
    if (!sportFavourites || !sportFavourites[type]) return false;

    return sportFavourites[type].some((item) => item.id === id);
  },

  containsFavoriteTeam: (match, sport = "football") => {
    const sportFavourites = get().favourites[sport];
    if (!sportFavourites || !sportFavourites.teams) return false;

    const homeTeamId = match?.homeTeam?.id;
    const awayTeamId = match?.awayTeam?.id;

    return sportFavourites.teams.some(
      (team) => team.id === homeTeamId || team.id === awayTeamId
    );
  },
}));
