import { z } from "zod";

// Sheet row schema from Google Sheets
export const sheetRowSchema = z.object({
  Date: z.string(),
  Website: z.string(),
  "Desktop Performance Score": z.union([z.string(), z.number()]),
  "Desktop Accessibility Score": z.union([z.string(), z.number()]),
  "Desktop Best Practices Score": z.union([z.string(), z.number()]),
  "Desktop SEO Score": z.union([z.string(), z.number()]),
  "Desktop First Contentful Paint": z.union([z.string(), z.number()]),
  "Desktop Largest Contentful Paint": z.union([z.string(), z.number()]),
  "Desktop Total Blocking Time": z.union([z.string(), z.number()]),
  "Desktop Cumulative Layout Shift": z.union([z.string(), z.number()]),
  "Desktop Speed Index": z.union([z.string(), z.number()]),
  "Mobile Performance Score": z.union([z.string(), z.number()]),
  "Mobile Accessibility Score": z.union([z.string(), z.number()]),
  "Mobile Best Practices Score": z.union([z.string(), z.number()]),
  "Mobile SEO Score": z.union([z.string(), z.number()]),
  "Mobile First Contentful Paint": z.union([z.string(), z.number()]),
  "Mobile Largest Contentful Paint": z.union([z.string(), z.number()]),
  "Mobile Total Blocking Time": z.union([z.string(), z.number()]),
  "Mobile Cumulative Layout Shift": z.union([z.string(), z.number()]),
  "Mobile Speed Index": z.union([z.string(), z.number()]),
});

// Processed metrics for charts - separating desktop and mobile
export const chartDataPointSchema = z.object({
  date: z.string(),
  // Desktop metrics
  desktopPerformance: z.number(),
  desktopAccessibility: z.number(),
  desktopBestPractices: z.number(),
  desktopSeo: z.number(),
  desktopFcp: z.number(),
  desktopLcp: z.number(),
  desktopTbt: z.number(),
  desktopCls: z.number(),
  desktopSpeedIndex: z.number(),
  // Mobile metrics
  mobilePerformance: z.number(),
  mobileAccessibility: z.number(),
  mobileBestPractices: z.number(),
  mobileSeo: z.number(),
  mobileFcp: z.number(),
  mobileLcp: z.number(),
  mobileTbt: z.number(),
  mobileCls: z.number(),
  mobileSpeedIndex: z.number(),
});

// Latest metrics summary
export const latestMetricsSchema = z.object({
  url: z.string(),
  timestamp: z.string(),
  desktop: z.object({
    performance: z.number(),
    accessibility: z.number(),
    bestPractices: z.number(),
    seo: z.number(),
    fcp: z.number(),
    lcp: z.number(),
    tbt: z.number(),
    cls: z.number(),
    speedIndex: z.number(),
  }),
  mobile: z.object({
    performance: z.number(),
    accessibility: z.number(),
    bestPractices: z.number(),
    seo: z.number(),
    fcp: z.number(),
    lcp: z.number(),
    tbt: z.number(),
    cls: z.number(),
    speedIndex: z.number(),
  }),
});

// URL group schema (each sheet represents one URL)
export const urlMetricsSchema = z.object({
  url: z.string(),
  name: z.string(),
  data: z.array(chartDataPointSchema),
  latestMetrics: latestMetricsSchema,
});

// Metrics configuration for filtering
export const AVAILABLE_METRICS = [
  // Lighthouse Scores (one chart shows both desktop and mobile)
  {
    id: "performance",
    label: "Performance",
    type: "lighthouse" as const,
    key: "performance" as const,
    unit: "",
  },
  {
    id: "accessibility",
    label: "Accessibility",
    type: "lighthouse" as const,
    key: "accessibility" as const,
    unit: "",
  },
  {
    id: "best-practices",
    label: "Best Practices",
    type: "lighthouse" as const,
    key: "bestPractices" as const,
    unit: "",
  },
  {
    id: "seo",
    label: "SEO",
    type: "lighthouse" as const,
    key: "seo" as const,
    unit: "",
  },

  // Web Vitals (one chart shows both desktop and mobile)
  {
    id: "fcp",
    label: "First Contentful Paint (s)",
    type: "webvital" as const,
    key: "fcp" as const,
    unit: "s",
  },
  {
    id: "lcp",
    label: "Largest Contentful Paint (s)",
    type: "webvital" as const,
    key: "lcp" as const,
    unit: "s",
  },
  {
    id: "tbt",
    label: "Total Blocking Time (ms)",
    type: "webvital" as const,
    key: "tbt" as const,
    unit: "ms",
  },
  {
    id: "cls",
    label: "Cumulative Layout Shift",
    type: "webvital" as const,
    key: "cls" as const,
    unit: "",
  },
  {
    id: "speed-index",
    label: "Speed Index (s)",
    type: "webvital" as const,
    key: "speedIndex" as const,
    unit: "s",
  },
] as const;

// Default metrics to show
export const DEFAULT_METRICS = ["performance", "fcp", "speed-index"] as const;

export type MetricId = (typeof AVAILABLE_METRICS)[number]["id"];
export type MetricType = "lighthouse" | "webvital";

// Export types
export type SheetRow = z.infer<typeof sheetRowSchema>;
export type ChartDataPoint = z.infer<typeof chartDataPointSchema>;
export type LatestMetrics = z.infer<typeof latestMetricsSchema>;
export type UrlMetrics = z.infer<typeof urlMetricsSchema>;
