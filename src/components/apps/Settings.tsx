// src/components/apps/Settings.tsx
import { useState } from "react";
import { useFileSystemStore } from "../../stores/FileSystemStore";
import { useUIStore } from "../../stores/UIStore";

const PRESET_BACKGROUNDS = [
  { id: "default", label: "Default", url: "" },
  {
    id: "[valentinromero]",
    label: "[valentinromero]",
    url: "https://i.pinimg.com/1200x/13/41/45/13414519583c03a8576b45d6171c11c9.jpg",
  },
  {
    id: "[mount]",
    label: "[mount]",
    url: "https://i.pinimg.com/1200x/e5/08/26/e50826bf40f25ed9445738cb7bfb6ba2.jpg",
  },
  {
    id: "[patafixixatap]",
    label: "[patafixixatap]",
    url: "https://i.pinimg.com/736x/2a/a0/55/2aa0551f4827c36d8175ec844143affc.jpg",
  },
  {
    id: "[batman]",
    label: "[batman]",
    url: "https://i.pinimg.com/736x/72/c3/5b/72c35bfb8bf0bca7547b121c3b81e9d4.jpg",
  },
];

function Settings() {
  const resetFileSystem = useFileSystemStore((s) => s.resetFileSystem);
  const welcomeDismissed = useUIStore((s) => s.welcomeDismissed);
  const setWelcomeDismissed = useUIStore((s) => s.setWelcomeDismissed);
  const desktopIconSize = useUIStore((s) => s.desktopIconSize);
  const setDesktopIconSize = useUIStore((s) => s.setDesktopIconSize);
  const backgroundUrl = useUIStore((s) => s.backgroundUrl);
  const setBackgroundUrl = useUIStore((s) => s.setBackgroundUrl);
  const [customBg, setCustomBg] = useState(backgroundUrl ?? "");

  const handleReset = () => {
    const ok = window.confirm(
      "Reset filesystem to the default initial state? This will remove user-created files and folders.",
    );
    if (!ok) return;
    try {
      resetFileSystem();
      setWelcomeDismissed(false);
      window.alert("Filesystem has been reset.");
    } catch (err) {
      console.error("Failed to reset filesystem:", err);
      window.alert("Failed to reset filesystem. See console for details.");
    }
  };

  return (
    <div className="flex h-full min-h-0 w-full flex-col overflow-hidden">
      <main className="flex-1 overflow-auto p-4">
        <section className="mb-6">
          <h4 className="text-sm font-semibold mb-2">General</h4>
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={!welcomeDismissed}
                onChange={(e) => {
                  const checked = e.target.checked;
                  setWelcomeDismissed(!checked);
                }}
                className="ml-2 accent-purple-800 focus:ring-purple-500"
              />
              <span className="text-sm">Show welcome on startup</span>
            </label>
          </div>
        </section>

        <section className="mb-6">
          <h4 className="text-sm font-semibold mb-2">Desktop</h4>
          <div className="flex flex-col gap-3">
            <div>
              <label className="text-xs text-zinc-700">Desktop icon size</label>
              <div className="flex items-center gap-3 mt-1">
                <input
                  type="range"
                  min={32}
                  max={160}
                  value={desktopIconSize}
                  onChange={(e) => setDesktopIconSize(Number(e.target.value))}
                  className="flex-1 ml-2 accent-purple-800"
                />
                <div className="w-16 text-right text-xs text-zinc-700">
                  {desktopIconSize}px
                </div>
              </div>
            </div>

            <div>
              <label className="text-xs text-zinc-700 mb-2 block">
                Desktop background
              </label>
              <div className="flex gap-2 flex-wrap">
                {PRESET_BACKGROUNDS.map((bg) => (
                  <button
                    key={bg.id}
                    type="button"
                    onClick={() => setBackgroundUrl(bg.url || null)}
                    className={`w-28 h-16 rounded-md overflow-hidden ${backgroundUrl === (bg.url || null) ? "ring-2 ring-purple-500" : "hover:opacity-90"}`}
                    style={{
                      backgroundImage: bg.url ? `url(${bg.url})` : undefined,
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                    }}
                  >
                    {!bg.url && (
                      <div className="flex h-full items-center justify-center text-xs text-zinc-500 bg-zinc-100">
                        Default
                      </div>
                    )}
                  </button>
                ))}
              </div>

              <div className="mt-3 flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Custom image URL"
                  value={customBg}
                  onChange={(e) => setCustomBg(e.target.value)}
                  className="flex-1 rounded-md border-2 border-purple-500 px-2 py-1 text-sm"
                />
                <button
                  type="button"
                  onClick={() => {
                    const url = customBg.trim();
                    if (!url) {
                      setBackgroundUrl(null);
                      return;
                    }
                    setBackgroundUrl(url);
                  }}
                  className="rounded-md px-3 py-1 bg-purple-600 text-white text-sm hover:bg-purple-700"
                >
                  Set
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setCustomBg("");
                    setBackgroundUrl(null);
                  }}
                  className="rounded-md px-3 py-1 bg-red-600 text-white text-sm hover:bg-red-700"
                >
                  Clear
                </button>
              </div>
            </div>
          </div>
        </section>

        <section>
          <h4 className="text-sm font-semibold mb-2">Danger Zone</h4>
          <div className="flex flex-col gap-3">
            <button
              type="button"
              onClick={handleReset}
              className="self-start rounded ml-2 px-2 py-1 bg-rose-600 text-white text-sm hover:bg-rose-700"
            >
              Reset filesystem
            </button>
          </div>
        </section>
      </main>
    </div>
  );
}

export default Settings;
