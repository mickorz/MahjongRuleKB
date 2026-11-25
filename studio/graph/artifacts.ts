// Artifact Graph（K0-4）：固定依赖图、可执行性与失效传播
// 只做数据契约与纯函数计算：不调度、不落盘、不驱动 Stage。
import { createHash } from "node:crypto";
import { artifactKindValues } from "../contracts/change.ts";

export type ArtifactKind = (typeof artifactKindValues)[number];
export type ArtifactState = "missing" | "candidate" | "ready" | "stale" | "failed" | "confirmed";

/** 固定依赖图：requires 表示「生成该产物之前必须已 ready 的产物」 */
export const artifactDependencies: Record<ArtifactKind, readonly ArtifactKind[]> = {
  change: [], // Change 本身由业务创建，无前置产物
  proposal: ["change"],
  diff: ["proposal"],
  impact: ["proposal"],
  validation: ["diff"], // impact 为可选前置，见 OPTIONAL_DEPS
  approval: ["validation"],
  regeneration: ["approval"],
  verify: ["regeneration"],
};

/** 可选前置：存在才要求 ready，不存在不阻塞 */
export const optionalArtifactDependencies: Partial<Record<ArtifactKind, readonly ArtifactKind[]>> = {
  validation: ["impact"],
};

/** Change 生命周期中，哪些产物必须 confirmed 才能进入下一状态 */
export const requiredForStatus: Record<string, readonly ArtifactKind[]> = {
  ready: ["proposal"],
  approved: ["proposal", "validation", "approval"],
  verifying: ["regeneration"],
  verified: ["verify"],
  archived: ["verify"],
};

export interface ArtifactNode {
  kind: ArtifactKind;
  state: ArtifactState;
  /** 输入指纹；输入变化即失效 */
  input_hash?: string | null;
}

export type BlockReason = { kind: ArtifactKind; missing: ArtifactKind[] };

/** 计算当前状态下可生成的产物与被阻塞的产物 */
export function planArtifacts(nodes: readonly ArtifactNode[]): {
  buildable: ArtifactKind[];
  blocked: BlockReason[];
  satisfied: ArtifactKind[];
} {
  const byKind = new Map(nodes.map((n) => [n.kind, n]));
  const isReady = (k: ArtifactKind) => {
    const n = byKind.get(k);
    return n !== undefined && (n.state === "ready" || n.state === "confirmed");
  };
  const buildable: ArtifactKind[] = [];
  const blocked: BlockReason[] = [];
  const satisfied: ArtifactKind[] = [];
  for (const kind of artifactKindValues) {
    const node = byKind.get(kind);
    if (!node) continue;
    if (isReady(kind)) {
      satisfied.push(kind);
      continue;
    }
    const required = artifactDependencies[kind];
    const optional = optionalArtifactDependencies[kind] ?? [];
    const missing = [
      ...required.filter((d) => !isReady(d)),
      ...optional.filter((d) => byKind.has(d) && !isReady(d)),
    ];
    if (missing.length === 0) buildable.push(kind);
    else blocked.push({ kind, missing });
  }
  return { buildable, blocked, satisfied };
}

/** 由若干输入计算产物指纹；输入顺序无关 */
export function artifactInputHash(parts: ReadonlyArray<string | number | boolean>): string {
  const normalized = parts.map(String).sort();
  return createHash("sha256").update(normalized.join("\u0000")).digest("hex");
}

/**
 * 失效传播：若某产物 input_hash 变化，其下游（直接或间接依赖它的产物）标记 stale。
 * 返回新的节点列表，不修改入参。
 */
export function invalidateDownstream(nodes: readonly ArtifactNode[]): {
  nodes: ArtifactNode[];
  invalidated: ArtifactKind[];
} {
  const byKind = new Map(nodes.map((n) => ({ ...n })).map((n) => [n.kind, n]));
  const changed = nodes.filter((n) => {
    const prev = byKind.get(n.kind);
    return prev !== undefined && n.input_hash != null && prev.input_hash !== n.input_hash;
  });
  const invalidated = new Set<ArtifactKind>();
  const queue = changed.map((n) => n.kind);
  while (queue.length) {
    const cur = queue.shift()!;
    for (const [kind, deps] of Object.entries(artifactDependencies) as Array<[ArtifactKind, readonly ArtifactKind[]]>) {
      if (!deps.includes(cur)) continue;
      if (invalidated.has(kind)) continue;
      invalidated.add(kind);
      queue.push(kind);
    }
    for (const [kind, deps] of Object.entries(optionalArtifactDependencies) as Array<
      [ArtifactKind, readonly ArtifactKind[]]
    >) {
      if (!deps.includes(cur) || invalidated.has(kind)) continue;
      invalidated.add(kind);
    }
  }
  // 变更源本身保持其新状态，只把下游标 stale
  const next = nodes.map((n) => (invalidated.has(n.kind) ? { ...n, state: "stale" as ArtifactState } : { ...n }));
  return { nodes: next, invalidated: [...invalidated] };
}

/** Change 是否可以进入目标状态：所需产物都已 confirmed */
export function canEnterStatus(
  status: string,
  nodes: readonly ArtifactNode[],
): { ok: boolean; missing: ArtifactKind[] } {
  const required = requiredForStatus[status];
  if (!required) return { ok: true, missing: [] };
  const byKind = new Map(nodes.map((n) => [n.kind, n]));
  const missing = required.filter((k) => byKind.get(k)?.state !== "confirmed");
  return { ok: missing.length === 0, missing };
}
