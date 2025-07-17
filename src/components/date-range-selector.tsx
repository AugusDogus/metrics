"use client";

import { Calendar } from "lucide-react";
import { useQueryState } from "nuqs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";

const DATE_RANGES = [
  { value: "90d", label: "Last 3 months" },
  { value: "30d", label: "Last 30 days" },
  { value: "7d", label: "Last 7 days" },
] as const;

export type DateRange = (typeof DATE_RANGES)[number]["value"];

export function DateRangeSelector() {
  const [dateRange, setDateRange] = useQueryState("range", {
    defaultValue: "90d" as DateRange,
    shallow: false,
  });

  return (
    <Select
      value={dateRange}
      onValueChange={(value) => void setDateRange(value as DateRange)}
    >
      <SelectTrigger className="w-[160px] gap-2">
        <Calendar className="h-4 w-4" />
        <SelectValue placeholder="Select range" />
      </SelectTrigger>
      <SelectContent>
        {DATE_RANGES.map((range) => (
          <SelectItem key={range.value} value={range.value}>
            {range.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

// Utility function to filter data based on date range
export function filterDataByDateRange<T extends { date: string }>(
  data: T[],
  dateRange: DateRange,
): T[] {
  if (data.length === 0) return data;

  // Get the most recent date from the data
  const dates = data
    .map((item) => new Date(item.date))
    .sort((a, b) => b.getTime() - a.getTime());
  const referenceDate = dates[0];

  if (!referenceDate) return data;

  let daysToSubtract = 90;
  if (dateRange === "30d") {
    daysToSubtract = 30;
  } else if (dateRange === "7d") {
    daysToSubtract = 7;
  }

  const startDate = new Date(referenceDate);
  startDate.setDate(startDate.getDate() - daysToSubtract);

  return data.filter((item) => {
    const itemDate = new Date(item.date);
    return itemDate >= startDate;
  });
}
