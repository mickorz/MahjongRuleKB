// P2：Change Manager（最小可用）
// 只做：创建 Change、挂 Proposal、产物状态推进、Verify、Archive 导出。
// 不实现：Artifact Graph 调度算法（由 graph/artifacts.ts 提供纯函数）、Stage 生成、UI。
import { existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";

import {
  artifactInputHash,
  canEnterStatus,
  planArtifacts,
  type ArtifactKind,
  type ArtifactNode,
} from "../graph/artifacts.ts";
import { artifactKindValues, artifactSchema, changeSchema, type Change } from "../contracts/change.ts";
import { assertWritable, archiveDir, ROOT_RUNTIME } from "../paths/registry.ts";

export type ChangeErrorCode = "not_found" | "invalid_transition" | "artifact_blocked" | "already_exists";

// 不用 TS 参数属性：会让本模块在 node strip-types 下无法直跑，而 CLI 入口需要能直跑。
export class ChangeError extends Error {
  readonly code: ChangeErrorCode;

  constructor(message: string, code: ChangeErrorCode) {
    super(message);
    this.code = code;
    this.name = "ChangeError";
  }
}

const activeDir = (kbRoot: string) => join(kbRoot, ROOT_RUNTIME, "changes", "active");

/** Change 存 `<kb>/.rule-studio/changes/active/<id>/change.json`（运行时，不入库） */
function changeFile(kbRoot: string, changeId: string): string {
  return join(activeDir(kbRoot), changeId, "change.json");
}

export interface CreateChangeInput {
  kbRoot: string;
  changeId: string;
  rulesetId: string;
  targetVariant: string;
  templateVersion: string;
  intent: string;
  scope?: string[];
  now?: string;
}

export function createChange(input: CreateChangeInput): Change {
  const file = changeFile(input.kbRoot, input.changeId);
  if (existsSync(file)) throw new ChangeError(`Change 已存在：${input.changeId}`, "already_exists");
  const now = input.now ?? new Date().toISOString();
  const change = changeSchema.parse({
    change_id: input.changeId,
    status: "draft",
    ruleset_id: input.rulesetId,
    target_variant: input.targetVariant,
    template_version: input.templateVersion,
    intent: input.intent,
    scope: input.scope ?? [],
    proposal_ids: [],
    artifacts: [],
    created_at: now,
    updated_at: now,
  });
  mkdirSync(join(activeDir(input.kbRoot), input.changeId), { recursive: true });
  writeFileSync(file, `${JSON.stringify(change, null, 2)}\n`, "utf8");
  return change;
}

export function readChange(kbRoot: string, changeId: string): Change {
  const file = changeFile(kbRoot, changeId);
  if (!existsSync(file)) throw new ChangeError(`Change 不存在：${changeId}`, "not_found");
  return changeSchema.parse(JSON.parse(readFileSync(file, "utf8")));
}

function save(kbRoot: string, change: Change): Change {
  const parsed = changeSchema.parse({ ...change, updated_at: new Date().toISOString() });
  writeFileSync(changeFile(kbRoot, change.change_id), `${JSON.stringify(parsed, null, 2)}\n`, "utf8");
  return parsed;
}

/** 挂一个 Proposal；同一 Change 可含多个（文档 + 规则） */
export function attachProposal(kbRoot: string, changeId: string, proposalId: string): Change {
  const change = readChange(kbRoot, changeId);
  if (change.proposal_ids.includes(proposalId)) return change;
  return save(kbRoot, { ...change, proposal_ids: [...change.proposal_ids, proposalId] });
}

/** 登记 / 更新产物状态；ready 与 confirmed 必须带 input hash */
export function setArtifact(
  kbRoot: string,
  changeId: string,
  artifact: { artifact_id: string; kind: ArtifactKind; status: ArtifactNode["state"]; input_parts?: Array<string | number | boolean>; path?: string },
): Change {
  const change = readChange(kbRoot, changeId);
  const node = artifactSchema.parse({
    artifact_id: artifact.artifact_id,
    kind: artifact.kind,
    status: artifact.status,
    input_hash: artifact.input_parts ? artifactInputHash(artifact.input_parts) : null,
    path: artifact.path ?? null,
  });
  const others = change.artifacts.filter((a) => a.artifact_id !== node.artifact_id);
  return save(kbRoot, { ...change, artifacts: [...others, node] });
}

/** 当前可做的产物与被阻塞项（复用 graph 纯函数） */
export function nextArtifacts(change: Change): ReturnType<typeof planArtifacts> {
  const known = change.artifacts.map((a) => ({ kind: a.kind, state: a.status, input_hash: a.input_hash ?? null }));
  const present = new Set(known.map((k) => k.kind));
  // 未登记的产物按 missing 参与计划，否则调用方看不到「下一步能做什么」
  const all: ArtifactNode[] = [...known];
  for (const kind of artifactKindValues) {
    if (!present.has(kind)) all.push({ kind, state: "missing", input_hash: null });
  }
  return planArtifacts(all);
}

/** 推进 Change 状态；approve / verify / archive 需产物齐备 */
export function advanceChange(kbRoot: string, changeId: string, to: Change["status"]): Change {
  const change = readChange(kbRoot, changeId);
  const gate = canEnterStatus(to, change.artifacts.map((a) => ({ kind: a.kind, state: a.status })));
  if (!gate.ok) {
    throw new ChangeError(
      `进入 ${to} 前这些产物必须 confirmed：${gate.missing.join(", ")}`,
      "artifact_blocked",
    );
  }
  return save(kbRoot, { ...change, status: to });
}

/** Verify 通过后归档：导出到 rulebook/changes/archive/<date>-<id>/（入库审计） */
export function archiveChange(kbRoot: string, changeId: string, date = new Date().toISOString().slice(0, 10)): string {
  const change = readChange(kbRoot, changeId);
  if (change.status !== "verified") {
    throw new ChangeError(`只有 verified 的 Change 可归档，当前 ${change.status}`, "invalid_transition");
  }
  const target = assertWritable("archive", "archive", `${archiveDir(date, changeId)}/change.json`);
  const destDir = join(kbRoot, target.replace(/\/change\.json$/, ""));
  mkdirSync(destDir, { recursive: true });
  writeFileSync(join(destDir, "change.json"), `${JSON.stringify({ ...change, status: "archived", archive_path: target }, null, 2)}\n`, "utf8");
  // 运行时可清理活动目录
  const src = join(activeDir(kbRoot), changeId);
  if (existsSync(src)) rmSync(src, { recursive: true, force: true });
  return target;
}

/** 列出活动 Change */
export function listActiveChanges(kbRoot: string): string[] {
  const dir = activeDir(kbRoot);
  return existsSync(dir) ? readdirSync(dir) : [];
}
