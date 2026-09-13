import { useRef, useMemo, useState, useEffect } from "react";
import { AppRegistry } from "../../app/AppRegistry";

import Dock from "../Dock";
import DesktopIcon from "./DesktopIcon";
import WindowManager from "./WindowManager";
import AppLauncher from "./AppLauncher";

function Desktop() {
  const desktopRef = useRef<HTMLElement>(null);

  const [viewport, setViewport] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  useEffect(() => {
    const element = desktopRef.current;
    if (!element) {
      return;
    }

    const updateSize = () => {
      setViewport({
        width: element.clientWidth,
        height: element.clientHeight,
      });
    };

    updateSize();
    const observer = new ResizeObserver(updateSize);
    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, []);

  const desktopApps = useMemo(() => {
    return Object.values(AppRegistry).filter(
      (app) => app.showOnDesktop !== false,
    );
  }, []);

  const wallpaperUrl =
    "https://images8.alphacoders.com/136/thumb-1920-1363709.png";

  return (
    <main
      ref={desktopRef}
      className="relative size-full overflow-hidden bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: `url(${wallpaperUrl})` }}
    >
      {desktopApps.map((app, index) => (
        <DesktopIcon x={24} y={24 + index * 96} key={app.id} appId={app.id} />
      ))}

      <AppLauncher />
      <WindowManager viewport={viewport} />
      <Dock />
    </main>
  );
}

export default Desktop;
