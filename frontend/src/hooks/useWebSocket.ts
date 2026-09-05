import { useCallback, useEffect, useRef, useState } from 'react';
import { playAudio } from '../audio';
import type { TranscriptUpdate, SuggestionCard, WSMessage } from '../types';

const MAX_RECONNECT_DELAY = 30000;
const INITIAL_RECONNECT_DELAY = 1000;

type Endpoint = 'session' | 'demo';

function wsSend(ws: WebSocket | null, msg: object) {
  if (ws?.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify(msg));
  }
}

/** Resolve WS base URL: VITE_BACKEND_URL in prod, same-origin (Vite proxy) in dev. */
function backendWsBase(): string {
  const configured = (import.meta.env.VITE_BACKEND_URL as string | undefined)?.replace(
    /\/$/,
    '',
  );
  if (configured) {
    if (configured.startsWith('https://')) return configured.replace(/^https/, 'wss');
    if (configured.startsWith('http://')) return configured.replace(/^http/, 'ws');
    return configured;
  }
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  return `${protocol}//${window.location.host}`;
}

function applyTranscript(
  prev: TranscriptUpdate[],
  update: TranscriptUpdate,
): TranscriptUpdate[] {
  if (prev.length > 0 && !prev[prev.length - 1].is_final) {
    return [...prev.slice(0, -1), update];
  }
  return [...prev, update];
}

export function useWebSocket() {
  const [isConnected, setIsConnected] = useState(false);
  const [transcripts, setTranscripts] = useState<TranscriptUpdate[]>([]);
  const [suggestions, setSuggestions] = useState<SuggestionCard[]>([]);
  const [isDemoRunning, setIsDemoRunning] = useState(false);

  const wsRef = useRef<WebSocket | null>(null);
  const reconnectDelay = useRef(INITIAL_RECONNECT_DELAY);
  const reconnectTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const mountedRef = useRef(true);
  const endpointRef = useRef<Endpoint>('session');
  const pendingEndpoint = useRef<Endpoint | null>(null);

  const connect = useCallback((endpoint: Endpoint = 'session') => {
    if (wsRef.current?.readyState === WebSocket.OPEN) return;
    endpointRef.current = endpoint;

    const wsPath = endpoint === 'demo' ? '/ws/demo' : '/ws/session';
    const ws = new WebSocket(`${backendWsBase()}${wsPath}`);

    ws.onopen = () => {
      if (!mountedRef.current) return;
      setIsConnected(true);
      reconnectDelay.current = INITIAL_RECONNECT_DELAY;
    };

    ws.onmessage = (event) => {
      if (!mountedRef.current) return;
      try {
        const msg = JSON.parse(event.data) as WSMessage;
        switch (msg.type) {
          case 'transcript_update':
            setTranscripts((prev) => applyTranscript(prev, msg.payload));
            break;
          case 'suggestion_card':
            setSuggestions((prev) => [msg.payload, ...prev]);
            break;
          case 'audio_play': {
            const advance = () => {
              if (endpointRef.current === 'demo' && mountedRef.current) {
                wsSend(wsRef.current, { type: 'demo_next' });
              }
            };
            if (msg.payload.audio && endpointRef.current === 'demo') {
              playAudio(msg.payload.audio, msg.payload.speaker).then(advance);
            } else if (endpointRef.current === 'demo') {
              advance();
            }
            break;
          }
          case 'status':
            if (msg.payload.message === 'demo_started') {
              setIsDemoRunning(true);
              wsSend(ws, { type: 'demo_next' });
            }
            if (msg.payload.message === 'demo_ended') setIsDemoRunning(false);
            break;
        }
      } catch {
        // ignore non-JSON messages
      }
    };

    ws.onclose = () => {
      if (!mountedRef.current) return;
      setIsConnected(false);
      setIsDemoRunning(false);
      wsRef.current = null;

      const next = pendingEndpoint.current;
      pendingEndpoint.current = null;
      if (next) {
        connect(next);
        return;
      }

      if (endpointRef.current === 'session') {
        reconnectTimer.current = setTimeout(() => {
          reconnectDelay.current = Math.min(
            reconnectDelay.current * 2,
            MAX_RECONNECT_DELAY,
          );
          connect('session');
        }, reconnectDelay.current);
      }
    };

    ws.onerror = () => {
      ws.close();
    };

    wsRef.current = ws;
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    connect('session');
    return () => {
      mountedRef.current = false;
      clearTimeout(reconnectTimer.current);
      pendingEndpoint.current = null;
      wsRef.current?.close();
    };
  }, [connect]);

  const sendAudio = useCallback((data: ArrayBuffer) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(data);
    }
  }, []);

  const sendText = useCallback((text: string) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: 'text_input', text }));
    }
  }, []);

  const dismissSuggestion = useCallback((id: string) => {
    setSuggestions((prev) => prev.filter((s) => s.id !== id));
  }, []);

  const switchEndpoint = useCallback(
    (endpoint: Endpoint) => {
      clearTimeout(reconnectTimer.current);
      setTranscripts([]);
      setSuggestions([]);
      pendingEndpoint.current = endpoint;
      if (wsRef.current) {
        wsRef.current.close();
      } else {
        pendingEndpoint.current = null;
        connect(endpoint);
      }
    },
    [connect],
  );

  const startDemo = useCallback(() => {
    setIsDemoRunning(true);
    switchEndpoint('demo');
  }, [switchEndpoint]);

  const stopDemo = useCallback(() => {
    document.querySelectorAll('audio').forEach((a) => {
      a.pause();
      a.remove();
    });
    setIsDemoRunning(false);
    switchEndpoint('session');
  }, [switchEndpoint]);

  return {
    isConnected,
    transcripts,
    suggestions,
    isDemoRunning,
    sendAudio,
    sendText,
    dismissSuggestion,
    startDemo,
    stopDemo,
  };
}
