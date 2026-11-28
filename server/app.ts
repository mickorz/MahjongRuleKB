// W3-1：本地只读工作台服务端
// 边界：
// - 只监听 127.0.0.1；Host 必须命中白名单（防 DNS rebinding）
// - 读接口只接受 variant + 固定产物名，绝不接受客户端路径
// - 写入接口（W3-3 起）要求 Origin 同源 + 自定义头；当前阶段只读，写请求一律 405
import { createServer, type IncomingMessage, type Server, type ServerResponse } from "node:http";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { SECTION_TITLES } from "../studio/pipeline/render.ts";
import { viewerHtml } from "./viewer.ts";
import { addMutation, createSession } from "../studio/edit/session.ts";
import { applySession } from "../studio/edit/apply-batch.ts";
import { checkMutation, computeBaseRevision, mutationSchema, mutationToProposalInput } from "../studio/edit/mutation.ts";
import { documentSchema } from "../studio/contracts/document.ts";
import { applyDocumentProposal } from "../studio/transaction/apply.ts";
import { markReviewed, readReviewFile, reviewSummary } from "../studio/review/store.ts";
import { listRevisions, revisionDiff, revisionOverridesBackup } from "./revisions.ts";
import { allRefIds, resolveNames } from "./ref-names.ts";
import { askAssistant, AssistantUnavailable } from "./assistant.ts";

const variantPattern = /^[a-z][a-z0-9-]*$/;

/** 只读产物白名单：客户端只能按名字要这几份，不能拼路径 */
const readableArtifacts = [
  "document.json",
  "quality-report.json",
  "diff-warnings.json",
  "changes.json",
  "需求全文.md",
  "差异视图.md",
  "对照视图.md",
] as const;
type ReadableArtifact = (typeof readableArtifacts)[number];

export type ApiRoute =
  | { kind: "index" }
  | { kind: "document"; variant: string }
  | { kind: "outline"; variant: string }
  | { kind: "checks"; variant: string }
  | { kind: "diffs"; variant: string }
  | { kind: "artifact"; variant: string; name: ReadableArtifact }
  | { kind: "segment"; variant: string; segmentId: string }
  | { kind: "reviews"; variant: string }
  | { kind: "refs"; variant: string }
  | { kind: "revisions"; variant: string }
  | { kind: "revision-diff"; variant: string; revisionId: string }
  | { kind: "fonts-css" }
  | { kind: "font-file"; name: string }
  | { kind: "not-found" };

/** 纯函数路由解析：便于单测，不碰文件系统 */
const fontFilePattern = /^[A-Za-z0-9_-]+\.woff2$/;
const fontsDir = join(dirname(fileURLToPath(import.meta.url)), "fonts");

export function resolveRoute(pathname: string): ApiRoute {
  if (pathname === "/" || pathname === "/index.html") return { kind: "index" };
  if (pathname === "/fonts.css") return { kind: "fonts-css" };
  if (pathname.startsWith("/fonts/")) {
    const name = pathname.slice("/fonts/".length);
    // 只接受 Google 的哈希文件名：无斜杠、无点号穿越
    return fontFilePattern.test(name) ? { kind: "font-file", name } : { kind: "not-found" };
  }
  const parts = pathname.split("/").filter(Boolean).map(decodeURIComponent);
  if (parts[0] !== "api") return { kind: "not-found" };

  if ((parts[1] === "doc" || parts[1] === "checks" || parts[1] === "diffs") && parts.length === 3) {
    const variant = parts[2];
    if (!variantPattern.test(variant)) return { kind: "not-found" };
    if (parts[1] === "doc") return { kind: "document", variant };
    if (parts[1] === "checks") return { kind: "checks", variant };
    return { kind: "diffs", variant };
  }

  if (parts[1] === "outline" && parts.length === 3 && variantPattern.test(parts[2])) {
    return { kind: "outline", variant: parts[2] };
  }

  if (parts[1] === "artifact" && parts.length === 4) {
    const variant = parts[2];
    const name = parts[3];
    if (!variantPattern.test(variant)) return { kind: "not-found" };
    // 名称必须精确命中白名单（不做后缀匹配，防 ../ 与同前缀绕过）
    if (!(readableArtifacts as readonly string[]).includes(name)) return { kind: "not-found" };
    return { kind: "artifact", variant, name: name as ReadableArtifact };
  }

  if (parts[1] === "refs" && parts.length === 3 && variantPattern.test(parts[2])) {
    return { kind: "refs", variant: parts[2] };
  }
  if (parts[1] === "revisions" && parts.length === 3 && variantPattern.test(parts[2])) {
    return { kind: "revisions", variant: parts[2] };
  }
  if (parts[1] === "revisions" && parts.length === 4 && variantPattern.test(parts[2])) {
    return { kind: "revision-diff", variant: parts[2], revisionId: parts[3] };
  }

  if (parts[1] === "reviews" && parts.length === 3 && variantPattern.test(parts[2])) {
    return { kind: "reviews", variant: parts[2] };
  }

  if (parts[1] === "segment" && parts.length === 4) {
    const variant = parts[2];
    if (!variantPattern.test(variant)) return { kind: "not-found" };
    return { kind: "segment", variant, segmentId: parts[3] };
  }

  return { kind: "not-found" };
}

export interface WorkbenchOptions {
  kbRoot?: string;
  /** 允许的 Host（含端口）；缺省按实际端口生成 */
  allowedHosts?: string[];
}

interface SegmentOut {
  segment_id: string;
  text: string;
  lineage: string;
  editable: boolean;
  diff_status: string;
  decision_status: string;
  machine_check_status?: string;
  release_blocker_refs: string[];
  references: Record<string, string[]>;
  base_rule_ref?: string | null;
  base_segment_ref?: string;
}

interface BlockOut {
  block_id: string;
  section_id: string;
  title: string;
  segments: SegmentOut[];
}

/** 读取文档并投影成前端需要的结构（只读投影，不改事实源） */
export function projectDocument(kbRoot: string, variant: string): { ruleset_id: string; document_version: number; base_binding?: unknown; blocks: BlockOut[] } | undefined {
  const file = join(kbRoot, "documents", variant, "document.json");
  if (!existsSync(file)) return undefined;
  const doc = JSON.parse(readFileSync(file, "utf8")) as {
    ruleset_id: string;
    document_version: number;
    base_binding?: unknown;
    blocks: Array<{ block_id: string; section_id: string; content: SegmentOut[] }>;
  };
  return {
    ruleset_id: doc.ruleset_id,
    document_version: doc.document_version,
    ...(doc.base_binding ? { base_binding: doc.base_binding } : {}),
    blocks: doc.blocks.map((b) => ({
      block_id: b.block_id,
      section_id: b.section_id,
      title: SECTION_TITLES[b.section_id] ?? b.section_id,
      segments: b.content.map((seg) => ({
        ...seg,
        refs_display: {
          rules: resolveNames(kbRoot, variant, seg.references?.rule_refs ?? [], "rule"),
          configs: resolveNames(kbRoot, variant, seg.references?.config_refs ?? [], "config"),
        },
      })),
    })),
  };
}

/** 本地开发工具：一律不缓存，避免改了 HTML/API 却看到旧页面 */
const NO_STORE = { "cache-control": "no-store, must-revalidate" } as const;

const json = (res: ServerResponse, status: number, payload: unknown) => {
  const body = JSON.stringify(payload);
  res.writeHead(status, {
    "content-type": "application/json; charset=utf-8",
    "content-length": Buffer.byteLength(body),
    ...NO_STORE,
  });
  res.end(body);
};

const text = (res: ServerResponse, status: number, body: string, contentType = "text/plain; charset=utf-8") => {
  res.writeHead(status, {
    "content-type": contentType,
    "content-length": Buffer.byteLength(body),
    ...NO_STORE,
  });
  res.end(body);
};

/** 主机白名单：拒绝 localhost.evil.com 这类后缀伪装 */
export function hostAllowed(hostHeader: string | undefined, allowed: ReadonlyArray<string>): boolean {
  if (!hostHeader) return false;
  return allowed.includes(hostHeader.toLowerCase());
}

export function createWorkbenchServer(options: WorkbenchOptions = {}): Server {
  const kbRoot = options.kbRoot ?? ".";
  const server = createServer((req, res) => {
    const port = (server.address() as { port: number } | null)?.port ?? 0;
    const allowed = (options.allowedHosts ?? [`127.0.0.1:${port}`, `localhost:${port}`]).map((h) => h.toLowerCase());

    if (!hostAllowed(req.headers.host, allowed)) {
      res.writeHead(403, { "content-type": "text/plain; charset=utf-8" });
      res.end("Host 不被允许");
      return;
    }
    const url = new URL(req.url ?? "/", `http://${req.headers.host}`);

    // 写入接口：必须带自定义头 + 同源 Origin（评审 P1-5）
    if (req.method === "POST") {
      handleWrite(req, res, { kbRoot, url }).catch((e: Error) =>
        json(res, 500, { error: "internal_error", message: e.message }),
      );
      return;
    }
    if (req.method !== "GET" && req.method !== "HEAD") {
      res.writeHead(405, { "content-type": "text/plain; charset=utf-8", allow: "GET, HEAD, POST" });
      res.end("工作台只支持 GET / POST");
      return;
    }

    const route = resolveRoute(url.pathname);

    if (route.kind === "index") {
      const localFonts = existsSync(join(fontsDir, "fonts.css"));
      text(res, 200, viewerHtml({ localFonts }), "text/html; charset=utf-8");
      return;
    }
    if (route.kind === "refs") {
      // 全量 ID → 中文名映射，前端用它把正文里的 ID 换成名字（悬停仍可看 ID）
      const index = { rules: {}, configs: {} } as { rules: Record<string, string>; configs: Record<string, string> };
      for (const kind of ["rules", "configs"] as const) {
        for (const id of allRefIds(kbRoot, route.variant, kind)) {
          const [hit] = resolveNames(kbRoot, route.variant, [id], kind === "rules" ? "rule" : "config");
          index[kind][id] = hit.name;
        }
      }
      return json(res, 200, index);
    }
    if (route.kind === "revisions") {
      return json(res, 200, { revisions: listRevisions(kbRoot, route.variant) });
    }
    if (route.kind === "revision-diff") {
      try {
        return json(res, 200, revisionDiff(kbRoot, route.variant, route.revisionId));
      } catch (e) {
        return json(res, 404, { error: "revision_not_found", message: (e as Error).message });
      }
    }
    if (route.kind === "fonts-css") {
      const file = join(fontsDir, "fonts.css");
      if (!existsSync(file)) return json(res, 404, { error: "fonts_not_fetched" });
      text(res, 200, readFileSync(file, "utf8"), "text/css; charset=utf-8");
      return;
    }
    if (route.kind === "font-file") {
      const file = join(fontsDir, route.name);
      if (!existsSync(file)) return json(res, 404, { error: "font_not_found" });
      res.writeHead(200, {
        "content-type": "font/woff2",
        "cache-control": "public, max-age=31536000, immutable",
        "x-content-type-options": "nosniff",
      });
      res.end(readFileSync(file));
      return;
    }
    if (route.kind === "not-found") {
      json(res, 404, { error: "not_found" });
      return;
    }
    if (route.kind === "document") {
      const doc = projectDocument(kbRoot, route.variant);
      if (!doc) return json(res, 404, { error: "document_not_found", variant: route.variant });
      return json(res, 200, doc);
    }
    if (route.kind === "outline") {
      const doc = projectDocument(kbRoot, route.variant);
      if (!doc) return json(res, 404, { error: "document_not_found" });
      return json(res, 200, doc.blocks.map((b) => ({ section_id: b.section_id, title: b.title, segments: b.segments.length })));
    }
    if (route.kind === "checks" || route.kind === "diffs") {
      const file = join(kbRoot, "documents", route.variant, route.kind === "checks" ? "quality-report.json" : "diff-warnings.json");
      if (!existsSync(file)) return json(res, 404, { error: "artifact_not_found" });
      return json(res, 200, JSON.parse(readFileSync(file, "utf8")));
    }
    if (route.kind === "artifact") {
      const file = join(kbRoot, "documents", route.variant, route.name);
      if (!existsSync(file)) return json(res, 404, { error: "artifact_not_found", name: route.name });
      const content = readFileSync(file, "utf8");
      return route.name.endsWith(".md") ? text(res, 200, content, "text/markdown; charset=utf-8") : json(res, 200, JSON.parse(content));
    }
    if (route.kind === "reviews") {
      const doc = projectDocument(kbRoot, route.variant);
      if (!doc) return json(res, 404, { error: "document_not_found" });
      const file = readReviewFile(kbRoot, route.variant, doc.ruleset_id);
      return json(res, 200, reviewSummary(file, doc.ruleset_id, doc.document_version, doc.blocks.map((b) => b.section_id)));
    }
    if (route.kind === "segment") {
      const doc = projectDocument(kbRoot, route.variant);
      if (!doc) return json(res, 404, { error: "document_not_found" });
      for (const block of doc.blocks) {
        const seg = block.segments.find((s) => s.segment_id === route.segmentId);
        if (seg) return json(res, 200, { ...seg, section_id: block.section_id, section_title: block.title });
      }
      return json(res, 404, { error: "segment_not_found", segment_id: route.segmentId });
    }
    json(res, 404, { error: "not_found" });
  });
  return server;
}

const readBody = (req: IncomingMessage): Promise<unknown> =>
  new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on("data", (c: Buffer) => chunks.push(c));
    req.on("end", () => {
      const raw = Buffer.concat(chunks).toString("utf8");
      // 非 UTF-8 请求体会被解成 U+FFFD，写进去就是永久乱码（Windows 控制台 curl 的典型坑）
      if (raw.includes("\uFFFD")) {
        reject(new Error("请求体不是合法 UTF-8，请以 UTF-8 编码发送"));
        return;
      }
      try {
        resolve(JSON.parse(raw || "{}"));
      } catch (e) {
        reject(new Error(`请求体不是合法 JSON：${(e as Error).message}`));
      }
    });
    req.on("error", reject);
  });

interface WriteContext {
  kbRoot: string;
  url: URL;
}

/** 写接口统一入口：来源校验 → 分流到 proposal / apply / review */
async function handleWrite(req: IncomingMessage, res: ServerResponse, ctx: WriteContext): Promise<void> {
  // CSRF：必须带自定义头（浏览器跨源表单无法自由添加）
  if (req.headers["x-rule-studio"] !== "1") {
    return json(res, 403, { error: "missing_csrf_header", hint: "写入请求必须带 X-Rule-Studio: 1" });
  }
  // Origin：给了就必须同源；缺失视为同源工具调用（curl/测试）
  const origin = req.headers.origin;
  if (origin) {
    let originHost = "";
    try {
      originHost = new URL(origin).host;
    } catch {
      return json(res, 403, { error: "bad_origin" });
    }
    if (originHost.toLowerCase() !== (req.headers.host ?? "").toLowerCase()) {
      return json(res, 403, { error: "cross_origin_denied" });
    }
  }

  let body: Record<string, unknown>;
  try {
    body = (await readBody(req)) as Record<string, unknown>;
  } catch (e) {
    return json(res, 400, { error: "bad_body", message: (e as Error).message });
  }

  const variant = typeof body.variant === "string" ? body.variant : "";
  if (!variantPattern.test(variant)) return json(res, 400, { error: "bad_variant" });

  if (ctx.url.pathname === "/api/proposal") return proposalPreview(res, ctx.kbRoot, variant, body);
  if (ctx.url.pathname === "/api/apply") return applyBatch(res, ctx.kbRoot, variant, body);
  if (ctx.url.pathname === "/api/review") return writeReview(res, ctx.kbRoot, variant, body);
  if (ctx.url.pathname === "/api/restore") return restoreRevision(res, ctx.kbRoot, variant, body);
  if (ctx.url.pathname === "/api/assistant") return assistantReply(res, variant, body);
  return json(res, 404, { error: "not_found" });
}

function loadDocument(kbRoot: string, variant: string) {
  const file = join(kbRoot, "documents", variant, "document.json");
  if (!existsSync(file)) return undefined;
  return documentSchema.parse(JSON.parse(readFileSync(file, "utf8")));
}

/** POST /api/proposal：只预览，不写盘 */
function proposalPreview(res: ServerResponse, kbRoot: string, variant: string, body: Record<string, unknown>): void {
  const document = loadDocument(kbRoot, variant);
  if (!document) return json(res, 404, { error: "document_not_found" });

  const parsed = mutationSchema.safeParse(body.mutation);
  if (!parsed.success) {
    return json(res, 400, {
      error: "bad_mutation",
      issues: parsed.error.issues.map((i) => `${i.path.join(".")} ${i.message}`),
    });
  }
  const check = checkMutation(parsed.data, { document, targetVariant: variant, isBaseDocument: variant === "hangzhou" });
  if (!check.ok) return json(res, 403, { ok: false, reasons: check.reasons });

  const proposal = mutationToProposalInput({
    mutation: parsed.data,
    document,
    rulesetId: document.ruleset_id,
    targetVariant: variant,
  });
  const revision = computeBaseRevision(kbRoot, variant, [`documents/${variant}/editorial-overrides.yaml`]);
  return json(res, 200, {
    ok: true,
    before: check.segment?.before ?? null,
    after: proposal.after_text ?? null,
    proposal,
    base_revision: revision,
  });
}

/** POST /api/apply：一批 mutation 作为一次会话提交（全或无） */
function applyBatch(res: ServerResponse, kbRoot: string, variant: string, body: Record<string, unknown>): void {
  const document = loadDocument(kbRoot, variant);
  if (!document) return json(res, 404, { error: "document_not_found" });

  const raw = Array.isArray(body.mutations) ? body.mutations : [];
  if (raw.length === 0) return json(res, 400, { error: "no_mutations" });

  const mutations = [];
  for (const item of raw) {
    const parsed = mutationSchema.safeParse(item);
    if (!parsed.success) {
      return json(res, 400, {
        error: "bad_mutation",
        issues: parsed.error.issues.map((i) => `${i.path.join(".")} ${i.message}`),
      });
    }
    mutations.push(parsed.data);
  }

  const sessionId = typeof body.session_id === "string" ? body.session_id : `SES-${String(Date.now()).slice(-4)}`;
  try {
    createSession({
      kbRoot,
      sessionId,
      rulesetId: document.ruleset_id,
      targetVariant: variant,
      documentVersion: document.document_version,
    });
    for (const m of mutations) addMutation(kbRoot, variant, sessionId, m);
    const result = applySession({
      kbRoot,
      variant,
      sessionId,
      ...(typeof body.transaction_id === "string" ? { transactionId: body.transaction_id } : {}),
      ...(typeof body.proposal_id === "string" ? { proposalId: body.proposal_id } : {}),
    });
    return json(res, result.ok ? 200 : 409, result);
  } catch (e) {
    return json(res, 409, { ok: false, error: "apply_failed", message: (e as Error).message });
  }
}

/**
 * POST /api/restore：把某个历史版本的「表达层」恢复回来。
 *
 * 为什么不能直接写 document.json：按权限矩阵，document.json 只能由 stage 生成，
 * 事务不得写入（它是产物，不是输入）。真实的输入是 editorial-overrides.yaml，
 * 所以恢复只回写 overrides，文档需要重新生成才能反映。
 */
function restoreRevision(res: ServerResponse, kbRoot: string, variant: string, body: Record<string, unknown>): void {
  const revisionId = typeof body.revision_id === "string" ? body.revision_id : "";
  if (!revisionId) return json(res, 400, { error: "bad_revision" });
  if (!listRevisions(kbRoot, variant).some((r) => r.id === revisionId)) {
    return json(res, 404, { error: "revision_not_found" });
  }

  const backup = revisionOverridesBackup(kbRoot, variant, revisionId);
  if (!backup) return json(res, 409, { ok: false, error: "no_expression_layer", message: "这一版没有表达层快照" });
  if (!backup.existedBefore) {
    return json(res, 409, { ok: false, error: "no_expression_layer", message: "这一版之前还没有表达层改动，无需恢复" });
  }
  if (backup.content === null) {
    return json(res, 409, { ok: false, error: "backup_missing" });
  }

  const current = loadDocument(kbRoot, variant);
  if (!current) return json(res, 404, { error: "document_not_found" });
  const txId = nextId(kbRoot, ".rule-studio/transactions", "TX-");
  const proposalId = nextId(kbRoot, ".rule-studio/changes/active", "DOC-P-");
  try {
    const result = applyDocumentProposal({
      kbRoot,
      transactionId: txId,
      proposalId,
      baseDocumentVersion: current.document_version,
      intent: "apply-expression",
      targetPath: `documents/${variant}/editorial-overrides.yaml`,
      targetContent: backup.content,
    });
    return json(res, 200, {
      ok: true,
      transaction_id: result.transactionId,
      note: "表达层已恢复；document.json 需重新生成才会反映",
    });
  } catch (e) {
    return json(res, 409, { ok: false, error: "restore_failed", message: (e as Error).message });
  }
}

/** 生成下一个 TX-### / DOC-P-### 编号（3 位，存在即递增） */
function nextId(kbRoot: string, relDir: string, prefix: string): string {
  const dir = join(kbRoot, relDir);
  const used = existsSync(dir)
    ? readdirSync(dir)
        .map((n) => new RegExp(`^${prefix}(\d{3})$`).exec(n)?.[1])
        .filter((v): v is string => typeof v === "string")
        .map(Number)
    : [];
  const next = (used.length > 0 ? Math.max(...used) : 0) + 1;
  return prefix + String(next).padStart(3, "0");
}

/** POST /api/assistant：把对话转发给已配置模型；只读上下文，不写任何文件 */
function assistantReply(res: ServerResponse, variant: string, body: Record<string, unknown>): void {
  const turns = Array.isArray(body.messages) ? body.messages : [];
  const messages = turns
    .filter((m): m is { role: string; content: string } =>
      typeof m === "object" && m !== null &&
      (((m as Record<string, unknown>).role === "user") || ((m as Record<string, unknown>).role === "assistant")) &&
      typeof (m as Record<string, unknown>).content === "string")
    .map((m) => ({ role: m.role as "user" | "assistant", content: m.content.slice(0, 4000) }));
  if (messages.length === 0) return json(res, 400, { error: "no_messages" });

  const title = typeof body.title === "string" ? body.title : undefined;
  const excerpt = typeof body.excerpt === "string" ? body.excerpt.slice(0, 6000) : undefined;

  askAssistant({ messages, context: { ...(title ? { title } : {}), ...(excerpt ? { excerpt } : {}) } })
    .then((reply) => json(res, 200, { ...reply, variant }))
    .catch((e: Error) => {
      if (e instanceof AssistantUnavailable) {
        return json(res, 503, { error: "assistant_unavailable", message: e.message });
      }
      return json(res, 502, { error: "assistant_failed", message: e.message });
    });
}

/** POST /api/review：写一条审查记录（actor=server） */
function writeReview(res: ServerResponse, kbRoot: string, variant: string, body: Record<string, unknown>): void {
  const document = loadDocument(kbRoot, variant);
  if (!document) return json(res, 404, { error: "document_not_found" });
  const target = body.target as { type?: string; id?: string } | undefined;
  if (!target || !["document", "section", "segment"].includes(target.type ?? "") || !target.id) {
    return json(res, 400, { error: "bad_target" });
  }
  const status = body.status === "reviewed" ? "reviewed" : body.status === "unreviewed" ? "unreviewed" : undefined;
  if (!status) return json(res, 400, { error: "bad_status" });
  const reviewer = typeof body.reviewer === "string" && body.reviewer.trim() ? body.reviewer.trim() : "策划";

  const file = markReviewed({
    kbRoot,
    variant,
    rulesetId: document.ruleset_id,
    target: { type: target.type as "document" | "section" | "segment", id: target.id },
    status,
    documentVersion: document.document_version,
    reviewer,
    ...(typeof body.note === "string" ? { note: body.note } : {}),
  });
  const summary = reviewSummary(
    file,
    document.ruleset_id,
    document.document_version,
    document.blocks.map((b) => b.section_id),
  );
  return json(res, 200, { ok: true, file, summary });
}

export { viewerHtml };
