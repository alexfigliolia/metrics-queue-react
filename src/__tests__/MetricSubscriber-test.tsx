import React from "react";
import { waitFor } from "@testing-library/dom";
import { render, act } from "@testing-library/react";
import { MetricsQueue } from "metrics-queue";

import { MetricSubscriber } from "../MetricSubscriber";
import { PerfLibMetric } from "../testUtils";

const renderMetricSubscriber = () => {
  return render(
    <MetricSubscriber markOrMeasure="example-metric">
      {(eventEmitted) => {
        if (eventEmitted) {
          return <div>Hello from your metric</div>;
        }
        return null;
      }}
    </MetricSubscriber>
  );
};

describe("Metric Subscriber", () => {
  beforeEach(() => {
    MetricsQueue.destroy();
    MetricsQueue.init();
  });

  it("Should register an event listener on the MetricsQueue corresponding to its 'markOrMeasure' prop", () => {
    const listener = jest.spyOn(MetricsQueue, "addEventListener");
    renderMetricSubscriber();
    expect(listener).toHaveBeenCalledWith("example-metric", expect.any(Function));
    expect(MetricsQueue["emitter"]["example-metric"].size).toEqual(1);
  });

  it("Should return no children until example-metric is reached", () => {
    const { container } = renderMetricSubscriber();
    expect(container.innerHTML).toEqual("");
  });

  it("Should render its children when example-metric is reached via native performance apis", async () => {
    const { getByText } = renderMetricSubscriber();
    void act(() => {
      performance.mark("example-metric");
    });
    await waitFor(() => getByText(/Hello from your metric/i));
  });

  it("Should render its children when example-metric is reached via an external plugin", async () => {
    const { getByText } = renderMetricSubscriber();
    const metric = new PerfLibMetric("example-metric");
    void act(() => {
      MetricsQueue.onPluginEvent("example-metric", metric);
    });
    await waitFor(() => getByText(/Hello from your metric/i));
  });
});
