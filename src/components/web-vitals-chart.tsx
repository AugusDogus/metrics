"use client";

import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "~/components/ui/chart";
import { type ChartDataPoint } from "~/lib/schemas";

interface WebVitalsChartProps {
  data: ChartDataPoint[];
  metric: keyof Pick<
    ChartDataPoint,
    "fcp" | "lcp" | "fid" | "cls" | "speedIndex" | "tbt"
  >;
  title: string;
  color: string;
  unit?: string;
  formatValue?: (value: number) => string;
}

const chartConfig = {
  fcp: {
    label: "First Contentful Paint",
    color: "hsl(var(--chart-1))",
  },
  lcp: {
    label: "Largest Contentful Paint",
    color: "hsl(var(--chart-2))",
  },
  fid: {
    label: "First Input Delay",
    color: "hsl(var(--chart-3))",
  },
  cls: {
    label: "Cumulative Layout Shift",
    color: "hsl(var(--chart-4))",
  },
  speedIndex: {
    label: "Speed Index",
    color: "hsl(var(--chart-5))",
  },
  tbt: {
    label: "Total Blocking Time",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig;

const defaultFormatters = {
  fcp: (value: number) => `${(value / 1000).toFixed(2)}s`,
  lcp: (value: number) => `${(value / 1000).toFixed(2)}s`,
  fid: (value: number) => `${value.toFixed(0)}ms`,
  cls: (value: number) => value.toFixed(3),
  speedIndex: (value: number) => `${(value / 1000).toFixed(2)}s`,
  tbt: (value: number) => `${value.toFixed(0)}ms`,
};

export function WebVitalsChart({
  data,
  metric,
  title,
  color,
  unit,
  formatValue,
}: WebVitalsChartProps) {
  const latestValue = data[data.length - 1]?.[metric] ?? 0;
  const formatter = formatValue ?? defaultFormatters[metric];

  // Calculate appropriate domain based on metric
  const values = data.map((d) => d[metric]);
  const maxValue = Math.max(...values);
  const minValue = Math.min(...values);
  const padding = (maxValue - minValue) * 0.1;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">{title}</h3>
        <div className="text-2xl font-bold" style={{ color }}>
          {formatter(latestValue)}
          {unit && ` ${unit}`}
        </div>
      </div>
      <ChartContainer config={chartConfig} className="h-[200px] w-full">
        <AreaChart
          accessibilityLayer
          data={data}
          margin={{
            left: 12,
            right: 12,
            top: 12,
            bottom: 12,
          }}
        >
          <CartesianGrid vertical={false} />
          <XAxis
            dataKey="date"
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            tickFormatter={(value) =>
              new Date(value as string).toLocaleDateString()
            }
          />
          <YAxis
            domain={[minValue - padding, maxValue + padding]}
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            tickFormatter={formatter}
          />
          <ChartTooltip
            cursor={false}
            content={
              <ChartTooltipContent
                indicator="dot"
                formatter={(value) => [formatter(value as number), title]}
              />
            }
          />
          <Area
            dataKey={metric}
            type="natural"
            fill={color}
            fillOpacity={0.4}
            stroke={color}
            stackId="a"
          />
        </AreaChart>
      </ChartContainer>
    </div>
  );
}
