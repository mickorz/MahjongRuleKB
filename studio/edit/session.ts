// W4-1：编辑会话与草稿
// 草稿只落在 .rule-studio 运行时目录，不写任何事实源；正式写入必须走 apply。
import { existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { z } from "zod";

import { assertWritable, ROOT_RUNTIME } from "../paths/registry.ts";
import { mutationSchema, type Mutation } from "./mutation.ts";

export const sessionSchema = z
  .object({
    session_id: z.string().regex(/^SES-\d{4,}$/, "session_id 形如 SES-0001"),
    ruleset_id: z.string().min(1),
    target_variant: z.string().min(1),
    /** 基于哪个文档版本开始编辑：应用时若版本变了要提醒 */
    based_on_document_version: z.number().int().nonnegative(),
    created_at: z.string().datetime(),
    updated_at: z.string().datetime(),
    mutations: z.array(mutationSchema),
  })
  .strict();
export type EditSession = z.infer<typeof sessionSchema>;

export const DRAFTS_ROOT = `${ROOT_RUNTIME}/drafts`;

function sessionFile(kbRoot: string, variant: string, sessionId: string): string {
  const relative = assertWritable("stage", "generate", `${DRAFTS_ROOT}/${variant}/${sessionId}.json`);
  return join(kbRoot, relative);
}

export interface CreateSessionInput {
  kbRoot: string;
  sessionId: string;
  rulesetId: string;
  targetVariant: string;
  documentVersion: number;
  now?: string;
}

export function createSession(input: CreateSessionInput): EditSession {
  const now = input.now ?? new Date().toISOString();
  const session = sessionSchema.parse({
    session_id: input.sessionId,
    ruleset_id: input.rulesetId,
    target_variant: input.targetVariant,
    based_on_document_version: input.documentVersion,
    created_at: now,
    updated_at: now,
    mutations: [],
  });
  const file = sessionFile(input.kbRoot, input.targetVariant, input.sessionId);
  mkdirSync(join(file, ".."), { recursive: true });
  writeFileSync(file, `${JSON.stringify(session, null, 2)}\n`, "utf8");
  return session;
}

export function readSession(kbRoot: string, variant: string, sessionId: string): EditSession {
  const file = sessionFile(kbRoot, variant, sessionId);
  if (!existsSync(file)) throw new Error(`编辑会话不存在：${sessionId}`);
  return sessionSchema.parse(JSON.parse(readFileSync(file, "utf8")));
}

function save(kbRoot: string, session: EditSession): EditSession {
  const parsed = sessionSchema.parse({ ...session, updated_at: new Date().toISOString() });
  writeFileSync(sessionFile(kbRoot, session.target_variant, session.session_id), `${JSON.stringify(parsed, null, 2)}\n`, "utf8");
  return parsed;
}

/** 添加一条编辑；同一片段的后一次编辑覆盖前一次（避免堆积互相矛盾的改动） */
export function addMutation(kbRoot: string, variant: string, sessionId: string, mutation: Mutation): EditSession {
  const session = readSession(kbRoot, variant, sessionId);
  const rest = session.mutations.filter(
    (m) => !(m.target.segment_id && m.target.segment_id === mutation.target.segment_id && m.op === mutation.op),
  );
  return save(kbRoot, { ...session, mutations: [...rest, mutation] });
}

export function listSessions(kbRoot: string, variant: string): string[] {
  const dir = join(kbRoot, DRAFTS_ROOT, variant);
  return existsSync(dir) ? readdirSync(dir).map((f) => f.replace(/\.json$/, "")) : [];
}

export function discardSession(kbRoot: string, variant: string, sessionId: string): void {
  const file = sessionFile(kbRoot, variant, sessionId);
  if (existsSync(file)) rmSync(file);
}

/** 草稿是否会与当前文档版本冲突（版本前进即需要重新确认） */
export function sessionDrift(session: EditSession, currentDocumentVersion: number): string | undefined {
  if (session.based_on_document_version === currentDocumentVersion) return undefined;
  return `草稿基于文档版本 ${session.based_on_document_version}，当前已是 ${currentDocumentVersion}：请重新确认改动`;
}
