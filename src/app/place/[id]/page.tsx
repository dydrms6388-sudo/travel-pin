import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { DESTINATIONS, getDestination } from "@/lib/destinations";
import { GearAffiliate, AdSlot } from "@/components/AdSlot";
import Community from "@/components/Community";
import PlaceActions from "./PlaceActions";

export const dynamicParams = false;
export function generateStaticParams() {
  return DESTINATIONS.map((d) => ({ id: d.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const d = getDestination(id);
  if (!d) return { title: "여행핀" };
  const title = `${d.name} 여행 — 베스트 시즌·예산·코스 + 라이브 채팅 | 여행핀`;
  const desc = `${d.name}(${d.country}) ${d.tagline}. 베스트 시즌 ${d.bestSeason}, 1일 예산 ${d.budgetPerDay}. 여행지 라이브 채팅·커뮤니티에서 동행과 꿀팁을 나누세요.`;
  return {
    title,
    description: desc,
    openGraph: { title, description: desc, type: "article", locale: "ko_KR" },
    twitter: { card: "summary_large_image", title, description: desc },
    alternates: { canonical: `/place/${d.id}` },
  };
}

export default async function PlacePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const d = getDestination(id);
  if (!d) notFound();

  const ld = {
    "@context": "https://schema.org",
    "@type": "TouristDestination",
    name: d.name,
    description: d.tagline,
    address: { "@type": "PostalAddress", addressCountry: d.country },
    touristType: d.vibe,
  };

  const related = DESTINATIONS.filter((x) => x.region === d.region && x.id !== d.id).slice(0, 3);

  return (
    <main className="mx-auto max-w-2xl px-4 pb-24">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />

      {/* 히어로 */}
      <div className="relative -mx-4 h-52 overflow-hidden" style={{ background: `linear-gradient(135deg, ${d.c1}, ${d.c2})` }}>
        <Link href="/" className="absolute left-4 top-4 z-10 rounded-full bg-black/30 px-3 py-1.5 text-sm text-white backdrop-blur">
          ← 목록
        </Link>
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-slate-950 to-transparent p-5">
          <span className="text-4xl">{d.flag}</span>
          <h1 className="mt-1 text-3xl font-black text-white">{d.name}</h1>
          <p className="text-sm text-white/85">{d.country} · {d.region} — {d.tagline}</p>
        </div>
      </div>

      {/* 핀/공유 액션 (클라이언트) */}
      <PlaceActions id={d.id} name={d.name} />

      {/* 핵심 정보 */}
      <div className="mt-4 grid grid-cols-3 gap-2">
        <Info icon="🗓" label="베스트 시즌" value={d.bestSeason} />
        <Info icon="💰" label="1일 예산" value={d.budgetPerDay} />
        <Info icon="✈️" label="비행시간" value={d.flightTime} />
      </div>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {d.vibe.map((v) => (
          <span key={v} className="rounded-full bg-white/5 px-3 py-1 text-xs text-white/60">#{v}</span>
        ))}
      </div>

      {/* 여행지별 라이브 커뮤니티 */}
      <section className="mt-7">
        <h2 className="mb-2 px-1 text-lg font-bold">💬 {d.name} 여행자 라운지</h2>
        <p className="mb-3 px-1 text-sm text-white/50">같은 곳을 꿈꾸는 사람들과 실시간으로 대화하고, 동행·꿀팁을 나눠보세요.</p>
        <Community place={d.id} placeName={d.name} />
      </section>

      <AdSlot />

      {/* 필수 코스 */}
      <section className="mt-7">
        <h2 className="mb-3 px-1 text-lg font-bold">📷 꼭 가봐야 할 곳</h2>
        <div className="space-y-2.5">
          {d.mustSee.map((m, i) => (
            <div key={i} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
              <p className="font-semibold text-white/90">{i + 1}. {m.title}</p>
              <p className="mt-1 text-sm text-white/55">{m.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 여행 꿀팁 */}
      <section className="mt-7">
        <h2 className="mb-3 px-1 text-lg font-bold">💡 현지 꿀팁</h2>
        <ul className="space-y-2">
          {d.tips.map((t, i) => (
            <li key={i} className="flex gap-2 rounded-2xl bg-white/[0.03] p-3 text-sm text-white/70">
              <span className="text-sky-300">✓</span>{t}
            </li>
          ))}
        </ul>
      </section>

      {/* 맥락 제휴 */}
      <section className="mt-7">
        <GearAffiliate items={d.gear} />
      </section>

      {/* 같은 지역 추천 (리텐션) */}
      {related.length > 0 && (
        <section className="mt-8">
          <h2 className="mb-3 px-1 text-lg font-bold">🧭 {d.region} 다른 여행지</h2>
          <div className="grid grid-cols-3 gap-2">
            {related.map((r) => (
              <Link
                key={r.id}
                href={`/place/${r.id}`}
                className="overflow-hidden rounded-2xl border border-white/10"
              >
                <div className="h-16" style={{ background: `linear-gradient(135deg, ${r.c1}, ${r.c2})` }} />
                <div className="p-2 text-center">
                  <p className="text-sm font-semibold">{r.flag} {r.name}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      <footer className="mt-10 border-t border-white/10 pt-6 text-center text-xs text-white/30">
        여행 정보는 참고용이며 실제 운영시간·요금·항공편은 변동될 수 있습니다.
      </footer>
    </main>
  );
}

function Info({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-3 text-center">
      <p className="text-lg">{icon}</p>
      <p className="mt-0.5 text-[10px] text-white/40">{label}</p>
      <p className="mt-0.5 text-xs font-semibold leading-tight text-white/85">{value}</p>
    </div>
  );
}
