import { MetricsQueue } from "metrics-queue";
import type { IMetricProvider } from "./types";

/**
 * MicroEmitter
 * * For internal use only
 *
 * It emits marks, measures, and "onBM" events for the ./MetricProvider
 * while safety wrapping native Performance["mark | measure"] calls
 *
 * The decision to extract this class from the component is based on maintaining
 * O(1) space - no matter how many providers are in the React tree
 */
export class MicroEmitter {
  /**
   * Add and index an event listener callback
   *
   * @param {IMetricProvider} options - any combination of native mark/measure to forward to
   *                                    performance.mark, performance.measure. When using external libraries
   *                                    use the 'metric' prop to farward
   */
  static emit({
    type,
    event,
    metric,
    startMarkOptions,
    startOrMeasureOptions,
    endMark,
    metricStop,
  }: IMetricProvider) {
    switch (type) {
      case "mark":
        return MetricsQueue.safetyWrap(this.mark, [event, startMarkOptions]);
      case "measure":
        return MetricsQueue.safetyWrap(this.measure, [event, startOrMeasureOptions, endMark]);
      case "plugin":
        if (!metric) {
          throw new Error(
            "This provider is emitting an event from an plugin library without using the metric prop. Please pass your metric instance to the MetricProvider using the 'metric' prop"
          );
        }
        if (typeof metricStop === "function") {
          metricStop();
        }
        return this.onPluginEvent(event, metric);
      default:
        return null;
    }
  }

  /**
   * Run performance.mark
   *
   * @param {string} name - The native performance.mark markName
   * @param {PerformanceMarkOptions} startMarkOptions - The native performance.mark options
   */
  static mark(name: string, options?: PerformanceMarkOptions) {
    performance.mark(name, options);
  }

  /**
   * Run performance.measure
   *
   * @param {string} name - The native performance.measure measureName
   * @param {string | PerformanceMeasureOptions | undefined} startOrMeasureOptions - the native performance.measure options
   * @param {string | undefined} endMark - The native performance.measure endMark argument
   */
  static measure(name: string, startOrMeasureOptions?: string | PerformanceMeasureOptions, endMark?: string) {
    performance.measure(name, startOrMeasureOptions, endMark);
  }

  /**
   * Emit an onPluginEvent
   *
   * @param {string} event - The identifying string for a metric
   * @param {any} metric - The instance of the metric object
   */
  static onPluginEvent(event: string, metric: any) {
    MetricsQueue.onPluginEvent(event, metric);
  }
}
