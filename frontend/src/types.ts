export interface TranscriptUpdate {
  text: string;
  is_final: boolean;
  speaker: string;
  timestamp: string;
}

export interface SuggestionCard {
  id: string;
  question: string;
  answer: string;
  source: string;
  confidence: number;
  timestamp: string;
}

export type WSMessage =
  | { type: 'transcript_update'; payload: TranscriptUpdate }
  | { type: 'suggestion_card'; payload: SuggestionCard }
  | { type: 'status'; payload: { message: string } }
  | { type: 'error'; payload: { message: string } }
  | { type: 'audio_play'; payload: { audio: string; format: string; speaker?: string } };
