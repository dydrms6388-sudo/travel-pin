"use client";
import { useEffect, useState } from "react";
import confetti from "canvas-confetti";
import { usePins } from "@/lib/pins";
import { loadSoundPref, sfx } from "@/lib/sound";

export default function PlaceActions({ id, name }: { id: string; name: string }) {
  const { has, toggle } = usePins();
  const [pinned, setPinned] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    loadSoundPref();
    setPinned(has(id));
  }, [has, id]);

  const onPin = (e: React.MouseEvent) => {
    const added = toggle(id);
    setPinned(added);
    if (added) {
      sfx.pin();
      confetti({
        particleCount: 70,
        spread: 75,
        origin: { x: e.clientX / window.innerWidth, y: e.clientY / window.innerHeight },
        scalar: 0.85,
      });
    } else sfx.tap();
  };

  const share = async () => {
    sfx.tap();
    const url = typeof window !== "undefined" ? window.location.href : "";
    const text = `${name} 여행 같이 떠날 사람? 여행핀에서 라이브 채팅으로 만나요 ✈️`;
    if (navigator.share) {
      try {
        await navigator.share({ title: `여행핀 — ${name}`, text, url });
        return;
      } catch {}
    }
    try {
      await navigator.clipboard.writeText(`${text} ${url}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {}
  };

  return (
    <div className="mt-4 flex gap-2">
      <button
        onClick={onPin}
        className={`flex-1 rounded-2xl py-3 text-sm font-bold transition ${
          pinned ? "bg-sky-500 text-white" : "border border-white/20 bg-white/5 text-white/80 hover:bg-white/10"
        }`}
      >
        {pinned ? "📍 내 핀에 저장됨" : "🤍 가고싶어요 핀 꽂기"}
      </button>
      <button
        onClick={share}
        className="rounded-2xl border border-white/20 bg-white/5 px-5 py-3 text-sm font-bold text-white/80 transition hover:bg-white/10"
      >
        {copied ? "✓ 복사됨" : "↗ 공유"}
      </button>
    </div>
  );
}
