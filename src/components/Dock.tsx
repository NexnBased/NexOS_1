import { useMemo, useState, useEffect } from "react";
import { AppRegistry } from "../app/AppRegistry";
import { useWindowStore } from "../stores/WindowStore";

function Dock() {
  const windows = useWindowStore((state) => state.windows);
  const hoveredWindowId = useWindowStore((state) => state.hoveredWindowId);
  const openWindow = useWindowStore((state) => state.openWindow);
  const focusWindow = useWindowStore((state) => state.focusWindow);
  const restoreWindow = useWindowStore((state) => state.restoreWindow);

  const [bottomReveal, setBottomReveal] = useState(true);
  const [dockHovered, setDockHovered] = useState(false);
  const apps = useMemo(() => Object.values(AppRegistry), []);

  const maximizedWindow = windows.some((window) => window.maximized && !window.minimized);
  const hoveredWindow = windows.find((window) => window.id === hoveredWindowId);
  const visibleWindows = windows.filter((window) => !window.minimized);
  const topWindow = visibleWindows.reduce<(typeof visibleWindows)[number] | null>(
    (highest, window) => !highest || window.zIndex > highest.zIndex ? window : highest, null
  );

  const focusedWindowIsHovered = hoveredWindow?.id === topWindow?.id;
  useEffect(() => {
    const handlePointerMove = (event: PointerEvent) => {
      const revealZone = window.innerHeight - 32;
      setBottomReveal(event.clientY >= revealZone);
    };

    window.addEventListener("pointermove", handlePointerMove);

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
    };
  }, []);

  const shouldHide = maximizedWindow || (focusedWindowIsHovered && !dockHovered) || (!bottomReveal && !dockHovered);

  return (
    <nav
      aria-label="Application Dock"
      onPointerEnter={() => setDockHovered(true)}
      onPointerLeave={() => setDockHovered(false)}
      className={`
        fixed
        bottom-4
        left-1/2
        z-9999
        -translate-x-1/2

        flex
        items-end
        gap-1.5

        rounded-2xl
        border
        border-white/20
        bg-black/30
        p-2

        shadow-2xl
        backdrop-blur-xl

        transition-all
        duration-300
        ease-out

        ${shouldHide
          ? "translate-y-[calc(100%+1rem)] opacity-0 pointer-events-none"
          : "translate-y-0 opacity-100"
        }
      `}
    >
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
            onClick={handleClick}
            aria-label={app.title}
            className={`
              group
              relative

              flex
              h-14
              w-14
              shrink-0
              items-center
              justify-center

              rounded-xl

              text-2xl

              transition-all
              duration-150
              ease-out

              hover:-translate-y-2
              hover:scale-110

              focus:outline-none
              focus-visible:ring-2
              focus-visible:ring-white/70

              ${isMinimized
                ? "opacity-60"
                : "opacity-100"
              }
            `}
          >
            <img src={app.icon} className="duration-100 transition-transform group-hover:scale-110" />

            {isOpen && (
              <span
                className={`
                  absolute
                  bottom-0
                  left-1/2
                  h-1
                  -translate-x-1/2
                  rounded-full

                  transition-all
                  duration-150

                  ${isMinimized
                    ? "w-1.5 opacity-50"
                    : "w-4 opacity-100"
                  }
                `}
              />
            )}
          </button>
        )
      })}
    </nav>
  )
}

export default Dock;