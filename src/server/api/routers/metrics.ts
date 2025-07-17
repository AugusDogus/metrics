import { z } from "zod";
import {
  sheetRowSchema,
  type ChartDataPoint,
  type UrlMetrics,
} from "~/lib/schemas";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

// Helper function to convert string/number to number, handling "N/A" values
function toNumber(value: string | number): number {
  if (typeof value === "number") return value;
  if (value === "N/A" || value === "") return 0;
  const parsed = parseFloat(value);
  return isNaN(parsed) ? 0 : parsed;
}

// Helper function to parse formatted time values (e.g., "1.2 s" -> 1200)
function parseTimeValue(value: string | number): number {
  if (typeof value === "number") return value;
  if (value === "N/A" || value === "") return 0;

  // Remove units and convert to ms
  const cleaned = value.toString().replace(/[^\d.]/g, "");
  const parsed = parseFloat(cleaned);
  if (isNaN(parsed)) return 0;

  // If value contains 's', convert to ms
  if (value.includes("s")) return parsed * 1000;
  return parsed;
}

// Helper function to parse date from the specific format used in sheets
function parseSheetDate(dateString: string | undefined): string {
  if (!dateString) {
    return new Date().toISOString().split("T")[0]!; // fallback to today
  }

  try {
    // Format is like "12/25/2024, 14.30" - replace period with colon for proper parsing
    const normalizedDate = dateString.replace(/(\d{2})\.(\d{2})$/, "$1:$2");
    const parsedDate = new Date(normalizedDate);

    if (isNaN(parsedDate.getTime())) {
      console.warn(`Invalid date format: ${dateString}`);
      return new Date().toISOString().split("T")[0]!; // fallback to today
    }

    return parsedDate.toISOString().split("T")[0]!;
  } catch (error) {
    console.warn(`Error parsing date: ${dateString}`, error);
    return new Date().toISOString().split("T")[0]!; // fallback to today
  }
}

// Helper function to parse full timestamp
function parseSheetTimestamp(dateString: string | undefined): string {
  if (!dateString) {
    return new Date().toISOString();
  }

  try {
    // Format is like "12/25/2024, 14.30" - replace period with colon for proper parsing
    const normalizedDate = dateString.replace(/(\d{2})\.(\d{2})$/, "$1:$2");
    const parsedDate = new Date(normalizedDate);

    if (isNaN(parsedDate.getTime())) {
      console.warn(`Invalid timestamp format: ${dateString}`);
      return new Date().toISOString();
    }

    return parsedDate.toISOString();
  } catch (error) {
    console.warn(`Error parsing timestamp: ${dateString}`, error);
    return new Date().toISOString();
  }
}

// Helper function to process sheet data into chart format
function processSheetData(rows: unknown[]): ChartDataPoint[] {
  return rows
    .map((row) => {
      const parsed = sheetRowSchema.safeParse(row);
      if (!parsed.success) return null;

      const data = parsed.data;
      return {
        date: parseSheetDate(data.Date),
        // Desktop metrics
        desktopPerformance: toNumber(data["Desktop Performance Score"]),
        desktopAccessibility: toNumber(data["Desktop Accessibility Score"]),
        desktopBestPractices: toNumber(data["Desktop Best Practices Score"]),
        desktopSeo: toNumber(data["Desktop SEO Score"]),
        desktopFcp: parseTimeValue(data["Desktop First Contentful Paint"]),
        desktopLcp: parseTimeValue(data["Desktop Largest Contentful Paint"]),
        desktopTbt: parseTimeValue(data["Desktop Total Blocking Time"]),
        desktopCls: toNumber(data["Desktop Cumulative Layout Shift"]),
        desktopSpeedIndex: parseTimeValue(data["Desktop Speed Index"]),
        // Mobile metrics
        mobilePerformance: toNumber(data["Mobile Performance Score"]),
        mobileAccessibility: toNumber(data["Mobile Accessibility Score"]),
        mobileBestPractices: toNumber(data["Mobile Best Practices Score"]),
        mobileSeo: toNumber(data["Mobile SEO Score"]),
        mobileFcp: parseTimeValue(data["Mobile First Contentful Paint"]),
        mobileLcp: parseTimeValue(data["Mobile Largest Contentful Paint"]),
        mobileTbt: parseTimeValue(data["Mobile Total Blocking Time"]),
        mobileCls: toNumber(data["Mobile Cumulative Layout Shift"]),
        mobileSpeedIndex: parseTimeValue(data["Mobile Speed Index"]),
      };
    })
    .filter((item): item is ChartDataPoint => item !== null)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
}

export const metricsRouter = createTRPCRouter({
  // Get all sheets (URLs) available - skip the first sheet (dashboard)
  getAllSheets: publicProcedure.query(async ({ ctx }) => {
    await ctx.doc.loadInfo();

    // Skip the first sheet as it's the dashboard
    return ctx.doc.sheetsByIndex.slice(1).map((sheet) => ({
      id: sheet.sheetId,
      title: sheet.title,
      rowCount: sheet.rowCount,
    }));
  }),

  // Get metrics for a specific sheet/URL
  getMetricsForSheet: publicProcedure
    .input(z.object({ sheetTitle: z.string() }))
    .query(async ({ ctx, input }) => {
      await ctx.doc.loadInfo();

      const sheet = ctx.doc.sheetsByTitle[input.sheetTitle];
      if (!sheet) {
        throw new Error(`Sheet with title "${input.sheetTitle}" not found`);
      }

      const rows = await sheet.getRows();
      const data = processSheetData(rows.map((row) => row.toObject()));

      if (data.length === 0) {
        throw new Error("No valid data found in sheet");
      }

      const latestData = data[data.length - 1]!;
      const url = latestData
        ? (rows[0]?.get("Website") as string)
        : input.sheetTitle;

      return {
        url,
        name: input.sheetTitle,
        data,
        latestMetrics: {
          url,
          timestamp: parseSheetTimestamp(
            rows[0]?.get("Date") as string | undefined,
          ),
          desktop: {
            performance: latestData.desktopPerformance,
            accessibility: latestData.desktopAccessibility,
            bestPractices: latestData.desktopBestPractices,
            seo: latestData.desktopSeo,
            fcp: latestData.desktopFcp,
            lcp: latestData.desktopLcp,
            tbt: latestData.desktopTbt,
            cls: latestData.desktopCls,
            speedIndex: latestData.desktopSpeedIndex,
          },
          mobile: {
            performance: latestData.mobilePerformance,
            accessibility: latestData.mobileAccessibility,
            bestPractices: latestData.mobileBestPractices,
            seo: latestData.mobileSeo,
            fcp: latestData.mobileFcp,
            lcp: latestData.mobileLcp,
            tbt: latestData.mobileTbt,
            cls: latestData.mobileCls,
            speedIndex: latestData.mobileSpeedIndex,
          },
        },
      } satisfies UrlMetrics;
    }),

  // Get all metrics for all sheets - skip the first sheet (dashboard)
  getAllMetrics: publicProcedure.query(async ({ ctx }) => {
    await ctx.doc.loadInfo();

    const results: UrlMetrics[] = [];

    // Skip the first sheet as it's the dashboard
    for (const sheet of ctx.doc.sheetsByIndex.slice(1)) {
      try {
        const rows = await sheet.getRows();
        const data = processSheetData(rows.map((row) => row.toObject()));

        if (data.length > 0) {
          const latestData = data[data.length - 1]!;
          const url = (rows[0]?.get("Website") as string) || sheet.title;

          results.push({
            url,
            name: sheet.title,
            data,
            latestMetrics: {
              url,
              timestamp: parseSheetTimestamp(
                rows[0]?.get("Date") as string | undefined,
              ),
              desktop: {
                performance: latestData.desktopPerformance,
                accessibility: latestData.desktopAccessibility,
                bestPractices: latestData.desktopBestPractices,
                seo: latestData.desktopSeo,
                fcp: latestData.desktopFcp,
                lcp: latestData.desktopLcp,
                tbt: latestData.desktopTbt,
                cls: latestData.desktopCls,
                speedIndex: latestData.desktopSpeedIndex,
              },
              mobile: {
                performance: latestData.mobilePerformance,
                accessibility: latestData.mobileAccessibility,
                bestPractices: latestData.mobileBestPractices,
                seo: latestData.mobileSeo,
                fcp: latestData.mobileFcp,
                lcp: latestData.mobileLcp,
                tbt: latestData.mobileTbt,
                cls: latestData.mobileCls,
                speedIndex: latestData.mobileSpeedIndex,
              },
            },
          });
        }
      } catch (error) {
        console.error(`Error processing sheet ${sheet.title}:`, error);
      }
    }

    return results;
  }),
});
