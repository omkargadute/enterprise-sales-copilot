import type { SuggestionCard as SuggestionCardType } from '../types';

interface SuggestionCardProps {
  card: SuggestionCardType;
  isPinned: boolean;
  onDismiss: (id: string) => void;
  onTogglePin: (id: string) => void;
  animationDelay?: number;
}

function confidenceMeta(confidence: number) {
  if (confidence > 0.8) {
    return {
      bar: 'bg-success shadow-[0_0_8px_rgb(34_197_94/0.4)]',
      badge: 'bg-success-subtle text-success border border-success/20',
      label: 'High confidence',
    };
  }
  if (confidence >= 0.5) {
    return {
      bar: 'bg-warning shadow-[0_0_8px_rgb(234_179_8/0.3)]',
      badge: 'bg-warning-subtle text-warning border border-warning/20',
      label: 'Medium confidence',
    };
  }
  return {
    bar: 'bg-danger shadow-[0_0_8px_rgb(239_68_68/0.3)]',
    badge: 'bg-danger-subtle text-danger border border-danger/20',
    label: 'Low confidence',
  };
}

export function SuggestionCard({
  card,
  isPinned,
  onDismiss,
  onTogglePin,
  animationDelay = 0,
}: SuggestionCardProps) {
  const meta = confidenceMeta(card.confidence);
  const pct = Math.round(card.confidence * 100);

  return (
    <article
      className="animate-fade-slide-up glass-subtle rounded-xl overflow-hidden transition-all duration-200 hover:bg-white/[0.06] hover:border-white/10"
      style={{ animationDelay: `${animationDelay}ms` }}
    >
      <div className={`h-0.5 ${meta.bar}`} aria-hidden="true" />

      <div className="p-4">
        <div className="flex items-start justify-between gap-3 mb-2.5">
          <h3 className="text-sm font-semibold text-text-primary leading-snug flex-1">
            {card.question}
          </h3>
          <div className="flex items-center gap-0.5 shrink-0">
            <button
              onClick={() => onTogglePin(card.id)}
              className={`min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg transition-all duration-200 cursor-pointer ${
                isPinned
                  ? 'text-primary bg-primary-subtle hover:bg-primary/20 border border-primary/20'
                  : 'text-text-muted hover:bg-white/5 hover:text-text-secondary'
              }`}
              aria-label={isPinned ? 'Unpin suggestion' : 'Pin suggestion'}
              aria-pressed={isPinned}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path d="M10 2a1 1 0 011 1v1.323l3.954 1.582 1.599-.8a1 1 0 01.894 1.79l-1.233.616 1.738 5.42a1 1 0 01-.285 1.05A3.989 3.989 0 0115 15a3.989 3.989 0 01-2.667-1.019 1 1 0 01-.285-1.05l1.715-5.349L11 6.477V16h2a1 1 0 110 2H7a1 1 0 110-2h2V6.477L6.237 7.582l1.715 5.349a1 1 0 01-.285 1.05A3.989 3.989 0 015 15a3.989 3.989 0 01-2.667-1.019 1 1 0 01-.285-1.05l1.738-5.42-1.233-.617a1 1 0 01.894-1.788l1.599.799L9 4.323V3a1 1 0 011-1z" />
              </svg>
            </button>
            <button
              onClick={() => onDismiss(card.id)}
              className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg text-text-muted hover:bg-white/5 hover:text-text-secondary transition-all duration-200 cursor-pointer"
              aria-label="Dismiss suggestion"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>

        <p className="text-sm text-text-secondary mb-3.5 leading-relaxed">{card.answer}</p>

        <div className="flex items-center flex-wrap gap-2">
          <span className="text-xs font-medium px-2.5 py-1 rounded-md bg-primary-subtle text-primary border border-primary/20">
            {card.source}
          </span>
          <span
            className={`metric-value text-xs font-medium px-2.5 py-1 rounded-md ${meta.badge}`}
            title={meta.label}
          >
            {pct}% confidence
          </span>
        </div>
      </div>
    </article>
  );
}
