import { useState, useCallback } from 'react';
import type { SuggestionCard as SuggestionCardType } from '../types';
import { SuggestionCard } from './SuggestionCard';
import { GlassPanel, PanelHeader } from './GlassPanel';

interface SuggestionPanelProps {
  suggestions: SuggestionCardType[];
  onDismiss: (id: string) => void;
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
          <path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 1 1 7.072 0l-.548.547A3.374 3.374 0 0 0 14 18.469V19a2 2 0 1 1-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
      </div>
      <p className="text-sm font-medium text-text-secondary">No suggestions yet</p>
      <p className="text-sm text-text-muted mt-1.5 max-w-[300px] leading-relaxed">
        Product questions detected in the call appear here with AI-generated answers in ~3 seconds.
      </p>
    </div>
  );
}

export function SuggestionPanel({ suggestions, onDismiss }: SuggestionPanelProps) {
  const [pinnedIds, setPinnedIds] = useState<Set<string>>(new Set());

  const togglePin = useCallback((id: string) => {
    setPinnedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const pinned = suggestions.filter((s) => pinnedIds.has(s.id));
  const unpinned = suggestions.filter((s) => !pinnedIds.has(s.id));
  const sorted = [...pinned, ...unpinned];

  return (
    <GlassPanel className="flex flex-col h-full min-h-[240px] lg:min-h-0" animate delay={60}>
      <PanelHeader
        title="AI Suggestions"
        subtitle="Detected questions and recommended responses"
        badge={
          sorted.length > 0 ? (
            <span className="metric-value text-xs font-medium text-primary glass-subtle px-2 py-0.5 rounded-md border border-primary/20">
              {sorted.length} active
            </span>
          ) : undefined
        }
      />

      <div className="flex-1 overflow-y-auto scrollbar-thin px-4 sm:px-5 py-4">
        {sorted.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="space-y-3">
            {pinned.length > 0 && unpinned.length > 0 && (
              <p className="text-[11px] font-medium text-text-muted uppercase tracking-wider px-0.5">
                Pinned
              </p>
            )}
            {sorted.map((card, index) => {
              const showUnpinnedHeader =
                pinned.length > 0 &&
                unpinned.length > 0 &&
                index === pinned.length;

              return (
                <div key={card.id}>
                  {showUnpinnedHeader && (
                    <p className="text-[11px] font-medium text-text-muted uppercase tracking-wider px-0.5 mb-3 mt-1">
                      Recent
                    </p>
                  )}
                  <SuggestionCard
                    card={card}
                    isPinned={pinnedIds.has(card.id)}
                    onDismiss={onDismiss}
                    onTogglePin={togglePin}
                    animationDelay={index * 40}
                  />
                </div>
              );
            })}
          </div>
        )}
      </div>
    </GlassPanel>
  );
}
