"use client";

import { MetricsChart } from "~/components/metrics-chart";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { WebVitalsChart } from "~/components/web-vitals-chart";
import { type UrlMetrics } from "~/lib/schemas";

interface MetricsDashboardProps {
  urlMetrics: UrlMetrics[];
}

export function MetricsDashboard({ urlMetrics }: MetricsDashboardProps) {
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
    <div className="space-y-8">
      {urlMetrics.map((urlData) => (
        <div key={urlData.url} className="space-y-6">
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
                  color="hsl(var(--chart-1))"
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
                  color="hsl(var(--chart-2))"
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
                  color="hsl(var(--chart-3))"
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
                  color="hsl(var(--chart-4))"
                />
              </CardContent>
            </Card>
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
                    color="hsl(var(--chart-1))"
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
                    color="hsl(var(--chart-2))"
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
                    color="hsl(var(--chart-4))"
                  />
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Additional Metrics */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Additional Metrics</h3>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">First Input Delay</CardTitle>
                </CardHeader>
                <CardContent>
                  <WebVitalsChart
                    data={urlData.data}
                    metric="fid"
                    title="FID"
                    color="hsl(var(--chart-3))"
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
                    color="hsl(var(--chart-5))"
                  />
                </CardContent>
              </Card>

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
                    color="hsl(var(--chart-1))"
                  />
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Separator between URLs */}
          {urlMetrics.indexOf(urlData) < urlMetrics.length - 1 && (
            <hr className="border-border" />
          )}
        </div>
      ))}
    </div>
  );
}
