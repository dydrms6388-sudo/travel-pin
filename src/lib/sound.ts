"use client";
// Web Audio 합성 사운드 — 외부 에셋 없음. 기본 OFF, 사용자 토글.
let ctx: AudioContext | null = null;
let enabled = false;

export function isSoundOn() {
  return enabled;
}
export function setSound(on: boolean) {
  enabled = on;
  if (typeof window !== "undefined") localStorage.setItem("tp_sound", on ? "1" : "0");
  if (on && !ctx) {
    try {
      ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    } catch {}
  }
}
export function loadSoundPref() {
  if (typeof window === "undefined") return false;
  enabled = localStorage.getItem("tp_sound") === "1";
  return enabled;
}

function tone(freq: number, dur: number, type: OscillatorType = "sine", vol = 0.15) {
  if (!enabled) return;
  if (!ctx) {
    try {
      ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    } catch {
      return;
    }
  }
  const c = ctx!;
  if (c.state === "suspended") c.resume();
  const osc = c.createOscillator();
  const gain = c.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  gain.gain.setValueAtTime(0, c.currentTime);
  gain.gain.linearRampToValueAtTime(vol, c.currentTime + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + dur);
  osc.connect(gain).connect(c.destination);
  osc.start();
  osc.stop(c.currentTime + dur);
}

export const sfx = {
  tap: () => tone(440, 0.08, "triangle", 0.1),
  pin: () => {
    tone(523, 0.1, "sine", 0.14);
    setTimeout(() => tone(784, 0.18, "sine", 0.12), 90);
  },
  send: () => tone(660, 0.07, "sine", 0.09),
  pop: () => tone(880, 0.12, "triangle", 0.1),
};
