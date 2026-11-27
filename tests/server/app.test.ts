// W3-1：只读工作台服务端测试（本地临时端口，不依赖外部服务）
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import type { Server } from "node:http";
import { mkdirSync, rmSync, writeFileSync } from "node:fs";
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
      references: { requirement_refs: [], rule_refs: ["XS-R-ZHUANGJIA-02"], config_refs: [], source_evidence_refs: [] },
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

  it("首页返回三栏 HTML", async () => {
    const res = await fetch(`${base}/`);
    expect(res.status).toBe(200);
    const html = await res.text();
    expect(html).toContain("Rule Studio 需求文档工作台");
    expect(html).toContain("<nav>");
    expect(html).toContain("<aside>");
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

  it("写请求一律 405（只读阶段）", async () => {
    for (const method of ["POST", "PUT", "DELETE"] as const) {
      const res = await fetch(`${base}/api/doc/xiaoshan`, { method });
      expect(res.status, method).toBe(405);
      expect(res.headers.get("allow")).toContain("GET");
    }
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
