import React from "react";
import { MetricsQueue } from "metrics-queue";
import { renderHook, act } from "@testing-library/react-hooks";
import { render } from "@testing-library/react";

import { useMetricSubscriptionModule } from "../useMetricSubscriptionModule";

const AsyncComponent = () => {
  return <div />;
};

const mockLoader = jest.fn(async () => AsyncComponent) as any as () => Promise<JSX.Element>;

const mockNonReactLoader = jest.fn(async () => () => "Hello") as any as () => Promise<() => string>;

describe("Use Metric Subscription", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    MetricsQueue.destroy();
    MetricsQueue.init();
    console.error = jest.fn();
  });

  it("invokes a listener on the Metrics Queue", async () => {
    const listenerSpy = jest.spyOn(MetricsQueue, "addEventListener");
    renderHook(() => useMetricSubscriptionModule("example-metric", mockLoader));
    expect(listenerSpy).toHaveBeenCalledWith("example-metric", expect.any(Function));
  });

  it("adds a callback to the MetricsQueue under the corresponding event name", async () => {
    renderHook(() => useMetricSubscriptionModule("example-metric", mockLoader));
    expect(MetricsQueue["emitter"]["example-metric"].size).toEqual(1);
  });

  it("Calls the supplied 'loader' function when a metric is reached", async () => {
    renderHook(() => useMetricSubscriptionModule("example-metric", mockLoader));
    expect(mockLoader).toHaveBeenCalledTimes(0);
    await act(async () => {
      performance.mark("example-metric");
      await new Promise(process.nextTick);
    });
    expect(mockLoader).toHaveBeenCalled();
  });

  it("Returns a 'ready' boolean and the result of the 'loader' function", async () => {
    const { result } = renderHook(() => useMetricSubscriptionModule("example-metric", mockLoader));
    let [ready, Component] = result.current;
    expect(ready).toEqual(false);
    expect(Component).toEqual(false);
    await act(async () => {
      performance.mark("example-metric");
      await new Promise(process.nextTick);
    });
    [ready, Component] = result.current;
    expect(ready).toEqual(true);
    expect(Component).toEqual(AsyncComponent);
  });

  it("throws an error when used without a loader function", async () => {
    const { error } = console;
    console.error = () => {};
    const { result } = renderHook(() =>
      useMetricSubscriptionModule("example-metric", undefined as unknown as () => Promise<any>)
    );
    expect(() => {
      result.current;
    }).toThrow(
      "To use useMetricSubscriptionModule, an asynchronous 'loader' function returning a module or promise is required"
    );
    console.error = error;
  });

  it("Stores resolved modules as 'getter' functions for JSX rendering", async () => {
    const { result } = renderHook(() => useMetricSubscriptionModule("example-metric", mockLoader));
    await act(async () => {
      performance.mark("example-metric");
      await new Promise(process.nextTick);
    });
    const Component = result.current[1] as () => JSX.Element;
    expect(() => {
      render(<Component />);
    }).not.toThrow();
  });

  it("Stores resolved non-react modules as 'getter' functions", async () => {
    const { result } = renderHook(() => useMetricSubscriptionModule("example-metric", mockNonReactLoader));
    await act(async () => {
      performance.mark("example-metric");
      await new Promise(process.nextTick);
    });
    const loadedModule = result.current[1] as (...args: any[]) => any;
    expect(loadedModule).toEqual(expect.any(Function));
    expect(loadedModule()).toEqual("Hello");
  });
});
