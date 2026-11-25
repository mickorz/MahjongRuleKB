// K0-2 路径注册表测试：推导、白名单、主体权限、规范化与逃逸
import { describe, it, expect } from "vitest";
import {
  archiveDir,
  artifactCatalog,
  actors,
  assertReadable,
  assertVariantScoped,
  assertWritable,
  documentHistoryDir,
  documentPath,
  normalizeRelative,
  PathPolicyError,
  proposalPath,
  rulebookSpecPath,
  sourceEvidencePath,
  transactionDir,
  workflowDir,
} from "../../../studio/paths/registry.ts";

describe("路径推导（服务端唯一来源）", () => {
  it("documents/<variant>/<file>", () => {
    expect(documentPath("hangzhou", "document.json")).toBe("documents/hangzhou/document.json");
    expect(documentPath("xiaoshan", "editorial-overrides.yaml")).toBe(
      "documents/xiaoshan/editorial-overrides.yaml",
    );
    expect(documentPath("xiaoshan", "document-outline.yaml")).toBe("documents/xiaoshan/document-outline.yaml");
  });

  it("history 目录带版本号", () => {
    expect(documentHistoryDir("hangzhou", 3)).toBe("documents/hangzhou/history/v3");
  });

  it("运行时与归档路径", () => {
    expect(proposalPath("DOC-P-001")).toBe(".rule-studio/proposals/DOC-P-001.json");
    expect(proposalPath("PR-001")).toBe(".rule-studio/proposals/PR-001.json");
    expect(transactionDir("TX-001")).toBe(".rule-studio/transactions/TX-001");
    expect(workflowDir("task-01")).toBe(".rule-studio/workflow/task-01");
    expect(archiveDir("2026-11-24", "CHG-001")).toBe("rulebook/changes/archive/2026-11-24-CHG-001");
  });

  it("非法变体 / 文件名 / ID 被拒绝", () => {
    expect(() => documentPath("../evil", "document.json")).toThrow(PathPolicyError);
    expect(() => documentPath("Hangzhou", "document.json")).toThrow(PathPolicyError);
    expect(() => documentPath("hangzhou", "secrets.env" as never)).toThrow(PathPolicyError);
    expect(() => proposalPath("DOC-P-1")).toThrow(PathPolicyError);
    expect(() => transactionDir("TX-1")).toThrow(PathPolicyError);
    expect(() => archiveDir("2026/11/24", "CHG-001")).toThrow(PathPolicyError);
  });
});

describe("路径规范化与逃逸", () => {
  it("拒绝绝对路径与盘符", () => {
    expect(() => normalizeRelative("/etc/passwd")).toThrow(PathPolicyError);
    expect(() => normalizeRelative("C:/Windows")).toThrow(PathPolicyError);
  });

  it("拒绝 .. 逃逸（含规范化后逃逸）", () => {
    expect(() => normalizeRelative("../outside")).toThrow(PathPolicyError);
    expect(() => normalizeRelative("documents/../../outside")).toThrow(PathPolicyError);
  });

  it("拒绝反斜杠与空字符", () => {
    expect(() => normalizeRelative("documents\\hangzhou\\document.json")).toThrow(PathPolicyError);
    expect(() => normalizeRelative("documents/hangzhou/\0.json")).toThrow(PathPolicyError);
  });

  it("消除多余的 ./ 与重复斜杠", () => {
    expect(normalizeRelative("./documents//hangzhou/document.json")).toBe("documents/hangzhou/document.json");
  });
});

describe("主体 × intent 权限矩阵", () => {
  it("Agent 无任何写权限", () => {
    for (const intent of ["generate", "apply-expression", "apply-structure", "apply-rule", "archive", "compile"] as const) {
      expect(() => assertWritable("agent", intent, "documents/hangzhou/document.json")).toThrow(PathPolicyError);
    }
  });

  it("Stage 只能写生成产物与 workflow", () => {
    expect(assertWritable("stage", "generate", "documents/hangzhou/document.json")).toBe(
      "documents/hangzhou/document.json",
    );
    expect(assertWritable("stage", "generate", ".rule-studio/workflow/task-01/stage-3.json")).toBeTruthy();
    // 不得写规则事实、不得写 override、不得写归档
    expect(() => assertWritable("stage", "generate", "rulebook/specs/base/hangzhou/config.yaml")).toThrow(
      PathPolicyError,
    );
    expect(() => assertWritable("stage", "generate", "documents/hangzhou/editorial-overrides.yaml")).toThrow(
      PathPolicyError,
    );
    expect(() => assertWritable("stage", "generate", "rulebook/changes/archive/x")).toThrow(PathPolicyError);
  });

  it("Transaction 按 intent 分别授权", () => {
    expect(assertWritable("transaction", "apply-expression", "documents/xiaoshan/editorial-overrides.yaml")).toBeTruthy();
    expect(assertWritable("transaction", "apply-structure", "documents/xiaoshan/document-outline.yaml")).toBeTruthy();
    expect(assertWritable("transaction", "apply-rule", "rulebook/specs/base/hangzhou/manifest.yaml")).toBeTruthy();
    // 越界
    expect(() => assertWritable("transaction", "apply-expression", "rulebook/specs/base/hangzhou/config.yaml")).toThrow(
      PathPolicyError,
    );
    expect(() => assertWritable("transaction", "apply-rule", "documents/hangzhou/document.json")).toThrow(PathPolicyError);
  });

  it("C1：杭州基座不允许人工经事务编辑", () => {
    for (const intent of ["apply-expression", "apply-structure"] as const) {
      expect(() => assertWritable("transaction", intent, "documents/hangzhou/editorial-overrides.yaml")).toThrow(
        /不得人工编辑/,
      );
      expect(() => assertWritable("transaction", intent, "documents/hangzhou/document-outline.yaml")).toThrow(
        /不得人工编辑/,
      );
    }
  });

  it("C1：杭州基座仍允许 Stage 生成与重新生成", () => {
    expect(assertWritable("stage", "generate", "documents/hangzhou/document.json")).toBe(
      "documents/hangzhou/document.json",
    );
    expect(assertWritable("stage", "generate", "documents/hangzhou/需求全文.md")).toBeTruthy();
    expect(assertWritable("stage", "generate", "documents/hangzhou/generation.lock.json")).toBeTruthy();
  });

  it("C1：变体隔离——声明萧山时不得写杭州或其他变体", () => {
    expect(assertVariantScoped("stage", "generate", "documents/xiaoshan/document.json", "xiaoshan")).toBeTruthy();
    expect(() => assertVariantScoped("stage", "generate", "documents/hangzhou/document.json", "xiaoshan")).toThrow(
      /变体越权/,
    );
    expect(() => assertVariantScoped("stage", "generate", "documents/shaoxing/document.json", "xiaoshan")).toThrow(
      /变体越权/,
    );
  });

  it("C2：diff-review.yaml 由人工在系统外维护，任何主体均不得写", () => {
    for (const actor of actors) {
      for (const intent of ["generate", "apply-expression", "apply-structure", "apply-review"] as const) {
        expect(() => assertWritable(actor, intent, "documents/xiaoshan/diff-review.yaml")).toThrow(PathPolicyError);
      }
    }
  });

  it("W0-6：产物注册表覆盖 12 个登记组，且每项都有写入主体或显式声明无人可写", () => {
    const categories = new Set(artifactCatalog.map((a) => a.category));
    expect(categories.size).toBe(12);
    for (const spec of artifactCatalog) {
      expect(["persistent", "version-bound", "per-generation", "per-check", "during-upgrade", "rebuildable", "system"]).toContain(
        spec.lifetime,
      );
      if (spec.name !== "diff-review.yaml") expect(spec.writers.length).toBeGreaterThan(0);
    }
  });

  it("W0-6：未注册的新产物一律拒绝（防先写后注册）", () => {
    expect(() => assertWritable("stage", "generate", "documents/xiaoshan/未注册产物.json")).toThrow(/未知文档产物/);
    expect(() => assertWritable("stage", "generate", "documents/xiaoshan/quality-report.json")).toBeTruthy();
  });

  it("W0-6：server 只能写审查记录，不得写文档内容", () => {
    expect(assertWritable("server", "apply-review", "documents/xiaoshan/review-records.json")).toBeTruthy();
    expect(() => assertWritable("server", "apply-review", "documents/xiaoshan/document.json")).toThrow(
      /写入主体清单/, 
    );
    expect(() => assertWritable("server", "generate", "documents/xiaoshan/document.json")).toThrow(PathPolicyError);
  });

  it("Archive 只能写归档目录，Compiler 只能写 compiled", () => {
    expect(assertWritable("archive", "archive", "rulebook/changes/archive/2026-11-24-CHG-001/change.json")).toBeTruthy();
    expect(() => assertWritable("archive", "archive", "rulebook/specs/base/hangzhou/config.yaml")).toThrow(PathPolicyError);
    expect(assertWritable("compiler", "compile", "rulebook/compiled/hangzhou/manifest.yaml")).toBeTruthy();
    expect(() => assertWritable("compiler", "compile", "rulebook/specs/base/hangzhou/config.yaml")).toThrow(
      PathPolicyError,
    );
  });

  it("文档产物只允许白名单文件", () => {
    expect(() => assertWritable("stage", "generate", "documents/hangzhou/unknown.json")).toThrow(PathPolicyError);
    expect(() => assertWritable("stage", "generate", "documents/hangzhou/history/v3/document.json")).toBeTruthy();
  });

  it("未定义 intent 一律拒绝", () => {
    expect(() => assertWritable("stage", "apply-rule", "rulebook/specs/base/hangzhou/config.yaml")).toThrow(
      PathPolicyError,
    );
  });
});

describe("只读范围", () => {
  it("允许读取三个根", () => {
    for (const p of ["rulebook/sources/x.md", "rulebook/compiled/hangzhou/manifest.yaml", "documents/hangzhou/document.json", ".rule-studio/proposals/DOC-P-001.json"]) {
      expect(assertReadable(p)).toBe(p);
    }
  });

  it("拒绝根外路径与逃逸", () => {
    expect(() => assertReadable("src/index.ts")).toThrow(PathPolicyError);
    expect(() => assertReadable("../etc/passwd")).toThrow(PathPolicyError);
  });

  it("原文证据必须在 rulebook/sources 下", () => {
    expect(sourceEvidencePath("rulebook/sources/hangzhou/x.md")).toBe("rulebook/sources/hangzhou/x.md");
    expect(() => sourceEvidencePath("documents/hangzhou/document.json")).toThrow(PathPolicyError);
    expect(() => sourceEvidencePath("rulebook/specs/base/hangzhou/config.yaml")).toThrow(PathPolicyError);
  });

  it("规则资产写入限定在 rulebook/specs 下", () => {
    expect(rulebookSpecPath("rulebook/specs/base/hangzhou/manifest.yaml")).toBeTruthy();
    expect(() => rulebookSpecPath("rulebook/changes/archive/x")).toThrow(PathPolicyError);
  });
});
