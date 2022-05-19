import type { HashTable } from "metrics-queue";

export type IMetricProvider = {
  type: "mark" | "measure" | "plugin";
  event: string;
  startMarkOptions?: PerformanceMarkOptions;
  startOrMeasureOptions?: string | PerformanceMeasureOptions;
  endMark?: string;
  children?: JSX.Element | null;
  metric?: HashTable<any> | any[];
  metricStop?: (...args: any[]) => any;
};
