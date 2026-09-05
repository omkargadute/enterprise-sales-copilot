import type { CallMetrics } from '../lib/callAnalytics';
import { KPI_TARGETS, formatPercent } from '../lib/callAnalytics';
import { BulletChart } from './BulletChart';
import { GlassPanel, PanelHeader } from './GlassPanel';

interface CallMetricsPanelProps {
  metrics: CallMetrics;
  isLive: boolean;
}

function MetricTile({
  label,
  value,
  sub,
  accent,
}: {
  label: string;
  value: string;
  sub?: string;
  accent?: boolean;
}) {
  return (
    <div className="glass-subtle rounded-lg p-3">
      <p className="text-[11px] font-medium text-text-muted uppercase tracking-wider mb-1">
        {label}
      </p>
      <p
        className={`metric-value text-xl font-semibold ${
          accent ? 'text-primary' : 'text-text-primary'
        }`}
      >
        {value}
      </p>
      {sub && <p className="text-[11px] text-text-muted mt-0.5">{sub}</p>}
    </div>
  );
}

export function CallMetricsPanel({ metrics, isLive }: CallMetricsPanelProps) {
  const confidencePct = metrics.avgConfidence != null ? metrics.avgConfidence * 100 : 0;
  const talkRatioPct =
    metrics.repTalkRatio != null ? metrics.repTalkRatio * 100 : 0;

  return (
    <GlassPanel className="flex flex-col h-full min-h-[200px]" animate delay={120}>
      <PanelHeader
        title="Call Intelligence"
        subtitle="Live performance metrics"
        badge={
          isLive ? (
            <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-success-subtle text-success text-[11px] font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-success animate-blink" aria-hidden="true" />
              Live
            </span>
          ) : (
            <span className="px-2 py-0.5 rounded-full bg-white/5 text-text-muted text-[11px] font-medium">
              Standby
            </span>
          )
        }
      />

      <div className="flex-1 overflow-y-auto scrollbar-thin px-4 sm:px-5 py-4 space-y-5">
        <div className="grid grid-cols-2 gap-2.5">
          <MetricTile
            label="Response time"
            value={metrics.questionsDetected > 0 ? `${metrics.avgResponseSec.toFixed(1)}s` : '—'}
            sub="Target ≤ 5s"
            accent={metrics.avgResponseSec > 0 && metrics.avgResponseSec <= 5}
          />
          <MetricTile
            label="Questions"
            value={String(metrics.questionsDetected)}
            sub={`Target ${KPI_TARGETS.questionsPerCall}/call`}
          />
          <MetricTile
            label="Confidence"
            value={
              metrics.avgConfidence != null
                ? `${Math.round(confidencePct)}%`
                : '—'
            }
            sub={`${metrics.highConfidenceCount} high confidence`}
          />
          <MetricTile
            label="Transcript"
            value={String(metrics.transcriptLines)}
            sub="Finalized lines"
          />
        </div>

        <div className="space-y-3.5">
          <p className="text-[11px] font-medium text-text-muted uppercase tracking-wider">
            Performance vs target
          </p>
          <BulletChart
            label="Avg response time"
            value={metrics.avgResponseSec || 0}
            max={10}
            target={KPI_TARGETS.responseTimeSec}
            format={(v) => (v > 0 ? `${v.toFixed(1)}s` : '—')}
            status={
              metrics.avgResponseSec > 0 && metrics.avgResponseSec <= KPI_TARGETS.responseTimeSec
                ? 'good'
                : 'neutral'
            }
          />
          <BulletChart
            label="Answer confidence"
            value={confidencePct}
            max={100}
            target={KPI_TARGETS.confidencePct}
            format={(v) => (v > 0 ? `${Math.round(v)}%` : '—')}
            status={
              confidencePct >= KPI_TARGETS.confidencePct
                ? 'good'
                : confidencePct >= 60
                  ? 'warn'
                  : 'neutral'
            }
          />
          <BulletChart
            label="Rep talk ratio"
            value={talkRatioPct}
            max={100}
            target={KPI_TARGETS.talkRatioPct}
            format={(v) => (v > 0 ? `${Math.round(v)}%` : '—')}
            status={
              talkRatioPct > 0 && talkRatioPct <= 55 ? 'good' : talkRatioPct > 65 ? 'warn' : 'neutral'
            }
          />
        </div>

        {metrics.repTalkRatio != null && metrics.customerTalkRatio != null && (
          <div className="space-y-2">
            <p className="text-[11px] font-medium text-text-muted uppercase tracking-wider">
              Talk distribution
            </p>
            <div
              className="flex h-2 rounded-full overflow-hidden bg-white/5"
              role="img"
              aria-label={`Rep ${formatPercent(metrics.repTalkRatio)}, Customer ${formatPercent(metrics.customerTalkRatio)}`}
            >
              <div
                className="bg-speaker-sales funnel-bar"
                style={{ width: formatPercent(metrics.repTalkRatio) }}
              />
              <div
                className="bg-speaker-customer funnel-bar"
                style={{ width: formatPercent(metrics.customerTalkRatio) }}
              />
            </div>
            <div className="flex justify-between text-[11px]">
              <span className="text-speaker-sales">
                Rep {formatPercent(metrics.repTalkRatio)}
              </span>
              <span className="text-speaker-customer">
                Customer {formatPercent(metrics.customerTalkRatio)}
              </span>
            </div>
          </div>
        )}
      </div>
    </GlassPanel>
  );
}
