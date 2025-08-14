"use client";

import * as React from "react";
import {
  ThemeProvider as NextThemesProvider,
  type ThemeProviderProps,
} from "next-themes";

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="cloudflare"
      enableSystem
      disableTransitionOnChange={false}
      themes={["cloudflare", "light", "dark", "dim"]}
      {...props}
    >
      {children}
    </NextThemesProvider>
  );
}
