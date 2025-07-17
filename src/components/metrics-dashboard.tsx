"use client";

import { useQueryState } from "nuqs";
import {
  filterDataByDateRange,
  type DateRange,
} from "~/components/date-range-selector";
import { MetricsChart } from "~/components/metrics-chart";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { WebVitalsChart } from "~/components/web-vitals-chart";
import {
  AVAILABLE_METRICS,
  DEFAULT_METRICS,
  type MetricId,
  type UrlMetrics,
} from "~/lib/schemas";

interface MetricsDashboardProps {
  urlMetrics: UrlMetrics[];
}

export function MetricsDashboard({ urlMetrics }: MetricsDashboardProps) {
  const [selectedUrl, setSelectedUrl] = useQueryState("url", {
    defaultValue: urlMetrics[0]?.name ?? "",
    shallow: false,
  });

  const [selectedMetrics] = useQueryState("metrics", {
    defaultValue: DEFAULT_METRICS.join(","),
    shallow: false,
  });

  const [dateRange] = useQueryState("range", {
    defaultValue: "90d" as DateRange,
    shallow: false,
  });

  if (urlMetrics.length === 0) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <h3 className="text-muted-foreground text-lg font-medium">
            No metrics data available
          </h3>
          <p className="text-muted-foreground text-sm">
            Make sure your Google Sheets contain lighthouse metrics data.
          </p>
        </div>
      </div>
    );
  }

  const selectedMetricIds = selectedMetrics
    .split(",")
    .filter(Boolean) as MetricId[];
  const selectedMetricConfigs = AVAILABLE_METRICS.filter((metric) =>
    selectedMetricIds.includes(metric.id),
  );

  const renderMetricCard = (
    metric: (typeof AVAILABLE_METRICS)[number],
    urlData: UrlMetrics,
  ) => {
    // Filter the data based on the selected date range
    const filteredData = filterDataByDateRange(
      urlData.data,
      dateRange as DateRange,
    );

    if (metric.type === "lighthouse") {
      return (
        <Card key={metric.id}>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">{metric.label}</CardTitle>
          </CardHeader>
          <CardContent>
            <MetricsChart
              data={filteredData}
              metric={metric.key}
              title={metric.label}
            />
          </CardContent>
        </Card>
      );
    } else {
      const formatValue =
        metric.unit === "s"
          ? (value: number) => `${(value / 1000).toFixed(2)}s`
          : metric.unit === "ms"
            ? (value: number) => `${value.toFixed(0)}ms`
            : metric.unit === ""
              ? (value: number) => value.toFixed(3)
              : undefined;

      return (
        <Card key={metric.id}>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">{metric.label}</CardTitle>
          </CardHeader>
          <CardContent>
            <WebVitalsChart
              data={filteredData}
              metric={metric.key}
              title={metric.label}
              formatValue={formatValue}
            />
          </CardContent>
        </Card>
      );
    }
  };

  return (
    <div className="space-y-6">
      <Tabs
        value={selectedUrl}
        onValueChange={setSelectedUrl}
        className="w-full"
      >
        <TabsList
          className="grid w-full"
          style={{
            gridTemplateColumns: `repeat(${urlMetrics.length}, minmax(0, 1fr))`,
          }}
        >
          {urlMetrics.map((urlData) => (
            <TabsTrigger
              key={urlData.name}
              value={urlData.name}
              className="text-xs sm:text-sm"
            >
              {urlData.name}
            </TabsTrigger>
          ))}
        </TabsList>

        {urlMetrics.map((urlData) => (
          <TabsContent
            key={urlData.name}
            value={urlData.name}
            className="space-y-6"
          >
            {/* URL Header */}
            <div className="space-y-2">
              <h2 className="text-2xl font-bold">{urlData.name}</h2>
              <p className="text-muted-foreground text-sm">{urlData.url}</p>
              <div className="text-muted-foreground text-xs">
                Last updated:{" "}
                {new Date(urlData.latestMetrics.timestamp).toLocaleString()}
              </div>
            </div>

            {/* Show message if no metrics selected */}
            {selectedMetricIds.length === 0 && (
              <div className="flex min-h-[200px] items-center justify-center">
                <div className="text-center">
                  <h3 className="text-muted-foreground text-lg font-medium">
                    No metrics selected
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    Use the metrics selector in the navbar to choose which
                    metrics to display.
                  </p>
                </div>
              </div>
            )}

            {/* All Selected Metrics */}
            {selectedMetricConfigs.length > 0 && (
              <div className="space-y-6">
                {selectedMetricConfigs.map((metric) => (
                  <div key={metric.id} className="w-full">
                    {renderMetricCard(metric, urlData)}
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
