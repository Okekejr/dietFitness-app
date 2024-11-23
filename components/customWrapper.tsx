import React from "react";
import { StatusBar } from "expo-status-bar";
import { useThemeColor } from "@/hooks/useThemeColor";

interface CustomWrapperProps {
  children: React.ReactNode;
}

export default function CustomWrapper({ children }: CustomWrapperProps) {
  const backgroundColor = useThemeColor({}, "background");
  const statusBarStyle = backgroundColor === "#000" ? "light" : "dark";

  return (
    <>
      <StatusBar
        style={statusBarStyle}
        backgroundColor={backgroundColor}
        translucent={false}
      />
      {children}
    </>
  );
}
