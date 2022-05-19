import React from "react";
import { MetricsQueue } from "metrics-queue";
import { render } from "@testing-library/react";

import { MetricProvider } from "../MetricProvider";
import type { IMetricProvider } from "../types";
import { PerfLibMetric, mockPerformanceAPI } from "../testUtils";

const renderEmitter = ({
  children = null,
  type = "mark",
  metric = undefined,
  event = "example-mark",
  startOrMeasureOptions,
}: IMetricProvider) => {
  if (children) {
    return render(
      <MetricProvider type={type} event={event} metric={metric} startOrMeasureOptions={startOrMeasureOptions}>
        {children}
      </MetricProvider>
    );
  }
  return render(
    <MetricProvider type={type} event={event} metric={metric} startOrMeasureOptions={startOrMeasureOptions} />
  );
};

describe("Metric Provider", () => {
  beforeEach(() => {
    mockPerformanceAPI(window);
    MetricsQueue.destroy();
    MetricsQueue.init();
  });

  describe("Marks:", () => {
    it("Emits performance.mark events based on the type and event properties", () => {
      const nativeSpy = jest.spyOn(performance, "mark");
      renderEmitter({} as IMetricProvider);
      expect(nativeSpy).toHaveBeenCalledWith("example-mark", undefined);
      expect(performance.getEntriesByName("example-mark")).toHaveLength(1);
    });

    it("Emits MetricsQueue.onMark events based on the type and event properties", async () => {
      renderEmitter({} as IMetricProvider);
      await new Promise(process.nextTick);
      expect(performance.getEntriesByName("example-mark")).toHaveLength(1);
    });

    it("Creates entries on the performance.entries list when the 'type' is 'mark'", () => {
      renderEmitter({} as IMetricProvider);
      expect(performance.getEntriesByName("example-mark")).toHaveLength(1);
    });

    it("Executes registered event listeners on the provided mark", async () => {
      const callback = jest.fn();
      MetricsQueue.addEventListener("example-mark", callback);
      renderEmitter({} as IMetricProvider);
      await new Promise(process.nextTick);
      expect(callback).toHaveBeenCalledWith(
        performance.getEntriesByName("example-mark")[0],
        "example-mark",
        undefined
      );
    });
  });

  describe("Measures:", () => {
    it("Emits performance.measure events based on the type and event properties", () => {
      const nativeSpy = jest.spyOn(performance, "measure");
      renderEmitter({
        type: "measure",
        event: "example-measure",
        startOrMeasureOptions: "example-mark",
      } as IMetricProvider);
      expect(nativeSpy).toHaveBeenCalledWith("example-measure", "example-mark", undefined);
    });

    it("Emits MetricsQueue.onMeasure events based on the type and event properties", async () => {
      const onEventSpy = jest.spyOn(MetricsQueue as any, "onMeasure");
      renderEmitter({
        type: "measure",
        event: "example-measure",
        startOrMeasureOptions: "example-mark",
      } as IMetricProvider);
      await new Promise(process.nextTick);
      expect(onEventSpy).toHaveBeenCalledTimes(1);
    });

    it("Creates entries on the performance.entries list when the 'type' is 'measure'", () => {
      renderEmitter({
        type: "measure",
        event: "example-measure",
        startOrMeasureOptions: "example-mark",
      } as IMetricProvider);
      expect(performance.getEntriesByName("example-measure")).toHaveLength(1);
    });

    it("Executes registered event listeners on the provided measure", async () => {
      const callback = jest.fn();
      MetricsQueue.addEventListener("example-measure", callback);
      renderEmitter({
        type: "measure",
        event: "example-measure",
        startOrMeasureOptions: "example-mark",
      } as IMetricProvider);
      await new Promise(process.nextTick);
      expect(callback).toHaveBeenCalledTimes(1);
    });
  });

  describe("Plugin Events", () => {
    it("Emits MetricsQueue.onPluginEvent when the 'type' is 'plugin'", () => {
      const spy = jest.spyOn(MetricsQueue, "onPluginEvent");
      const metric = new PerfLibMetric("example-metric");
      renderEmitter({
        type: "plugin",
        event: "example-metric",
        metric,
      } as IMetricProvider);
      expect(spy).toHaveBeenCalledWith("example-metric", metric);
    });

    it("Executes registered event listeners on the provided plugin's event", async () => {
      const callback = jest.fn();
      MetricsQueue.addEventListener("example-metric", callback);
      const metric = new PerfLibMetric("example-metric");
      metric.subscribe((instance: PerfLibMetric) => {
        MetricsQueue.onPluginEvent("example-metric", instance);
      });
      renderEmitter({
        type: "plugin",
        event: "example-metric",
        metric,
      } as IMetricProvider);
      await Promise.resolve(process.nextTick);
      expect(callback).toHaveBeenCalledWith(metric);
    });
  });

  describe("Child Rendering", () => {
    it("Renders no children by default", () => {
      const { container } = renderEmitter({} as IMetricProvider);
      expect(container.innerHTML).toEqual("");
    });

    it("Renders children if that makes you happy", () => {
      const { container } = renderEmitter({
        children: <div>Im a child</div>,
      } as IMetricProvider);
      expect(container.innerHTML).toEqual("<div>Im a child</div>");
    });
  });
});
