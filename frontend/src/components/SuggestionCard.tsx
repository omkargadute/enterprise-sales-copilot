import type { SuggestionCard as SuggestionCardType } from '../types';

interface SuggestionCardProps {
  card: SuggestionCardType;
  isPinned: boolean;
  onDismiss: (id: string) => void;
  onTogglePin: (id: string) => void;
}

function confidenceColor(confidence: number) {
  if (confidence > 0.8) return 'bg-green-100 text-green-800';
  if (confidence >= 0.5) return 'bg-yellow-100 text-yellow-800';
  return 'bg-red-100 text-red-800';
}

export function SuggestionCard({ card, isPinned, onDismiss, onTogglePin }: SuggestionCardProps) {
  return (
    <div className="animate-fade-slide-up bg-white rounded-lg border border-gray-200 shadow-sm p-4">
      <div className="flex items-start justify-between gap-2 mb-2">
        <h3 className="text-sm font-bold text-gray-900 leading-snug">{card.question}</h3>
        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={() => onTogglePin(card.id)}
            className={`p-1 rounded hover:bg-gray-100 ${
              isPinned ? 'text-blue-600' : 'text-gray-400'
            }`}
            title={isPinned ? 'Unpin' : 'Pin'}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
              <path d="M10 2a1 1 0 011 1v1.323l3.954 1.582 1.599-.8a1 1 0 01.894 1.79l-1.233.616 1.738 5.42a1 1 0 01-.285 1.05A3.989 3.989 0 0115 15a3.989 3.989 0 01-2.667-1.019 1 1 0 01-.285-1.05l1.715-5.349L11 6.477V16h2a1 1 0 110 2H7a1 1 0 110-2h2V6.477L6.237 7.582l1.715 5.349a1 1 0 01-.285 1.05A3.989 3.989 0 015 15a3.989 3.989 0 01-2.667-1.019 1 1 0 01-.285-1.05l1.738-5.42-1.233-.617a1 1 0 01.894-1.788l1.599.799L9 4.323V3a1 1 0 011-1z" />
            </svg>
          </button>
          <button
            onClick={() => onDismiss(card.id)}
            className="p-1 rounded text-gray-400 hover:bg-gray-100 hover:text-gray-600"
            title="Dismiss"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      </div>

      <p className="text-sm text-gray-700 mb-3 leading-relaxed">{card.answer}</p>

      <div className="flex items-center gap-2">
        <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
          {card.source}
        </span>
        <span
          className={`text-xs font-medium px-2 py-0.5 rounded-full ${confidenceColor(card.confidence)}`}
        >
          {Math.round(card.confidence * 100)}% confidence
        </span>
      </div>
    </div>
  );
}
