import { useCallback, useEffect, useState } from "react";
import { useFileSystemStore } from "../../stores/FileSystemStore";
import type { AppProps } from "../../app/AppRegistry";

function ImageViewer({ fileId }: AppProps) {
  const file = useFileSystemStore((s) =>
    fileId ? s.getItem(fileId) : undefined,
  );
  const [zoom, setZoom] = useState(1);
  const [fit, setFit] = useState(true);
  const [natural, setNatural] = useState<{ w: number; h: number } | null>(null);

  const onWheel = useCallback(
    (e: WheelEvent) => {
      if (e.ctrlKey) {
        e.preventDefault();
        setZoom((z) =>
          Math.max(0.1, Math.min(4, z - Math.sign(e.deltaY) * 0.1)),
        );
        setFit(false);
      }
    },
    [setZoom, setFit],
  );

  useEffect(() => {
    window.addEventListener("wheel", onWheel, { passive: false });
    return () => window.removeEventListener("wheel", onWheel);
  }, [onWheel]);

  if (!fileId) {
    return (
      <div className="flex h-full items-center justify-center text-sm">
        Open an image from Files.
      </div>
    );
  }

  if (!file) {
    return (
      <div className="flex h-full items-center justify-center text-sm">
        Image not found.
      </div>
    );
  }

  const src =
    file.content && file.content.startsWith("data:") ? file.content : undefined;

  return (
    <div className="flex h-full flex-col overflow-hidden bg-zinc-950 text-white">
      <header className="flex items-center justify-between px-3 py-2 border-b border-white/6">
        <div className="flex items-center gap-3">
          <span className="text-sm font-semibold">{file.name}</span>
          {file.mimeType && (
            <span className="text-xs text-white/50">{file.mimeType}</span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setZoom((z) => Math.max(0.1, z - 0.25));
              setFit(false);
            }}
            className="px-2 py-1 rounded bg-white/5 hover:bg-white/8 text-xs"
            title="Zoom out"
          >
            -
          </button>

          <button
            onClick={() => {
              setZoom((z) => Math.min(4, z + 0.25));
              setFit(false);
            }}
            className="px-2 py-1 rounded bg-white/5 hover:bg-white/8 text-xs"
            title="Zoom in"
          >
            +
          </button>

          <button
            onClick={() => {
              setZoom(1);
              setFit(true);
            }}
            className="px-2 py-1 rounded bg-white/5 hover:bg-white/8 text-xs"
            title="Fit / Reset"
          >
            Fit
          </button>
        </div>
      </header>

      <div className="flex-1 min-h-0 flex items-center justify-center overflow-auto p-3">
        {src ? (
          <img
            src={src}
            alt={file.name}
            onLoad={(e) => {
              const img = e.currentTarget;
              setNatural({ w: img.naturalWidth, h: img.naturalHeight });
            }}
            style={{
              width: fit
                ? "auto"
                : `${natural ? natural.w * zoom : 100 * zoom}px`,
              height: fit
                ? "auto"
                : `${natural ? natural.h * zoom : 100 * zoom}px`,
              maxWidth: fit ? "100%" : undefined,
              maxHeight: fit ? "100%" : undefined,
            }}
            className="select-none"
          />
        ) : (
          <div className="flex flex-col items-center gap-2 text-white/40">
            <div className="p-6 rounded-lg bg-white/5">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
                <path
                  d="M21 19V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v12"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M3 17l4-4 4 4 4-6 4 6"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <div className="text-sm">Image preview unavailable</div>
          </div>
        )}
      </div>

      <footer className="flex items-center justify-between px-3 py-2 border-t border-white/6 text-xs text-white/60">
        <div>{natural ? `${natural.w}×${natural.h}` : ""}</div>
        <div>Zoom: {(zoom * 100).toFixed(0)}%</div>
      </footer>
    </div>
  );
}

export default ImageViewer;
