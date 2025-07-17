"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { DateRangeSelector } from "~/components/date-range-selector";
import { MetricsSelector } from "~/components/metrics-selector";
import { ThemeToggle } from "~/components/theme-toggle";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "~/components/ui/tooltip";
import { api } from "~/trpc/react";

// Extract the last path segment from a URL for tab display
function getTabDisplayName(url: string): string {
  try {
    // Handle URLs that might not have protocol
    const urlToProcess = url.startsWith("http") ? url : `https://${url}`;
    const urlObj = new URL(urlToProcess);
    const pathSegments = urlObj.pathname.split("/").filter(Boolean);

    if (pathSegments.length === 0) {
      return "Home";
    }

    // Get the last segment and format it
    const lastSegment = pathSegments[pathSegments.length - 1];
    if (!lastSegment) return "Home";

    return lastSegment
      .replace(/-/g, " ")
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  } catch {
    // If URL parsing fails, extract from the raw string
    const parts = url.split("/").filter(Boolean);
    if (parts.length === 0) return "Home";

    const lastPart = parts[parts.length - 1];
    if (!lastPart) return "Home";

    return lastPart
      .replace(/-/g, " ")
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  }
}

function NavbarContent() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { data: sheets = [] } = api.metrics.getAllSheets.useQuery();

  // Get current sheet title from URL
  const getCurrentSheetTitle = () => {
    if (pathname === "/") {
      return sheets[0]?.title;
    }

    const encodedTitle = pathname.replace("/", "");

    try {
      const decodedTitle = atob(encodedTitle);
      return sheets.find((sheet) => sheet.title === decodedTitle)?.title;
    } catch {
      return undefined;
    }
  };

  const currentSheetTitle = getCurrentSheetTitle();

  // Construct URL with preserved search parameters
  const createTabUrl = (encodedTitle: string) => {
    const url = `/${encodedTitle}`;
    const params = searchParams.toString();
    return params ? `${url}?${params}` : url;
  };

  return (
    <TooltipProvider>
      <header className="bg-background/95 supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50 w-full border-b backdrop-blur">
        <div className="container mx-auto px-4">
          {/* Main navbar */}
          <div className="flex h-14 items-center justify-between">
            <div className="flex items-center space-x-2">
              <h1 className="text-lg font-semibold">Lighthouse Metrics</h1>
            </div>
            <div className="flex items-center space-x-2">
              <DateRangeSelector />
              <MetricsSelector />
              <ThemeToggle />
            </div>
          </div>

          {/* Sheet navigation tabs */}
          {sheets.length > 0 && (
            <div className="border-t">
              <div className="scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent hover:scrollbar-thumb-gray-400 w-full overflow-x-auto">
                <div className="mt-2 flex min-h-10 gap-1 pb-2">
                  {sheets.map((sheet) => {
                    const encodedTitle = btoa(sheet.title);
                    const isActive = currentSheetTitle === sheet.title;

                    return (
                      <Tooltip key={sheet.title}>
                        <TooltipTrigger className="flex-1">
                          <Link
                            href={createTabUrl(encodedTitle)}
                            className={`focus-visible:ring-ring inline-flex h-9 w-full items-center justify-center gap-2 rounded-md border border-transparent px-2 py-1 text-xs font-medium whitespace-nowrap capitalize transition-all focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 sm:text-sm ${
                              isActive
                                ? "bg-foreground text-background shadow-sm"
                                : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                            }`}
                          >
                            {getTabDisplayName(sheet.title)}
                          </Link>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{sheet.title}</p>
                        </TooltipContent>
                      </Tooltip>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      </header>
    </TooltipProvider>
  );
}

export function Navbar() {
  return (
    <Suspense
      fallback={
        <header className="bg-background/95 supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50 w-full border-b backdrop-blur">
          <div className="container mx-auto px-4">
            <div className="flex h-14 items-center justify-between">
              <div className="flex items-center space-x-2">
                <h1 className="text-lg font-semibold">Lighthouse Metrics</h1>
              </div>
              <div className="flex items-center space-x-2">
                <ThemeToggle />
              </div>
            </div>
          </div>
        </header>
      }
    >
      <NavbarContent />
    </Suspense>
  );
}
