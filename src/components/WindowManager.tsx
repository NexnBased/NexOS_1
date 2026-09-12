import Welcome from "./apps/Welcome";
import Window, { type WindowData } from "./Window";
import { useEffect, useState } from "react";

interface WindowManagerProps {
  viewport: {
    width: number;
    height: number;
  };
}

function WindowManager({ viewport }: WindowManagerProps) {
  const [windows, setWindows] = useState<WindowData[]>([]);
  const [nextZIndex, setNexnZIndex] = useState(1);

  const openWindow = (
    id: string,
    title: string,
    component: WindowData["component"],
    options?: {
      x?: number;
      y?: number;
      width?: number;
      height?: number;
    }
  ) => {
    setWindows((current) => {
      if (current.some((window) => window.id === id)) {
        return current;
      }

      return [
        ...current,
        {
          id,
          title,
          component,
          x: options?.x ?? 100,
          y: options?.y ?? 100,
          width: options?.width ?? 500,
          height: options?.height ?? 400,
          zIndex: nextZIndex,
        },
      ];
    });

    setNexnZIndex((value) => value + 1);
  };

  useEffect(() => {
    openWindow("welcome", "Welcome", Welcome, {
      x: 100,
      y: 100,
      width: 400,
      height: 150,
    });
  }, []);

  const closeWindow = (id: string) => {
    setWindows((current) => current.filter((window) => window.id !== id));
  };

  const focusWindow = (id: string) => {
    setNexnZIndex((value) => {
      setWindows((current) =>
        current.map((window) =>
          window.id === id
            ? { ...window, zIndex: value }
            : window
        )
      );

      return value + 1;
    });
  };

  const moveWindow = (
    id: string,
    position: { x: number; y: number }
  ) => {
    setWindows((current) =>
      current.map((window) =>
        window.id === id
          ? {
            ...window,
            x: position.x,
            y: position.y,
          }
          : window
      )
    )
  }

  const resizeWindow = (
    id: string,
    size: { width: number; height: number }
  ) => {
    setWindows((current) =>
      current.map((window) =>
        window.id === id
          ? {
            ...window,
            width: Math.max(200, size.width),
            height: Math.max(150, size.height),
          }
          : window
      )
    )
  }

  const minimizeWindow = (id: string) => {
    console.log("Minimize:", id);
  };

  const maximizeWindow = (id: string) => {
    console.log("Maximize:", id);
  };

  return (
    <>
      {windows.map((window) => (
        <Window
          key={window.id}
          window={window}
          viewport={viewport}
          onClose={() => closeWindow(window.id)}
          onMinimize={() => minimizeWindow(window.id)}
          onMaximize={() => maximizeWindow(window.id)}
          onFocus={focusWindow}
          onMove={(position) =>
            moveWindow(window.id, position)
          }
          onResize={(size) =>
            resizeWindow(window.id, size)
          }
        />
      ))}
    </>
  )
}

export default WindowManager;