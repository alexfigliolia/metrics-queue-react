import { useMetricSubscription } from "./useMetricSubscription";

interface IMetricSubscriber {
  markOrMeasure: string;
  children(eventEmitted: boolean): JSX.Element | null;
}

/**
 * Metric Subscriber
 *
 * Designed for conditional rendering based on the status of
 * a performance metric
 *
 * <MetricSubscriber markOrMeasure="your-mark-measure-or-BM">
 *  {
 *    metricReached => {
 *     ...Do some performance wizardry
 *    }
 *  }
 * </MetricSubscriber>
 *
 * @param {string} markOrMeasure - the name of a mark, measure, or BM event
 * @param {Function} children - a render function
 */
export const MetricSubscriber = ({ children, markOrMeasure }: IMetricSubscriber) => {
  const eventEmitted = useMetricSubscription(markOrMeasure);
  return children(eventEmitted);
};
