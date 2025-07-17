import { notFound } from "next/navigation";
import { Suspense } from "react";
import { MetricsDashboard } from "~/components/metrics-dashboard";
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

  return <MetricsDashboard selectedSheetData={selectedSheetData} />;
}

export default async function SheetPage({ params }: SheetPageProps) {
  const { sheetId } = await params;

  return (
    <HydrateClient>
      <div className="space-y-6">
        <Suspense fallback={<LoadingState />}>
          <MetricsContent sheetId={sheetId} />
        </Suspense>
      </div>
    </HydrateClient>
  );
}

// Note: generateStaticParams removed to avoid build-time context issues
// Dynamic routes will be handled at request time instead
