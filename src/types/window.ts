import type { ComponentType } from "react";

export interface WindowData {
  id: string;
  appId: string;
  title: string;
  component: ComponentType<{
    width: number;
    height: number;
    fileId?: string;
  }>;
  fileId?: string;
  x: number;
  y: number;
  width: number;
  height: number;
  minWidth: number;
  minHeight: number;
  maxWidth?: number;
  maxHeight?: number;
  resizable: boolean;
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
