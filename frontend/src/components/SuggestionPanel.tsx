import { useState, useCallback } from 'react';
import type { SuggestionCard as SuggestionCardType } from '../types';
import { SuggestionCard } from './SuggestionCard';

interface SuggestionPanelProps {
  suggestions: SuggestionCardType[];
  onDismiss: (id: string) => void;
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
    <div className="flex flex-col h-full bg-gray-50">
      <div className="px-4 py-3 border-b border-gray-200">
        <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
          Suggestions
        </h2>
      </div>
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
        {sorted.length === 0 ? (
          <p className="text-gray-400 text-sm italic mt-8 text-center">
            Product answers appear here when a question is detected.
          </p>
        ) : (
          sorted.map((card) => (
            <SuggestionCard
              key={card.id}
              card={card}
              isPinned={pinnedIds.has(card.id)}
              onDismiss={onDismiss}
              onTogglePin={togglePin}
            />
          ))
        )}
      </div>
    </div>
  );
}
