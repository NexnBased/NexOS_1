import { create } from "zustand";

const WelcomeDismissedKey = "nexos.welcome-dismissed";
const DesktopIconSizeKey = "nexos.desktop-icon-size";
const BackgroundUrlKey = "nexos.background-url";

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
  desktopIconSize: number;
  setDesktopIconSize: (size: number) => void;
  welcomeDismissed: boolean;
  setWelcomeDismissed: (dismissed: boolean) => void;
  backgroundUrl: string | null;
  setBackgroundUrl: (url: string | null) => void;
}

const readBool = (key: string, fallback = false) => {
  try {
    return typeof window !== "undefined" && localStorage.getItem(key) === "true"
      ? true
      : fallback;
  } catch {
    return fallback;
  }
};

const readNumber = (key: string, fallback: number) => {
  try {
    if (typeof window === "undefined") return fallback;
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    const n = Number(raw);
    return Number.isFinite(n) ? n : fallback;
  } catch {
    return fallback;
  }
};

const readString = (key: string, fallback: string | null = null) => {
  try {
    if (typeof window === "undefined") return fallback;
    const v = localStorage.getItem(key);
    return v ?? fallback;
  } catch {
    return fallback;
  }
};

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
  desktopIconSize: readNumber(DesktopIconSizeKey, 84),
  setDesktopIconSize: (size: number) => {
    const clamped = Math.max(32, Math.min(160, Math.round(size)));
    try {
      if (typeof window !== "undefined") {
        localStorage.setItem(DesktopIconSizeKey, String(clamped));
      }
    } catch {
      // null
    }
    set({ desktopIconSize: clamped });
  },
  welcomeDismissed: readBool(WelcomeDismissedKey, false),
  setWelcomeDismissed: (dismissed: boolean) => {
    try {
      if (typeof window !== "undefined") {
        if (dismissed) {
          localStorage.setItem(WelcomeDismissedKey, "true");
        } else {
          localStorage.removeItem(WelcomeDismissedKey);
        }
      }
    } catch {
      // null
    }
    set({ welcomeDismissed: dismissed });
  },
  backgroundUrl: readString(BackgroundUrlKey, null),
  setBackgroundUrl: (url: string | null) => {
    try {
      if (typeof window !== "undefined") {
        if (url) localStorage.setItem(BackgroundUrlKey, url);
        else localStorage.removeItem(BackgroundUrlKey);
      }
    } catch {
      // null
    }
    set({ backgroundUrl: url });
  },
}));
