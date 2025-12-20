"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import type { Threat } from "@/lib/types";
import { getCIADistributionData } from "@/lib/chart-data";

interface CIADistributionChartProps {
  threats: Threat[];
}

const chartConfig = {
  confidentiality: {
    label: "Конфиденциальность",
    theme: {
      light: "oklch(0.7357 0.1641 34.7091)",
      dark: "oklch(0.7357 0.1641 34.7091)",
    },
  },
  integrity: {
    label: "Целостность",
    theme: {
      light: "oklch(0.8278 0.1131 57.9984)",
      dark: "oklch(0.8278 0.1131 57.9984)",
    },
  },
  availability: {
    label: "Доступность",
    theme: {
      light: "oklch(0.8773 0.0763 54.9314)",
      dark: "oklch(0.8773 0.0763 54.9314)",
    },
  },
} satisfies ChartConfig;

export function CIADistributionChart({ threats }: CIADistributionChartProps) {
  if (!threats || threats.length === 0) {
    return (
      <div className="h-[400px] flex items-center justify-center">
        <p className="text-muted-foreground">Нет данных для отображения</p>
      </div>
    );
  }

  const data = getCIADistributionData(threats);

  if (!data || data.length === 0) {
    return (
      <div className="h-[400px] flex items-center justify-center">
        <p className="text-muted-foreground">Нет данных для отображения</p>
      </div>
    );
  }

  // Функция для рендеринга столбцов с разными цветами
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

