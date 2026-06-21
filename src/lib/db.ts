import { neon } from "@neondatabase/serverless";

// 격리 스키마 travelpin — factory 스키마와 분리
const sql = neon(process.env.DATABASE_URL || "");

let initialized = false;

export async function ensureSchema() {
  if (initialized) return;
  await sql`CREATE SCHEMA IF NOT EXISTS travelpin`;
  await sql`
    CREATE TABLE IF NOT EXISTS travelpin.messages (
      id BIGSERIAL PRIMARY KEY,
      place TEXT NOT NULL,
      nick TEXT NOT NULL,
      body TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )`;
  await sql`CREATE INDEX IF NOT EXISTS idx_msg_place ON travelpin.messages (place, id)`;
  await sql`
    CREATE TABLE IF NOT EXISTS travelpin.posts (
      id BIGSERIAL PRIMARY KEY,
      place TEXT NOT NULL,
      kind TEXT NOT NULL DEFAULT 'tip',
      nick TEXT NOT NULL,
      title TEXT NOT NULL,
      body TEXT NOT NULL,
      likes INT NOT NULL DEFAULT 0,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )`;
  await sql`CREATE INDEX IF NOT EXISTS idx_post_place ON travelpin.posts (place, id DESC)`;
  initialized = true;
}

export { sql };

export function clean(s: unknown, max = 500): string {
  if (typeof s !== "string") return "";
  return s.replace(/\s+/g, " ").trim().slice(0, max);
}
