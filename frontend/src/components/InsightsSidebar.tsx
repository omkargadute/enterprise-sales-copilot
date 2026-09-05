import { CallMetricsPanel } from './CallMetricsPanel';
import { PipelineFunnel } from './PipelineFunnel';
import type { CallMetrics } from '../lib/callAnalytics';

interface InsightsSidebarProps {
  metrics: CallMetrics;
  isLive: boolean;
}

export function InsightsSidebar({ metrics, isLive }: InsightsSidebarProps) {
  return (
    <aside
      className="hidden xl:flex flex-col gap-3 min-h-0 w-[280px] 2xl:w-[300px] shrink-0 p-3 pb-3 overflow-y-auto scrollbar-thin"
      aria-label="Call intelligence and pipeline"
    >
      <CallMetricsPanel metrics={metrics} isLive={isLive} />
      <PipelineFunnel />
    </aside>
  );
}
