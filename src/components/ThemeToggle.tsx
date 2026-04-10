"use client";

import { Sun, Moon } from "lucide-react";
import { useTheme } from "@/lib/ThemeContext";

export default function ThemeToggle() {
  const { theme, toggle } = useTheme();

  return (
    <button
      onClick={toggle}
      className="flex h-9 w-9 items-center justify-center rounded-full border border-border text-muted transition-colors hover:bg-card hover:text-foreground"
      aria-label="切換主題"
    >
      {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
    </button>
  );
}
