import { PIPELINE_STAGES } from '../lib/callAnalytics';
import { GlassPanel, PanelHeader } from './GlassPanel';

export function PipelineFunnel() {
  const maxCount = Math.max(...PIPELINE_STAGES.map((s) => s.count));

  return (
    <GlassPanel className="flex flex-col" animate delay={180}>
      <PanelHeader
        title="Pipeline"
        subtitle="Active opportunities by stage"
      />

      <div className="px-4 sm:px-5 py-4 space-y-2.5">
        {PIPELINE_STAGES.map((stage) => {
          const widthPct = (stage.count / maxCount) * 100;
          return (
            <div key={stage.name} className="group">
              <div className="flex items-center justify-between mb-1">
                <span
                  className={`text-xs font-medium ${
                    stage.isCurrent ? 'text-primary' : 'text-text-secondary'
                  }`}
                >
                  {stage.name}
                  {stage.isCurrent && (
                    <span className="ml-1.5 text-[10px] text-primary/80">← current</span>
                  )}
                </span>
                <span className="metric-value text-xs text-text-muted tabular-nums">
                  {stage.count}
                </span>
              </div>
              <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
                <div
                  className={`h-full rounded-full funnel-bar ${
                    stage.isCurrent
                      ? 'bg-primary shadow-[0_0_12px_rgb(94_106_210/0.4)]'
                      : 'bg-white/15 group-hover:bg-white/25'
                  }`}
                  style={{ width: `${widthPct}%` }}
                />
              </div>
            </div>
          );
        })}

        <div className="pt-3 mt-1 border-t border-border flex items-center justify-between">
          <span className="text-[11px] text-text-muted">Total pipeline</span>
          <span className="metric-value text-sm font-semibold text-text-primary">
            {PIPELINE_STAGES.reduce((sum, s) => sum + s.count, 0)} deals
          </span>
        </div>
      </div>
    </GlassPanel>
  );
}
