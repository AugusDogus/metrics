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
  metric: "performance" | "accessibility" | "bestPractices" | "seo";
  title: string;
}

const chartConfig = {
  desktop: {
    label: "Desktop",
    color: "var(--chart-1)",
  },
  mobile: {
    label: "Mobile",
    color: "var(--chart-2)",
  },
} satisfies ChartConfig;

export function MetricsChart({ data, metric, title }: MetricsChartProps) {
  const desktopKey =
    `desktop${metric.charAt(0).toUpperCase() + metric.slice(1)}` as keyof ChartDataPoint;
  const mobileKey =
    `mobile${metric.charAt(0).toUpperCase() + metric.slice(1)}` as keyof ChartDataPoint;

  const latestDesktop = data[data.length - 1]?.[desktopKey] ?? 0;
  const latestMobile = data[data.length - 1]?.[mobileKey] ?? 0;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">{title}</h3>
        <div className="flex gap-4 text-sm">
          <div className="flex items-center gap-1">
            <div className="bg-chart-1 h-2 w-2 rounded-full"></div>
            <span>Desktop: {latestDesktop}</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="bg-chart-2 h-2 w-2 rounded-full"></div>
            <span>Mobile: {latestMobile}</span>
          </div>
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
            content={
              <ChartTooltipContent
                indicator="dot"
                formatter={(value, name, item) => {
                  const indicatorColor =
                    (item as { payload?: { fill?: string }; color?: string })
                      ?.payload?.fill ??
                    (item as { color?: string })?.color ??
                    "var(--chart-1)";
                  const label = name === desktopKey ? "Desktop" : "Mobile";

                  return (
                    <>
                      <div
                        className="h-2.5 w-2.5 shrink-0 rounded-[2px] border bg-[var(--color-bg)]"
                        style={
                          {
                            "--color-bg": indicatorColor,
                          } as React.CSSProperties
                        }
                      />
                      <div className="flex flex-1 items-center justify-between leading-none">
                        <span className="text-muted-foreground">{label}</span>
                        <span className="text-foreground font-mono font-medium tabular-nums">
                          {value}
                        </span>
                      </div>
                    </>
                  );
                }}
              />
            }
          />
          <Area
            dataKey={desktopKey}
            type="natural"
            fill="var(--color-desktop)"
            fillOpacity={0.4}
            stroke="var(--color-desktop)"
            stackId="a"
          />
          <Area
            dataKey={mobileKey}
            type="natural"
            fill="var(--color-mobile)"
            fillOpacity={0.4}
            stroke="var(--color-mobile)"
            stackId="b"
          />
        </AreaChart>
      </ChartContainer>
    </div>
  );
}
