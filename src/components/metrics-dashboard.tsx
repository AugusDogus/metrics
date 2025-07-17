"use client";

import { useRouter } from "next/navigation";
import { useQueryState } from "nuqs";
import SimpleBar from "simplebar-react";
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
  type SheetMetadata,
  type UrlMetrics,
} from "~/lib/schemas";

import "simplebar-react/dist/simplebar.min.css";

interface MetricsDashboardProps {
  sheets: SheetMetadata[];
  selectedSheetData: UrlMetrics;
}

// Extract the last two path segments from a URL for tab display
function getTabDisplayName(url: string): string {
  try {
    // Handle URLs that might not have protocol
    const urlToProcess = url.startsWith("http") ? url : `https://${url}`;
    const urlObj = new URL(urlToProcess);
    const pathSegments = urlObj.pathname.split("/").filter(Boolean);

    // If no path segments (root/home page), return "Home"
    if (pathSegments.length === 0) {
      return "Home";
    }

    // Get the last two segments (or just one if only one exists)
    const lastTwoSegments = pathSegments.slice(-2);
    return lastTwoSegments.join("/").replaceAll("/", " ").replaceAll("-", " ");
  } catch {
    // Fallback: split by / and get last two segments
    const segments = url.split("/").filter(Boolean);

    if (segments.length === 0) {
      return "Home";
    }

    // Get the last two segments (or just one if only one exists)
    const lastTwoSegments = segments.slice(-2);
    return lastTwoSegments.join("/");
  }
}

export function MetricsDashboard({
  sheets,
  selectedSheetData,
}: MetricsDashboardProps) {
  const router = useRouter();

  const [selectedMetrics] = useQueryState("metrics", {
    defaultValue: DEFAULT_METRICS.join(","),
    shallow: false,
  });

  const [dateRange] = useQueryState("range", {
    defaultValue: "90d" as DateRange,
    shallow: false,
  });

  if (sheets.length === 0) {
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

  const handleTabChange = (sheetTitle: string) => {
    // Encode the sheet title as base64 for the URL
    const encodedTitle = btoa(sheetTitle);

    // Get current search params to preserve other filters
    const searchParams = new URLSearchParams(window.location.search);

    // Navigate to the new URL with the encoded sheet title as the path
    router.push(`/${encodedTitle}?${searchParams.toString()}`);
  };

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
        value={selectedSheetData.name}
        onValueChange={handleTabChange}
        className="min-h-16 w-full"
      >
        <TabsList className="min-h-16 w-full">
          <SimpleBar
            forceVisible="x"
            autoHide={false}
            className="w-full overflow-x-auto pb-2"
          >
            <div className="mt-2 flex min-h-10 gap-1 pb-2">
              {sheets.map((sheet) => (
                <TabsTrigger
                  key={sheet.title}
                  value={sheet.title}
                  className="text-xs whitespace-nowrap capitalize sm:text-sm"
                >
                  {getTabDisplayName(sheet.title)}
                </TabsTrigger>
              ))}
            </div>
          </SimpleBar>
        </TabsList>

        {/* Only render the selected tab content since we only have data for one sheet */}
        <TabsContent value={selectedSheetData.name} className="space-y-6">
          <div className="space-y-6">
            {/* URL Header */}
            <div className="space-y-2">
              <h2 className="text-2xl font-bold">{selectedSheetData.name}</h2>
              <p className="text-muted-foreground text-sm">
                {selectedSheetData.url}
              </p>
              <div className="text-muted-foreground text-xs">
                Last updated:{" "}
                {new Date(
                  selectedSheetData.latestMetrics.timestamp,
                ).toLocaleString()}
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
            {selectedMetricIds.length > 0 && (
              <div className="space-y-6">
                {selectedMetricConfigs.map((metric) => (
                  <div key={metric.id} className="w-full">
                    {renderMetricCard(metric, selectedSheetData)}
                  </div>
                ))}
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
