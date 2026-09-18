import type { ComponentType } from "react";
import Welcome from "../components/apps/Welcome";
import Calculator from "../components/apps/Calculator";
import Notes from "../components/apps/Notes";
import Files from "../components/apps/Files";

export interface AppProps {
  width: number;
  height: number;
}

export interface AppDefinition {
  id: string;
  title: string;
  component: ComponentType<AppProps>;
  defaultWidth: number;
  defaultHeight: number;
  minWidth?: number;
  minHeight?: number;
  icon?: string;
  showInLauncher?: boolean;
  showOnDesktop?: boolean;
  showInDock?: boolean;
}

export const AppRegistry: Record<string, AppDefinition> = {
  welcome: {
    id: "welcome",
    title: "Welcome",
    component: Welcome,
    defaultWidth: 400,
    defaultHeight: 150,
    minWidth: 400,
    minHeight: 150,
    icon: "https://i.pinimg.com/1200x/48/49/ac/4849aca80f124fcec6d446e159449b58.jpg",
    showInLauncher: false,
    showOnDesktop: true,
    showInDock: false,
  },
  calculator: {
    id: "calculator",
    title: "Calculator",
    component: Calculator,
    defaultWidth: 350,
    defaultHeight: 500,
    minWidth: 350,
    minHeight: 500,
    icon: "https://i.pinimg.com/736x/88/8d/3f/888d3fb1d57bd69f2c52fb89d5abf7e7.jpg",
    showInLauncher: true,
    showOnDesktop: true,
    showInDock: true,
  },
  notes: {
    id: "notes",
    title: "Notes",
    component: Notes,
    defaultWidth: 800,
    defaultHeight: 500,
    minWidth: 800,
    minHeight: 500,
    icon: "https://i.pinimg.com/736x/8c/de/74/8cde744c0bca6d1cf6c0dde004548451.jpg",
    showInLauncher: true,
    showOnDesktop: true,
    showInDock: true,
  },
  files: {
    id: "files",
    title: "Files",
    component: Files,
    defaultWidth: 800,
    defaultHeight: 500,
    minWidth: 500,
    minHeight: 350,
    icon: "https://i.pinimg.com/736x/95/13/dd/9513dd6721787751f30ec543236487fc.jpg",
    showInLauncher: true,
    showOnDesktop: true,
    showInDock: true,
  },
};
