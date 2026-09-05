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
    <div className="flex flex-col h-screen bg-gray-100">
      <StatusBar
        isConnected={isConnected}
        isCapturing={isCapturing}
        isDemoRunning={isDemoRunning}
        onToggleMic={handleToggleMic}
        onStartDemo={startDemo}
        onStopDemo={stopDemo}
      />

      <div className="flex flex-1 min-h-0">
        <div className="w-2/5 border-r border-gray-200">
          <TranscriptPanel transcripts={transcripts} />
        </div>
        <div className="w-3/5">
          <SuggestionPanel
            suggestions={suggestions}
            onDismiss={dismissSuggestion}
          />
        </div>
      </div>

      <TextInput onSend={sendText} />
    </div>
  );
}
