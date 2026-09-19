import { useRef, useMemo, useState, useEffect } from "react";
import { AppRegistry } from "../../app/AppRegistry";

import Dock from "../Dock";
import DesktopIcon from "./DesktopIcon";
import WindowManager from "./WindowManager";
import AppLauncher from "./AppLauncher";
import DesktopContextMenu from "./DesktopContextMenu";

import { useUIStore } from "../../stores/UIStore";
import { useWindowStore } from "../../stores/WindowStore";

function Desktop() {
  const desktopRef = useRef<HTMLElement>(null);
  const [viewport, setViewport] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });
  const setDesktopViewport = useWindowStore(
    (state) => state.setDesktopViewport,
  );
  const openWindow = useWindowStore((state) => state.openWindow);

  useEffect(() => {
    const element = desktopRef.current;
    if (!element) {
      return;
    }

    const updateSize = () => {
      const nextViewport = {
        width: element.clientWidth,
        height: element.clientHeight,
      };

      setViewport(nextViewport);
      setDesktopViewport(nextViewport);
    };

    updateSize();
    const observer = new ResizeObserver(updateSize);
    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [setDesktopViewport]);

  const desktopApps = useMemo(() => {
    return Object.values(AppRegistry).filter(
      (app) => app.showOnDesktop !== false,
    );
  }, []);

  const openContextMenu = useUIStore((state) => state.openContextMenu);
  const closeContextMenu = useUIStore((state) => state.closeContextMenu);

  useEffect(() => {
    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target as Node;

      if (
        target instanceof Element &&
        target.closest("[data-desktop-context-menu]")
      ) {
        return;
      }
      closeContextMenu();
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeContextMenu();
      }
    };

    window.addEventListener("pointerdown", handlePointerDown);
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("pointerdown", handlePointerDown);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [closeContextMenu]);

  useEffect(() => {
    const welcomeWasDismissed = localStorage.getItem("nexos.welcome-dismissed") === "true";
    if (!welcomeWasDismissed) {
      openWindow("welcome");
    }
  }, [openWindow]);

  const wallpaperUrl =
    "https://images8.alphacoders.com/136/thumb-1920-1363709.png";

  return (
    <main
      ref={desktopRef}
      className="relative size-full overflow-hidden bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: `url(${wallpaperUrl})` }}
      onContextMenu={(event) => {
        event.preventDefault();
        if (event.target !== event.currentTarget) {
          return;
        }

        const rect = desktopRef.current?.getBoundingClientRect();
        if (!rect) {
          return;
        }

        openContextMenu({
          x: event.clientX - rect.left,
          y: event.clientY - rect.top,
        });
      }}
    >
      {desktopApps.map((app, index) => (
        <DesktopIcon x={24} y={24 + index * 96} key={app.id} appId={app.id} />
      ))}

      <AppLauncher />
      <DesktopContextMenu desktopRef={desktopRef} />
      <WindowManager viewport={viewport} />
      <Dock />
    </main>
  );
}

export default Desktop;
