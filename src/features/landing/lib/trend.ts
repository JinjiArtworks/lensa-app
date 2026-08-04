import type { TrendMetric } from "../types";

export function computeTrendDelta(metric: TrendMetric) {
  const first = metric.data[0].value;
  const last = metric.data[metric.data.length - 1].value;
  const deltaPct = Math.round((Math.abs(last - first) / first) * 100);
  const wentUp = last > first;
  const isGood = (metric.goodDirection === "up") === wentUp;
  return { deltaPct, wentUp, isGood, first, last };
}
