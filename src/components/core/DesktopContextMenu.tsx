import { Grid2X2, Monitor, RefreshCw } from "lucide-react";
import { useUIStore } from "../../stores/UIStore";
import React, { useRef, useState, useEffect } from "react";

interface Props {
  desktopRef: React.RefObject<HTMLElement | null>;
}

function DesktopContextMenu({ desktopRef }: Props) {
  const menuRef = useRef<HTMLDivElement>(null);
  const contextMenuOpen = useUIStore((state) => state.contextMenuOpen);
  const contextMenuPosition = useUIStore((state) => state.contextMenuPosition);
  const closeContextMenu = useUIStore((state) => state.closeContextMenu);
  const openLauncher = useUIStore((state) => state.openLauncher);

  const [position, setPosition] = useState({
    x: contextMenuPosition.x,
    y: contextMenuPosition.y,
  });

  useEffect(() => {
    const menu = menuRef.current;
    const desktop = desktopRef.current;
    if (!menu || !desktop) {
      return;
    }
    const desktopRect = desktop.getBoundingClientRect();
    const menuWidth = menu.offsetWidth;
    const menuHeight = menu.offsetHeight;
    const padding = 8;
    const maxX = desktopRect.width - menuWidth - padding;
    const maxY = desktopRect.height - menuHeight - padding;

    setPosition({
      x: Math.min(Math.max(contextMenuPosition.x, padding), maxX),
      y: Math.min(Math.max(contextMenuPosition.y, padding), maxY),
    });
  }, [contextMenuPosition, desktopRef]);

  if (!contextMenuOpen) {
    return null;
  }

  const handleOpenLauncher = () => {
    closeContextMenu();
    openLauncher();
  };
  const handleRefresh = () => {
    closeContextMenu();
  };

  return (
    <div className="pointer-events-none absolute inset-0 z-8000">
      <div
        ref={menuRef}
        data-desktop-context-menu
        className="pointer-events-auto absolute w-50 overflow-hidden rounded-xl bg-black/45 p-1 shadow-2xl backdrop-blur-xl animate-in fade-in zoom-in-95 duration-100"
        style={{
          left: position.x,
          top: position.y,
        }}
        onContextMenu={(event) => {
          event.preventDefault();
          event.stopPropagation();
        }}
      >
        <button
          type="button"
          onClick={handleOpenLauncher}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm text-white transition hover:bg-white/10 focus:outline-none focus-visible:bg-white/10"
        >
          <Grid2X2 size={17} strokeWidth={1.8} className="text-white/75" />
          <span>Open Applications</span>
        </button>

        <button
          type="button"
          onClick={handleRefresh}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm text-white transition hover:bg-white/10 focus:outline-none focus-visible:bg-white/10"
        >
          <RefreshCw size={17} strokeWidth={1.8} className="text-white/75" />
          <span>Refresh</span>
        </button>

        <div className="my-1 h-px bg-white/10" />

        <button
          type="button"
          disabled
          title="Display settings are not implemented yet"
          className="flex w-full cursor-not-allowed items-center gap-3 rounded-lg px-3 py-2 text-left text-sm text-white/35"
        >
          <Monitor size={17} strokeWidth={1.8} />
          <span>Display Settings</span>
        </button>
      </div>
    </div>
  );
}

export default DesktopContextMenu;
