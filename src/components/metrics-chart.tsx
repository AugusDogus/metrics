"use client";

import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "~/components/ui/chart";
import { type ChartDataPoint } from "~/lib/schemas";

interface MetricsChartProps {
  data: ChartDataPoint[];
  metric: keyof Pick<
    ChartDataPoint,
    "performance" | "accessibility" | "bestPractices" | "seo"
  >;
  title: string;
  color: string;
}

const chartConfig = {
  performance: {
    label: "Performance",
    color: "hsl(var(--chart-1))",
  },
  accessibility: {
    label: "Accessibility",
    color: "hsl(var(--chart-2))",
  },
  bestPractices: {
    label: "Best Practices",
    color: "hsl(var(--chart-3))",
  },
  seo: {
    label: "SEO",
    color: "hsl(var(--chart-4))",
  },
} satisfies ChartConfig;

export function MetricsChart({
  data,
  metric,
  title,
  color,
}: MetricsChartProps) {
  const latestValue = data[data.length - 1]?.[metric] ?? 0;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">{title}</h3>
        <div className="text-2xl font-bold" style={{ color }}>
          {latestValue}
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
            domain={[0, 100]}
            tickLine={false}
            axisLine={false}
            tickMargin={8}
          />
          <ChartTooltip
            cursor={false}
            content={<ChartTooltipContent indicator="dot" />}
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
