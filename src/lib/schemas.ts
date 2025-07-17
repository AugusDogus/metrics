import { z } from "zod";

// Core Lighthouse metrics schema
export const lighthouseMetricsSchema = z.object({
  url: z.string().url(),
  timestamp: z.string().datetime(),
  performance: z.number().min(0).max(100),
  accessibility: z.number().min(0).max(100),
  bestPractices: z.number().min(0).max(100),
  seo: z.number().min(0).max(100),
  firstContentfulPaint: z.number().positive(),
  largestContentfulPaint: z.number().positive(),
  firstInputDelay: z.number().min(0),
  cumulativeLayoutShift: z.number().min(0),
  speedIndex: z.number().positive(),
  totalBlockingTime: z.number().min(0),
});

// Sheet row schema from Google Sheets
export const sheetRowSchema = z.object({
  URL: z.string(),
  Timestamp: z.string(),
  Performance: z.union([z.string(), z.number()]),
  Accessibility: z.union([z.string(), z.number()]),
  "Best Practices": z.union([z.string(), z.number()]),
  SEO: z.union([z.string(), z.number()]),
  "First Contentful Paint": z.union([z.string(), z.number()]),
  "Largest Contentful Paint": z.union([z.string(), z.number()]),
  "First Input Delay": z.union([z.string(), z.number()]),
  "Cumulative Layout Shift": z.union([z.string(), z.number()]),
  "Speed Index": z.union([z.string(), z.number()]),
  "Total Blocking Time": z.union([z.string(), z.number()]),
});

// Processed metrics for charts
export const chartDataPointSchema = z.object({
  date: z.string(),
  performance: z.number(),
  accessibility: z.number(),
  bestPractices: z.number(),
  seo: z.number(),
  fcp: z.number(),
  lcp: z.number(),
  fid: z.number(),
  cls: z.number(),
  speedIndex: z.number(),
  tbt: z.number(),
});

// URL group schema (each sheet represents one URL)
export const urlMetricsSchema = z.object({
  url: z.string().url(),
  name: z.string(),
  data: z.array(chartDataPointSchema),
  latestMetrics: lighthouseMetricsSchema,
});

// Export types
export type LighthouseMetrics = z.infer<typeof lighthouseMetricsSchema>;
export type SheetRow = z.infer<typeof sheetRowSchema>;
export type ChartDataPoint = z.infer<typeof chartDataPointSchema>;
export type UrlMetrics = z.infer<typeof urlMetricsSchema>;
