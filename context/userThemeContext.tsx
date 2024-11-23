import AsyncStorage from "@react-native-async-storage/async-storage";
import { createContext, useContext, useEffect, useState } from "react";
import { useColorScheme } from "react-native";

interface ThemeContextType {
  theme: "light" | "dark";
  colorMode: "light" | "dark" | "system"; // Expose raw colorMode
  setColorMode: (mode: "light" | "dark" | "system") => Promise<void>;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: "light",
  colorMode: "system",
  setColorMode: async () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemTheme = useColorScheme();
  const [colorMode, setColorMode] = useState<"light" | "dark" | "system">(
    "system"
  );
  const [theme, setTheme] = useState<"light" | "dark">(systemTheme ?? "light");

  useEffect(() => {
    const loadColorMode = async () => {
      const savedMode = await AsyncStorage.getItem("colorMode");
      setColorMode((savedMode as "light" | "dark" | "system") ?? "system");
    };
    loadColorMode();
  }, []);

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
    <ThemeContext.Provider
      value={{ theme, colorMode, setColorMode: handleSetColorMode }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
