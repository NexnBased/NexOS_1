import { AppRegistry } from "../../app/AppRegistry";
import { useWindowStore } from "../../stores/WindowStore";

interface Props {
  appId: string;
  x: number;
  y: number;
}

function DesktopIcon({ appId, x, y }: Props) {
  const openWindow = useWindowStore((state) => state.openWindow);
  const app = AppRegistry[appId];
  if (!app) {
    return null;
  }

  return (
    <button
      type="button"
      onDoubleClick={() => openWindow(appId)}
      style={{
        left: x,
        top: y,
      }}
      className="absolute w-20 flex flex-col items-center gap-1 rounded-lg p-2 text-white select-none hover:bg-white/10 focus:outline-none focus:bg-white/15"
    >
      <img
        className="flex size-12 items-center justify-center text-3xl rounded-md"
        src={app.icon}
        draggable={false}
      />
      <span className="w-full truncate text-center text-[14px] tracking-wide">
        {app.title}
      </span>
    </button>
  );
}

export default DesktopIcon;
