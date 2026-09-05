import { useCallback, useMemo } from 'react';
import { useWebSocket } from './hooks/useWebSocket';
import { useAudioCapture } from './hooks/useAudioCapture';
import { StatusBar } from './components/StatusBar';
import { DealContextBar } from './components/DealContextBar';
import { TranscriptPanel } from './components/TranscriptPanel';
import { SuggestionPanel } from './components/SuggestionPanel';
import { InsightsSidebar } from './components/InsightsSidebar';
import { MobileMetricsStrip } from './components/MobileMetricsStrip';
import { TextInput } from './components/TextInput';
import { computeCallMetrics } from './lib/callAnalytics';

function AmbientBackground() {
  return (
    <div className="app-canvas" aria-hidden="true">
      <div className="ambient-blob ambient-blob--indigo" />
      <div className="ambient-blob ambient-blob--blue" />
      <div className="ambient-blob ambient-blob--teal" />
    </div>
  );
}

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

  const metrics = useMemo(
    () => computeCallMetrics(transcripts, suggestions),
    [transcripts, suggestions],
  );

  const isLive = isCapturing || isDemoRunning || transcripts.length > 0;

  return (
    <>
      <AmbientBackground />

      <div className="flex flex-col h-dvh relative">
        <StatusBar
          isConnected={isConnected}
          isCapturing={isCapturing}
          isDemoRunning={isDemoRunning}
          onToggleMic={handleToggleMic}
          onStartDemo={startDemo}
          onStopDemo={stopDemo}
        />

        <DealContextBar />

        <MobileMetricsStrip metrics={metrics} isLive={isLive} />

        <main className="flex flex-1 min-h-0 gap-3 p-3 pb-0 flex-col lg:flex-row">
          <section
            className="flex flex-col min-h-0 flex-1 lg:max-w-[44%] xl:max-w-[38%] min-h-[35dvh] lg:min-h-0"
            aria-label="Live transcript"
          >
            <TranscriptPanel transcripts={transcripts} />
          </section>

          <section
            className="flex flex-col flex-1 min-h-0 min-w-0"
            aria-label="AI suggestions"
          >
            <SuggestionPanel
              suggestions={suggestions}
              onDismiss={dismissSuggestion}
            />
          </section>

          <InsightsSidebar metrics={metrics} isLive={isLive} />
        </main>

        <TextInput onSend={sendText} disabled={!isConnected} />
      </div>
    </>
  );
}
