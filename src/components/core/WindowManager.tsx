import Window from "./Window";
import { AnimatePresence } from "motion/react";
import { useWindowStore } from "../../stores/WindowStore";

interface Props {
  viewport: {
    width: number;
    height: number;
  };
}

function WindowManager({ viewport }: Props) {
  const windows = useWindowStore((state) => state.windows);
  const closeWindow = useWindowStore((state) => state.closeWindow);
  const focusWindow = useWindowStore((state) => state.focusWindow);
  const minimizeWindow = useWindowStore((state) => state.minimizeWindow);
  const maximizeWindow = useWindowStore((state) => state.maximizeWindow);
  const moveWindow = useWindowStore((state) => state.moveWindow);
  const resizeWindow = useWindowStore((state) => state.resizeWindow);
  const setHoveredWindow = useWindowStore((state) => state.setHoveredWindow);

  return (
    <AnimatePresence mode="sync">
      {windows
        .filter((window) => !window.minimized)
        .map((window) => (
          <Window
            key={window.id}
            window={window}
            viewport={viewport}
            onClose={() => closeWindow(window.id)}
            onMinimize={() => minimizeWindow(window.id)}
            onMaximize={() => maximizeWindow(window.id, viewport)}
            onFocus={focusWindow}
            onMove={(position) => moveWindow(window.id, position)}
            onResize={(size) => resizeWindow(window.id, size)}
            onPointerEnter={() => setHoveredWindow(window.id)}
            onPointerLeave={() => setHoveredWindow(null)}
          />
        ))}
    </AnimatePresence>
  );
}

export default WindowManager;
