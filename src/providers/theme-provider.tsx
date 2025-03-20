import { createContext, ReactNode, useContext, useEffect, useState } from "react";
import { ThemeMode } from "../common/enums";

class ThemeConfigs {
  mode: ThemeMode;
  logoUrl: string;
  changeMode: (mode: ThemeMode) => void;
}

const ThemeContext = createContext(new ThemeConfigs());

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [mode, setMode] = useState<ThemeMode>(ThemeMode.Dark);
  const [logoUrl, setLogoUrl] = useState<string>("");

  const getModeClassByEnum = (mode: ThemeMode) => {
    switch (mode) {
      case ThemeMode.Light:
        return "light";
      case ThemeMode.Dark:
        return "dark";
      default:
        return "";
    }
  };

  useEffect(() => {
    setMode(window.matchMedia("(prefers-color-scheme: dark)").matches ? ThemeMode.Dark : ThemeMode.Light);
    setLogoUrl("logo.png");
  }, []);

  document.body.classList.add(getModeClassByEnum(mode));

  const changeMode = (newMode: ThemeMode) => {
    if (mode === newMode) return;
    document.body.classList.remove(getModeClassByEnum(mode));
    setMode(newMode);
    document.body.classList.add(getModeClassByEnum(newMode));
  };

  return <ThemeContext.Provider value={{ logoUrl, mode, changeMode }}>{children}</ThemeContext.Provider>;
};

export const useThemeProvider = () => {
  return useContext(ThemeContext);
};
