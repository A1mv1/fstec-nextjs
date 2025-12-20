"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";
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
      light: "oklch(0.7357 0.1641 34.7091)",
      dark: "oklch(0.7357 0.1641 34.7091)",
    },
  },
} satisfies ChartConfig;

export function TopViolatorsChart({ threats, limit = 10 }: TopViolatorsChartProps) {
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

