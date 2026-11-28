// W3-1：只读工作台服务端测试（本地临时端口，不依赖外部服务）
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import type { Server } from "node:http";
import { mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";

import { createWorkbenchServer, hostAllowed, projectDocument, resolveRoute } from "../../server/app.ts";

const doc = (variant: string) => ({
  ruleset_id: variant === "hangzhou" ? "hangzhou-friends-4p" : "xiaoshan-friends-4p",
  target_variant: variant,
  template_version: "1.0.0",
  ruleset_version: "1.2.0",
  document_version: 3,
  blocks: [
    {
      block_id: "DOC-XS-000001",
      logical_block_id: "LBL-OPENING-01",
      section_id: "opening",
      type: "paragraph",
      document_version: 3,
      content: [
        {
          segment_id: "SEG-000001",
          text: "首局从四名参战玩家中随机确定庄家。",
          editable: true,
          lineage: "modified",
          decision_status: "confirmed",
          diff_status: "candidate",
          release_blocker_refs: [],
          references: {
            requirement_refs: [],
            rule_refs: ["XS-R-ZHUANGJIA-02"],
            config_refs: [],
            source_evidence_refs: ["rulebook/sources/xiaoshan/xiaoshan-rules.md#R-BANK-02"],
          },
          base_rule_ref: "HJ-R-LUNZHUANG",
        },
      ],
      references: {
        requirement_refs: [],
        rule_refs: ["XS-R-ZHUANGJIA-02"],
        config_refs: [],
        source_evidence_refs: ["rulebook/sources/xiaoshan/xiaoshan-rules.md#R-BANK-02"],
      },
    },
  ],
  segment_lineage: [],
});

describe("W3-1 路由解析（纯函数）", () => {
  it("已知路由", () => {
    expect(resolveRoute("/")).toEqual({ kind: "index" });
    expect(resolveRoute("/api/doc/xiaoshan")).toEqual({ kind: "document", variant: "xiaoshan" });
    expect(resolveRoute("/api/outline/xiaoshan")).toEqual({ kind: "outline", variant: "xiaoshan" });
    expect(resolveRoute("/api/checks/xiaoshan")).toEqual({ kind: "checks", variant: "xiaoshan" });
  });

  it("产物名必须精确命中白名单", () => {
    expect(resolveRoute("/api/artifact/xiaoshan/需求全文.md")).toEqual({
      kind: "artifact",
      variant: "xiaoshan",
      name: "需求全文.md",
    });
    for (const bad of ["../../etc/passwd", "document.json.bak", "需求全文", "secrets.json"]) {
      expect(resolveRoute(`/api/artifact/xiaoshan/${encodeURIComponent(bad)}`), bad).toEqual({ kind: "not-found" });
    }
  });

  it("变体名不合法一律 not-found", () => {
    for (const bad of ["../hungzhou", "XiaoShan", "xiaoshan/../hangzhou", "."]) {
      expect(resolveRoute(`/api/doc/${encodeURIComponent(bad)}`)).toEqual({ kind: "not-found" });
    }
  });

  it("Host 白名单拒绝后缀伪装", () => {
    const allowed = ["127.0.0.1:4173", "localhost:4173"];
    expect(hostAllowed("127.0.0.1:4173", allowed)).toBe(true);
    expect(hostAllowed("LOCALHOST:4173", allowed)).toBe(true);
    expect(hostAllowed("localhost:4173.evil.com", allowed)).toBe(false);
    expect(hostAllowed("192.168.1.2:4173", allowed)).toBe(false);
    expect(hostAllowed(undefined, allowed)).toBe(false);
  });
});

describe("W3-1 HTTP 行为", () => {
  let kb: string;
  let server: Server;
  let base: string;

  beforeEach(async () => {
    kb = join(tmpdir(), `kb-srv-${process.pid}-${Date.now()}-${Math.random().toString(16).slice(2)}`);
    mkdirSync(join(kb, "documents/xiaoshan"), { recursive: true });
    writeFileSync(join(kb, "documents/xiaoshan/document.json"), JSON.stringify(doc("xiaoshan")), "utf8");
    writeFileSync(join(kb, "documents/xiaoshan/需求全文.md"), "# 萧山\n", "utf8");
    writeFileSync(
      join(kb, "documents/xiaoshan/quality-report.json"),
      JSON.stringify({ status: "passed", summary: { total: 0, failed: 0, warning: 0 }, findings: [] }),
      "utf8",
    );
    writeFileSync(join(kb, "documents/xiaoshan/diff-warnings.json"), JSON.stringify({ findings: [], byRule: {} }), "utf8");

    server = createWorkbenchServer({ kbRoot: kb });
    await new Promise<void>((r) => server.listen(0, "127.0.0.1", () => r()));
    const port = (server.address() as { port: number }).port;
    base = `http://127.0.0.1:${port}`;
  });

  afterEach(async () => {
    await new Promise<void>((r) => server.close(() => r()));
    rmSync(kb, { recursive: true, force: true });
  });

  it("首页返回两栏 HTML", async () => {
    const res = await fetch(`${base}/`);
    expect(res.status).toBe(200);
    const html = await res.text();
    // S1：界面文案全中文，不出现拼音与 ruleset_id
    expect(html).toContain("策划工作台");
    expect(html).toContain("杭州");
    expect(html).toContain("萧山");
    expect(html).not.toContain(">Rule Studio<");
    // 顶栏只保留品牌 + 玩法切换（1-8 步骤圆点已移除）
    expect(html).not.toContain('id="steps"');
    expect(html).toContain('id="variants"');
    // S1/S2：外壳不滚 + 可拖拽分栏 + 状态栏
    expect(html).toContain('data-layout="two-pane"');
    expect(html).toContain('class="splitter"');
    expect(html).toContain('aria-label="状态栏"');
    expect(html).toContain('id="pane-nav"');
    // 右栏（来源）已合并进卡片脚注
    expect(html).not.toContain('id="pane-aside"');
    expect(html).toContain('class="doc-col"');
  });

  it("文档接口返回投影结构（章节标题已翻译）", async () => {
    const res = await fetch(`${base}/api/doc/xiaoshan`);
    expect(res.status).toBe(200);
    const body = (await res.json()) as { blocks: Array<{ title: string; segments: Array<{ lineage: string }> }> };
    expect(body.blocks[0].title).toBe("开局与发牌");
    expect(body.blocks[0].segments[0].lineage).toBe("modified");
  });

  it("段来源接口给出引用与原文证据", async () => {
    const res = await fetch(`${base}/api/segment/xiaoshan/SEG-000001`);
    const body = (await res.json()) as { references: { rule_refs: string[]; source_evidence_refs: string[] }; section_title: string };
    expect(body.references.rule_refs).toEqual(["XS-R-ZHUANGJIA-02"]);
    expect(body.references.source_evidence_refs[0]).toContain("xiaoshan-rules.md");
    expect(body.section_title).toBe("开局与发牌");
  });

  it("Markdown 产物按 text/markdown 返回", async () => {
    const res = await fetch(`${base}/api/artifact/xiaoshan/${encodeURIComponent("需求全文.md")}`);
    expect(res.status).toBe(200);
    expect(res.headers.get("content-type")).toContain("text/markdown");
  });

  it("不存在的变体 / 产物 → 404", async () => {
    expect((await fetch(`${base}/api/doc/hangzhou`)).status).toBe(404);
    expect((await fetch(`${base}/api/artifact/xiaoshan/${encodeURIComponent("changes.json")}`)).status).toBe(404);
  });

  it("非 GET/POST 方法 405；POST 无 CSRF 头 403", async () => {
    for (const method of ["PUT", "DELETE"] as const) {
      const res = await fetch(`${base}/api/doc/xiaoshan`, { method });
      expect(res.status, method).toBe(405);
      expect(res.headers.get("allow")).toContain("POST");
    }
    const res = await fetch(`${base}/api/doc/xiaoshan`, { method: "POST" });
    expect(res.status).toBe(403);
  });

  it("Host 不在白名单 → 403（DNS rebinding 防护）", async () => {
    // fetch 禁止覆盖 Host，必须用原始 http.request
    const { request } = await import("node:http");
    const url = new URL(base);
    const status = await new Promise<number>((resolve, reject) => {
      const req = request(
        { hostname: url.hostname, port: url.port, path: "/api/doc/xiaoshan", headers: { host: `evil.example.com:${url.port}` } },
        (res) => {
          res.resume();
          resolve(res.statusCode ?? 0);
        },
      );
      req.on("error", reject);
      req.end();
    });
    expect(status).toBe(403);
  });

  it("不返回 CORS 头（避免被第三方页面读取）", async () => {
    const res = await fetch(`${base}/api/doc/xiaoshan`, { headers: { origin: "https://evil.example.com" } });
    expect(res.headers.get("access-control-allow-origin")).toBeNull();
  });
});

describe("W3-1 文档投影", () => {
  it("缺失文档返回 undefined", () => {
    const kb = join(tmpdir(), `kb-proj-${Date.now()}`);
    mkdirSync(kb, { recursive: true });
    expect(projectDocument(kb, "xiaoshan")).toBeUndefined();
    rmSync(kb, { recursive: true, force: true });
  });
});

describe("W3-4 写接口", () => {
  let kb: string;
  let server: Server;
  let base: string;
  const headers = { "content-type": "application/json", "x-rule-studio": "1" };

  beforeEach(async () => {
    kb = join(tmpdir(), `kb-w34-${process.pid}-${Date.now()}-${Math.random().toString(16).slice(2)}`);
    mkdirSync(join(kb, "documents/xiaoshan"), { recursive: true });
    mkdirSync(join(kb, ".rule-studio/transactions"), { recursive: true });
    const d = doc("xiaoshan") as unknown as { blocks: Array<{ content: Array<Record<string, unknown>> }> };
    // 让片段可编辑：lineage=modified 且 editable=true（夹具默认已是 modified）
    writeFileSync(join(kb, "documents/xiaoshan/document.json"), JSON.stringify(d), "utf8");
    writeFileSync(join(kb, "documents/xiaoshan/editorial-overrides.yaml"), "- overrides: []\n", "utf8");
    server = createWorkbenchServer({ kbRoot: kb });
    await new Promise<void>((r) => server.listen(0, "127.0.0.1", () => r()));
    base = `http://127.0.0.1:${(server.address() as { port: number }).port}`;
  });

  afterEach(async () => {
    await new Promise<void>((r) => server.close(() => r()));
    rmSync(kb, { recursive: true, force: true });
  });

  const mutation = { target: { segment_id: "SEG-000001" }, op: "replace-text", text: "改写后的段落", source: "richtext", rationale: "编辑" };

  it("缺 CSRF 头的写请求被拒", async () => {
    const res = await fetch(`${base}/api/proposal`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ variant: "xiaoshan", mutation }),
    });
    expect(res.status).toBe(403);
    expect(((await res.json()) as { error: string }).error).toBe("missing_csrf_header");
  });

  it("跨源 Origin 被拒", async () => {
    const res = await fetch(`${base}/api/proposal`, {
      method: "POST",
      headers: { ...headers, origin: "https://evil.example.com" },
      body: JSON.stringify({ variant: "xiaoshan", mutation }),
    });
    expect(res.status).toBe(403);
  });

  it("proposal 返回改动前后与基线版本，但不写盘", async () => {
    const res = await fetch(`${base}/api/proposal`, {
      method: "POST",
      headers,
      body: JSON.stringify({ variant: "xiaoshan", mutation }),
    });
    expect(res.status).toBe(200);
    const body = (await res.json()) as { ok: boolean; before: string; after: string; base_revision: { document_version: number } };
    expect(body.ok).toBe(true);
    expect(body.after).toBe("改写后的段落");
    expect(body.before.length).toBeGreaterThan(0);
    expect(body.base_revision.document_version).toBe(3);
    // 未写盘
    expect(readFileSync(join(kb, "documents/xiaoshan/editorial-overrides.yaml"), "utf8")).toBe("- overrides: []\n");
  });

  it("proposal 对继承片段返回 403 与原因", async () => {
    const d = JSON.parse(readFileSync(join(kb, "documents/xiaoshan/document.json"), "utf8")) as {
      blocks: Array<{ content: Array<Record<string, unknown>> }>;
    };
    d.blocks[0].content[0].lineage = "default_inherited";
    d.blocks[0].content[0].base_rule_ref = "HJ-R-DINGZHUANG";
    writeFileSync(join(kb, "documents/xiaoshan/document.json"), JSON.stringify(d), "utf8");
    const res = await fetch(`${base}/api/proposal`, {
      method: "POST",
      headers,
      body: JSON.stringify({ variant: "xiaoshan", mutation }),
    });
    expect(res.status).toBe(403);
    expect(JSON.stringify(await res.json())).toMatch(/继承/);
  });

  it("apply 落盘并升版本", async () => {
    const res = await fetch(`${base}/api/apply`, {
      method: "POST",
      headers,
      body: JSON.stringify({ variant: "xiaoshan", mutations: [mutation], transaction_id: "TX-001", proposal_id: "DOC-P-001" }),
    });
    expect(res.status).toBe(200);
    const body = (await res.json()) as { ok: boolean; applied: number; documentVersionAfter: number };
    expect(body.ok, JSON.stringify(body)).toBe(true);
    expect(body.applied).toBe(1);
    expect(body.documentVersionAfter).toBe(4);

    const overrides = readFileSync(join(kb, "documents/xiaoshan/editorial-overrides.yaml"), "utf8");
    expect(overrides).toContain("改写后的段落");
  });

  it("请求体含 U+FFFD（非 UTF-8）→ 400，不写盘", async () => {
    const before = readFileSync(join(kb, "documents/xiaoshan/editorial-overrides.yaml"), "utf8");
    const res = await fetch(`${base}/api/apply`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        variant: "xiaoshan",
        mutations: [{ segment_id: "SEG-000105", op: "replace-text", text: "��乱码" }],
      }),
    });
    expect(res.status).toBe(400);
    expect(((await res.json()) as { error: string }).error).toBe("bad_body");
    expect(readFileSync(join(kb, "documents/xiaoshan/editorial-overrides.yaml"), "utf8")).toBe(before);
  });

  it("apply 空批次 → 400", async () => {
    const res = await fetch(`${base}/api/apply`, { method: "POST", headers, body: JSON.stringify({ variant: "xiaoshan", mutations: [] }) });
    expect(res.status).toBe(400);
  });

  it("未知写路径 → 404", async () => {
    const res = await fetch(`${base}/api/nope`, { method: "POST", headers, body: JSON.stringify({ variant: "xiaoshan" }) });
    expect(res.status).toBe(404);
  });
});
