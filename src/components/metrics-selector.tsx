"use client";

import { Check, Settings } from "lucide-react";
import { useQueryState } from "nuqs";
import { useState } from "react";
import { Button } from "~/components/ui/button";
import { Checkbox } from "~/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import {
  AVAILABLE_METRICS,
  DEFAULT_METRICS,
  type MetricId,
} from "~/lib/schemas";

export function MetricsSelector() {
  const [selectedMetrics, setSelectedMetrics] = useQueryState("metrics", {
    defaultValue: DEFAULT_METRICS.join(","),
    shallow: false,
  });

  const [isOpen, setIsOpen] = useState(false);

  const selectedMetricIds = selectedMetrics
    .split(",")
    .filter(Boolean) as MetricId[];

  const handleMetricToggle = (metricId: MetricId) => {
    const currentMetrics = selectedMetrics.split(",").filter(Boolean);
    const newMetrics = currentMetrics.includes(metricId)
      ? currentMetrics.filter((id) => id !== metricId)
      : [...currentMetrics, metricId];

    void setSelectedMetrics(newMetrics.join(","));
  };

  const resetToDefault = () => {
    void setSelectedMetrics(DEFAULT_METRICS.join(","));
  };

  const lighthouseMetrics = AVAILABLE_METRICS.filter(
    (m) => m.type === "lighthouse",
  );
  const webVitalMetrics = AVAILABLE_METRICS.filter(
    (m) => m.type === "webvital",
  );

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Settings className="h-4 w-4" />
          Metrics ({selectedMetricIds.length})
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel className="flex items-center justify-between">
          Select Metrics
          <Button
            variant="ghost"
            size="sm"
            onClick={resetToDefault}
            className="h-auto p-1 text-xs"
          >
            Reset to Default
          </Button>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        <DropdownMenuLabel className="text-muted-foreground text-xs font-medium">
          Lighthouse Scores
        </DropdownMenuLabel>
        {lighthouseMetrics.map((metric) => (
          <DropdownMenuItem
            key={metric.id}
            className="flex cursor-pointer items-center space-x-2"
            onSelect={(e) => {
              e.preventDefault();
              handleMetricToggle(metric.id);
            }}
          >
            <Checkbox
              id={metric.id}
              checked={selectedMetricIds.includes(metric.id)}
              onCheckedChange={() => handleMetricToggle(metric.id)}
            />
            <label
              htmlFor={metric.id}
              className="flex-1 cursor-pointer text-sm"
            >
              {metric.label}
            </label>
            {selectedMetricIds.includes(metric.id) && (
              <Check className="text-primary h-4 w-4" />
            )}
          </DropdownMenuItem>
        ))}

        <DropdownMenuSeparator />
        <DropdownMenuLabel className="text-muted-foreground text-xs font-medium">
          Web Vitals & Performance
        </DropdownMenuLabel>
        {webVitalMetrics.map((metric) => (
          <DropdownMenuItem
            key={metric.id}
            className="flex cursor-pointer items-center space-x-2"
            onSelect={(e) => {
              e.preventDefault();
              handleMetricToggle(metric.id);
            }}
          >
            <Checkbox
              id={metric.id}
              checked={selectedMetricIds.includes(metric.id)}
              onCheckedChange={() => handleMetricToggle(metric.id)}
            />
            <label
              htmlFor={metric.id}
              className="flex-1 cursor-pointer text-sm"
            >
              {metric.label}
            </label>
            {selectedMetricIds.includes(metric.id) && (
              <Check className="text-primary h-4 w-4" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
