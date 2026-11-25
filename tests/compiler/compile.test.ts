// 编译结果测试：数量公式、引用闭合、溯源保留、配置合并、重新编译无 diff
import { describe, it, expect, beforeAll } from "vitest";
import { execSync } from "node:child_process";
import { readFileSync, readdirSync, existsSync, mkdtempSync, rmSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { createHash } from "node:crypto";
import { parse as parseYaml } from "yaml";
import { splitFrontMatter, loadRuleset } from "../../compiler/validator.ts";
import { DEFAULT_PATHS, main as compileTo } from "../../compiler/compile.ts";

function walk(dir: string): string[] {
  const out: string[] = [];
  for (const n of readdirSync(dir)) {
    const p = join(dir, n);
    if (existsSync(p) && !p.endsWith(".md") && !p.endsWith(".yaml") && !p.endsWith(".json")) {
      try {
        out.push(...walk(p));
      } catch {
        /* 文件 */
      }
    } else out.push(p);
  }
  return out;
}

function loadCompiled(dir: string) {
  const rules = readdirSync(dir, { recursive: true })
    .filter((f) => String(f).endsWith(".md") && !String(f).includes("compile-report"))
    .map((f) => join(dir, String(f)))
    .sort()
    .map((file) => {
      const { meta, body } = splitFrontMatter(readFileSync(file, "utf8"));
      return { meta: meta as { id: string; change_type?: string; base_rule_ref?: string; compares_to?: string[]; depends_on: string[] }, body, file };
    });
  const config = parseYaml(readFileSync(join(dir, "config.yaml"), "utf8")) as { id: string; value: unknown; status?: string; compiled_origin: string }[];
  const configUi = parseYaml(readFileSync(join(dir, "config.ui.yaml"), "utf8")) as { id: string }[];
  const manifest = parseYaml(readFileSync(join(dir, "manifest.yaml"), "utf8")) as Record<string, unknown>;
  const index = JSON.parse(readFileSync(join(dir, "rule-index.json"), "utf8")) as { rule_aliases: Record<string, string> };
  return { rules, config, configUi, manifest, index };
}

describe("rulebook/compiled/xiaoshan", () => {
  const c = loadCompiled("rulebook/compiled/xiaoshan");
  const base = loadRuleset("rulebook/specs/base/hangzhou");
  const variant = loadRuleset("rulebook/specs/variants/xiaoshan");

  it("规则总数 = 杭州 N + 萧山 added b（inherited 不生成新卡，modified 替换不加数）", () => {
    const added = variant.rules.filter((r) => r.meta.origin === "variant" && r.meta.change_type === "added").length;
    expect(c.rules.length).toBe(base.rules.length + added);
    expect(c.rules.length).toBe(61 + 25);
  });

  it("被 modified 的杭州卡不在产物中，对应的萧山卡在", () => {
    const ids = new Set(c.rules.map((r) => r.meta.id as string));
    const modified = variant.rules.filter((r) => r.meta.origin === "variant" && r.meta.change_type === "modified");
    for (const r of modified) {
      const m = r.meta as { base_rule_ref: string };
      expect(ids.has(m.base_rule_ref), `${m.base_rule_ref} 应被替换`).toBe(false);
      expect(ids.has(r.meta.id), `${r.meta.id} 应在产物中`).toBe(true);
    }
  });

  it("rule_aliases 记录 HJ→XS（modified）和 XS→HJ（inherited），无双向映射", () => {
    const a = c.index.rule_aliases;
    expect(a["HJ-R-JIAGANG"]).toBe("XS-R-HUPAI-02");
    expect(a["XS-R-ZHUANGJIA-01"]).toBe("HJ-R-DINGZHUANG");
    expect(a["HJ-C-QIANGGANGHU"]).toBe("XS-C-QIANGGANGHU");
    for (const [k, v] of Object.entries(a)) expect(a[v], `${k} ↔ ${v}`).not.toBe(k);
  });

  it("溯源字段保留：modified 卡的 base_rule_ref 指向原始杭州卡", () => {
    for (const r of c.rules) {
      const m = r.meta as { change_type?: string; base_rule_ref?: string };
      if (m.change_type === "modified") {
        expect(m.base_rule_ref).toBeDefined();
        expect(base.rules.find((b) => b.meta.id === m.base_rule_ref), `${r.meta.id} base_rule_ref ${m.base_rule_ref}`).toBeDefined();
      }
    }
  });

  it("编译后依赖引用闭合：所有 depends_on 和正文引用都能在产物里找到", () => {
    const ids = new Set([...c.rules.map((r) => r.meta.id as string), ...c.config.map((x) => x.id), ...c.configUi.map((x) => x.id)]);
    for (const r of c.rules) {
      for (const d of (r.meta as { depends_on: string[] }).depends_on) expect(ids.has(d), `${r.meta.id} depends_on ${d}`).toBe(true);
      for (const ref of r.body.matchAll(/`((?:HJ|XS)-[CRFKNMTPVIA]-[A-Z0-9]+(?:-[A-Z0-9]+)*)`/g)) {
        expect(ids.has(ref[1]), `${r.meta.id} 正文引用 ${ref[1]}`).toBe(true);
      }
    }
  });

  it("被替换卡的旧 ID 在产物正文中无残留（只允许在 base_rule_ref / compares_to 溯源字段）", () => {
    for (const r of c.rules) {
      const m = r.meta as { base_rule_ref?: string; compares_to?: string[] };
      const trace = new Set([...(m.compares_to ?? []), m.base_rule_ref ?? ""]);
      for (const ref of r.body.matchAll(/`((?:HJ)-[A-Z0-9-]+)`/g)) {
        const id = ref[1];
        if (trace.has(id)) continue;
        // 正文里引用的 HJ ID 必须仍在产物中（规则卡或配置项）
        const stillThere = c.rules.some((x) => x.meta.id === id) || c.config.some((x) => x.id === id) || c.configUi.some((x) => x.id === id);
        expect(stillThere, `${r.meta.id} 正文残留已替换的 ${id}`).toBe(true);
      }
    }
  });

  it("配置合并：inherited 取杭州值并带入萧山 status；modified 用萧山值；未提及的继承", () => {
    const joker = c.config.find((x) => x.id === "HJ-C-CAISHEN")!;
    expect(joker.value).toBe("white_dragon");
    expect(joker.status).toBe("disputed");
    const qiang = c.config.find((x) => x.id === "XS-C-QIANGGANGHU")!;
    expect(qiang.value).toBe("disabled");
    expect(c.config.find((x) => x.id === "HJ-C-QIANGGANGHU")).toBeUndefined();
    const cap = c.config.find((x) => x.id === "XS-C-TUODI-EDU")!;
    expect(cap.value).toBe(200);
    const baseScore = c.config.find((x) => x.id === "HJ-C-DIFEN")!;
    expect(baseScore.value).toBe(1);
    expect(c.config.find((x) => x.id === "HJ-C-RENSHU")).toBeDefined();
  });

  it("config.ui.yaml 纯继承，不含 XS 项", () => {
    for (const cUi of c.configUi) expect(cUi.id).toMatch(/^HJ-/);
  });

  it("manifest releasable=false，3 个阻塞项", () => {
    expect(c.manifest.releasable).toBe(false);
    expect(c.manifest.blockers).toHaveLength(3);
    expect(c.manifest.compiled_from).toEqual({ ruleset_id: "hangzhou-friends-4p", version: "1.2.0" });
    expect(c.manifest.scope).toEqual({ player_count: 4, room_type: "friends" });
  });

  it("产物正文不含「见杭州文档」类相对引用（可独立读取）", () => {
    // 产物卡的 sources 字段保留原始出处用于追溯是允许的；这里检查正文不依赖「见杭州文档 x.x 节」这类相对引用
    for (const r of c.rules) {
      expect(r.body).not.toMatch(/见杭麻文档|见杭州文档/);
    }
  });
});

describe("rulebook/compiled/hangzhou", () => {
  it("pass-through：61 张卡，releasable=true", () => {
    const c = loadCompiled("rulebook/compiled/hangzhou");
    expect(c.rules.length).toBe(61);
    expect(c.manifest.releasable).toBe(true);
    expect(Object.keys(c.index.rule_aliases)).toHaveLength(0);
  });
});

describe("编译产物一致性", () => {
  // 编译到临时目录：不改写仓库产物，避免与其他测试文件读 rulebook/compiled 产生竞争。
  // 比对使用完整内容 SHA256（不用长度或前缀）：长度与前缀相同但内容不同也应失败。
  const relOf = (root: string, file: string) => file.slice(root.length).replaceAll("\\", "/").replace(/^\//, "");
  const hashTree = (root: string): Record<string, string> => {
    const out: Record<string, string> = {};
    for (const file of walk(root).sort()) {
      out[relOf(root, file)] = createHash("sha256").update(readFileSync(file)).digest("hex");
    }
    return out;
  };

  it("同一输入连续两次编译，产物逐文件 SHA256 一致", () => {
    const out = mkdtempSync(join(tmpdir(), "kb-compile-"));
    const paths = { ...DEFAULT_PATHS, compiledDir: out };
    try {
      compileTo(paths);
      const first = hashTree(out);
      compileTo(paths);
      expect(hashTree(out)).toEqual(first);
    } finally {
      rmSync(out, { recursive: true, force: true });
    }
  }, 30000);

  it("仓库中的 rulebook/compiled 与当前 specs 重新编译结果逐文件一致", () => {
    const out = mkdtempSync(join(tmpdir(), "kb-compile-"));
    const paths = { ...DEFAULT_PATHS, compiledDir: out };
    try {
      compileTo(paths);
      const fresh = hashTree(out);
      const committed = hashTree(DEFAULT_PATHS.compiledDir);

      // 文件集合必须相同（不多不少），再逐个比对内容指纹
      expect(Object.keys(fresh).sort()).toEqual(Object.keys(committed).sort());

      const mismatched = Object.keys(fresh).filter((rel) => fresh[rel] !== committed[rel]);
      expect(
        mismatched,
        `以下产物与 specs 重新编译结果不一致，请跑 node compiler/compile.ts 后提交：\n${mismatched.join("\n")}`,
      ).toEqual([]);
    } finally {
      rmSync(out, { recursive: true, force: true });
    }
  }, 30000);
});
