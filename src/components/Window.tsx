import { MaximizeIcon, MinimizeIcon, XIcon } from "lucide-react";
import type { ComponentType, MouseEvent as ReactMouseEvent } from "react";

export interface WindowData {
  id: string;
  title: string;
  x: number;
  y: number;
  width: number;
  height: number;
  zIndex: number;
  component: ComponentType<{
    width: number;
    height: number;
  }>;
}

interface Viewport {
  width: number;
  height: number;
}

interface WindowProps {
  window: WindowData;
  viewport?: Viewport;
  onClose?: () => void;
  onMinimize?: () => void;
  onMaximize?: () => void;
  onFocus?: (id: string) => void;
  onMove?: (position: { x: number; y: number }) => void;
  onResize?: (size: { width: number; height: number }) => void;
}

function Window({
  window,
  viewport,
  onClose,
  onMinimize,
  onMaximize,
  onFocus,
  onMove,
  onResize,
}: WindowProps) {
  const App = window.component;

  const startResize = (e: ReactMouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    document.body.style.cursor = "nwse-resize";

    const startX = e.clientX;
    const startY = e.clientY;
    const startWidth = window.width;
    const startHeight = window.height;

    const onMouseMove = (ev: MouseEvent) => {
      onResize?.({
        width: startWidth + (ev.clientX - startX),
        height: startHeight + (ev.clientY - startY),
      });
    };

    const onMouseUp = () => {
      document.body.style.cursor = "default";
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
    };

    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
  };

  return (
    <div
      style={{
        left: window.x,
        top: window.y,
        width: window.width,
        height: window.height,
        zIndex: window.zIndex,
        position: "absolute",
      }}
      className="absolute flex flex-col rounded-md backdrop-blur-xs overflow-hidden"
    >
      <div
        onMouseDown={(e: ReactMouseEvent<HTMLDivElement>) => {
          onFocus?.(window.id);

          const startX = e.clientX;
          const startY = e.clientY;
          const baseX = window.x;
          const baseY = window.y;

          const onMouseMove = (ev: MouseEvent) => {
            onMove?.({
              x: baseX + (ev.clientX - startX),
              y: baseY + (ev.clientY - startY),
            });
          };

          const onUp = () => {
            document.removeEventListener("mousemove", onMouseMove);
            document.removeEventListener("mouseup", onUp);
          };

          document.addEventListener("mousemove", onMouseMove);
          document.addEventListener("mouseup", onUp);
        }}
        className="flex shrink-0 justify-between pl-1 pr-1 items-center text-purple-800 bg-purple-200/50 p-[6px 10px] cursor-grab active:cursor-grabbing"
      >
        <div>{window.title}</div>

        <div className="flex gap-2 flex-row size-fit">
          <button onClick={onMinimize}><MinimizeIcon size={20} /></button>
          <button onClick={onMaximize}><MaximizeIcon size={20} /></button>
          <button onClick={onClose}><XIcon size={24} /></button>
        </div>
      </div>

      <div className="flex-1 p-3 w-full min-h-0 min-w-0 relative overflow-hidden">
        <App
          width={viewport?.width ?? window.width}
          height={viewport?.height ?? window.height}
        />
      </div>

      <div onMouseDown={startResize} className="absolute right-0 -bottom-1.5 size-fit rotate-90 cursor-nwse-resize">
        &#9701;
      </div>
    </div>
  )
}

export default Window;