import { useEffect, useRef } from 'react';
import type { TranscriptUpdate } from '../types';

interface TranscriptPanelProps {
  transcripts: TranscriptUpdate[];
}

const SPEAKER_META: Record<string, { name: string; label: string; text: string }> = {
  sales: { name: 'Sales Rep', label: 'text-blue-600', text: 'text-gray-700' },
  customer: { name: 'Customer', label: 'text-emerald-600', text: 'text-gray-900' },
};

function textClass(speaker: string, isFinal: boolean): string {
  if (!isFinal) return 'text-gray-400 italic';
  return SPEAKER_META[speaker]?.text ?? 'text-gray-900';
}

export function TranscriptPanel({ transcripts }: TranscriptPanelProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [transcripts]);

  let lastSpeaker = '';

  return (
    <div className="flex flex-col h-full bg-white">
      <div className="px-4 py-3 border-b border-gray-200">
        <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
          Live Transcript
        </h2>
      </div>
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-1">
        {transcripts.length === 0 ? (
          <p className="text-gray-400 text-sm italic mt-8 text-center">
            No transcript yet.
          </p>
        ) : (
          transcripts.map((t, i) => {
            const meta = SPEAKER_META[t.speaker];
            const showLabel = meta && t.speaker !== lastSpeaker && t.is_final;
            if (t.is_final) lastSpeaker = t.speaker;

            return (
              <div key={i}>
                {showLabel && (
                  <div className={`text-xs font-semibold mt-3 mb-0.5 ${meta.label}`}>
                    {meta.name}
                  </div>
                )}
                <p className={`text-sm leading-relaxed ${textClass(t.speaker, t.is_final)}`}>
                  {t.text}
                </p>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}
