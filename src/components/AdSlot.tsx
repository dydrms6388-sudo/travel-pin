"use client";
// 수익화 슬롯 — 애드센스 자리(승인 후 활성) + 맥락 제휴 안내
export function AdSlot({ label = "광고" }: { label?: string }) {
  return (
    <div className="my-4 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-5 text-center">
      <p className="text-[11px] uppercase tracking-widest text-white/30">{label}</p>
      <p className="mt-1 text-sm text-white/40">파트너 광고 자리 · 도메인 연결 후 노출</p>
    </div>
  );
}

export function GearAffiliate({ items }: { items: string[] }) {
  return (
    <div className="rounded-2xl border border-amber-400/20 bg-amber-400/[0.06] p-4">
      <p className="text-sm font-semibold text-amber-200">🧳 이 여행에 챙기면 좋은 것</p>
      <div className="mt-3 flex flex-wrap gap-2">
        {items.map((it) => (
          <a
            key={it}
            href={`https://www.coupang.com/np/search?q=${encodeURIComponent(it + " 여행")}`}
            target="_blank"
            rel="noopener noreferrer nofollow sponsored"
            className="rounded-full border border-amber-300/30 bg-amber-300/10 px-3 py-1.5 text-xs text-amber-100 transition hover:bg-amber-300/20"
          >
            {it} ↗
          </a>
        ))}
      </div>
      <p className="mt-2 text-[10px] text-white/30">
        쿠팡 파트너스 활동의 일환으로, 일정액의 수수료를 제공받을 수 있습니다.
      </p>
    </div>
  );
}
