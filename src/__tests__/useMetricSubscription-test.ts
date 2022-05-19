import { renderHook, act } from "@testing-library/react-hooks";
import { MetricsQueue } from "metrics-queue";

import { useMetricSubscription } from "../useMetricSubscription";
import { PerfLibMetric } from "../testUtils";

describe("Use Metric Subscription", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    MetricsQueue.destroy();
    MetricsQueue.init();
    console.error = jest.fn();
  });

  it("invokes a listener on the Metrics Queue", () => {
    const listenerSpy = jest.spyOn(MetricsQueue, "addEventListener");
    renderHook(() => useMetricSubscription("example-metric"));
    expect(listenerSpy).toHaveBeenCalledWith("example-metric", expect.any(Function));
  });

  it("adds a callback to the MetricsQueue under the corresponding event name", () => {
    renderHook(() => useMetricSubscription("example-metric"));
    expect(MetricsQueue["emitter"]["example-metric"].size).toEqual(1);
  });

  it("Returns a boolean value representing the 'emitted' state of an event", () => {
    const { result } = renderHook(() => useMetricSubscription("example-metric"));
    expect(result.current).toEqual(false);
  });

  it("Sets the boolean return value to true once the event has emitted", async () => {
    const { result } = renderHook(() => useMetricSubscription("example-metric"));
    await act(async () => {
      performance.mark("example-metric");
      await new Promise(process.nextTick);
    });
    expect(result.current).toEqual(true);
  });

  it("Calls the optional callback with the correct mark params once the event has emitted", async () => {
    const callback = jest.fn();
    renderHook(() => useMetricSubscription("example-metric", callback));
    let mark;
    await act(async () => {
      mark = performance.mark("example-metric", {
        detail: "Ham and swiss sandwich",
      });
      await new Promise(process.nextTick);
    });
    expect(callback).toHaveBeenCalledWith(mark, "example-metric", {
      detail: "Ham and swiss sandwich",
    });
  });

  it("Calls the optional callback with the correct measure params once the event has emitted", async () => {
    const callback = jest.fn();
    performance.mark("example-mark");
    renderHook(() => useMetricSubscription("example-metric", callback));
    let measure;
    await act(async () => {
      measure = performance.measure("example-metric", { detail: "Ham and swiss sandwich" }, "example-mark");
      await new Promise(process.nextTick);
    });
    expect(callback).toHaveBeenCalledWith(
      measure,
      "example-metric",
      {
        detail: "Ham and swiss sandwich",
      },
      "example-mark"
    );
  });

  it("Calls the optional callback with the correct onPluginEvent params once the event has emitted", async () => {
    const callback = jest.fn();
    renderHook(() => useMetricSubscription("example-metric", callback));
    const metric = new PerfLibMetric("example-metric");
    await act(async () => {
      MetricsQueue.onPluginEvent("example-metric", metric);
      await new Promise(process.nextTick);
    });
    expect(callback).toHaveBeenCalledWith(metric);
  });
});
