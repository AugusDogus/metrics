"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import SimpleBar from "simplebar-react";
import { DateRangeSelector } from "~/components/date-range-selector";
import { MetricsSelector } from "~/components/metrics-selector";
import { ThemeToggle } from "~/components/theme-toggle";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "~/components/ui/tooltip";
import { type SheetMetadata } from "~/lib/schemas";

import "simplebar-react/dist/simplebar.min.css";

interface NavbarProps {
  sheets: SheetMetadata[];
}

// Extract the last path segment from a URL for tab display
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

    // Get the last segment and clean it up
    const lastSegment = pathSegments[pathSegments.length - 1];
    return lastSegment ? lastSegment.replaceAll("-", " ") : "Home";
  } catch {
    // Fallback: split by / and get last segment
    const segments = url.split("/").filter(Boolean);

    if (segments.length === 0) {
      return "Home";
    }

    // Get the last segment and clean it up
    const lastSegment = segments[segments.length - 1];
    return lastSegment ? lastSegment.replaceAll("-", " ") : "Home";
  }
}

export function Navbar({ sheets }: NavbarProps) {
  const pathname = usePathname();

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
              <SimpleBar
                forceVisible="x"
                autoHide={false}
                className="w-full overflow-x-auto pb-2"
              >
                <div className="mt-2 flex min-h-10 gap-1 pb-2">
                  {sheets.map((sheet) => {
                    const encodedTitle = btoa(sheet.title);
                    const isActive = currentSheetTitle === sheet.title;

                    return (
                      <Tooltip key={sheet.title}>
                        <TooltipTrigger className="flex-1">
                          <Link
                            href={`/${encodedTitle}`}
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
              </SimpleBar>
            </div>
          )}
        </div>
      </header>
    </TooltipProvider>
  );
}
