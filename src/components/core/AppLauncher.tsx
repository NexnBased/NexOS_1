import { useRef, useMemo, useState, useEffect } from "react";
import { SearchIcon as Search, XIcon as X } from "lucide-react";

import { AppRegistry } from "../../app/AppRegistry";
import { useWindowStore } from "../../stores/WindowStore";
import { useUIStore } from "../../stores/UIStore";

import AppLauncherItem from "./AppLauncherItem";

function AppLauncher() {
  const launcherOpen = useUIStore((state) => state.launcherOpen);
  const closeLauncher = useUIStore((state) => state.closeLauncher);
  const openWindow = useWindowStore((state) => state.openWindow);

  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);

  const searchRef = useRef<HTMLInputElement>(null);

  const apps = useMemo(() => {
    return Object.values(AppRegistry).filter(
      (app) => app.showInLauncher !== false,
    );
  }, []);

  const filteredApps = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) {
      return apps;
    }

    return apps.filter((app) =>
      app.title.toLowerCase().includes(normalizedQuery),
    );
  }, [apps, query]);

  useEffect(() => {
    if (!launcherOpen) {
      return;
    }

    requestAnimationFrame(() => {
      searchRef.current?.focus();
    });
  }, [launcherOpen]);

  useEffect(() => {
    if (!launcherOpen) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        closeLauncher();
        return;
      }

      if (event.key === "ArrowRight") {
        event.preventDefault();

        setSelectedIndex((index) =>
          filteredApps.length === 0 ? 0 : (index + 1) % filteredApps.length,
        );

        return;
      }

      if (event.key === "ArrowLeft") {
        event.preventDefault();

        setSelectedIndex((index) =>
          filteredApps.length === 0
            ? 0
            : (index - 1 + filteredApps.length) % filteredApps.length,
        );

        return;
      }

      if (event.key === "ArrowDown") {
        event.preventDefault();

        setSelectedIndex((index) =>
          filteredApps.length === 0
            ? 0
            : Math.min(index + 1, filteredApps.length - 1),
        );

        return;
      }

      if (event.key === "ArrowUp") {
        event.preventDefault();

        setSelectedIndex((index) => Math.max(index - 1, 0));

        return;
      }

      if (event.key === "Enter") {
        event.preventDefault();

        const app = filteredApps[selectedIndex];

        if (!app) {
          return;
        }

        openWindow(app.id);
        closeLauncher();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [launcherOpen, filteredApps, selectedIndex, openWindow, closeLauncher]);

  if (!launcherOpen) {
    return null;
  }

  const launchApp = (appId: string) => {
    openWindow(appId);
    closeLauncher();
  };

  return (
    <div className="absolute inset-0 z-9000 flex flex-col bg-black/35 backdrop-blur-xl animate-in fade-in duration-200">
      <div className="flex justify-center pt-12">
        <div className="relative w-full max-w-xl px-4">
          <Search
            size={20}
            className="pointer-events-none absolute left-8 top-1/2 -translate-y-1/2 text-white/60"
          />

          <input
            ref={searchRef}
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setSelectedIndex(0);
            }}
            type="text"
            placeholder="Search applications..."
            className="h-12 w-full rounded-2xl bg-white/10 px-12 pr-12 text-white placeholder:text-white/50 shadow-2xl outline-none backdrop-blur-xl focus:border-white/30 focus:bg-white/15"
          />

          <button
            type="button"
            onClick={closeLauncher}
            aria-label="Close application launcher"
            className="absolute right-7 top-1/2 -translate-y-1/2 rounded-full p-1.5 text-white/60 transition hover:bg-white/10 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      <div className="flex flex-1 items-start justify-center overflow-y-auto px-8 py-12">
        {filteredApps.length > 0 ? (
          <div className="grid grid-cols-[repeat(auto-fit,minmax(112px,112px))] justify-center gap-x-6 gap-y-8 w-full max-w-4xl">
            {filteredApps.map((app, index) => (
              <AppLauncherItem
                key={app.id}
                app={app}
                selected={index === selectedIndex}
                onClick={() => launchApp(app.id)}
              />
            ))}
          </div>
        ) : (
          <div className="pt-12 text-center text-white/60">
            No applications found
          </div>
        )}
      </div>

      <div className="flex justify-center pb-8 text-xs text-white/40">
        <span>Arrow keys to navigate · Enter to launch · Esc to close</span>
      </div>
    </div>
  );
}

export default AppLauncher;
