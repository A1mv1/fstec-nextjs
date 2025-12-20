"use client";

import { PieChart, Pie, Cell, Legend } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import type { Threat } from "@/lib/types";
import { getTacticalTasksDistributionData } from "@/lib/chart-data";

interface TacticalTasksChartProps {
  threats: Threat[];
}

const chartConfig = {
  color1: {
    label: "Цвет 1",
    theme: {
      light: "oklch(0.7357 0.1641 34.7091)",
      dark: "oklch(0.7357 0.1641 34.7091)",
    },
  },
  color2: {
    label: "Цвет 2",
    theme: {
      light: "oklch(0.8278 0.1131 57.9984)",
      dark: "oklch(0.8278 0.1131 57.9984)",
    },
  },
  color3: {
    label: "Цвет 3",
    theme: {
      light: "oklch(0.8773 0.0763 54.9314)",
      dark: "oklch(0.8773 0.0763 54.9314)",
    },
  },
  color4: {
    label: "Цвет 4",
    theme: {
      light: "oklch(0.8200 0.1054 40.8859)",
      dark: "oklch(0.8200 0.1054 40.8859)",
    },
  },
  color5: {
    label: "Цвет 5",
    theme: {
      light: "oklch(0.6368 0.1306 32.0721)",
      dark: "oklch(0.6368 0.1306 32.0721)",
    },
  },
} satisfies ChartConfig;

export function TacticalTasksChart({ threats }: TacticalTasksChartProps) {
  const data = getTacticalTasksDistributionData(threats);

  return (
    <ChartContainer config={chartConfig} className="h-[500px] w-full animate-in fade-in slide-in-from-bottom-4 duration-1000">
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={({ name, percent }) => {
            // Показываем только процент для сегментов больше 5%
            if (percent < 0.05) return '';
            return `${(percent * 100).toFixed(0)}%`;
          }}
          outerRadius={140}
          fill="var(--color-color1)"
          dataKey="value"
          isAnimationActive={true}
          animationBegin={0}
          animationDuration={1500}
          animationEasing="ease-out"
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={`var(--color-${entry.fill})`} />
          ))}
        </Pie>
        <ChartTooltip content={<ChartTooltipContent />} />
        <Legend 
          wrapperStyle={{ paddingTop: '20px' }}
          formatter={(value) => {
            const item = data.find(d => d.name === value);
            if (item) {
              const total = data.reduce((sum, d) => sum + d.value, 0);
              const percent = ((item.value / total) * 100).toFixed(1);
              return `${value} (${item.value}, ${percent}%)`;
            }
            return value;
          }}
        />
      </PieChart>
    </ChartContainer>
  );
}

