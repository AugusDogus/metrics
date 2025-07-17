import { z } from "zod";
import { CACHE_KEYS, CACHE_TTL, redis } from "~/lib/redis";
import {
  sheetRowSchema,
  type ChartDataPoint,
  type SheetMetadata,
  type UrlMetrics,
} from "~/lib/schemas";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

// Helper function to add delay between API calls
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Type for API errors
interface ApiError {
  response?: {
    status: number;
  };
}

// Helper function to convert string/number to number safely
function toNumber(value: string | number | undefined): number {
  if (typeof value === "number") return value;
  if (typeof value === "string") {
    const parsed = parseFloat(value);
    return isNaN(parsed) ? 0 : parsed;
  }
  return 0;
}

// Helper function to parse date from Google Sheets format
function parseSheetDate(dateString: string | undefined): string {
  if (!dateString) return new Date().toISOString().split("T")[0]!;

  try {
    // Handle Google Sheets date format like "12/25/2024, 14.30"
    // Convert period to colon for time parsing
    const normalizedDate = dateString.replace(/(\d{2})\.(\d{2})$/, "$1:$2");
    const date = new Date(normalizedDate);

    if (isNaN(date.getTime())) {
      console.warn(`Invalid date format: ${dateString}, using current date`);
      return new Date().toISOString().split("T")[0]!;
    }

    return date.toISOString().split("T")[0]!;
  } catch (error) {
    console.warn(`Error parsing date: ${dateString}`, error);
    return new Date().toISOString().split("T")[0]!;
  }
}

// Helper function to parse full timestamp
function parseSheetTimestamp(dateString: string | undefined): Date {
  if (!dateString) return new Date();

  try {
    // Handle Google Sheets date format like "12/25/2024, 14.30"
    // Convert period to colon for time parsing
    const normalizedDate = dateString.replace(/(\d{2})\.(\d{2})$/, "$1:$2");
    const date = new Date(normalizedDate);

    if (isNaN(date.getTime())) {
      console.warn(
        `Invalid timestamp format: ${dateString}, using current time`,
      );
      return new Date();
    }

    return date;
  } catch (error) {
    console.warn(`Error parsing timestamp: ${dateString}`, error);
    return new Date();
  }
}

// Process raw sheet data into chart format
function processSheetData(
  rawData: Record<string, unknown>[],
): ChartDataPoint[] {
  return rawData
    .map((row) => {
      try {
        const parsed = sheetRowSchema.safeParse(row);
        if (!parsed.success) {
          console.warn("Invalid row data:", parsed.error.issues);
          return null;
        }

        const data = parsed.data;
        return {
          date: parseSheetDate(data.Date),
          // Desktop metrics
          desktopPerformance: toNumber(data["Desktop Performance Score"]),
          desktopAccessibility: toNumber(data["Desktop Accessibility Score"]),
          desktopBestPractices: toNumber(data["Desktop Best Practices Score"]),
          desktopSeo: toNumber(data["Desktop SEO Score"]),
          desktopFcp: toNumber(data["Desktop First Contentful Paint"]),
          desktopLcp: toNumber(data["Desktop Largest Contentful Paint"]),
          desktopTbt: toNumber(data["Desktop Total Blocking Time"]),
          desktopCls: toNumber(data["Desktop Cumulative Layout Shift"]),
          desktopSpeedIndex: toNumber(data["Desktop Speed Index"]),
          // Mobile metrics
          mobilePerformance: toNumber(data["Mobile Performance Score"]),
          mobileAccessibility: toNumber(data["Mobile Accessibility Score"]),
          mobileBestPractices: toNumber(data["Mobile Best Practices Score"]),
          mobileSeo: toNumber(data["Mobile SEO Score"]),
          mobileFcp: toNumber(data["Mobile First Contentful Paint"]),
          mobileLcp: toNumber(data["Mobile Largest Contentful Paint"]),
          mobileTbt: toNumber(data["Mobile Total Blocking Time"]),
          mobileCls: toNumber(data["Mobile Cumulative Layout Shift"]),
          mobileSpeedIndex: toNumber(data["Mobile Speed Index"]),
        };
      } catch (error) {
        console.error("Error processing row:", error);
        return null;
      }
    })
    .filter((item): item is ChartDataPoint => item !== null)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
}

export const metricsRouter = createTRPCRouter({
  // Get all sheets (URLs) available - skip the first sheet (dashboard)
  getAllSheets: publicProcedure.query(async ({ ctx }) => {
    try {
      // Try to get from cache first
      const cached = await redis.get<SheetMetadata[]>(
        CACHE_KEYS.SHEETS_METADATA,
      );
      if (cached) {
        console.log("Returning cached sheet metadata");
        return cached;
      }

      console.log("Fetching fresh sheet metadata from Google Sheets");
      await ctx.doc.loadInfo();

      // Skip the first sheet as it's the dashboard
      const sheets = ctx.doc.sheetsByIndex.slice(1).map((sheet) => ({
        id: sheet.sheetId,
        title: sheet.title,
        rowCount: sheet.rowCount,
      }));

      // Cache the result
      await redis.setex(
        CACHE_KEYS.SHEETS_METADATA,
        CACHE_TTL.SHEETS_METADATA,
        sheets,
      );

      return sheets;
    } catch (error: unknown) {
      console.error("Error fetching sheets:", error);
      const apiError = error as ApiError;
      if (apiError?.response?.status === 429) {
        throw new Error(
          "Rate limit exceeded. Please wait a moment before trying again.",
        );
      }
      throw error;
    }
  }),

  // Get metrics for a specific sheet/URL
  getMetricsForSheet: publicProcedure
    .input(z.object({ sheetTitle: z.string() }))
    .query(async ({ ctx, input }) => {
      try {
        // Try to get from cache first
        const cacheKey = CACHE_KEYS.SHEET_DATA(input.sheetTitle);
        const cached = await redis.get<UrlMetrics>(cacheKey);
        if (cached) {
          console.log(`Returning cached data for sheet: ${input.sheetTitle}`);
          return cached;
        }

        console.log(`Fetching fresh data for sheet: ${input.sheetTitle}`);
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

        const result: UrlMetrics = {
          url,
          name: input.sheetTitle,
          data,
          latestMetrics: {
            url,
            timestamp: parseSheetTimestamp(
              rows[0]?.get("Date") as string | undefined,
            ).toISOString(),
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
        };

        // Cache the result
        await redis.setex(cacheKey, CACHE_TTL.SHEET_DATA, result);

        return result;
      } catch (error: unknown) {
        console.error(
          `Error fetching metrics for sheet ${input.sheetTitle}:`,
          error,
        );
        const apiError = error as ApiError;
        if (apiError?.response?.status === 429) {
          throw new Error(
            "Rate limit exceeded. Please wait a moment before trying again.",
          );
        }
        throw error;
      }
    }),

  // Get all metrics for all sheets with rate limiting - skip the first sheet (dashboard)
  // This endpoint is kept for backward compatibility but not recommended for new usage
  getAllMetrics: publicProcedure.query(async ({ ctx }) => {
    try {
      await ctx.doc.loadInfo();

      const results: UrlMetrics[] = [];
      const sheets = ctx.doc.sheetsByIndex.slice(1); // Skip the first sheet as it's the dashboard

      console.log(`Fetching data from ${sheets.length} sheets...`);

      for (let i = 0; i < sheets.length; i++) {
        const sheet = sheets[i]!;

        try {
          console.log(
            `Processing sheet ${i + 1}/${sheets.length}: ${sheet.title}`,
          );

          // Add delay between requests to avoid rate limiting
          if (i > 0) {
            console.log("Adding delay to prevent rate limiting...");
            await sleep(1000); // 1 second delay between sheets
          }

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
                ).toISOString(),
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
          } else {
            console.warn(`No valid data found in sheet: ${sheet.title}`);
          }
        } catch (sheetError: unknown) {
          console.error(`Error processing sheet ${sheet.title}:`, sheetError);

          // If we hit rate limit, break the loop and return what we have
          const apiError = sheetError as ApiError;
          if (apiError?.response?.status === 429) {
            console.warn("Rate limit hit, returning partial results");
            break;
          }

          // For other errors, continue processing remaining sheets
          continue;
        }
      }

      console.log(`Successfully processed ${results.length} sheets`);
      return results;
    } catch (error: unknown) {
      console.error("Error in getAllMetrics:", error);
      const apiError = error as ApiError;
      if (apiError?.response?.status === 429) {
        throw new Error(
          "Rate limit exceeded. Please wait a moment and refresh the page.",
        );
      }
      throw error;
    }
  }),
});
