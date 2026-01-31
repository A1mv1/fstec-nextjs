"use client";

import * as React from "react";
import { PieChart, Pie, Cell, Legend } from "recharts";
import { useTheme } from "next-themes";
import { useTranslations } from "next-intl";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import type { Threat } from "@/lib/types";
import { getCIACombinationsData } from "@/lib/chart-data";

interface CIACombinationsChartProps {
  threats: Threat[];
}

const chartConfig = {
  color1: {
    label: "Color 1",
    theme: {
      light: "var(--chart-1)",
      dark: "var(--chart-1)",
      "retro-arcade": "oklch(0.5924 0.2025 355.8943)",
      "retro-arcade-dark": "oklch(0.5924 0.2025 355.8943)",
    },
  },
  color2: {
    label: "Color 2",
    theme: {
      light: "var(--chart-2)",
      dark: "var(--chart-2)",
      "retro-arcade": "oklch(0.6437 0.1019 187.3840)",
      "retro-arcade-dark": "oklch(0.6437 0.1019 187.3840)",
    },
  },
  color3: {
    label: "Color 3",
    theme: {
      light: "var(--chart-3)",
      dark: "var(--chart-3)",
      "retro-arcade": "oklch(0.5808 0.1732 39.5003)",
      "retro-arcade-dark": "oklch(0.5808 0.1732 39.5003)",
    },
  },
  color4: {
    label: "Color 4",
    theme: {
      light: "var(--chart-4)",
      dark: "var(--chart-4)",
      "retro-arcade": "oklch(0.65 0.22 355)",
      "retro-arcade-dark": "oklch(0.65 0.22 355)",
    },
  },
  color5: {
    label: "Color 5",
    theme: {
      light: "var(--chart-5)",
      dark: "var(--chart-5)",
      "retro-arcade": "oklch(0.68 0.18 187)",
      "retro-arcade-dark": "oklch(0.68 0.18 187)",
    },
  },
} satisfies ChartConfig;

export function CIACombinationsChart({ threats }: CIACombinationsChartProps) {
  const t = useTranslations('ChartsData');
  const tCommon = useTranslations('Common');
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
      color3: getInitialColor(chartConfig.color3),
      color4: getInitialColor(chartConfig.color4),
      color5: getInitialColor(chartConfig.color5),
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
        color3: getColor(chartConfig.color3),
        color4: getColor(chartConfig.color4),
        color5: getColor(chartConfig.color5),
      });
    };
    
    const timeoutId = setTimeout(updateColors, 0);
    return () => clearTimeout(timeoutId);
  }, [mounted, currentTheme, resolveColor]);

  if (!threats || threats.length === 0) {
    return (
      <div className="h-[500px] flex items-center justify-center">
        <p className="text-muted-foreground">{tCommon("noData")}</p>
      </div>
    );
  }

  const data = getCIACombinationsData(threats, t);

  if (!data || data.length === 0) {
    return (
      <div className="h-[500px] flex items-center justify-center">
        <p className="text-muted-foreground">{tCommon("noData")}</p>
      </div>
    );
  }

  return (
    <ChartContainer config={chartConfig} className="h-[500px] w-full animate-in fade-in slide-in-from-bottom-4 duration-1000">
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={({ name, percent }) => {
            // Показываем только для сегментов больше 5%
            if (percent < 0.05) return '';
            return `${(percent * 100).toFixed(0)}%`;
          }}
          outerRadius={140}
          fill={colorMap.color1}
          dataKey="value"
          isAnimationActive={true}
          animationBegin={0}
          animationDuration={1500}
          animationEasing="ease-out"
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={colorMap[entry.fill] || colorMap.color1} />
          ))}
        </Pie>
        <ChartTooltip content={<ChartTooltipContent />} />
        <Legend 
          wrapperStyle={{ paddingTop: '20px' }}
          formatter={(value) => {
            const item = data.find(d => d.name === value);
            if (item) {
              const percent = ((item.value / data.reduce((sum, d) => sum + d.value, 0)) * 100).toFixed(1);
              return `${value} (${item.value}, ${percent}%)`;
            }
            return value;
          }}
        />
      </PieChart>
    </ChartContainer>
  );
}

