'use client';

import { useCallback } from 'react';
import { useWebSocket } from './hooks/useWebSocket';
import { useAudioCapture } from './hooks/useAudioCapture';
import { StatusBar } from './components/StatusBar';
import { TranscriptPanel } from './components/TranscriptPanel';
import { SuggestionPanel } from './components/SuggestionPanel';
import { TextInput } from './components/TextInput';

export default function App() {
  const {
    isConnected,
    transcripts,
    suggestions,
    isDemoRunning,
    sendAudio,
    sendText,
    dismissSuggestion,
    startDemo,
    stopDemo,
  } = useWebSocket();

  const { startCapture, stopCapture, isCapturing } = useAudioCapture({
    onAudioData: sendAudio,
  });

  const handleToggleMic = useCallback(() => {
    if (isCapturing) {
      stopCapture();
    } else {
      startCapture();
    }
  }, [isCapturing, startCapture, stopCapture]);

  return (
    <div className="flex flex-col h-dvh bg-surface-muted">
      <StatusBar
        isConnected={isConnected}
        isCapturing={isCapturing}
        isDemoRunning={isDemoRunning}
        onToggleMic={handleToggleMic}
        onStartDemo={startDemo}
        onStopDemo={stopDemo}
      />

      <main className="flex flex-1 min-h-0 flex-col lg:flex-row">
        <section
          className="flex flex-col min-h-0 lg:w-[42%] xl:w-[38%] border-b lg:border-b-0 lg:border-r border-border"
          aria-label="Live transcript"
        >
          <TranscriptPanel transcripts={transcripts} />
        </section>

        <section
          className="flex flex-col flex-1 min-h-0"
          aria-label="AI suggestions"
        >
          <SuggestionPanel
            suggestions={suggestions}
            onDismiss={dismissSuggestion}
          />
        </section>
      </main>

      <TextInput onSend={sendText} disabled={!isConnected} />
    </div>
  );
}
