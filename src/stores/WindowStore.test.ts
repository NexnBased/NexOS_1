import { beforeEach, describe, expect, it } from "vitest";
import { useWindowStore } from "./WindowStore";
import { AppIds } from "../app/AppRegistry";
import type { WindowData } from "../types/window";

function makeWindow(overrides: Partial<WindowData> = {}): WindowData {
  const noopComponent = (() => null) as unknown as WindowData["component"];
  const base: WindowData = {
    id: overrides.id ?? `test-window-${Math.random().toString(36).slice(2, 9)}`,
    appId: overrides.appId ?? AppIds.FILES,
    title: overrides.title ?? "Test",
    component: overrides.component ?? noopComponent,
    fileId: overrides.fileId,
    x: overrides.x ?? 100,
    y: overrides.y ?? 80,
    width: overrides.width ?? 480,
    height: overrides.height ?? 300,
    minWidth: overrides.minWidth ?? 200,
    minHeight: overrides.minHeight ?? 120,
    maxWidth: overrides.maxWidth,
    maxHeight: overrides.maxHeight,
    resizable: overrides.resizable ?? true,
    zIndex: overrides.zIndex ?? 1,
    minimized: overrides.minimized ?? false,
    maximized: overrides.maximized ?? false,
    previousBounds: overrides.previousBounds,
  };
  return base;
}

describe("WindowStore", () => {
  beforeEach(() => {
    useWindowStore.setState({
      windows: [],
      nextZIndex: 1,
      desktopViewport: { width: 1024, height: 768 },
      hoveredWindowId: null,
    });
  });

  it("focuses windows by raising z-index", () => {
    const ws = useWindowStore.getState();
    const w = makeWindow({ appId: AppIds.FILES, zIndex: 2 });
    useWindowStore.setState((s) => ({
      windows: [...s.windows, w],
      nextZIndex: Math.max(s.nextZIndex, w.zIndex + 1),
    }));
    const before = useWindowStore.getState().windows.find((x) => x.id === w.id)!;
    const oldZ = before.zIndex;
    ws.focusWindow(w.id);
    const after = useWindowStore.getState().windows.find((x) => x.id === w.id)!;
    expect(after).toBeDefined();
    expect(after.zIndex).toBeGreaterThanOrEqual(oldZ);
  });

  it("minimizes and restores windows", () => {
    const ws = useWindowStore.getState();
    const w = makeWindow({ appId: AppIds.FILES });
    useWindowStore.setState((s) => ({
      windows: [...s.windows, w],
      nextZIndex: Math.max(s.nextZIndex, w.zIndex + 1),
    }));

    ws.minimizeWindow(w.id);
    expect(useWindowStore.getState().windows.find((x) => x.id === w.id)?.minimized).toBe(true);
    ws.restoreWindow(w.id);
    expect(useWindowStore.getState().windows.find((x) => x.id === w.id)?.minimized).toBe(false);
  });

  it("maximizes and restores to previous bounds", () => {
    const ws = useWindowStore.getState();
    const w = makeWindow({ appId: AppIds.FILES, width: 400, height: 300 });
    useWindowStore.setState((s) => ({
      windows: [...s.windows, w],
      nextZIndex: Math.max(s.nextZIndex, w.zIndex + 1),
    }));
    ws.maximizeWindow(w.id, { width: 800, height: 600 });
    const maximized = useWindowStore.getState().windows.find((x) => x.id === w.id)!;
    expect(maximized.maximized).toBe(true);
    expect(maximized.width).toBe(800);
    expect(maximized.height).toBe(600);
    ws.maximizeWindow(w.id, { width: 800, height: 600 });
    const restored = useWindowStore.getState().windows.find((x) => x.id === w.id)!;
    expect(restored.maximized).toBe(false);
    expect(restored.width).toBeGreaterThanOrEqual(restored.minWidth);
  });

  it("moves and resizes windows with bounds enforcement", () => {
    const ws = useWindowStore.getState();
    const w = makeWindow({ appId: AppIds.FILES, width: 300, height: 200, x: 10, y: 10 });
    useWindowStore.setState((s) => ({
      windows: [...s.windows, w],
      nextZIndex: Math.max(s.nextZIndex, w.zIndex + 1),
    }));
    ws.moveWindow(w.id, { x: 50, y: 60 });
    const moved = useWindowStore.getState().windows.find((x) => x.id === w.id)!;
    expect(moved.x).toBe(50);
    expect(moved.y).toBe(60);
    ws.resizeWindow(w.id, { width: 220, height: 180 });
    const resized = useWindowStore.getState().windows.find((x) => x.id === w.id)!;
    expect(resized.width).toBeGreaterThanOrEqual(resized.minWidth);
    expect(resized.height).toBeGreaterThanOrEqual(resized.minHeight);
  });
});