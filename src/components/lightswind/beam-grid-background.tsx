"use client";

import React, { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

export interface BeamGridBackgroundProps {
  className?: string;
  gridSize?: number;
  interactive?: boolean;
  asBackground?: boolean;
  showFade?: boolean;
  fadeIntensity?: number;
}

const BeamGridBackground: React.FC<BeamGridBackgroundProps> = ({
  className,
  gridSize = 50,
  interactive = true,
  asBackground = true,
  showFade = true,
  fadeIntensity = 25,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [mousePos, setMousePos] = useState({ x: -1000, y: -1000 });
  const animationFrameRef = useRef<number>();
  const [theme, setTheme] = useState<string>("light");

  // Detect theme changes
  useEffect(() => {
    const detectTheme = () => {
      if (document.documentElement.classList.contains("dim")) {
        setTheme("dim");
      } else if (document.documentElement.classList.contains("dark")) {
        setTheme("dark");
      } else {
        setTheme("light");
      }
    };

    detectTheme();

    // Watch for theme changes
    const observer = new MutationObserver(detectTheme);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => observer.disconnect();
  }, []);

  // Get theme-aware colors
  const getThemeColors = () => {
    const colors = {
      light: {
        grid: "rgba(0, 0, 0, 0.05)",
        interactiveGlow: "rgba(59, 130, 246, 0.15)",
      },
      dark: {
        grid: "rgba(255, 255, 255, 0.05)",
        interactiveGlow: "rgba(96, 165, 250, 0.15)",
      },
      dim: {
        grid: "rgba(177, 186, 196, 0.08)",
        interactiveGlow: "rgba(65, 132, 228, 0.15)",
      },
    };
    return colors[theme as keyof typeof colors] || colors.light;
  };



  // Handle mouse interaction
  useEffect(() => {
    if (!interactive) return;

    const handleMouseMove = (e: MouseEvent) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      setMousePos({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
    };

    const handleMouseLeave = () => {
      setMousePos({ x: -1000, y: -1000 });
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [interactive]);

  // Animation loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const colors = getThemeColors();

      // Draw grid
      ctx.strokeStyle = colors.grid;
      ctx.lineWidth = 1;

      // Vertical lines
      for (let x = 0; x < canvas.width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }

      // Horizontal lines
      for (let y = 0; y < canvas.height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }

      // Draw interactive glow effect
      if (interactive && mousePos.x > 0 && mousePos.y > 0) {
        const gradient = ctx.createRadialGradient(
          mousePos.x,
          mousePos.y,
          0,
          mousePos.x,
          mousePos.y,
          200
        );
        gradient.addColorStop(0, colors.interactiveGlow);
        gradient.addColorStop(1, "transparent");
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      window.removeEventListener("resize", resizeCanvas);
    };
  }, [mousePos, gridSize, interactive, theme]);

  return (
    <div
      className={cn(
        "pointer-events-none",
        asBackground && "fixed inset-0 w-full h-full",
        className
      )}
      style={{
        ...(asBackground && { position: "fixed", top: 0, left: 0 }),
      }}
    >
      <canvas
        ref={canvasRef}
        className={cn(
          "w-full h-full",
          interactive && "pointer-events-auto"
        )}
      />
      {showFade && (
        <>
          {/* Top fade */}
          <div
            className="absolute top-0 left-0 right-0 h-32 pointer-events-none"
            style={{
              background: `linear-gradient(to bottom, hsl(var(--background) / ${fadeIntensity / 100}), transparent)`,
            }}
          />
          {/* Bottom fade */}
          <div
            className="absolute bottom-0 left-0 right-0 h-32 pointer-events-none"
            style={{
              background: `linear-gradient(to top, hsl(var(--background) / ${fadeIntensity / 100}), transparent)`,
            }}
          />
          {/* Left fade */}
          <div
            className="absolute top-0 bottom-0 left-0 w-32 pointer-events-none"
            style={{
              background: `linear-gradient(to right, hsl(var(--background) / ${fadeIntensity / 100}), transparent)`,
            }}
          />
          {/* Right fade */}
          <div
            className="absolute top-0 bottom-0 right-0 w-32 pointer-events-none"
            style={{
              background: `linear-gradient(to left, hsl(var(--background) / ${fadeIntensity / 100}), transparent)`,
            }}
          />
        </>
      )}
    </div>
  );
};

export default BeamGridBackground;