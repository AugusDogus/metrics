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
  // Lighthouse Scores
  {
    id: "desktop-performance",
    label: "Desktop Performance",
    type: "lighthouse" as const,
    key: "desktopPerformance" as const,
    unit: "",
  },
  {
    id: "mobile-performance",
    label: "Mobile Performance",
    type: "lighthouse" as const,
    key: "mobilePerformance" as const,
    unit: "",
  },
  {
    id: "desktop-accessibility",
    label: "Desktop Accessibility",
    type: "lighthouse" as const,
    key: "desktopAccessibility" as const,
    unit: "",
  },
  {
    id: "mobile-accessibility",
    label: "Mobile Accessibility",
    type: "lighthouse" as const,
    key: "mobileAccessibility" as const,
    unit: "",
  },
  {
    id: "desktop-best-practices",
    label: "Desktop Best Practices",
    type: "lighthouse" as const,
    key: "desktopBestPractices" as const,
    unit: "",
  },
  {
    id: "mobile-best-practices",
    label: "Mobile Best Practices",
    type: "lighthouse" as const,
    key: "mobileBestPractices" as const,
    unit: "",
  },
  {
    id: "desktop-seo",
    label: "Desktop SEO",
    type: "lighthouse" as const,
    key: "desktopSeo" as const,
    unit: "",
  },
  {
    id: "mobile-seo",
    label: "Mobile SEO",
    type: "lighthouse" as const,
    key: "mobileSeo" as const,
    unit: "",
  },

  // Web Vitals
  {
    id: "desktop-fcp",
    label: "Desktop FCP (s)",
    type: "webvital" as const,
    key: "desktopFcp" as const,
    unit: "s",
  },
  {
    id: "mobile-fcp",
    label: "Mobile FCP (s)",
    type: "webvital" as const,
    key: "mobileFcp" as const,
    unit: "s",
  },
  {
    id: "desktop-lcp",
    label: "Desktop LCP (s)",
    type: "webvital" as const,
    key: "desktopLcp" as const,
    unit: "s",
  },
  {
    id: "mobile-lcp",
    label: "Mobile LCP (s)",
    type: "webvital" as const,
    key: "mobileLcp" as const,
    unit: "s",
  },
  {
    id: "desktop-tbt",
    label: "Desktop TBT (ms)",
    type: "webvital" as const,
    key: "desktopTbt" as const,
    unit: "ms",
  },
  {
    id: "mobile-tbt",
    label: "Mobile TBT (ms)",
    type: "webvital" as const,
    key: "mobileTbt" as const,
    unit: "ms",
  },
  {
    id: "desktop-cls",
    label: "Desktop CLS",
    type: "webvital" as const,
    key: "desktopCls" as const,
    unit: "",
  },
  {
    id: "mobile-cls",
    label: "Mobile CLS",
    type: "webvital" as const,
    key: "mobileCls" as const,
    unit: "",
  },
  {
    id: "desktop-speed-index",
    label: "Desktop Speed (s)",
    type: "webvital" as const,
    key: "desktopSpeedIndex" as const,
    unit: "s",
  },
  {
    id: "mobile-speed-index",
    label: "Mobile Speed (s)",
    type: "webvital" as const,
    key: "mobileSpeedIndex" as const,
    unit: "s",
  },
] as const;

// Default metrics to show
export const DEFAULT_METRICS = [
  "desktop-performance",
  "mobile-performance",
  "desktop-fcp",
  "mobile-fcp",
  "desktop-speed-index",
  "mobile-speed-index",
] as const;

export type MetricId = (typeof AVAILABLE_METRICS)[number]["id"];
export type MetricType = "lighthouse" | "webvital";

// Export types
export type SheetRow = z.infer<typeof sheetRowSchema>;
export type ChartDataPoint = z.infer<typeof chartDataPointSchema>;
export type LatestMetrics = z.infer<typeof latestMetricsSchema>;
export type UrlMetrics = z.infer<typeof urlMetricsSchema>;
