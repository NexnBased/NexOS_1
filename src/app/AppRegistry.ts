import type { ComponentType } from "react";

import Notes from "../components/apps/Notes";
import Files from "../components/apps/Files";
import Welcome from "../components/apps/Welcome";
import Calendar from "../components/apps/Calendar";
import Calculator from "../components/apps/Calculator";
import TextEditor from "../components/apps/TextEditor";

export interface AppProps {
  width: number;
  height: number;
  fileId?: string;
}

export interface AppDefinition {
  id: string;
  title: string;
  component: ComponentType<AppProps>;
  defaultWidth: number;
  defaultHeight: number;
  minWidth?: number;
  minHeight?: number;
  maxWidth?: number;
  maxHeight?: number;
  resizable?: boolean;
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
    defaultWidth: 500,
    defaultHeight: 250,
    minWidth: 400,
    minHeight: 150,
    icon: "https://upload.wikimedia.org/wikipedia/commons/a/a6/Apple_Home_%28iOS%29.png",
    showInLauncher: false,
    showOnDesktop: true,
    showInDock: false,
  },
  files: {
    id: "files",
    title: "Files",
    component: Files,
    defaultWidth: 800,
    defaultHeight: 500,
    minWidth: 700,
    minHeight: 450,
    icon: "https://upload.wikimedia.org/wikipedia/commons/d/d6/Files_App_icon_iOS.png",
    showInLauncher: true,
    showOnDesktop: true,
    showInDock: true,
  },
  calculator: {
    id: "calculator",
    title: "Calculator",
    component: Calculator,
    defaultWidth: 350,
    defaultHeight: 500,
    minWidth: 350,
    minHeight: 500,
    resizable: false,
    icon: "https://thumb.wikimedia.org/wikipedia/commons/thumb/3/3a/Calculator_Icon_%28macOS_27%29.png/960px-Calculator_Icon_%28macOS_27%29.png",
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
    icon: "https://thumb.wikimedia.org/wikipedia/commons/thumb/1/18/Notes_%28iOS_26%29_app_icon.png/960px-Notes_%28iOS_26%29_app_icon.png",
    showInLauncher: true,
    showOnDesktop: true,
    showInDock: true,
  },
  calendar: {
    id: "calendar",
    title: "Calendar",
    component: Calendar,
    defaultWidth: 300,
    defaultHeight: 390,
    minWidth: 300,
    minHeight: 390,
    resizable: false,
    icon: "https://play-lh.googleusercontent.com/vEoqLbT_QkYcEaawWBRc22N6i98OUtOUpM1LmKdVs_xx7lCsUyFfV0ZiqoUXjMijUteiBhhN4K5MpoF96FRNOg=w480-h960-rw",
    showInLauncher: true,
    showOnDesktop: true,
    showInDock: false,
  },
  texteditor: {
    id: "texteditor",
    title: "Text Editor",
    component: TextEditor,
    defaultWidth: 400,
    defaultHeight: 500,
    resizable: false,
    icon: "https://gedit-text-editor.org/images/gedit-icon.png",
    showInLauncher: true,
    showOnDesktop: true,
    showInDock: false,
  },
};
