import { useState, useEffect } from "react";
import { MetricsQueue } from "metrics-queue";

/**
 * useMetricSubscription
 *
 * Subscribe to a metric being recorded by your application and
 * run some conditional react logic once it's hit. You can subscribe to any
 * performance.mark, performance.measure, or MetricsQueue.onPluginEvent
 *
 * Great for conditional rendering, deferring expensive computes, and
 * lazy loading children
 *
 * @param {string} event - a performance.mark, measure, or BM event
 * @param {Function} callback - an optional callback to run once the event is reached
 */
export const useMetricSubscription = (event: string, callback?: (...args: any[]) => any) => {
  const [eventEmitted, setEventEmitted] = useState(false);
  useEffect(() => {
    const listenerID = MetricsQueue.addEventListener(event, (...args) => {
      setEventEmitted(true);
      if (typeof callback === "function") {
        callback.apply(null, args);
      }
    });
    return () => {
      // Remove the listener on unmount if the metric was never reached
      MetricsQueue.removeEventListener(event, listenerID);
    };
  }, [event]);
  return eventEmitted;
};
