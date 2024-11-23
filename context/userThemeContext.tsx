import React, { createContext, useContext, useState, useEffect } from "react";
import { useColorScheme } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface ThemeContextType {
  theme: "light" | "dark";
  setColorMode: (mode: "light" | "dark" | "system") => Promise<void>;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: "light",
  setColorMode: async () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemTheme = useColorScheme();
  const [colorMode, setColorMode] = useState<"light" | "dark" | "system">(
    "system"
  );
  const [theme, setTheme] = useState<"light" | "dark">(systemTheme ?? "light");

  // Load colorMode from AsyncStorage on mount
  useEffect(() => {
    const loadColorMode = async () => {
      const savedMode = await AsyncStorage.getItem("colorMode");
      setColorMode((savedMode as "light" | "dark" | "system") ?? "system");
    };
    loadColorMode();
  }, []);

  // Update the theme based on colorMode
  useEffect(() => {
    if (colorMode === "system") {
      setTheme(systemTheme ?? "light");
    } else {
      setTheme(colorMode);
    }
  }, [colorMode, systemTheme]);

  const handleSetColorMode = async (mode: "light" | "dark" | "system") => {
    setColorMode(mode);
    await AsyncStorage.setItem("colorMode", mode);
  };

  return (
    <ThemeContext.Provider value={{ theme, setColorMode: handleSetColorMode }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
