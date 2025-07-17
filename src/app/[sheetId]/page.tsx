import { notFound } from "next/navigation";
import { Suspense } from "react";
import { DateRangeSelector } from "~/components/date-range-selector";
import { MetricsDashboard } from "~/components/metrics-dashboard";
import { MetricsSelector } from "~/components/metrics-selector";
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

interface SheetPageProps {
  params: Promise<{ sheetId: string }>;
}

async function MetricsContent({ sheetId }: { sheetId: string }) {
  // Get all sheet metadata
  const sheets = await api.metrics.getAllSheets();

  if (sheets.length === 0) {
    notFound();
  }

  // Decode the sheet title from the URL
  let decodedSheetTitle: string;
  try {
    decodedSheetTitle = atob(sheetId);
  } catch (error) {
    console.warn("Failed to decode sheet ID:", error);
    notFound();
  }

  // Verify the sheet exists
  const sheet = sheets.find((s) => s.title === decodedSheetTitle);
  if (!sheet) {
    notFound();
  }

  // Load the selected sheet's data
  const selectedSheetData = await api.metrics.getMetricsForSheet({
    sheetTitle: decodedSheetTitle,
  });

  return (
    <MetricsDashboard sheets={sheets} selectedSheetData={selectedSheetData} />
  );
}

export default async function SheetPage({ params }: SheetPageProps) {
  const { sheetId } = await params;

  return (
    <HydrateClient>
      <div className="bg-background min-h-screen">
        {/* Header */}
        <header className="bg-background/95 supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50 w-full border-b backdrop-blur">
          <div className="container mx-auto flex h-14 items-center justify-between px-4">
            <div className="flex items-center space-x-2">
              <h1 className="text-lg font-semibold">Lighthouse Metrics</h1>
            </div>
            <div className="flex items-center space-x-2">
              <DateRangeSelector />
              <MetricsSelector />
              <ThemeToggle />
            </div>
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
              <MetricsContent sheetId={sheetId} />
            </Suspense>
          </div>
        </main>
      </div>
    </HydrateClient>
  );
}

// Generate static params for all sheets if needed
export async function generateStaticParams() {
  try {
    const sheets = await api.metrics.getAllSheets();
    return sheets.map((sheet) => ({
      sheetId: btoa(sheet.title),
    }));
  } catch (error) {
    console.warn("Failed to generate static params:", error);
    return [];
  }
}
