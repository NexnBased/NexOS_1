import { Grid2X2, RefreshCw } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import {
  useCallback,
  useLayoutEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactNode,
  type RefObject,
} from "react";
import { useUIStore } from "../../stores/UIStore";

interface Props {
  desktopRef: RefObject<HTMLElement | null>;
}

interface MenuPosition {
  x: number;
  y: number;
}

function DesktopContextMenu({ desktopRef }: Props) {
  const menuRef = useRef<HTMLDivElement>(null);
  const contextMenuOpen = useUIStore((state) => state.contextMenuOpen);
  const contextMenuPosition = useUIStore((state) => state.contextMenuPosition);
  const closeContextMenu = useUIStore((state) => state.closeContextMenu);
  const openLauncher = useUIStore((state) => state.openLauncher);
  const [position, setPosition] = useState<MenuPosition>(contextMenuPosition);
  const updatePosition = useCallback(() => {
    const menu = menuRef.current;
    const desktop = desktopRef.current;
    if (!menu || !desktop) return;
    const desktopRect = desktop.getBoundingClientRect();
    const menuRect = menu.getBoundingClientRect();
    const padding = 6;

    const maxX = Math.max(
      padding,
      desktopRect.width - menuRect.width - padding,
    );
    const maxY = Math.max(
      padding,
      desktopRect.height - menuRect.height - padding,
    );

    setPosition({
      x: Math.min(Math.max(contextMenuPosition.x, padding), maxX),
      y: Math.min(Math.max(contextMenuPosition.y, padding), maxY),
    });
  }, [contextMenuPosition, desktopRef]);

  useLayoutEffect(() => {
    if (!contextMenuOpen) return;
    const frame = requestAnimationFrame(updatePosition);
    const desktop = desktopRef.current;
    if (!desktop) return () => cancelAnimationFrame(frame);
    const resizeObserver = new ResizeObserver(updatePosition);
    resizeObserver.observe(desktop);
    window.addEventListener("resize", updatePosition);

    return () => {
      cancelAnimationFrame(frame);
      resizeObserver.disconnect();
      window.removeEventListener("resize", updatePosition);
    };
  }, [contextMenuOpen, desktopRef, updatePosition]);

  const handleOpenApplications = () => {
    closeContextMenu();
    openLauncher();
  };

  const handleRefresh = () => {
    closeContextMenu();
    window.location.reload();
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const items = Array.from(
      menuRef.current?.querySelectorAll<HTMLButtonElement>(
        '[role="menuitem"]',
      ) ?? [],
    );

    const currentIndex = items.indexOf(
      document.activeElement as HTMLButtonElement,
    );

    if (event.key === "Escape") {
      event.preventDefault();
      closeContextMenu();
      return;
    }

    if (event.key === "ArrowDown") {
      event.preventDefault();
      const nextIndex = currentIndex >= items.length - 1 ? 0 : currentIndex + 1;

      items[nextIndex]?.focus();
      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      const previousIndex =
        currentIndex <= 0 ? items.length - 1 : currentIndex - 1;

      items[previousIndex]?.focus();
      return;
    }

    if (event.key === "Home") {
      event.preventDefault();
      items[0]?.focus();
      return;
    }

    if (event.key === "End") {
      event.preventDefault();
      items[items.length - 1]?.focus();
    }
  };

  return (
    <AnimatePresence>
      {contextMenuOpen && (
        <div
          className="pointer-events-none absolute inset-0 z-8000"
          onContextMenu={(event) => {
            event.preventDefault();
            event.stopPropagation();
          }}
        >
          <motion.div
            ref={menuRef}
            data-desktop-context-menu
            role="menu"
            tabIndex={-1}
            aria-label="Desktop context menu"
            initial={{
              opacity: 0,
              scale: 0.96,
              y: -3,
            }}
            animate={{
              opacity: 1,
              scale: 1,
              y: 0,
            }}
            exit={{
              opacity: 0,
              scale: 0.96,
              y: -3,
            }}
            transition={{
              type: "spring",
              stiffness: 560,
              damping: 36,
              mass: 0.4,
              opacity: {
                duration: 0.1,
              },
            }}
            onKeyDown={handleKeyDown}
            onPointerDown={(event) => {
              event.stopPropagation();
            }}
            onClick={(event) => {
              event.stopPropagation();
            }}
            style={{
              left: position.x,
              top: position.y,
              transformOrigin: "top left",
            }}
            className="pointer-events-auto absolute flex w-44 flex-col gap-0.5 rounded-md bg-purple-200/90 p-1 backdrop-blur-xl"
          >
            <ContextMenuItem
              icon={<Grid2X2 size={15} strokeWidth={3} />}
              label="Open Applications"
              onClick={handleOpenApplications}
            />
            <ContextMenuItem
              icon={<RefreshCw size={15} strokeWidth={3} />}
              label="Refresh"
              onClick={handleRefresh}
            />
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

interface ItemProps {
  icon: ReactNode;
  label: string;
  onClick: () => void;
}

function ContextMenuItem({ icon, label, onClick }: ItemProps) {
  return (
    <button
      type="button"
      role="menuitem"
      onClick={onClick}
      className="flex w-full items-center gap-2 rounded-md! px-2 py-1.5 text-left text-xs font-medium text-purple-500 transition-colors duration-150 hover:bg-purple-400 hover:text-purple-950 focus:bg-purple-100 focus:outline-none focus-visible:ring-1 focus-visible:ring-purple-400 active:bg-purple-200"
    >
      <span className="flex size-4 shrink-0 items-center justify-center text-purple-600">
        {icon}
      </span>
      <span className="min-w-0 flex-1 truncate">{label}</span>
    </button>
  );
}

export default DesktopContextMenu;
