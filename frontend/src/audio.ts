/** Decode base64 MP3 and play it. Resolves when playback ends. */
export function playAudio(base64Audio: string, speaker?: string): Promise<void> {
  return new Promise((resolve) => {
    const byteString = atob(base64Audio);
    const bytes = new Uint8Array(byteString.length);
    for (let i = 0; i < byteString.length; i++) {
      bytes[i] = byteString.charCodeAt(i);
    }
    const blob = new Blob([bytes], { type: 'audio/mpeg' });
    const url = URL.createObjectURL(blob);
    const audio = new Audio(url);
    if (speaker === 'customer') audio.playbackRate = 1.15;
    audio.onended = () => {
      URL.revokeObjectURL(url);
      resolve();
    };
    audio.onerror = () => {
      URL.revokeObjectURL(url);
      resolve();
    };
    audio.play().catch(() => resolve());
  });
}
