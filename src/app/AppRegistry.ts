import type { ComponentType } from "react";
import Welcome from "../components/apps/Welcome";
import Calculator from "../components/apps/Calculator";
import Notes from "../components/apps/Notes";

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
  },
  calculator: {
    id: "calculator",
    title: "Calculator",
    component: Calculator,
    defaultWidth: 350,
    defaultHeight: 500,
    minWidth: 350,
    minHeight: 500,
    icon: "https://i.pinimg.com/736x/43/e3/61/43e36102d3e2a48a1e9661e4c39b64bc.jpg",
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
  }
};
