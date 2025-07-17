"use client";

import { useQueryState } from "nuqs";
import { MetricsChart } from "~/components/metrics-chart";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { WebVitalsChart } from "~/components/web-vitals-chart";
import { type UrlMetrics } from "~/lib/schemas";

interface MetricsDashboardProps {
  urlMetrics: UrlMetrics[];
}

export function MetricsDashboard({ urlMetrics }: MetricsDashboardProps) {
  const [selectedUrl, setSelectedUrl] = useQueryState("url", {
    defaultValue: urlMetrics[0]?.name ?? "",
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

            {/* Lighthouse Core Metrics */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Lighthouse Scores</h3>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">Performance</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <MetricsChart
                      data={urlData.data}
                      metric="performance"
                      title="Performance"
                    />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">Accessibility</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <MetricsChart
                      data={urlData.data}
                      metric="accessibility"
                      title="Accessibility"
                    />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">Best Practices</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <MetricsChart
                      data={urlData.data}
                      metric="bestPractices"
                      title="Best Practices"
                    />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">SEO</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <MetricsChart
                      data={urlData.data}
                      metric="seo"
                      title="SEO"
                    />
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Core Web Vitals */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Core Web Vitals</h3>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">
                      First Contentful Paint
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <WebVitalsChart
                      data={urlData.data}
                      metric="fcp"
                      title="FCP"
                    />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">
                      Largest Contentful Paint
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <WebVitalsChart
                      data={urlData.data}
                      metric="lcp"
                      title="LCP"
                    />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">
                      Cumulative Layout Shift
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <WebVitalsChart
                      data={urlData.data}
                      metric="cls"
                      title="CLS"
                    />
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Additional Metrics */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Additional Metrics</h3>
              <div className="grid gap-6 md:grid-cols-2">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">
                      Total Blocking Time
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <WebVitalsChart
                      data={urlData.data}
                      metric="tbt"
                      title="TBT"
                    />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">Speed Index</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <WebVitalsChart
                      data={urlData.data}
                      metric="speedIndex"
                      title="Speed Index"
                    />
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
