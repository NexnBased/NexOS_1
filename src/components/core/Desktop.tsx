import { useRef, useMemo, useState, useEffect } from "react";
import { AppRegistry, AppIds } from "../../app/AppRegistry";

import Dock from "../Dock";
import DesktopIcon from "./DesktopIcon";
import WindowManager from "./WindowManager";
import AppLauncher from "./AppLauncher";
import DesktopContextMenu from "./DesktopContextMenu";

import { useUIStore } from "../../stores/UIStore";
import { useWindowStore } from "../../stores/WindowStore";
import Topbar from "../Topbar";

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

  const desktopIconSize = useUIStore((s) => s.desktopIconSize);
  const backgroundUrl = useUIStore((s) => s.backgroundUrl);
  const welcomeDismissed = useUIStore((s) => s.welcomeDismissed);

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

    return () => observer.disconnect();
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
      )
        return;
      closeContextMenu();
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeContextMenu();
    };

    window.addEventListener("pointerdown", handlePointerDown);
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("pointerdown", handlePointerDown);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [closeContextMenu]);

  useEffect(() => {
    if (!welcomeDismissed) {
      openWindow(AppIds.WELCOME);
    }
  }, [welcomeDismissed, openWindow]);

  const wallpaperUrl =
    backgroundUrl ??
    "https://wallpapercave.com/wp/wp14816721.webp";
  const startX = 24;
  const startY = 24;
  const gap = Math.max(12, Math.round(desktopIconSize * 0.28));
  const step = desktopIconSize + gap;
  const columns = Math.max(
    1,
    Math.floor(Math.max(1, (viewport.width - startX) / step)),
  );

  return (
    <main
      ref={desktopRef}
      className="relative size-full overflow-hidden bg-cover! bg-center! bg-no-repeat!"
      style={{ backgroundImage: `url(${wallpaperUrl})` }}
      onContextMenu={(event) => {
        event.preventDefault();
        if (event.target !== event.currentTarget) return;

        const rect = desktopRef.current?.getBoundingClientRect();
        if (!rect) return;

        openContextMenu({
          x: event.clientX - rect.left,
          y: event.clientY - rect.top,
        });
      }}
    >
      <Topbar />
      {desktopApps.map((app, index) => {
        const col = index % columns;
        const row = Math.floor(index / columns);
        const x = startX + col * step;
        const y = startY + row * step;
        return (
          <DesktopIcon
            x={x}
            y={y}
            size={desktopIconSize}
            key={app.id}
            appId={app.id}
          />
        );
      })}

      <AppLauncher />
      <DesktopContextMenu desktopRef={desktopRef} />
      <WindowManager viewport={viewport} />
      <Dock />
    </main>
  );
}

export default Desktop;
