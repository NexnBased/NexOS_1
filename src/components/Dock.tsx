import { useEffect, useMemo, useState } from "react";
import { AppRegistry } from "../app/AppRegistry";
import { useWindowStore } from "../stores/WindowStore";
import { Grid2X2 } from "lucide-react";
import { useUIStore } from "../stores/UIStore";

function Dock() {
  const windows = useWindowStore((state) => state.windows);
  const hoveredWindowId = useWindowStore((state) => state.hoveredWindowId);
  const openWindow = useWindowStore((state) => state.openWindow);
  const focusWindow = useWindowStore((state) => state.focusWindow);
  const restoreWindow = useWindowStore((state) => state.restoreWindow);
  const [bottomReveal, setBottomReveal] = useState(false);
  const [dockHovered, setDockHovered] = useState(false);
  const apps = useMemo(() => {
    return Object.values(AppRegistry).filter((app) => app.showInDock !== false);
  }, []);

  const maximizedWindow = windows.some(
    (window) => window.maximized && !window.minimized,
  );
  const hoveredWindow = windows.find((window) => window.id === hoveredWindowId);
  const isWindowHovered = hoveredWindow !== undefined;

  const launcherOpen = useUIStore((state) => state.launcherOpen);
  const toggleLauncher = useUIStore((state) => state.toggleLauncher);

  useEffect(() => {
    const handlePointerMove = (event: PointerEvent) => {
      const revealZone = window.innerHeight - 48;
      setBottomReveal(event.clientY >= revealZone);
    };

    window.addEventListener("pointermove", handlePointerMove);

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
    };
  }, []);

  const shouldHide =
    launcherOpen ||
    maximizedWindow ||
    (isWindowHovered && !dockHovered && !bottomReveal);

  return (
    <nav
      aria-label="Application Dock"
      onPointerEnter={() => setDockHovered(true)}
      onPointerLeave={() => setDockHovered(false)}
      className={`fixed bottom-4 left-1/2 z-9999 -translate-x-1/2 flex items-end gap-1.5 rounded-2xl bg-black/30 p-2 shadow-2xl backdrop-blur-xl transition-all duration-300 ease-out
        ${
          shouldHide
            ? "translate-y-[calc(100%+1rem)] opacity-0 pointer-events-none"
            : "translate-y-0 opacity-100"
        }
      `}
    >
      <button
        type="button"
        title="Applications"
        aria-label="Open applications"
        aria-expanded={launcherOpen}
        onClick={toggleLauncher}
        className="group relative flex size-14 shrink-0 items-center justify-center rounded-xl text-white transition-all duration-150 ease-out hover:-translate-y-2 hover:scale-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
      >
        <Grid2X2
          size={28}
          strokeWidth={1.8}
          className="transition-transform duration-150 group-hover:scale-110"
        />
      </button>
      {apps.map((app) => {
        const window = windows.find((item) => item.appId === app.id);
        const isOpen = Boolean(window);
        const isMinimized = window?.minimized ?? false;

        const handleClick = () => {
          if (!window) {
            openWindow(app.id);
            return;
          }

          if (isMinimized) {
            restoreWindow(window.id);
            return;
          }

          focusWindow(window.id);
        };

        return (
          <button
            key={app.id}
            type="button"
            title={app.title}
            aria-label={app.title}
            onClick={handleClick}
            className={`group relative flex h-14 w-14 shrink-0 items-center justify-center rounded-xl transition-all duration-150 ease-out hover:-translate-y-2 hover:scale-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70
              ${isMinimized ? "opacity-60" : "opacity-100"}
            `}
          >
            <img
              src={app.icon}
              alt=""
              draggable={false}
              className="size-10 rounded-md object-contain transition-transform duration-100 group-hover:scale-110"
            />

            {isOpen && (
              <span
                className={`absolute bottom-0 left-1/2 h-1 -translate-x-1/2 rounded-full bg-purple-100 transition-all duration-150
                  ${isMinimized ? "w-1.5 opacity-50" : "w-4 opacity-100"}
                `}
              />
            )}
          </button>
        );
      })}
    </nav>
  );
}

export default Dock;
