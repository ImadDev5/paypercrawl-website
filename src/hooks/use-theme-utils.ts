"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export function useThemeUtils() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = mounted && (resolvedTheme === "dark" || theme === "dark");
  const isDim = mounted && (resolvedTheme === "dim" || theme === "dim");
  const isLight = mounted && (resolvedTheme === "light" || theme === "light");
  const isCloudflare =
    mounted && (resolvedTheme === "cloudflare" || theme === "cloudflare");
  const isSystem = mounted && theme === "system";

  const toggleTheme = () => {
    if (!mounted) return;

    switch (theme) {
      case "light":
        setTheme("dark");
        break;
      case "dark":
        setTheme("dim");
        break;
      case "dim":
        setTheme("cloudflare");
        break;
      case "cloudflare":
        setTheme("light");
        break;
      default:
        setTheme("cloudflare");
    }
  };

  const cycleThemes = () => {
    if (!mounted) return;

    const themes = ["cloudflare", "light", "dark", "dim", "system"];
    const currentIndex = themes.indexOf(theme || "cloudflare");
    const nextIndex = (currentIndex + 1) % themes.length;
    setTheme(themes[nextIndex]);
  };

  return {
    theme,
    setTheme,
    resolvedTheme,
    mounted,
    isDark,
    isDim,
    isLight,
    isCloudflare,
    isSystem,
    toggleTheme,
    cycleThemes,
  };
}
