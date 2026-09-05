import { useEffect, useRef } from 'react';
import type { TranscriptUpdate } from '../types';
import { GlassPanel, PanelHeader } from './GlassPanel';

interface TranscriptPanelProps {
  transcripts: TranscriptUpdate[];
}

const SPEAKER_META: Record<string, { name: string; dot: string; label: string; text: string }> = {
  sales: {
    name: 'Sales Rep',
    dot: 'bg-speaker-sales',
    label: 'text-speaker-sales',
    text: 'text-text-secondary',
  },
  customer: {
    name: 'Customer',
    dot: 'bg-speaker-customer',
    label: 'text-speaker-customer',
    text: 'text-text-primary',
  },
};

function textClass(speaker: string, isFinal: boolean): string {
  if (!isFinal) return 'text-text-muted italic';
  return SPEAKER_META[speaker]?.text ?? 'text-text-primary';
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center h-full px-6 py-12 text-center">
      <div className="w-14 h-14 rounded-2xl glass-subtle flex items-center justify-center mb-4">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="w-6 h-6 text-text-muted"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
          <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
          <line x1="12" y1="19" x2="12" y2="23" />
          <line x1="8" y1="23" x2="16" y2="23" />
        </svg>
      </div>
      <p className="text-sm font-medium text-text-secondary">Waiting for audio</p>
      <p className="text-sm text-text-muted mt-1.5 max-w-[260px] leading-relaxed">
        Start the mic or run a demo to see live transcription.
      </p>
    </div>
  );
}

export function TranscriptPanel({ transcripts }: TranscriptPanelProps) {
  const bottomRef = useRef<HTMLDivElement>(null);
  const finalCount = transcripts.filter((t) => t.is_final).length;

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [transcripts]);

  let lastSpeaker = '';

  return (
    <GlassPanel className="flex flex-col h-full min-h-[200px] lg:min-h-0" animate>
      <PanelHeader
        title="Live Transcript"
        subtitle="Real-time call transcription"
        badge={
          finalCount > 0 ? (
            <span className="metric-value text-xs font-medium text-text-muted glass-subtle px-2 py-0.5 rounded-md">
              {finalCount} {finalCount === 1 ? 'line' : 'lines'}
            </span>
          ) : undefined
        }
      />

      <div className="flex-1 overflow-y-auto scrollbar-thin px-4 sm:px-5 py-4">
        {transcripts.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="space-y-0.5">
            {transcripts.map((t, i) => {
              const meta = SPEAKER_META[t.speaker];
              const showLabel = meta && t.speaker !== lastSpeaker && t.is_final;
              if (t.is_final) lastSpeaker = t.speaker;

              return (
                <div key={i} className={showLabel ? 'mt-5 first:mt-0' : undefined}>
                  {showLabel && (
                    <div className="flex items-center gap-2 mb-1.5">
                      <span
                        className={`w-2 h-2 rounded-full shrink-0 ${meta.dot} shadow-[0_0_8px_currentColor]`}
                        aria-hidden="true"
                      />
                      <span className={`text-[11px] font-semibold uppercase tracking-wider ${meta.label}`}>
                        {meta.name}
                      </span>
                    </div>
                  )}
                  <p className={`text-[15px] leading-relaxed pl-4 ${textClass(t.speaker, t.is_final)}`}>
                    {t.text}
                    {!t.is_final && (
                      <span className="inline-block w-0.5 h-4 bg-primary/60 ml-0.5 align-middle animate-blink" aria-hidden="true" />
                    )}
                  </p>
                </div>
              );
            })}
          </div>
        )}
        <div ref={bottomRef} />
      </div>
    </GlassPanel>
  );
}
