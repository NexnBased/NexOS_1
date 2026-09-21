import { beforeEach, describe, expect, it } from "vitest";
import { useWindowStore } from "./WindowStore";

describe("WindowStore", () => {
  beforeEach(() => {
    useWindowStore.setState({
      windows: [],
      nextZIndex: 1,
      hoveredWindowId: null,
      desktopViewport: { width: 1200, height: 800 },
    });
  });

  it("opens a registered window", () => {
    useWindowStore.getState().openWindow("calculator");
    const window = useWindowStore
      .getState()
      .windows.find((entry) => entry.appId === "calculator");

    expect(window).toBeDefined();
    expect(window?.minimized).toBe(false);
  });

  it("centers a new window", () => {
    useWindowStore.getState().setDesktopViewport({ width: 1200, height: 800 });

    useWindowStore.getState().openWindow("calculator");
    const window = useWindowStore
      .getState()
      .windows.find((entry) => entry.appId === "calculator");

    expect(window?.x).toBe(425);
    expect(window?.y).toBe(150);
  });

  it("does not resize a non-resizable window", () => {
    useWindowStore.getState().openWindow("calculator");
    const before = useWindowStore
      .getState()
      .windows.find((entry) => entry.appId === "calculator");

    if (!before) {
      throw new Error("Calculator window was not created");
    }
    useWindowStore
      .getState()
      .resizeWindow(before.id, { width: 900, height: 900 });
    const after = useWindowStore
      .getState()
      .windows.find((entry) => entry.id === before.id);

    expect(after?.width).toBe(before.width);
    expect(after?.height).toBe(before.height);
  });

  it("clamps window movement to the viewport", () => {
    useWindowStore.getState().openWindow("calculator");
    const window = useWindowStore
      .getState()
      .windows.find((entry) => entry.appId === "calculator");

    if (!window) {
      throw new Error("Calculator window was not created");
    }
    useWindowStore.getState().moveWindow(window.id, { x: -500, y: -500 });
    const moved = useWindowStore
      .getState()
      .windows.find((entry) => entry.id === window.id);

    expect(moved?.x).toBe(0);
    expect(moved?.y).toBe(0);
  });
});
