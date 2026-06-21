import { NextRequest, NextResponse } from "next/server";
import { ensureSchema, sql, clean } from "@/lib/db";
import { getDestination } from "@/lib/destinations";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const KINDS = ["tip", "question", "mate", "review"]; // 꿀팁/질문/동행구함/후기

export async function GET(req: NextRequest) {
  try {
    await ensureSchema();
    const place = clean(req.nextUrl.searchParams.get("place"), 40);
    if (!place || !getDestination(place)) return NextResponse.json({ posts: [] });
    const rows = await sql`
      SELECT id, kind, nick, title, body, likes, created_at
      FROM travelpin.posts WHERE place=${place}
      ORDER BY id DESC LIMIT 50`;
    return NextResponse.json({ posts: rows });
  } catch {
    return NextResponse.json({ posts: [] }, { status: 200 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await ensureSchema();
    const data = await req.json().catch(() => ({}));
    const action = clean(data.action, 10);

    if (action === "like") {
      const id = Number(data.id);
      if (!id) return NextResponse.json({ ok: false }, { status: 400 });
      const r = await sql`UPDATE travelpin.posts SET likes=likes+1 WHERE id=${id} RETURNING likes`;
      return NextResponse.json({ ok: true, likes: r[0]?.likes ?? 0 });
    }

    const place = clean(data.place, 40);
    const kind = KINDS.includes(data.kind) ? data.kind : "tip";
    const nick = clean(data.nick, 20) || "익명여행자";
    const title = clean(data.title, 60);
    const body = clean(data.body, 800);
    if (!place || !getDestination(place) || !title || !body)
      return NextResponse.json({ ok: false }, { status: 400 });

    const ins = await sql`
      INSERT INTO travelpin.posts (place, kind, nick, title, body)
      VALUES (${place}, ${kind}, ${nick}, ${title}, ${body})
      RETURNING id, kind, nick, title, body, likes, created_at`;
    return NextResponse.json({ ok: true, post: ins[0] });
  } catch {
    return NextResponse.json({ ok: false, error: "db" }, { status: 200 });
  }
}
