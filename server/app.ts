// W3-1：本地只读工作台服务端
// 边界：
// - 只监听 127.0.0.1；Host 必须命中白名单（防 DNS rebinding）
// - 读接口只接受 variant + 固定产物名，绝不接受客户端路径
// - 写入接口（W3-3 起）要求 Origin 同源 + 自定义头；当前阶段只读，写请求一律 405
import { createServer, type IncomingMessage, type Server, type ServerResponse } from "node:http";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { SECTION_TITLES } from "../studio/pipeline/render.ts";

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
  | { kind: "not-found" };

/** 纯函数路由解析：便于单测，不碰文件系统 */
export function resolveRoute(pathname: string): ApiRoute {
  if (pathname === "/" || pathname === "/index.html") return { kind: "index" };
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
      segments: b.content,
    })),
  };
}

const json = (res: ServerResponse, status: number, payload: unknown) => {
  const body = JSON.stringify(payload);
  res.writeHead(status, { "content-type": "application/json; charset=utf-8", "content-length": Buffer.byteLength(body) });
  res.end(body);
};

const text = (res: ServerResponse, status: number, body: string, contentType = "text/plain; charset=utf-8") => {
  res.writeHead(status, { "content-type": contentType, "content-length": Buffer.byteLength(body) });
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
    // 只读阶段：任何写入一律拒绝，且不回 CORS 头
    if (req.method !== "GET" && req.method !== "HEAD") {
      res.writeHead(405, { "content-type": "text/plain; charset=utf-8", allow: "GET, HEAD" });
      res.end("只读工作台：仅支持 GET");
      return;
    }

    const url = new URL(req.url ?? "/", `http://${req.headers.host}`);
    const route = resolveRoute(url.pathname);

    if (route.kind === "index") {
      text(res, 200, viewerHtml(), "text/html; charset=utf-8");
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

/** 无构建前端：三栏只读视图。故意不引入框架，W3-2 需要交互再换。 */
export function viewerHtml(): string {
  return `<!doctype html>
<html lang="zh-CN">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>Rule Studio 需求文档工作台</title>
<style>
  :root { color-scheme: light dark; }
  body { margin:0; font:14px/1.6 system-ui, -apple-system, "Segoe UI", sans-serif; display:flex; height:100vh; }
  nav { width:240px; border-right:1px solid #8884; overflow:auto; padding:12px; }
  main { flex:1; overflow:auto; padding:16px 24px; }
  aside { width:320px; border-left:1px solid #8884; overflow:auto; padding:12px; }
  h2 { font-size:16px; margin:20px 0 8px; }
  .seg { margin:6px 0; padding:8px 10px; border-radius:6px; border-left:3px solid transparent; }
  .seg[data-lineage="modified"] { border-left-color:#e08a1e; background:#e08a1e14; }
  .seg[data-lineage="added"] { border-left-color:#2f9e44; background:#2f9e4414; }
  .seg[data-lineage$="inherited"] { border-left-color:#1c7ed6; background:#1c7ed60f; }
  .badge { font-size:11px; padding:0 5px; border-radius:4px; border:1px solid currentColor; margin-right:4px; opacity:.85; }
  .locked { opacity:.85; }
  .muted { opacity:.6; font-size:12px; }
  .warn { color:#c92a2a; }
  button.link { background:none; border:none; color:inherit; text-decoration:underline; cursor:pointer; font-size:12px; padding:0; }
  .sources { font-size:12px; white-space:pre-wrap; }
</style>
</head>
<body>
<nav>
  <strong>文档</strong>
  <div id="variants"></div>
  <div id="toc"></div>
</nav>
<main id="doc"><p class="muted">选择左侧文档</p></main>
<aside>
  <strong>信息面板</strong>
  <div id="checks" class="muted"></div>
  <hr />
  <div id="sources" class="sources muted">点击段落查看来源</div>
</aside>
<script>
const variants = ["hangzhou", "xiaoshan"];
const el = (id) => document.getElementById(id);

function badge(text, cls = "") {
  const span = document.createElement("span");
  span.className = "badge " + cls;
  span.textContent = text;
  return span;
}

async function loadDoc(variant) {
  const res = await fetch("/api/doc/" + variant);
  if (!res.ok) { el("doc").innerHTML = '<p class="warn">文档不存在：' + variant + '</p>'; return; }
  const doc = await res.json();
  el("doc").innerHTML = "";
  const h1 = document.createElement("h1");
  h1.textContent = doc.ruleset_id + "（文档版本 " + doc.document_version + "）";
  el("doc").appendChild(h1);

  const toc = el("toc");
  toc.innerHTML = "<hr /><strong>章节</strong>";
  for (const block of doc.blocks) {
    const h2 = document.createElement("h2");
    h2.textContent = block.title;
    h2.id = "sec-" + block.section_id;
    el("doc").appendChild(h2);
    const link = document.createElement("div");
    const btn = document.createElement("button");
    btn.className = "link";
    btn.textContent = block.title;
    btn.onclick = () => h2.scrollIntoView({ behavior: "smooth" });
    link.appendChild(btn);
    toc.appendChild(link);

    for (const seg of block.segments) {
      const div = document.createElement("div");
      div.className = "seg" + (seg.editable ? "" : " locked");
      div.dataset.lineage = seg.lineage;
      if (seg.lineage === "modified") div.appendChild(badge("修改"));
      if (seg.lineage === "added") div.appendChild(badge("新增"));
      if (seg.lineage.endsWith("inherited")) div.appendChild(badge("继承"));
      if (seg.diff_status === "candidate") div.appendChild(badge("差异待确认"));
      if (seg.release_blocker_refs && seg.release_blocker_refs.length) div.appendChild(badge("待裁决 " + seg.release_blocker_refs.join("、")));
      if (!seg.editable) div.appendChild(badge("数值·不可改写"));
      if (!seg.editable || seg.lineage.endsWith("inherited") || seg.lineage === "base") div.appendChild(badge("只读"));
      const p = document.createElement("span");
      p.textContent = " " + seg.text;
      div.appendChild(p);
      div.onclick = () => showSources(variant, seg.segment_id);
      el("doc").appendChild(div);
    }
  }
  loadChecks(variant);
}

async function showSources(variant, segmentId) {
  const res = await fetch("/api/segment/" + variant + "/" + segmentId);
  if (!res.ok) { el("sources").textContent = "找不到该段落"; return; }
  const seg = await res.json();
  el("sources").textContent = [
    "段落：" + seg.segment_id,
    "章节：" + seg.section_title,
    "归属：" + seg.lineage + "｜差异：" + seg.diff_status + "｜机器检查：" + (seg.machine_check_status || "未检查"),
    "规则：" + (seg.references.rule_refs.join("、") || "—"),
    "配置：" + (seg.references.config_refs.join("、") || "—"),
    "原文证据：" + (seg.references.source_evidence_refs.join("\\n") || "—"),
  ].join("\\n");
}

async function loadChecks(variant) {
  const box = el("checks");
  box.textContent = "";
  for (const [label, url] of [["质量报告", "/api/checks/"], ["差异告警", "/api/diffs/"]]) {
    const res = await fetch(url + variant);
    if (!res.ok) continue;
    const data = await res.json();
    const line = document.createElement("div");
    if (label === "质量报告") {
      line.textContent = label + "：" + data.status + "（failed " + data.summary.failed + " / warning " + data.summary.warning + "）";
      line.className = data.summary.failed ? "warn" : "";
    } else {
      line.textContent = label + "：" + (data.findings || []).length + " 条";
    }
    box.appendChild(line);
  }
}

const nav = el("variants");
for (const v of variants) {
  const btn = document.createElement("button");
  btn.className = "link";
  btn.textContent = v;
  btn.onclick = () => loadDoc(v);
  nav.appendChild(btn);
  nav.appendChild(document.createElement("br"));
}
loadDoc("xiaoshan");
</script>
</body>
</html>
`;
}
