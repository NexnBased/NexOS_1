import { create } from "zustand";

interface UIStore {
  launcherOpen: boolean;
  openLauncher: () => void;
  closeLauncher: () => void;
  toggleLauncher: () => void;
}

export const useUIStore = create<UIStore>((set) => ({
  launcherOpen: false,

  openLauncher: () => {
    set({ launcherOpen: true });
  },
  closeLauncher: () => {
    set({ launcherOpen: false });
  },
  toggleLauncher: () => {
    set((state) => ({ launcherOpen: !state.launcherOpen }));
  },
}));
