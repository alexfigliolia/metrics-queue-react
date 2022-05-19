import { useState, useEffect } from "react";
import { MetricsQueue } from "metrics-queue";

/**
 * useMetricSubscriptionModule
 *
 * Subscribe to a metric being recorded by your application and
 * asynchronously load a module once it's reached. You can subscribe to any
 * performance.mark, performance.measure, or MetricsQueue.onPluginEvent
 *
 * @param {string} event - a performance.mark, measure, or BM event
 * @param {Function} loader - a Promise that returns a react element
 */

export const useMetricSubscriptionModule = (event: string, loader: () => Promise<any>) => {
  if (typeof loader !== "function") {
    throw new Error(
      "To use useMetricSubscriptionModule, an asynchronous 'loader' function returning a module or promise is required"
    );
  }
  const [loadedModule, setLoadedModule] = useState<boolean | (() => any)>(false);
  useEffect(() => {
    const listenerID = MetricsQueue.addEventListener(event, async () => {
      const deferredModule = await loader();
      setLoadedModule(() => deferredModule as () => any);
    });
    return () => {
      // Remove the listener on unmount if the metric was never reached
      MetricsQueue.removeEventListener(event, listenerID);
    };
  }, [event]);
  return [!!loadedModule, loadedModule];
};

/**
 * Example:
 *
 *  export const ImproveTTI = (props = {}) => {
 *    const loadModule = useCallback(async () => {
 *       return (await import("./ExpensiveModule")).ExpensiveModule
 *    });
 *    const [reachedTTI, AsyncComponent] = useMetricSubscriptionModuleModule(
 *      "time-to-interactive",
 *       loadModule
 *    );
 *    if(reachedTTI) {
 *      return <AsyncComponent {...props}/>
 *    }
 *    return <Spinner />;
 *  }
 */
