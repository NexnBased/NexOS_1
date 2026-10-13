import { AppRegistry } from "../../app/AppRegistry";
import { useWindowStore } from "../../stores/WindowStore";

interface Props {
  appId: string;
  x: number;
  y: number;
  size?: number;
}

function DesktopIcon({ appId, x, y, size = 84 }: Props) {
  const openWindow = useWindowStore((state) => state.openWindow);
  const app = AppRegistry[appId];
  if (!app) return null;
  const iconSize = Math.max(24, Math.round(size * 0.56));
  const buttonWidth = Math.max(80, size);
  const titleFontSize = Math.max(12, Math.round(size * 0.14));

  return (
    <button
      type="button"
      onDoubleClick={() => openWindow(appId)}
      style={{
        left: x,
        top: y,
        width: buttonWidth,
      }}
      className="absolute flex flex-col items-center gap-1 rounded-lg p-2 text-white select-none hover:bg-white/10 focus:outline-none focus:bg-white/15"
    >
      <img
        src={app.icon}
        alt={app.title}
        draggable={false}
        style={{
          width: iconSize,
          height: iconSize,
          objectFit: "cover",
          borderRadius: Math.max(6, Math.round(iconSize * 0.18)),
        }}
        className="flex items-center justify-center"
      />
      <span
        className="w-full truncate text-center tracking-wide"
        style={{ fontSize: titleFontSize }}
      >
        {app.title}
      </span>
    </button>
  );
}

export default DesktopIcon;
