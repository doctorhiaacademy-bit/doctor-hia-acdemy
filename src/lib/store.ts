import { create } from "zustand";

interface AppState {
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  setDarkMode: (value: boolean) => void;
  // Auth state
  user: any | null;
  role: string | null;
  isPremium: boolean;
  setUser: (user: any | null, role: string | null, isPremium: boolean) => void;
}

export const useStore = create<AppState>((set) => ({
  isDarkMode: false,
  toggleDarkMode: () =>
    set((state) => {
      const newMode = !state.isDarkMode;
      if (newMode) document.documentElement.classList.add("dark");
      else document.documentElement.classList.remove("dark");
      return { isDarkMode: newMode };
    }),
  setDarkMode: (value) => {
    if (value) document.documentElement.classList.add("dark");
    else document.documentElement.classList.remove("dark");
    set({ isDarkMode: value });
  },

  user: null,
  role: null,
  isPremium: false,
  setUser: (user, role, isPremium) => set({ user, role, isPremium }),
}));
