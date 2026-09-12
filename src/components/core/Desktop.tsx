import { useRef, useState, useEffect, } from "react";

import Dock from "../Dock";
import DesktopIcon from "./DesktopIcon";
import WindowManager from "./WindowManager";

function Desktop() {
  const desktopRef = useRef<HTMLElement>(null);

  const [viewport, setViewport] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  useEffect(() => {
    const element = desktopRef.current;
    if (!element) { return; }

    const updateSize = () => {
      setViewport({
        width: element.clientWidth,
        height: element.clientHeight,
      });
    };

    updateSize();
    const observer = new ResizeObserver(updateSize);
    observer.observe(element);

    return () => { observer.disconnect(); };
  }, []);

  const wallpaperUrl =
    "https://images8.alphacoders.com/136/thumb-1920-1363709.png";

  return (
    <main
      ref={desktopRef}
      className="relative size-full overflow-hidden bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: `url(${wallpaperUrl})`, }}
    >
      <DesktopIcon appId="welcome" x={24} y={24} />
      <DesktopIcon appId="calculator" x={24} y={120} />
      <DesktopIcon appId="notes" x={24} y={216} />

      <WindowManager viewport={viewport} />
      <Dock />
    </main>
  );
}

export default Desktop;