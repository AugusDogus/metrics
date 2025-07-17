import { Suspense } from "react";
import { MetricsDashboard } from "~/components/metrics-dashboard";
import { ThemeToggle } from "~/components/theme-toggle";
import { api, HydrateClient } from "~/trpc/server";

function LoadingState() {
  return (
    <div className="flex min-h-[400px] items-center justify-center">
      <div className="space-y-2 text-center">
        <div className="border-foreground mx-auto h-8 w-8 animate-spin rounded-full border-b-2"></div>
        <p className="text-muted-foreground text-sm">Loading metrics data...</p>
      </div>
    </div>
  );
}

async function MetricsContent() {
  const metricsData = await api.metrics.getAllMetrics();
  return <MetricsDashboard urlMetrics={metricsData} />;
}

export default function Home() {
  void api.metrics.getAllMetrics.prefetch();

  return (
    <HydrateClient>
      <div className="bg-background min-h-screen">
        {/* Header */}
        <header className="bg-background/95 supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50 w-full border-b backdrop-blur">
          <div className="container mx-auto flex h-14 items-center justify-between px-4">
            <div className="flex items-center space-x-2">
              <h1 className="text-lg font-semibold">Lighthouse Metrics</h1>
            </div>
            <ThemeToggle />
          </div>
        </header>

        {/* Main Content */}
        <main className="container mx-auto px-4 py-8">
          <div className="space-y-6">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tight">
                Performance Dashboard
              </h1>
              <p className="text-muted-foreground">
                Monitor your website&apos;s performance metrics from Google
                Lighthouse.
              </p>
            </div>

            <Suspense fallback={<LoadingState />}>
              <MetricsContent />
            </Suspense>
          </div>
        </main>
      </div>
    </HydrateClient>
  );
}
