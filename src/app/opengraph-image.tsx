import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "여행핀 — 여행지 핀 + 라이브 커뮤니티";

export default function OG() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #0ea5e9, #6366f1 55%, #d946ef)",
          color: "white",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ fontSize: 110 }}>📍</div>
        <div style={{ fontSize: 78, fontWeight: 900, marginTop: 8 }}>여행핀</div>
        <div style={{ fontSize: 36, marginTop: 16, opacity: 0.92 }}>
          가고 싶은 곳에 핀을 꽂고, 거기서 사람들과 떠들어요
        </div>
        <div style={{ fontSize: 26, marginTop: 24, opacity: 0.8 }}>
          여행지별 실시간 채팅 · 커뮤니티 · 동행 · 꿀팁
        </div>
      </div>
    ),
    size
  );
}
