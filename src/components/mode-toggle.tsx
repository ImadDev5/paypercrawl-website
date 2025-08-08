"use client";

import * as React from "react";
import { Monitor, Moon, Sun, SunDim } from "lucide-react";
import { useTheme } from "next-themes";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function ModeToggle() {
  const { setTheme, theme } = useTheme();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" className="relative">
          <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0 dim:-rotate-90 dim:scale-0" />
          <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100 dim:rotate-90 dim:scale-0" />
          <SunDim className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dim:rotate-0 dim:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem
          onClick={() => setTheme("light")}
          className="flex items-center gap-2 relative"
        >
          <Sun className="h-4 w-4" />
          Light
          {theme === "light" && (
            <div className="absolute right-2 h-2 w-2 rounded-full bg-primary" />
          )}
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => setTheme("dark")}
          className="flex items-center gap-2 relative"
        >
          <Moon className="h-4 w-4" />
          Dark
          {theme === "dark" && (
            <div className="absolute right-2 h-2 w-2 rounded-full bg-primary" />
          )}
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => setTheme("dim")}
          className="flex items-center gap-2 relative"
        >
          <SunDim className="h-4 w-4" />
          Dark Dimmed
          {theme === "dim" && (
            <div className="absolute right-2 h-2 w-2 rounded-full bg-primary" />
          )}
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => setTheme("system")}
          className="flex items-center gap-2 relative"
        >
          <Monitor className="h-4 w-4" />
          System
          {theme === "system" && (
            <div className="absolute right-2 h-2 w-2 rounded-full bg-primary" />
          )}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
