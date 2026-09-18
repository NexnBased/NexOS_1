import { create } from "zustand";

interface ContextMenuPosition {
  x: number;
  y: number;
}

interface UIStore {
  launcherOpen: boolean;
  contextMenuOpen: boolean;
  contextMenuPosition: ContextMenuPosition;
  openLauncher: () => void;
  closeLauncher: () => void;
  toggleLauncher: () => void;
  openContextMenu: (position: ContextMenuPosition) => void;
  closeContextMenu: () => void;
}

export const useUIStore = create<UIStore>((set) => ({
  launcherOpen: false,
  contextMenuOpen: false,
  contextMenuPosition: {
    x: 0,
    y: 0,
  },
  openLauncher: () => {
    set({ launcherOpen: true, contextMenuOpen: false });
  },
  closeLauncher: () => {
    set({ launcherOpen: false });
  },
  toggleLauncher: () => {
    set((state) => ({
      launcherOpen: !state.launcherOpen,
      contextMenuOpen: false,
    }));
  },
  openContextMenu: (position) => {
    set({
      contextMenuOpen: true,
      contextMenuPosition: position,
      launcherOpen: false,
    });
  },
  closeContextMenu: () => {
    set({ contextMenuOpen: false });
  },
}));
