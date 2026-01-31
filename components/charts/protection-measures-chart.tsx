"use client";

import * as React from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";
import { useTheme } from "next-themes";
import { useTranslations } from "next-intl";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import type { Threat } from "@/lib/types";
import { getProtectionMeasuresStatsData } from "@/lib/chart-data";

interface ProtectionMeasuresChartProps {
  threats: Threat[];
}

const chartConfig = {
  color1: {
    label: "With measures",
    theme: {
      light: "var(--chart-2)",
      dark: "var(--chart-2)",
      "retro-arcade": "oklch(0.6437 0.1019 187.3840)",
      "retro-arcade-dark": "oklch(0.6437 0.1019 187.3840)",
    },
  },
  color2: {
    label: "Without measures",
    theme: {
      light: "var(--chart-1)",
      dark: "var(--chart-1)",
      "retro-arcade": "oklch(0.5924 0.2025 355.8943)",
      "retro-arcade-dark": "oklch(0.5924 0.2025 355.8943)",
    },
  },
} satisfies ChartConfig;

export function ProtectionMeasuresChart({ threats }: ProtectionMeasuresChartProps) {
  const t = useTranslations('ChartsData');
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

  const resolveColor = React.useCallback((color: string): string => {
    if (typeof window === "undefined" || !color.startsWith('var(')) {
      return color;
    }
    const varName = color.match(/var\(([^)]+)\)/)?.[1]?.trim();
    if (varName) {
      const computedValue = getComputedStyle(document.documentElement)
        .getPropertyValue(varName)
        .trim();
      if (computedValue) {
        return computedValue;
      }
    }
    return color;
  }, []);

  const [colorMap, setColorMap] = React.useState<Record<string, string>>(() => {
    const getInitialColor = (config: typeof chartConfig.color1) => {
      const color = config.theme.light;
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
    };
    return {
      color1: getInitialColor(chartConfig.color1),
      color2: getInitialColor(chartConfig.color2),
    };
  });

  React.useEffect(() => {
    if (!mounted) return;
    
    const updateColors = () => {
      const getColor = (config: typeof chartConfig.color1) => {
        const color = config.theme[currentTheme as keyof typeof config.theme] || config.theme.light;
        return resolveColor(color);
      };
      
      setColorMap({
        color1: getColor(chartConfig.color1),
        color2: getColor(chartConfig.color2),
      });
    };
    
    const timeoutId = setTimeout(updateColors, 0);
    return () => clearTimeout(timeoutId);
  }, [mounted, currentTheme, resolveColor]);

  const data = getProtectionMeasuresStatsData(threats, t);

  const renderBar = (props: any) => {
    const { payload, x, y, width, height } = props;
    const fillColor = colorMap[payload.fill] || colorMap.color1;
    return (
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        fill={fillColor}
        rx={8}
        ry={8}
      />
    );
  };

  return (
    <ChartContainer config={chartConfig} className="h-[400px] w-full animate-in fade-in slide-in-from-bottom-4 duration-1000">
      <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis 
          dataKey="name" 
          tickLine={false}
          axisLine={false}
        />
        <YAxis tickLine={false} axisLine={false} />
        <ChartTooltip content={<ChartTooltipContent />} />
        <Bar 
          dataKey="value" 
          shape={renderBar}
          isAnimationActive={true}
          animationBegin={0}
          animationDuration={1200}
          animationEasing="ease-out"
        />
      </BarChart>
    </ChartContainer>
  );
}

