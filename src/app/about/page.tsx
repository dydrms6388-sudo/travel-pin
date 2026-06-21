import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "소개 — 여행핀", description: "여행핀 서비스 소개" };

export default function About() {
  return (
    <main className="mx-auto max-w-2xl px-5 py-12">
      <Link href="/" className="text-sm text-white/50">← 홈</Link>
      <h1 className="mt-4 text-2xl font-black">여행핀 소개</h1>
      <div className="mt-5 space-y-4 text-sm leading-relaxed text-white/70">
        <p>
          <b className="text-white">여행핀</b>은 가고 싶은 여행지를 핀으로 모으고, 여행지마다 열려 있는
          <b className="text-sky-300"> 실시간 채팅방</b>과 <b className="text-fuchsia-300">커뮤니티</b>에서
          같은 곳을 꿈꾸는 사람들과 동행을 구하고 꿀팁을 나누는 서비스예요.
        </p>
        <p>
          여행지마다 베스트 시즌, 1일 예상 예산, 비행시간, 꼭 가봐야 할 코스와 현지 꿀팁을 정리해 두었습니다.
          버킷리스트를 채우고, 출발 전 정보를 모으고, 떠나는 순간까지 함께하세요.
        </p>
        <p className="text-white/40">
          제공되는 여행 정보는 참고용이며 실제 운영시간·요금·항공편은 변동될 수 있습니다.
        </p>
      </div>
      <Link href="/" className="mt-8 inline-block rounded-2xl bg-sky-500 px-6 py-3 text-sm font-bold">
        여행지 둘러보기 →
      </Link>
    </main>
  );
}
