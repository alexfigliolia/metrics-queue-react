import { useEffect } from "react";

import { MicroEmitter } from "./MicroEmitter";
import type { IMetricProvider } from "./types";

/**
 * MetricProvider
 *
 * Inspired by PageLoad* and PageSegmentLoad*, this component allows
 * you to emit performance.mark(), performance.measure(), and
 * broser_metric.stop() right from the react tree:
 *
 * @param {IMetricProvider} props - See examples below
 */
export const MetricProvider = (props: IMetricProvider) => {
  const { type, event, children = null } = props;
  useEffect(() => {
    MicroEmitter.emit(props);
  }, [type, event]);
  return children;
};

/**
 * Examples:
 *
 *  <MetricProvider
 *    type='mark'
 *    event='my-performance-mark' />
 *
 * <MetricProvider
 *    type='measure'
 *    event='my-performance-measure'
 *    startOrMeasureOptions='my-performance-mark' />
 *
 * <MetricProvider
 *    type='plugin'
 *    event='example-event'
 *    metric={metricInstance} />
 */
