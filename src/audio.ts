let context: AudioContext | null = null;

export function playCue(kind: "ok" | "no" | "tap", enabled: boolean): void {
  if (!enabled) return;
  const AudioCtor = window.AudioContext ?? window.webkitAudioContext;
  if (!AudioCtor) return;
  context ??= new AudioCtor();
  const now = context.currentTime;
  const osc = context.createOscillator();
  const gain = context.createGain();
  osc.type = "sine";
  osc.frequency.value = kind === "ok" ? 620 : kind === "no" ? 220 : 440;
  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.exponentialRampToValueAtTime(0.05, now + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.18);
  osc.connect(gain);
  gain.connect(context.destination);
  osc.start(now);
  osc.stop(now + 0.2);
}

declare global {
  interface Window {
    webkitAudioContext?: typeof AudioContext;
  }
}
