import { NextRequest, NextResponse } from "next/server";
import { ensureSchema, sql, clean } from "@/lib/db";
import { getDestination } from "@/lib/destinations";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// 여행지별 라이브 채팅 — 폴링 기반(시드 메시지 자동 생성)
const SEED: Record<string, string[]> = {};
function seedFor(place: string) {
  const d = getDestination(place);
  if (!d) return [];
  return [
    `${d.name} 7월 초에 가는데 ${d.vibe[0]} 코스 같이 짤 사람 있나요?`,
    `${d.mustSee[0].title} 진짜 인생샷 명소예요 👍`,
    `${d.name} 환전/교통 꿀팁 공유해요~`,
  ];
}

export async function GET(req: NextRequest) {
  try {
    await ensureSchema();
    const place = clean(req.nextUrl.searchParams.get("place"), 40);
    const after = Number(req.nextUrl.searchParams.get("after") || 0);
    if (!place || !getDestination(place))
      return NextResponse.json({ messages: [] });

    // 시드(첫 진입 시 채팅방이 비어보이지 않게)
    if (!SEED[place]) {
      SEED[place] = ["init"];
      const existing = await sql`SELECT count(*)::int AS n FROM travelpin.messages WHERE place=${place}`;
      if (existing[0].n === 0) {
        for (const body of seedFor(place)) {
          await sql`INSERT INTO travelpin.messages (place, nick, body) VALUES (${place}, ${"여행핀러"}, ${body})`;
        }
      }
    }

    const rows = await sql`
      SELECT id, nick, body, created_at FROM travelpin.messages
      WHERE place=${place} AND id > ${after}
      ORDER BY id ASC LIMIT 100`;
    const total = await sql`SELECT count(*)::int AS n FROM travelpin.messages WHERE place=${place}`;
    return NextResponse.json({ messages: rows, total: total[0].n });
  } catch (e) {
    return NextResponse.json({ messages: [], error: "db" }, { status: 200 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await ensureSchema();
    const data = await req.json().catch(() => ({}));
    const place = clean(data.place, 40);
    const nick = clean(data.nick, 20) || "익명여행자";
    const body = clean(data.body, 300);
    if (!place || !getDestination(place) || !body)
      return NextResponse.json({ ok: false }, { status: 400 });

    // 간단 레이트리밋: 같은 닉+내용 5초내 중복 차단
    const dup = await sql`
      SELECT 1 FROM travelpin.messages
      WHERE place=${place} AND nick=${nick} AND body=${body}
        AND created_at > now() - interval '5 seconds' LIMIT 1`;
    if (dup.length) return NextResponse.json({ ok: true, dedup: true });

    const ins = await sql`
      INSERT INTO travelpin.messages (place, nick, body)
      VALUES (${place}, ${nick}, ${body}) RETURNING id, nick, body, created_at`;
    return NextResponse.json({ ok: true, message: ins[0] });
  } catch (e) {
    return NextResponse.json({ ok: false, error: "db" }, { status: 200 });
  }
}
