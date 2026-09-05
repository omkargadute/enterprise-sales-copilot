import { DEAL_CONTEXT, formatCurrency } from '../lib/callAnalytics';

export function DealContextBar() {
  return (
    <div className="glass-subtle border-b border-border px-4 sm:px-6 py-2.5 shrink-0 animate-panel-enter">
      <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-text-muted shrink-0">Account</span>
          <span className="font-semibold text-text-primary truncate">
            {DEAL_CONTEXT.company}
          </span>
        </div>

        <div className="hidden sm:flex items-center gap-2">
          <span className="text-text-muted">ACV</span>
          <span className="metric-value font-semibold text-primary">
            {formatCurrency(DEAL_CONTEXT.acv)}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-text-muted shrink-0">Stage</span>
          <span className="px-2 py-0.5 rounded-md bg-primary-subtle text-primary font-medium">
            {DEAL_CONTEXT.stage}
          </span>
        </div>

        <div className="hidden md:flex items-center gap-2">
          <span className="text-text-muted">Close</span>
          <span className="text-text-secondary">{DEAL_CONTEXT.closeDate}</span>
        </div>

        <div className="hidden lg:flex items-center gap-2 min-w-0">
          <span className="text-text-muted shrink-0">Champion</span>
          <span className="text-text-secondary truncate">
            {DEAL_CONTEXT.champion}
            <span className="text-text-muted"> · {DEAL_CONTEXT.championTitle}</span>
          </span>
        </div>

        <div className="hidden xl:flex items-center gap-2 ml-auto">
          <span className="text-text-muted">Competing</span>
          <span className="text-text-secondary">{DEAL_CONTEXT.competitor}</span>
        </div>
      </div>
    </div>
  );
}
