import type { ComponentType } from "react";

export interface WindowData {
  id: string;
  appId: string;
  title: string;
  component: ComponentType<{
    width: number;
    height: number;
  }>;
  x: number;
  y: number;
  width: number;
  height: number;
  zIndex: number;
  minimized: boolean;
  maximized: boolean;
  previousBounds?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}
