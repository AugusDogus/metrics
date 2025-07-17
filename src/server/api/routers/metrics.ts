import { z } from "zod";
import {
  sheetRowSchema,
  type ChartDataPoint,
  type UrlMetrics,
} from "~/lib/schemas";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

// Helper function to convert string/number to number
function toNumber(value: string | number): number {
  return typeof value === "string" ? parseFloat(value) || 0 : value;
}

// Helper function to process sheet data into chart format
function processSheetData(rows: unknown[]): ChartDataPoint[] {
  return rows
    .map((row) => {
      const parsed = sheetRowSchema.safeParse(row);
      if (!parsed.success) return null;

      const data = parsed.data;
      return {
        date: new Date(data.Timestamp).toISOString().split("T")[0],
        performance: toNumber(data.Performance),
        accessibility: toNumber(data.Accessibility),
        bestPractices: toNumber(data["Best Practices"]),
        seo: toNumber(data.SEO),
        fcp: toNumber(data["First Contentful Paint"]),
        lcp: toNumber(data["Largest Contentful Paint"]),
        fid: toNumber(data["First Input Delay"]),
        cls: toNumber(data["Cumulative Layout Shift"]),
        speedIndex: toNumber(data["Speed Index"]),
        tbt: toNumber(data["Total Blocking Time"]),
      };
    })
    .filter((item): item is ChartDataPoint => item !== null)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
}

export const metricsRouter = createTRPCRouter({
  // Get all sheets (URLs) available
  getAllSheets: publicProcedure.query(async ({ ctx }) => {
    await ctx.doc.loadInfo();

    return ctx.doc.sheetsByIndex.map((sheet) => ({
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
      const url = (rows[0]?.get("URL") as string) || input.sheetTitle;

      return {
        url,
        name: input.sheetTitle,
        data,
        latestMetrics: {
          url,
          timestamp: new Date(latestData.date).toISOString(),
          performance: latestData.performance,
          accessibility: latestData.accessibility,
          bestPractices: latestData.bestPractices,
          seo: latestData.seo,
          firstContentfulPaint: latestData.fcp,
          largestContentfulPaint: latestData.lcp,
          firstInputDelay: latestData.fid,
          cumulativeLayoutShift: latestData.cls,
          speedIndex: latestData.speedIndex,
          totalBlockingTime: latestData.tbt,
        },
      } satisfies UrlMetrics;
    }),

  // Get all metrics for all sheets
  getAllMetrics: publicProcedure.query(async ({ ctx }) => {
    await ctx.doc.loadInfo();

    const results: UrlMetrics[] = [];

    for (const sheet of ctx.doc.sheetsByIndex) {
      try {
        const rows = await sheet.getRows();
        const data = processSheetData(rows.map((row) => row.toObject()));

        if (data.length > 0) {
          const latestData = data[data.length - 1]!;
          const url = (rows[0]?.get("URL") as string) || sheet.title;

          results.push({
            url,
            name: sheet.title,
            data,
            latestMetrics: {
              url,
              timestamp: new Date(latestData.date).toISOString(),
              performance: latestData.performance,
              accessibility: latestData.accessibility,
              bestPractices: latestData.bestPractices,
              seo: latestData.seo,
              firstContentfulPaint: latestData.fcp,
              largestContentfulPaint: latestData.lcp,
              firstInputDelay: latestData.fid,
              cumulativeLayoutShift: latestData.cls,
              speedIndex: latestData.speedIndex,
              totalBlockingTime: latestData.tbt,
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
