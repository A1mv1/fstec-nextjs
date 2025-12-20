"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import type { Threat } from "@/lib/types";
import { getTopObjectsData } from "@/lib/chart-data";

interface TopObjectsChartProps {
  threats: Threat[];
  limit?: number;
}

const chartConfig = {
  value: {
    label: "Количество угроз",
    theme: {
      light: "oklch(0.8278 0.1131 57.9984)",
      dark: "oklch(0.8278 0.1131 57.9984)",
    },
  },
} satisfies ChartConfig;

export function TopObjectsChart({ threats, limit = 15 }: TopObjectsChartProps) {
  const data = getTopObjectsData(threats, limit);

  return (
    <ChartContainer config={chartConfig} className="h-[600px] w-full animate-in fade-in slide-in-from-bottom-4 duration-1000">
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
          width={180}
          tick={{ fontSize: 11 }}
          tickLine={false}
          axisLine={false}
          tickMargin={10}
        />
        <ChartTooltip content={<ChartTooltipContent />} />
        <Bar 
          dataKey="value" 
          fill="var(--color-value)" 
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

