import { create } from "zustand";
import { AppRegistry } from "../app/AppRegistry";
import type { WindowData } from "../types/window";

interface WindowStore {
  windows: WindowData[];
  nextZIndex: number;

  openWindow: (
    appId: string,
    options?: {
      x?: number;
      y?: number;
      width?: number;
      height?: number;
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
                  minimized: false,
                  zIndex: state.nextZIndex,
                }
              : window,
          ),

          nextZIndex: state.nextZIndex + 1,
        };
      }

      const newWindow: WindowData = {
        id: app.id,
        appId: app.id,
        title: app.title,
        component: app.component,
        x: options?.x ?? 100,
        y: options?.y ?? 100,
        width: options?.width ?? app.defaultWidth,
        height: options?.height ?? app.defaultHeight,
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
      windows: state.windows.map((window) =>
        window.id === id ? { ...window, x: position.x, y: position.y } : window,
      ),
    }));
  },

  resizeWindow: (id, size) => {
    set((state) => ({
      windows: state.windows.map((window) =>
        window.id === id
          ? {
              ...window,
              width: Math.max(200, size.width),
              height: Math.max(150, size.height),
            }
          : window,
      ),
    }));
  },
}));
