"use client";
import { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { motion } from "framer-motion";
import confetti from "canvas-confetti";
import { DESTINATIONS, REGIONS, Region } from "@/lib/destinations";
import { usePins } from "@/lib/pins";
import { loadSoundPref, setSound, sfx } from "@/lib/sound";
import { AdSlot } from "@/components/AdSlot";

const Globe = dynamic(() => import("@/components/Globe"), { ssr: false });

export default function Home() {
  const { pins, toggle, has } = usePins();
  const [region, setRegion] = useState<Region | "전체" | "내핀">("전체");
  const [hover, setHover] = useState<string | undefined>();
  const [sound, setSoundState] = useState(false);

  useEffect(() => setSoundState(loadSoundPref()), []);

  const list = useMemo(() => {
    if (region === "내핀") return DESTINATIONS.filter((d) => pins.includes(d.id));
    if (region === "전체") return DESTINATIONS;
    return DESTINATIONS.filter((d) => d.region === region);
  }, [region, pins]);

  const onPin = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    const added = toggle(id);
    if (added) {
      sfx.pin();
      const x = e.clientX / window.innerWidth;
      const y = e.clientY / window.innerHeight;
      confetti({ particleCount: 60, spread: 70, origin: { x, y }, scalar: 0.8 });
    } else sfx.tap();
  };

  const toggleSound = () => {
    const next = !sound;
    setSound(next);
    setSoundState(next);
    if (next) sfx.pop();
  };

  return (
    <main className="mx-auto max-w-5xl px-4 pb-24 pt-6">
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-2xl">📍</span>
          <h1 className="text-lg font-extrabold tracking-tight">여행핀</h1>
        </div>
        <div className="flex items-center gap-3">
          <span className="rounded-full bg-white/5 px-3 py-1 text-xs text-white/60">내 핀 {pins.length}</span>
          <button
            onClick={toggleSound}
            aria-label="소리 토글"
            className="rounded-full bg-white/5 px-3 py-1 text-xs text-white/70 transition hover:bg-white/10"
          >
            {sound ? "🔊 소리" : "🔇 소리"}
          </button>
        </div>
      </header>

      <section className="relative mt-4 overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-sky-500/15 via-indigo-500/10 to-fuchsia-500/15">
        <div className="absolute inset-0 opacity-90">
          <Globe activeId={hover} />
        </div>
        <div className="relative z-10 px-6 py-12 text-center">
          <motion.h2
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-2xl font-black leading-snug sm:text-3xl"
          >
            가고 싶은 곳에 핀을 꽂고,<br />거기서 사람들과 떠들어요
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="mx-auto mt-3 max-w-md text-sm text-white/70"
          >
            여행지마다 <b className="text-sky-300">실시간 채팅방</b>과 <b className="text-fuchsia-300">커뮤니티</b>가 있어요.
            동행을 구하고, 꿀팁을 나누고, 버킷리스트를 채우세요.
          </motion.p>
        </div>
      </section>

      <nav className="sticky top-0 z-20 -mx-4 mt-5 flex gap-2 overflow-x-auto bg-slate-950/80 px-4 py-3 backdrop-blur">
        {(["전체", ...REGIONS, "내핀"] as const).map((r) => (
          <button
            key={r}
            onClick={() => { sfx.tap(); setRegion(r); }}
            className={`whitespace-nowrap rounded-full px-4 py-1.5 text-sm font-semibold transition ${
              region === r ? "bg-white text-slate-900" : "bg-white/5 text-white/60 hover:bg-white/10"
            }`}
          >
            {r === "내핀" ? `⭐ 내 핀${pins.length ? ` (${pins.length})` : ""}` : r}
          </button>
        ))}
      </nav>

      <section className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
        {list.map((d, i) => (
          <motion.div
            key={d.id}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: Math.min(i * 0.03, 0.3) }}
          >
            <Link
              href={`/place/${d.id}`}
              onMouseEnter={() => setHover(d.id)}
              onMouseLeave={() => setHover(undefined)}
              className="group block overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03] transition hover:border-white/25"
            >
              <div className="relative h-32 p-5" style={{ background: `linear-gradient(135deg, ${d.c1}, ${d.c2})` }}>
                <button
                  onClick={(e) => onPin(d.id, e)}
                  aria-label="핀 꽂기"
                  className="absolute right-4 top-4 grid h-10 w-10 place-items-center rounded-full bg-black/25 text-lg backdrop-blur transition hover:scale-110"
                >
                  {has(d.id) ? "📍" : "🤍"}
                </button>
                <span className="text-3xl drop-shadow">{d.flag}</span>
                <h3 className="mt-1 text-xl font-extrabold text-white drop-shadow">{d.name}</h3>
                <p className="text-xs font-medium text-white/85">{d.country} · {d.region}</p>
              </div>
              <div className="p-4">
                <p className="text-sm text-white/75">{d.tagline}</p>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {d.vibe.slice(0, 3).map((v) => (
                    <span key={v} className="rounded-full bg-white/5 px-2.5 py-1 text-[11px] text-white/55">#{v}</span>
                  ))}
                </div>
                <div className="mt-3 flex items-center justify-between text-[11px] text-white/45">
                  <span>🗓 {d.bestSeason.split(" ")[0]}</span>
                  <span className="text-sky-300 group-hover:translate-x-0.5">라이브 채팅 입장 →</span>
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </section>

      {list.length === 0 && (
        <p className="py-16 text-center text-white/40">아직 핀이 없어요. 가고 싶은 여행지에 📍 를 눌러보세요.</p>
      )}

      <AdSlot />

      <footer className="mt-10 space-y-2 border-t border-white/10 pt-6 text-center text-xs text-white/35">
        <p>여행핀 · 여행지 핀 모으기 + 라이브 커뮤니티</p>
        <div className="flex justify-center gap-4">
          <Link href="/about" className="hover:text-white/60">소개</Link>
          <Link href="/privacy" className="hover:text-white/60">개인정보·문의</Link>
        </div>
        <p className="text-white/25">여행 정보는 참고용이며 실제 운영시간·요금은 변동될 수 있습니다.</p>
      </footer>
    </main>
  );
}
