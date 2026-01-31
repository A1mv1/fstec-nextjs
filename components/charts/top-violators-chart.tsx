"use client";

import * as React from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";
import { useTheme } from "next-themes";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import type { Threat } from "@/lib/types";
import { getTopViolatorsData } from "@/lib/chart-data";

interface TopViolatorsChartProps {
  threats: Threat[];
  limit?: number;
}

const chartConfig = {
  value: {
    label: "Количество угроз",
    theme: {
      light: "var(--chart-4)",
      dark: "var(--chart-4)",
      "retro-arcade": "oklch(0.5924 0.2025 355.8943)",
      "retro-arcade-dark": "oklch(0.5924 0.2025 355.8943)",
    },
  },
} satisfies ChartConfig;

export function TopViolatorsChart({ threats, limit = 10 }: TopViolatorsChartProps) {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);
  const [isRetroArcade, setIsRetroArcade] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  React.useEffect(() => {
    if (!mounted || typeof window === "undefined") return;
    const container = document.documentElement;
    setIsRetroArcade(container.classList.contains("retro-arcade"));

    const observer = new MutationObserver(() => {
      setIsRetroArcade(container.classList.contains("retro-arcade"));
    });

    observer.observe(container, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => observer.disconnect();
  }, [mounted, resolvedTheme]);

  const currentTheme = React.useMemo(() => {
    if (!mounted) return "light";
    if (isRetroArcade) {
      return resolvedTheme === "dark" ? "retro-arcade-dark" : "retro-arcade";
    }
    return resolvedTheme === "dark" ? "dark" : "light";
  }, [mounted, isRetroArcade, resolvedTheme]);

  const [fillColor, setFillColor] = React.useState<string>(() => {
    const color = chartConfig.value.theme.light;
    if (typeof window !== "undefined" && color.startsWith('var(')) {
      const varName = color.match(/var\(([^)]+)\)/)?.[1]?.trim();
      if (varName) {
        const computedValue = getComputedStyle(document.documentElement)
          .getPropertyValue(varName)
          .trim();
        if (computedValue) {
          return computedValue;
        }
      }
    }
    return color;
  });

  React.useEffect(() => {
    if (!mounted) return;
    
    const updateColor = () => {
      let color = chartConfig.value.theme[currentTheme as keyof typeof chartConfig.value.theme] || chartConfig.value.theme.light;
      
      // Разрешаем CSS-переменные из темы (например, var(--chart-4))
      if (typeof window !== "undefined" && color.startsWith('var(')) {
        const varName = color.match(/var\(([^)]+)\)/)?.[1]?.trim();
        if (varName) {
          const computedValue = getComputedStyle(document.documentElement)
            .getPropertyValue(varName)
            .trim();
          if (computedValue) {
            color = computedValue;
          }
        }
      }
      
      setFillColor(color);
    };
    
    const timeoutId = setTimeout(updateColor, 0);
    return () => clearTimeout(timeoutId);
  }, [mounted, currentTheme]);
  const data = getTopViolatorsData(threats, limit);

  return (
    <ChartContainer config={chartConfig} className="h-[500px] w-full animate-in fade-in slide-in-from-bottom-4 duration-1000">
      <BarChart 
        data={data} 
        layout="vertical"
        margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis type="number" tickLine={false} axisLine={false} />
        <YAxis 
          type="category" 
          dataKey="name" 
          width={140}
          tick={{ fontSize: 12 }}
          tickLine={false}
          axisLine={false}
          tickMargin={10}
        />
        <ChartTooltip content={<ChartTooltipContent />} />
        <Bar 
          dataKey="value" 
          fill={fillColor}
          radius={[0, 8, 8, 0]}
          isAnimationActive={true}
          animationBegin={0}
          animationDuration={1200}
          animationEasing="ease-out"
        />
      </BarChart>
    </ChartContainer>
  );
}

