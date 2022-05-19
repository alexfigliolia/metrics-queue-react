import { MetricsQueue } from "metrics-queue";
import { MicroEmitter } from "../MicroEmitter";
import { PerfLibMetric } from "../testUtils";

Object.defineProperty(window, "performance", {
  writable: true,
  value: {
    now: () => Date.now(),
    mark: (name: string) => ({
      name,
      time: Date.now(),
    }),
    measure: (measure: string) => ({
      name: measure,
      time: Date.now(),
    }),
  },
});

describe("Micro Emitter:", () => {
  describe("Emit:", () => {
    it("Emits native mark events based on the type parameter", () => {
      const spy = jest.spyOn(MicroEmitter, "mark");
      MicroEmitter.emit({
        type: "mark",
        event: "example-mark",
        startMarkOptions: undefined,
      });
      expect(spy).toHaveBeenCalledWith("example-mark", undefined);
    });
    it("Emits native measure events based on the type parameter", () => {
      const spy = jest.spyOn(MicroEmitter, "measure");
      MicroEmitter.emit({
        type: "measure",
        event: "example-measure",
        startOrMeasureOptions: "example-mark",
        endMark: undefined,
      });
      expect(spy).toHaveBeenCalledWith("example-measure", "example-mark", undefined);
    });

    it("Emits plugin events based on the type parameter", () => {
      const spy = jest.spyOn(MicroEmitter, "onPluginEvent");
      const metric = new PerfLibMetric("example-metric");
      MicroEmitter.emit({
        type: "plugin",
        event: "example-metric",
        metric,
      });
      expect(spy).toHaveBeenCalledWith("example-metric", metric);
    });

    it("Throws an error when emitting plugin events without a metric", () => {
      expect(() => {
        MicroEmitter.emit({
          type: "plugin",
          event: "example-metric",
        });
      }).toThrow(
        "This provider is emitting an event from an plugin library without using the metric prop. Please pass your metric instance to the MetricProvider using the 'metric' prop"
      );
    });

    it("Calls metricStop when emitting plugin events with the metricStop prop", () => {
      const metric = new PerfLibMetric("example-metric");
      const spy = jest.spyOn(metric, "stop");
      MicroEmitter.emit({
        type: "plugin",
        event: "example-metric",
        metric,
        metricStop: () => metric.stop(),
      });
      expect(spy).toHaveBeenCalledTimes(1);
    });

    it("Returns null if a developer typo slips through in dev mode", () => {
      const returnValue = MicroEmitter.emit({
        type: "sandwich" as "mark" | "measure",
        event: "example-metric",
      });
      expect(returnValue).toEqual(null);
    });
  });

  describe("Mark:", () => {
    it("Calls the native performance.mark with arguments", () => {
      const spy = jest.spyOn(performance, "mark");
      MicroEmitter.mark("example-mark");
      expect(spy).toHaveBeenCalledWith("example-mark", undefined);
    });
  });

  describe("Measure:", () => {
    it("Calls the native performance.measure with arguments", () => {
      const spy = jest.spyOn(performance, "measure");
      MicroEmitter.measure("example-measure", "example-mark");
      expect(spy).toHaveBeenCalledWith("example-measure", "example-mark", undefined);
    });
  });

  describe("On Plugin Event:", () => {
    it("Calls the MetricsQueue.onPluginEvent with the event key", () => {
      const spy = jest.spyOn(MetricsQueue, "onPluginEvent");
      const metric = new PerfLibMetric("example-metric");
      MicroEmitter.onPluginEvent("example-metric", metric);
      expect(spy).toHaveBeenCalledWith("example-metric", metric);
    });
  });
});
