import { useState, useCallback } from 'react';
import type { SuggestionCard as SuggestionCardType } from '../types';
import { SuggestionCard } from './SuggestionCard';

interface SuggestionPanelProps {
  suggestions: SuggestionCardType[];
  onDismiss: (id: string) => void;
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center h-full px-6 py-12 text-center">
      <div className="w-12 h-12 rounded-full bg-surface-raised flex items-center justify-center mb-4">
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
      <p className="text-sm text-text-muted mt-1 max-w-[280px]">
        Product questions detected in the call will appear here with suggested answers.
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
    <div className="flex flex-col h-full bg-surface-muted min-h-[240px] lg:min-h-0">
      <div className="px-4 sm:px-5 py-3 border-b border-border flex items-center justify-between shrink-0 bg-surface">
        <div>
          <h2 className="text-sm font-semibold text-text-primary">AI Suggestions</h2>
          <p className="text-xs text-text-muted mt-0.5">Detected questions and recommended responses</p>
        </div>
        {sorted.length > 0 && (
          <span className="text-xs font-medium tabular-nums text-text-muted bg-surface-raised px-2 py-0.5 rounded-md">
            {sorted.length} active
          </span>
        )}
      </div>

      <div className="flex-1 overflow-y-auto px-4 sm:px-5 py-4">
        {sorted.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="space-y-3">
            {pinned.length > 0 && unpinned.length > 0 && (
              <p className="text-xs font-medium text-text-muted uppercase tracking-wide px-0.5">
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
                    <p className="text-xs font-medium text-text-muted uppercase tracking-wide px-0.5 mb-3 mt-1">
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
    </div>
  );
}
