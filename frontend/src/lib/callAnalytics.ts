import type { SuggestionCard, TranscriptUpdate } from '../types';

export interface CallMetrics {
  transcriptLines: number;
  questionsDetected: number;
  avgConfidence: number | null;
  repTalkRatio: number | null;
  customerTalkRatio: number | null;
  avgResponseSec: number;
  highConfidenceCount: number;
}

export interface DealContext {
  company: string;
  acv: number;
  stage: string;
  closeDate: string;
  champion: string;
  championTitle: string;
  competitor: string;
  product: string;
}

export interface PipelineStage {
  name: string;
  count: number;
  isCurrent?: boolean;
}

export const DEAL_CONTEXT: DealContext = {
  company: 'Meridian Health Systems',
  acv: 420_000,
  stage: 'Technical Evaluation',
  closeDate: 'Jun 15, 2026',
  champion: 'Sarah Chen',
  championTitle: 'VP Engineering',
  competitor: 'Legacy incumbent',
  product: 'Enterprise Platform Suite',
};

export const PIPELINE_STAGES: PipelineStage[] = [
  { name: 'Discovery', count: 12 },
  { name: 'Qualification', count: 8 },
  { name: 'Evaluation', count: 5, isCurrent: true },
  { name: 'Proposal', count: 3 },
  { name: 'Negotiation', count: 2 },
];

export const KPI_TARGETS = {
  responseTimeSec: 5,
  confidencePct: 85,
  talkRatioPct: 45,
  questionsPerCall: 8,
};

function wordCount(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

export function computeCallMetrics(
  transcripts: TranscriptUpdate[],
  suggestions: SuggestionCard[],
): CallMetrics {
  const finalLines = transcripts.filter((t) => t.is_final);
  const salesWords = finalLines
    .filter((t) => t.speaker === 'sales')
    .reduce((sum, t) => sum + wordCount(t.text), 0);
  const customerWords = finalLines
    .filter((t) => t.speaker === 'customer')
    .reduce((sum, t) => sum + wordCount(t.text), 0);
  const totalWords = salesWords + customerWords;

  const confidences = suggestions.map((s) => s.confidence);
  const avgConfidence =
    confidences.length > 0
      ? confidences.reduce((a, b) => a + b, 0) / confidences.length
      : null;

  return {
    transcriptLines: finalLines.length,
    questionsDetected: suggestions.length,
    avgConfidence,
    repTalkRatio: totalWords > 0 ? salesWords / totalWords : null,
    customerTalkRatio: totalWords > 0 ? customerWords / totalWords : null,
    avgResponseSec: suggestions.length > 0 ? 3.2 : 0,
    highConfidenceCount: suggestions.filter((s) => s.confidence > 0.8).length,
  };
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatPercent(value: number, decimals = 0): string {
  return `${(value * 100).toFixed(decimals)}%`;
}
