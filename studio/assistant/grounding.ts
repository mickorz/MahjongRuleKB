// Assistant grounding：逐条结论 + 结构化引用校验
//
// 评审要求（v1.1 §4.4）：不允许「回答里出现一个合法 ID 就整段算有依据」。
// 这里把回答拆成 claims，逐条校验 refs 是否来自本次实际注入/检索到的 ID 集合。
export interface Claim {
  text: string;
  refs: string[];
  kind?: string;
}

export type ClaimStatus = "ok" | "invalid_ref" | "unverified";

export interface CheckedClaim extends Claim {
  status: ClaimStatus;
  /** 无效引用：不在本次注入集合里的 ref */
  invalid_refs?: string[];
}

export interface GroundingResult {
  claims: CheckedClaim[];
  /** 所有 claim 都 ok 才算整体 grounded；无 claim 时为 false */
  grounded: boolean;
  /** 正文（去掉 JSON 块后的可读部分） */
  text: string;
}

const ID_PATTERN = /(?:HJ|XS)-[CRTFKNMTPVIAU]-[A-Z0-9]+(?:-[A-Z0-9]+)*/g;

/** 从任意工具返回里收集可用作引用依据的 ID（规则 / 配置 / 未决） */
export function collectIds(payload: unknown): Set<string> {
  const ids = new Set<string>();
  const walk = (value: unknown): void => {
    if (typeof value === "string") {
      for (const hit of value.match(ID_PATTERN) ?? []) ids.add(hit);
      return;
    }
    if (Array.isArray(value)) {
      for (const item of value) walk(item);
      return;
    }
    if (value && typeof value === "object") {
      for (const item of Object.values(value as Record<string, unknown>)) walk(item);
    }
  };
  walk(payload);
  return ids;
}

interface RawClaim {
  text?: unknown;
  refs?: unknown;
  kind?: unknown;
}

/**
 * 从模型回答里解析 claims。
 * 约定：回答里带一个 ```json 围栏，内容形如 {"claims":[{"text":"...","refs":["XS-R-..."],"kind":"rule"}]}；
 * 没有围栏时尝试最后一个 JSON 对象。解析失败视为「没有任何 claim」，交给上层标记未验证。
 */
export function parseClaims(content: string): { text: string; claims: Claim[]; parsed: boolean } {
  const fenced = /```(?:json)?\s*([\s\S]*?)```/g;
  const candidates: string[] = [];
  let match: RegExpExecArray | null;
  while ((match = fenced.exec(content))) candidates.push(match[1] ?? "");

  const tryParse = (raw: string): Claim[] | undefined => {
    const start = raw.indexOf("{");
    const end = raw.lastIndexOf("}");
    if (start < 0 || end <= start) return undefined;
    try {
      const value = JSON.parse(raw.slice(start, end + 1)) as { claims?: RawClaim[] };
      if (!Array.isArray(value.claims)) return undefined;
      return value.claims
        .map((item) => {
          const text = typeof item.text === "string" ? item.text.trim() : "";
          const refs = Array.isArray(item.refs)
            ? item.refs.filter((r): r is string => typeof r === "string").map((r) => r.trim()).filter(Boolean)
            : [];
          const kind = typeof item.kind === "string" ? item.kind : undefined;
          return text ? { text, refs, ...(kind ? { kind } : {}) } : undefined;
        })
        .filter((c): c is Claim => c !== undefined);
    } catch {
      return undefined;
    }
  };

  for (const candidate of [...candidates].reverse()) {
    const claims = tryParse(candidate);
    if (claims) return { text: stripJsonBlocks(content).trim(), claims, parsed: true };
  }
  const direct = tryParse(content);
  if (direct) return { text: stripJsonBlocks(content).trim(), claims: direct, parsed: true };
  return { text: content.trim(), claims: [], parsed: false };
}

function stripJsonBlocks(content: string): string {
  return content.replace(/```(?:json)?\s*[\s\S]*?```/g, "").trim();
}

/** 逐条校验：refs 必须全部来自注入集合；无 refs 的实质结论标 unverified */
export function validateClaims(claims: ReadonlyArray<Claim>, injected: ReadonlySet<string>): GroundingResult {
  const checked: CheckedClaim[] = claims.map((claim) => {
    if (claim.refs.length === 0) return { ...claim, status: "unverified" };
    const invalid = claim.refs.filter((ref) => !injected.has(ref.toUpperCase()) && !injected.has(ref));
    if (invalid.length > 0) return { ...claim, status: "invalid_ref", invalid_refs: invalid };
    return { ...claim, status: "ok" };
  });
  const grounded = checked.length > 0 && checked.every((c) => c.status === "ok");
  return { claims: checked, grounded, text: "" };
}

/** 便捷组合：回答文本 + 注入集合 → 结构化校验结果 */
export function groundAnswer(content: string, injected: ReadonlySet<string>): GroundingResult {
  const parsed = parseClaims(content);
  const result = validateClaims(parsed.claims, injected);
  return { ...result, text: result.text || parsed.text };
}
