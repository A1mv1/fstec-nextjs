"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";
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
    label: "С мерами защиты",
    theme: {
      light: "oklch(0.7357 0.1641 34.7091)",
      dark: "oklch(0.7357 0.1641 34.7091)",
    },
  },
  color2: {
    label: "Без мер защиты",
    theme: {
      light: "oklch(0.8278 0.1131 57.9984)",
      dark: "oklch(0.8278 0.1131 57.9984)",
    },
  },
} satisfies ChartConfig;

export function ProtectionMeasuresChart({ threats }: ProtectionMeasuresChartProps) {
  const data = getProtectionMeasuresStatsData(threats);

  const renderBar = (props: any) => {
    const { payload, x, y, width, height } = props;
    const fillColor = `var(--color-${payload.fill})`;
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

