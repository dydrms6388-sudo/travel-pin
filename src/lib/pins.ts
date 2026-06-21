"use client";
import { useEffect, useState } from "react";

const KEY = "tp_pins";

export function usePins() {
  const [pins, setPins] = useState<string[]>([]);
  useEffect(() => {
    try {
      setPins(JSON.parse(localStorage.getItem(KEY) || "[]"));
    } catch {
      setPins([]);
    }
  }, []);
  const save = (next: string[]) => {
    setPins(next);
    localStorage.setItem(KEY, JSON.stringify(next));
  };
  const toggle = (id: string) => {
    const next = pins.includes(id) ? pins.filter((p) => p !== id) : [...pins, id];
    save(next);
    return next.includes(id);
  };
  const has = (id: string) => pins.includes(id);
  return { pins, toggle, has };
}

export function getNick(): string {
  if (typeof window === "undefined") return "여행자";
  let n = localStorage.getItem("tp_nick");
  if (!n) {
    const adj = ["설레는", "느긋한", "부지런한", "낭만적인", "용감한", "배고픈", "햇살같은"];
    const noun = ["여행자", "방랑자", "탐험가", "뚜벅이", "미식가", "사진가"];
    n = adj[Math.floor(Math.random() * adj.length)] + " " + noun[Math.floor(Math.random() * noun.length)];
    localStorage.setItem("tp_nick", n);
  }
  return n;
}

export function setNick(n: string) {
  if (typeof window !== "undefined") localStorage.setItem("tp_nick", n.slice(0, 20));
}
