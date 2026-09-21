import { create } from "zustand";
import { AppRegistry } from "../app/AppRegistry";
import type { WindowData } from "../types/window";

const welcomeAppDismissedKey = "nexos.welcome-dismissed";

interface WindowStore {
  windows: WindowData[];
  nextZIndex: number;
  desktopViewport: {
    width: number;
    height: number;
  };
  setDesktopViewport: (viewport: { width: number; height: number }) => void;

  openWindow: (
    appId: string,
    options?: {
      x?: number;
      y?: number;
      width?: number;
      height?: number;
      fileId?: string;
    },
  ) => void;

  closeWindow: (id: string) => void;
  focusWindow: (id: string) => void;
  minimizeWindow: (id: string) => void;
  restoreWindow: (id: string) => void;
  hoveredWindowId: string | null;
  setHoveredWindow: (id: string | null) => void;

  maximizeWindow: (
    id: string,
    viewport: {
      width: number;
      height: number;
    },
  ) => void;

  moveWindow: (
    id: string,
    position: {
      x: number;
      y: number;
    },
  ) => void;

  resizeWindow: (
    id: string,
    size: {
      width: number;
      height: number;
    },
  ) => void;
}

export const useWindowStore = create<WindowStore>((set) => ({
  windows: [],
  nextZIndex: 1,
  hoveredWindowId: null,
  setHoveredWindow: (id) => {
    set({ hoveredWindowId: id });
  },
  desktopViewport: {
    width: window.innerWidth,
    height: window.innerHeight,
  },
  setDesktopViewport: (viewport) => {
    set((state) => ({
      desktopViewport: viewport,
      windows: state.windows.map((window) => {
        if (window.maximized) {
          return {
            ...window,
            x: 0,
            y: 0,
            width: viewport.width,
            height: viewport.height,
          };
        }

        const maxX = Math.max(0, viewport.width - window.width);
        const maxY = Math.max(0, viewport.height - window.height);

        const width = Math.min(
          window.width,
          window.maxWidth ?? Number.POSITIVE_INFINITY,
          Math.max(window.minWidth, viewport.width - window.x),
        );

        const height = Math.min(
          window.height,
          window.maxHeight ?? Number.POSITIVE_INFINITY,
          Math.max(window.minHeight, viewport.height - window.y),
        );

        return {
          ...window,
          width,
          height,
          x: Math.min(Math.max(0, window.x), maxX),
          y: Math.min(Math.max(0, window.y), maxY),
        };
      }),
    }));
  },

  openWindow: (appId, options) => {
    const app = AppRegistry[appId];

    if (!app) {
      console.warn(`App ${appId} is not registered`);
      return;
    }

    set((state) => {
      const existingWindow = state.windows.find(
        (window) => window.id === appId,
      );

      if (existingWindow) {
        return {
          windows: state.windows.map((window) =>
            window.id === existingWindow.id
              ? {
                  ...window,
                  fileId: options?.fileId ?? window.fileId,
                  minimized: false,
                  zIndex: state.nextZIndex
                }
              : window
          ),
          nextZIndex: state.nextZIndex + 1
        };
      }

      const minWidth = app.minWidth ?? 200;
      const minHeight = app.minHeight ?? 150;
      const maxWidth = app.maxWidth;
      const maxHeight = app.maxHeight;
      const width = Math.min(
        Math.max(options?.width ?? app.defaultWidth, minWidth),
        maxWidth ?? Number.POSITIVE_INFINITY,
      );
      const height = Math.min(
        Math.max(options?.height ?? app.defaultHeight, minHeight),
        maxHeight ?? Number.POSITIVE_INFINITY,
      );
      const x =
        options?.x ?? Math.max(0, (state.desktopViewport.width - width) / 2);
      const y =
        options?.y ?? Math.max(0, (state.desktopViewport.height - height) / 2);

      const newWindow: WindowData = {
        id: app.id,
        appId: app.id,
        title: app.title,
        component: app.component,
        fileId: options?.fileId,
        x: Math.min(
          Math.max(0, x),
          Math.max(0, state.desktopViewport.width - width),
        ),
        y: Math.min(
          Math.max(0, y),
          Math.max(0, state.desktopViewport.height - height),
        ),
        width,
        height,
        minWidth,
        minHeight,
        maxWidth,
        maxHeight,
        resizable: app.resizable !== false,
        zIndex: state.nextZIndex,
        minimized: false,
        maximized: false,
      };

      return {
        windows: [...state.windows, newWindow],
        nextZIndex: state.nextZIndex + 1,
      };
    });
  },

  closeWindow: (id) => {
    if (id === "welcome") {
      localStorage.setItem(welcomeAppDismissedKey, "true");
    }

    set((state) => ({
      windows: state.windows.filter((window) => window.id !== id),
    }));
  },

  focusWindow: (id) => {
    set((state) => ({
      windows: state.windows.map((window) =>
        window.id === id
          ? { ...window, minimized: false, zIndex: state.nextZIndex }
          : window,
      ),

      nextZIndex: state.nextZIndex + 1,
    }));
  },

  minimizeWindow: (id) => {
    set((state) => ({
      windows: state.windows.map((window) =>
        window.id === id ? { ...window, minimized: true } : window,
      ),
    }));
  },

  restoreWindow: (id) => {
    set((state) => ({
      windows: state.windows.map((window) =>
        window.id === id
          ? { ...window, minimized: false, zIndex: state.nextZIndex }
          : window,
      ),

      nextZIndex: state.nextZIndex + 1,
    }));
  },

  maximizeWindow: (id, viewport) => {
    set((state) => ({
      windows: state.windows.map((window) => {
        if (window.id !== id) {
          return window;
        }

        if (window.maximized) {
          return {
            ...window,
            x: window.previousBounds?.x ?? 100,
            y: window.previousBounds?.y ?? 100,
            width: window.previousBounds?.width ?? window.width,
            height: window.previousBounds?.height ?? window.height,
            maximized: false,
            previousBounds: undefined,
            zIndex: state.nextZIndex,
          };
        }

        return {
          ...window,
          previousBounds: {
            x: window.x,
            y: window.y,
            width: window.width,
            height: window.height,
          },

          x: 0,
          y: 0,
          width: viewport.width,
          height: viewport.height,

          maximized: true,
          minimized: false,
          zIndex: state.nextZIndex,
        };
      }),

      nextZIndex: state.nextZIndex + 1,
    }));
  },

  moveWindow: (id, position) => {
    set((state) => ({
      windows: state.windows.map((window) => {
        if (window.id !== id || window.maximized) {
          return window;
        }

        const maxX = Math.max(0, state.desktopViewport.width - window.width);
        const maxY = Math.max(0, state.desktopViewport.height - window.height);

        return {
          ...window,
          x: Math.min(Math.max(0, position.x), maxX),
          y: Math.min(Math.max(0, position.y), maxY),
        };
      }),
    }));
  },

  resizeWindow: (id, size) => {
    set((state) => ({
      windows: state.windows.map((window) => {
        if (window.id !== id || window.maximized || !window.resizable) {
          return window;
        }

        const desktopMaxWidth = Math.max(
          window.minWidth,
          state.desktopViewport.width - window.x,
        );

        const desktopMaxHeight = Math.max(
          window.minHeight,
          state.desktopViewport.height - window.y,
        );

        const allowedMaxWidth = Math.min(
          desktopMaxWidth,
          window.maxWidth ?? Number.POSITIVE_INFINITY,
        );

        const allowedMaxHeight = Math.min(
          desktopMaxHeight,
          window.maxHeight ?? Number.POSITIVE_INFINITY,
        );

        return {
          ...window,
          width: Math.min(
            Math.max(window.minWidth, size.width),
            allowedMaxWidth,
          ),
          height: Math.min(
            Math.max(window.minHeight, size.height),
            allowedMaxHeight,
          ),
        };
      }),
    }));
  },
}));
