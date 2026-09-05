import { useEffect, useState } from 'react';

interface StatusBarProps {
  isConnected: boolean;
  isCapturing: boolean;
  isDemoRunning: boolean;
  onToggleMic: () => void;
  onStartDemo: () => void;
  onStopDemo: () => void;
}

function MicIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 14a3 3 0 003-3V5a3 3 0 00-6 0v6a3 3 0 003 3z" />
      <path d="M19 11a1 1 0 10-2 0 5 5 0 01-10 0 1 1 0 10-2 0 7 7 0 006 6.93V20H8a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07A7 7 0 0019 11z" />
    </svg>
  );
}

function PlayIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
    </svg>
  );
}

function StopIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 001 1h4a1 1 0 001-1V8a1 1 0 00-1-1H8z" clipRule="evenodd" />
    </svg>
  );
}

export function StatusBar({
  isConnected,
  isCapturing,
  isDemoRunning,
  onToggleMic,
  onStartDemo,
  onStopDemo,
}: StatusBarProps) {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => clearInterval(interval);
  }, []);

  const mins = Math.floor(elapsed / 60);
  const secs = elapsed % 60;
  const timer = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;

  return (
    <header className="bg-header text-white px-4 sm:px-6 py-3 flex items-center justify-between shrink-0 gap-4">
      <div className="flex items-center gap-3 min-w-0">
        <div className="flex items-center gap-2.5 min-w-0">
          <div
            className="w-7 h-7 rounded-md bg-primary flex items-center justify-center shrink-0"
            aria-hidden="true"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2L2 7l10 5 10-5-10-5z" />
              <path d="M2 17l10 5 10-5" />
              <path d="M2 12l10 5 10-5" />
            </svg>
          </div>
          <div className="min-w-0">
            <h1 className="text-base font-semibold tracking-tight truncate">Sales Copilot</h1>
            <p className="text-xs text-slate-400 tabular-nums hidden sm:block">{timer} elapsed</p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        <div
          className="hidden sm:flex items-center gap-2 px-2.5 py-1 rounded-md bg-white/5 text-xs font-medium"
          role="status"
          aria-live="polite"
        >
          <span
            className={`w-2 h-2 rounded-full shrink-0 ${
              isConnected ? 'bg-green-400' : 'bg-red-400 animate-blink'
            }`}
            aria-hidden="true"
          />
          <span className="text-slate-300">
            {isConnected ? 'Connected' : 'Disconnected'}
          </span>
        </div>

        {isDemoRunning ? (
          <button
            onClick={onStopDemo}
            className="flex items-center gap-1.5 min-h-[44px] px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 cursor-pointer bg-danger hover:bg-red-700 text-white focus-visible:outline-offset-[-2px]"
            aria-label="Stop demo playback"
          >
            <StopIcon className="w-4 h-4" />
            <span className="hidden sm:inline">Stop Demo</span>
          </button>
        ) : (
          <button
            onClick={onStartDemo}
            disabled={!isConnected}
            className="flex items-center gap-1.5 min-h-[44px] px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 cursor-pointer bg-white/10 hover:bg-white/15 text-white disabled:opacity-40 disabled:cursor-not-allowed focus-visible:outline-offset-[-2px]"
            aria-label="Start demo playback"
          >
            <PlayIcon className="w-4 h-4" />
            <span className="hidden sm:inline">Demo</span>
          </button>
        )}

        <button
          onClick={onToggleMic}
          disabled={!isConnected}
          className={`flex items-center gap-1.5 min-h-[44px] px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed focus-visible:outline-offset-[-2px] ${
            isCapturing
              ? 'bg-danger hover:bg-red-700 text-white animate-pulse-ring'
              : 'bg-primary hover:bg-primary-hover text-white'
          }`}
          aria-label={isCapturing ? 'Stop microphone capture' : 'Start microphone capture'}
          aria-pressed={isCapturing}
        >
          <MicIcon className="w-4 h-4" />
          <span className="hidden sm:inline">{isCapturing ? 'Recording' : 'Start Mic'}</span>
        </button>
      </div>
    </header>
  );
}
