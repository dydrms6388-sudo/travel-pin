import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "개인정보·문의 — 여행핀", description: "개인정보 처리방침 및 문의" };

export default function Privacy() {
  return (
    <main className="mx-auto max-w-2xl px-5 py-12">
      <Link href="/" className="text-sm text-white/50">← 홈</Link>
      <h1 className="mt-4 text-2xl font-black">개인정보 처리방침 · 문의</h1>
      <div className="mt-5 space-y-4 text-sm leading-relaxed text-white/65">
        <p>여행핀은 회원가입 없이 이용할 수 있는 서비스입니다.</p>
        <ul className="list-disc space-y-2 pl-5">
          <li>핀(저장한 여행지)과 닉네임은 브라우저 로컬스토리지에 저장되며 서버로 전송되지 않습니다.</li>
          <li>커뮤니티·채팅에 작성한 글과 메시지는 닉네임과 함께 공개적으로 표시됩니다. 개인정보(연락처·계정 등)를 적지 마세요.</li>
          <li>서비스 운영을 위해 광고·제휴 파트너(Google, 쿠팡 파트너스 등)의 쿠키가 사용될 수 있습니다.</li>
          <li>본 서비스는 쿠팡 파트너스 활동의 일환으로 일정액의 수수료를 제공받을 수 있습니다.</li>
        </ul>
        <p className="text-white/45">문의: dydrms6388@gmail.com</p>
      </div>
    </main>
  );
}
