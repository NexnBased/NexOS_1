import type { MouseEvent as ReactMouseEvent } from "react";
import { type WindowData } from "../../types/window";

interface WindowProps {
  window: WindowData;
  viewport?: {
    width: number;
    height: number;
  };
  onClose?: () => void;
  onMinimize?: () => void;
  onMaximize?: () => void;
  onFocus?: (id: string) => void;
  onMove?: (position: { x: number; y: number }) => void;
  onResize?: (size: { width: number; height: number }) => void;
  onPointerEnter?: () => void;
  onPointerLeave?: () => void;
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
  onPointerEnter,
  onPointerLeave,
}: WindowProps) {
  if (window.minimized) {
    return null;
  }
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
      onPointerEnter={onPointerEnter}
      onPointerLeave={onPointerLeave}
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
        onMouseDown={(e) => {
          if (e.target !== e.currentTarget) {
            return;
          }
          onFocus?.(window.id);
          if (window.maximized) {
            return;
          }

          const startX = e.clientX;
          const startY = e.clientY;
          const baseX = window.x;
          const baseY = window.y;

          const onMouseMove = (ev: MouseEvent) => {
            onMove?.({
              x: baseX + ev.clientX - startX,
              y: baseY + ev.clientY - startY,
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
        <p className="font-bold tracking-wide select-none pointer-events-none">{window.title}</p>

        <div className="flex gap-2 flex-row size-fit">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onMaximize?.();
            }}
            className="size-4 rounded-full bg-yellow-500 hover:bg-yellow-800"
          />
          <button
            onClick={(e) => {
              e.stopPropagation();
              onMinimize?.();
            }}
            className="size-4 rounded-full bg-green-500 hover:bg-green-800"
          />
          <button
            onClick={(e) => {
              e.stopPropagation();
              onClose?.();
            }}
            className="size-4 rounded-full bg-red-500 hover:bg-red-800"
          />
        </div>
      </div>

      <div className="flex-1 w-full min-h-0 min-w-0 relative overflow-hidden">
        <App
          width={viewport?.width ?? window.width}
          height={viewport?.height ?? window.height}
        />
      </div>

      <div
        onMouseDown={startResize}
        className="absolute right-0.5 -bottom-0.5 size-fit rotate-90 cursor-nwse-resize opacity-10 select-none touch-none"
      >
        &#9701;
      </div>
    </div>
  );
}

export default Window;
