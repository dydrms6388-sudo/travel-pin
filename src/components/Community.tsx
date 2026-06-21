"use client";
import { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getNick, setNick } from "@/lib/pins";
import { sfx } from "@/lib/sound";

interface Msg { id: number; nick: string; body: string; created_at: string }
interface Post { id: number; kind: string; nick: string; title: string; body: string; likes: number; created_at: string }

const KIND_LABEL: Record<string, string> = { tip: "꿀팁", question: "질문", mate: "동행구함", review: "후기" };
const KIND_COLOR: Record<string, string> = {
  tip: "bg-emerald-400/15 text-emerald-200 border-emerald-300/30",
  question: "bg-sky-400/15 text-sky-200 border-sky-300/30",
  mate: "bg-fuchsia-400/15 text-fuchsia-200 border-fuchsia-300/30",
  review: "bg-amber-400/15 text-amber-200 border-amber-300/30",
};

function ago(iso: string) {
  const t = new Date(iso).getTime();
  const diff = Math.max(0, (Date.now() - t) / 1000);
  if (diff < 60) return "방금";
  if (diff < 3600) return `${Math.floor(diff / 60)}분 전`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}시간 전`;
  return `${Math.floor(diff / 86400)}일 전`;
}

export default function Community({ place, placeName }: { place: string; placeName: string }) {
  const [tab, setTab] = useState<"chat" | "board">("chat");
  const [nick, setNickState] = useState("여행자");
  useEffect(() => setNickState(getNick()), []);

  return (
    <div className="rounded-3xl border border-white/10 bg-gradient-to-b from-white/[0.06] to-white/[0.02] p-1.5">
      <div className="flex items-center justify-between px-3 pt-2">
        <div className="flex gap-1.5">
          <TabBtn active={tab === "chat"} onClick={() => setTab("chat")}>💬 라이브 채팅</TabBtn>
          <TabBtn active={tab === "board"} onClick={() => setTab("board")}>📌 커뮤니티</TabBtn>
        </div>
        <NickEditor nick={nick} onChange={(n) => { setNick(n); setNickState(n); }} />
      </div>
      {tab === "chat" ? <Chat place={place} placeName={placeName} nick={nick} /> : <Board place={place} nick={nick} />}
    </div>
  );
}

function TabBtn({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={() => { sfx.tap(); onClick(); }}
      className={`rounded-xl px-3 py-1.5 text-sm font-semibold transition ${
        active ? "bg-white text-slate-900" : "text-white/60 hover:text-white"
      }`}
    >
      {children}
    </button>
  );
}

function NickEditor({ nick, onChange }: { nick: string; onChange: (n: string) => void }) {
  const [edit, setEdit] = useState(false);
  const [v, setV] = useState(nick);
  useEffect(() => setV(nick), [nick]);
  if (!edit)
    return (
      <button onClick={() => setEdit(true)} className="text-xs text-white/40 hover:text-white/70">
        {nick} ✎
      </button>
    );
  return (
    <input
      autoFocus
      value={v}
      maxLength={20}
      onChange={(e) => setV(e.target.value)}
      onBlur={() => { onChange(v.trim() || nick); setEdit(false); }}
      onKeyDown={(e) => { if (e.key === "Enter") { onChange(v.trim() || nick); setEdit(false); } }}
      className="w-28 rounded-lg border border-white/20 bg-white/10 px-2 py-1 text-xs text-white outline-none"
    />
  );
}

/* ---------- 라이브 채팅 ---------- */
function Chat({ place, placeName, nick }: { place: string; placeName: string; nick: string }) {
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [total, setTotal] = useState(0);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const lastId = useRef(0);
  const boxRef = useRef<HTMLDivElement>(null);
  const stick = useRef(true);

  const poll = useCallback(async () => {
    try {
      const r = await fetch(`/api/chat?place=${place}&after=${lastId.current}`, { cache: "no-store" });
      const d = await r.json();
      if (d.total != null) setTotal(d.total);
      if (Array.isArray(d.messages) && d.messages.length) {
        setMsgs((prev) => {
          const seen = new Set(prev.map((m) => m.id));
          const add = d.messages.filter((m: Msg) => !seen.has(m.id));
          if (add.length) lastId.current = Math.max(lastId.current, ...add.map((m: Msg) => m.id));
          return add.length ? [...prev, ...add].slice(-200) : prev;
        });
      }
    } catch {}
  }, [place]);

  useEffect(() => {
    setMsgs([]); lastId.current = 0;
    poll();
    const t = setInterval(poll, 3500);
    return () => clearInterval(t);
  }, [poll]);

  useEffect(() => {
    if (stick.current && boxRef.current) boxRef.current.scrollTop = boxRef.current.scrollHeight;
  }, [msgs]);

  const send = async () => {
    const body = text.trim();
    if (!body || sending) return;
    setSending(true);
    setText("");
    // 낙관적 표시
    const optimistic: Msg = { id: -Date.now(), nick, body, created_at: new Date().toISOString() };
    setMsgs((p) => [...p, optimistic].slice(-200));
    sfx.send();
    try {
      const r = await fetch("/api/chat", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ place, nick, body }),
      });
      const d = await r.json();
      if (d.message) {
        lastId.current = Math.max(lastId.current, d.message.id);
        setMsgs((p) => p.filter((m) => m.id !== optimistic.id).concat(d.message).slice(-200));
      }
    } catch {}
    setSending(false);
  };

  return (
    <div className="p-2">
      <div className="mb-2 flex items-center justify-between px-1 text-xs text-white/45">
        <span>🟢 {placeName} 여행 라이브</span>
        <span>누적 {total}개 대화</span>
      </div>
      <div
        ref={boxRef}
        onScroll={(e) => {
          const el = e.currentTarget;
          stick.current = el.scrollHeight - el.scrollTop - el.clientHeight < 60;
        }}
        className="h-72 space-y-2 overflow-y-auto rounded-2xl bg-black/20 p-3"
      >
        <AnimatePresence initial={false}>
          {msgs.map((m) => {
            const mine = m.nick === nick;
            return (
              <motion.div
                key={m.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex ${mine ? "justify-end" : "justify-start"}`}
              >
                <div className={`max-w-[78%] ${mine ? "items-end" : ""}`}>
                  {!mine && <p className="mb-0.5 px-1 text-[11px] text-white/40">{m.nick}</p>}
                  <div
                    className={`rounded-2xl px-3 py-2 text-sm ${
                      mine ? "bg-sky-500 text-white" : "bg-white/10 text-white/90"
                    }`}
                  >
                    {m.body}
                  </div>
                  <p className={`mt-0.5 px-1 text-[10px] text-white/30 ${mine ? "text-right" : ""}`}>{ago(m.created_at)}</p>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
        {msgs.length === 0 && <p className="pt-20 text-center text-sm text-white/30">첫 메시지를 남겨보세요 ✈️</p>}
      </div>
      <div className="mt-2 flex gap-2">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") send(); }}
          maxLength={300}
          placeholder={`${placeName} 여행 얘기 나누기…`}
          className="flex-1 rounded-2xl border border-white/15 bg-white/5 px-4 py-2.5 text-sm text-white outline-none focus:border-sky-400/60"
        />
        <button
          onClick={send}
          disabled={sending || !text.trim()}
          className="rounded-2xl bg-sky-500 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-sky-400 disabled:opacity-40"
        >
          전송
        </button>
      </div>
    </div>
  );
}

/* ---------- 커뮤니티 게시판 ---------- */
function Board({ place, nick }: { place: string; nick: string }) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [open, setOpen] = useState(false);
  const [kind, setKind] = useState("tip");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [liked, setLiked] = useState<Set<number>>(new Set());

  const load = useCallback(async () => {
    try {
      const r = await fetch(`/api/posts?place=${place}`, { cache: "no-store" });
      const d = await r.json();
      if (Array.isArray(d.posts)) setPosts(d.posts);
    } catch {}
  }, [place]);

  useEffect(() => { load(); }, [load]);

  const submit = async () => {
    if (!title.trim() || !body.trim()) return;
    const r = await fetch("/api/posts", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ place, kind, nick, title, body }),
    });
    const d = await r.json();
    if (d.post) {
      sfx.pop();
      setPosts((p) => [d.post, ...p]);
      setTitle(""); setBody(""); setOpen(false);
    }
  };

  const like = async (id: number) => {
    if (liked.has(id)) return;
    setLiked((s) => new Set(s).add(id));
    setPosts((p) => p.map((x) => (x.id === id ? { ...x, likes: x.likes + 1 } : x)));
    sfx.tap();
    await fetch("/api/posts", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ action: "like", id }),
    });
  };

  return (
    <div className="p-3">
      <button
        onClick={() => { sfx.tap(); setOpen((o) => !o); }}
        className="mb-3 w-full rounded-2xl border border-dashed border-white/20 bg-white/[0.03] py-2.5 text-sm font-semibold text-white/70 transition hover:bg-white/[0.07]"
      >
        {open ? "✕ 닫기" : "✏️ 꿀팁·질문·동행 글 남기기"}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-4 overflow-hidden rounded-2xl bg-black/20 p-3"
          >
            <div className="mb-2 flex flex-wrap gap-1.5">
              {Object.entries(KIND_LABEL).map(([k, label]) => (
                <button
                  key={k}
                  onClick={() => setKind(k)}
                  className={`rounded-full border px-3 py-1 text-xs ${
                    kind === k ? KIND_COLOR[k] : "border-white/15 text-white/50"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={60}
              placeholder="제목"
              className="mb-2 w-full rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-sm text-white outline-none"
            />
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              maxLength={800}
              rows={3}
              placeholder="내용을 적어주세요"
              className="mb-2 w-full resize-none rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-sm text-white outline-none"
            />
            <button
              onClick={submit}
              disabled={!title.trim() || !body.trim()}
              className="w-full rounded-xl bg-emerald-500 py-2 text-sm font-semibold text-white transition hover:bg-emerald-400 disabled:opacity-40"
            >
              올리기
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="space-y-2.5">
        {posts.map((p) => (
          <div key={p.id} className="rounded-2xl border border-white/10 bg-white/[0.03] p-3.5">
            <div className="mb-1 flex items-center gap-2">
              <span className={`rounded-full border px-2 py-0.5 text-[10px] ${KIND_COLOR[p.kind] || ""}`}>
                {KIND_LABEL[p.kind] || p.kind}
              </span>
              <span className="text-xs text-white/40">{p.nick}</span>
              <span className="text-[10px] text-white/25">· {ago(p.created_at)}</span>
            </div>
            <p className="font-semibold text-white/90">{p.title}</p>
            <p className="mt-1 whitespace-pre-wrap text-sm text-white/60">{p.body}</p>
            <button
              onClick={() => like(p.id)}
              className={`mt-2 inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs transition ${
                liked.has(p.id) ? "bg-rose-500/20 text-rose-200" : "bg-white/5 text-white/50 hover:bg-white/10"
              }`}
            >
              ❤️ {p.likes}
            </button>
          </div>
        ))}
        {posts.length === 0 && (
          <p className="py-10 text-center text-sm text-white/30">아직 글이 없어요. 첫 꿀팁을 남겨보세요!</p>
        )}
      </div>
    </div>
  );
}
