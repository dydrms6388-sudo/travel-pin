import type { Metadata } from "next";
import "./globals.css";

const SITE = "https://travel-pin-six.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(SITE),
  title: "여행핀 — 가고 싶은 여행지 핀 꽂고, 여행지별 라이브 커뮤니티",
  description:
    "전 세계 인기 여행지를 핀으로 모으고, 여행지별 실시간 채팅·커뮤니티에서 동행을 구하고 꿀팁을 나누세요. 베스트 시즌·예산·필수 코스까지 한눈에.",
  keywords: ["여행지 추천", "여행 커뮤니티", "여행 동행", "여행 버킷리스트", "해외여행 준비", "국내여행"],
  openGraph: {
    title: "여행핀 — 여행지 핀 + 라이브 커뮤니티",
    description: "가고 싶은 곳을 핀으로 모으고, 여행지별 실시간 채팅에서 동행·꿀팁을 나눠요.",
    url: SITE,
    siteName: "여행핀",
    type: "website",
    locale: "ko_KR",
  },
  twitter: { card: "summary_large_image", title: "여행핀", description: "여행지 핀 + 라이브 커뮤니티" },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const ld = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "여행핀",
    applicationCategory: "TravelApplication",
    operatingSystem: "Web",
    description: "여행지 핀 모으기 + 여행지별 라이브 채팅·커뮤니티",
    offers: { "@type": "Offer", price: "0", priceCurrency: "KRW" },
  };
  return (
    <html lang="ko" className="h-full antialiased">
      <body className="min-h-screen bg-slate-950 text-white">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
        {children}
      </body>
    </html>
  );
}
