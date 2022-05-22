# Metrics Queue React

This library exposes some React utilities that make common [Metrics Queue](https://github.com/alexfigliolia/metrics-queue#readme) operations easy and reuseable.

## Installation

```bash
yarn add metrics-queue metrics-queue-react
# or
bolt add metrics-queue metrics-queue-react
# or
npm i -S metrics-queue metrics-queue-react
```

Initialize the `MetricsQueue` to enable subscribing to performance marks and measures:

```JavaScript
import { MetricsQueue } from "metrics-queue";

MetricsQueue.init();
// Off to the races!
```

For a more in-depth set configuration options please head over to the `MetricsQueue`'s [documentation](https://github.com/alexfigliolia/metrics-queue#readme)

## React Utilities

### MetricSubscriber

Conditionally render based on the status of a performance metric:

```JavaScript
// Somewhere in your application code:
performance.mark("first-render");

// In your UI modules:
import { MetricSubscriber } from "metrics-queue-react";
import { AsyncComponent } from "./your/async/component"

export const AwesomeComponent = () => (
  <MetricSubscriber markOrMeasure="first-render">
    {eventReached => {
      if(!eventReached) return <Loading />

      return <AsyncComponent />
    }}
  </MetricSubscriber>
);
```

In the use case above, `AsyncComponent` can be any expensive-to-render component or asynchronous import that resolves to a component. It can also be any secondary experience that can be deferred until after the `"first-render"` mark.

### useMetricSubscription

For a more minimal approach, this package also exposes a hook:

```JavaScript
import { useMetricSubscription } from "metrics-queue-react";

export const AwesomeComponent = () => {
  const eventReached = useMetricSubscription("your_mark_or_measure");

  if(!eventReached) return null; // Or a spinner, or whatever makes you happy today

  return <SomeExpensiveOrAsyncComponent />
}
```

The `useMetricSubscription` hook can receive an optional callback to execute once `"your_mark_or_measure"` is reached:

```JavaScript
import { useMetricSubscription } from "metrics-queue-react";

export const AwesomeComponent = () => {
  const eventReached = useMetricSubscription(
    "your_mark_or_measure",
    (measure) => {
      console.log("Event reached at", measure.duration);
    }
  );

  if(!eventReached) return null; // Or a spinner, or whatever makes you happy today

  return <SomeExpensiveOrAsyncComponent />
}
```

### useMetricSubscriptionModule

Similar to `useMetricSubscription`, this hook is designed to resolve asynchronous imports once a metric is reached:

```JavaScript
import React from "react";
import { useMetricSubscriptionModule } from "metrics-queue-react";
import Spinner from "ui-library";

// Define an async function that returns a Component
const loadModule = async () => {
  return (await import("./ExpensiveModule")).ExpensiveModule
});

// Define your component
export const LoadAfterMetric = (props = {}) => {
  // Load the component after a feature's first meaningful paint
  const [reachedFMP, AsyncComponent] = useMetricSubscriptionModule(
   "first-meaningful-paint",
    loadModule
  );

  if(reachedFMP) {
    // Render your after-FMP Component
    return <AsyncComponent {...props}/>
  }
  // Provide a fallback or null until FMP is reached
  return <Spinner />;
};
```

### MetricProvider

We know that with the Performance API, defining marks and measures are simple one-liners:

```JavaScript
performance.mark("example-mark");
// or
performance.measure("example-measure");
```

However, if you'd like to use something a little more React-flavored, this package has some Providers that you can place in your react tree. The `MetricProvider` will make a call to the Performance API as soon as it mounts:

```JavaScript
import { MetricProvider } from "metrics-queue-react";

const MakePerformanceMark = () => {
  return (
      <MetricProvider
        type="mark"
        event="feature-first-paint" />
  );
}

const MakePerformanceMeasure = () => {
  return (
      <MetricProvider
        type="measure"
        event="feature-interactive"
        startOrMeasureOptions="feature-first-paint" />
  );
}
```

The `MetricProviders` above will call:

```JavaScript
performance.mark("feature-first-paint");
// And
performance.measure("feature-interactive", "feature-first-paint");
```

as soon as they mount.

#### MetricProviders with `MetricsQueue` plugins

```JavaScript
import { MetricProvider } from "metrics-queue-react"
import { createPerfMetric } from "example-perf-lib";

const metric = createPerfMetric("example-metric");

const MakeCustomPerfLibMetric = () => {
  return (
      <MetricProvider
        type="plugin"
        event="example-metric"
        metric={metric}
        metricStop={() => metric.stop()} />
  );
}
```

Under the hood, the `MetricProvider` in the above example will call:

```JavaScript
// Mark the stoptime of the metric
metric.stop()
MetricsQueue.plugins["your-plugin-name"]("example-metric", metric);
// This will execute all event listeners on "example-metric"
```

as soon as it mounts. It will also automatically emit events on the correct plugin without you having to specify `"your-plugin-name"` as a prop.

## Contributing

All contributions and PR's are welcome for this project. If you'd like support for another UI library, please raise an issue or create an NPM package under the name `metrics-queue/new-ui-lib`
