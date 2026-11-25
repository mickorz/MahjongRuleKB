// ID 生命周期（K0-4）：跨次重生成的片段身份匹配
// 原则（设计 v1.8 §6.1 / AD-34）：
// - 身份事实源是上一版 document.json（含 block/segment 与 segment_lineage），identity-map 只是可重建索引
// - 匹配只依据持久化结构信息（logical_block_id、section_id、引用、顺序），不使用文本相似度
// - 无法确定对应关系时人工修改进入「失效待处理」，禁止自动迁移
import type { Document, DocumentBlock, Segment } from "../contracts/document.ts";

/** 上一版中的片段视图 */
export interface PrevSegment {
  block_id: string;
  logical_block_id: string;
  section_id: string;
  segment_id: string;
  /** 用于结构匹配的锚点：排序后的规则/配置引用 */
  anchor: string;
  /** 该片段是否带人工表达修改（override），决定失效时是否需要人工处理 */
  has_override: boolean;
  ordinal: number;
}

/** 本次生成产出的片段草稿（尚未分配稳定 ID） */
export interface DraftSegment {
  logical_block_id: string;
  section_id: string;
  anchor: string;
  ordinal: number;
  /** 已有稳定 ID 时（例如原地重生成）直接沿用 */
  existing_segment_id?: string;
}

export interface MatchResult {
  /** 新片段 → 沿用的旧 segment_id */
  retained: Array<{ draft_index: number; segment_id: string }>;
  /** 需要生成新 ID 的片段下标 */
  assign_new: number[];
  /** 拆分 / 合并关系 */
  lineage: Array<{ type: "split" | "merge"; from_segment_ids: string[]; to_segment_ids: string[] }>;
  /** 无法匹配且带人工修改的旧片段：失效待处理，不自动迁移 */
  invalidated: Array<{ segment_id: string; block_id: string; reason: string }>;
}

const anchorOf = (seg: Segment): string =>
  [...seg.references.rule_refs, ...seg.references.config_refs].sort().join("|");

/** 从上一版文档提取片段视图 */
export function prevSegmentsOf(prev: Document, overriddenSegmentIds: readonly string[] = []): PrevSegment[] {
  const overrides = new Set(overriddenSegmentIds);
  const out: PrevSegment[] = [];
  for (const block of prev.blocks) {
    for (const [ordinal, seg] of block.content.entries()) {
      out.push({
        block_id: block.block_id,
        logical_block_id: block.logical_block_id,
        section_id: block.section_id,
        segment_id: seg.segment_id,
        anchor: anchorOf(seg),
        has_override: overrides.has(seg.segment_id),
        ordinal,
      });
    }
  }
  return out;
}

/** 生成草稿视图（供测试与 Stage 3 使用） */
export function draftsOf(blocks: ReadonlyArray<Pick<DocumentBlock, "logical_block_id" | "section_id" | "content">>): DraftSegment[] {
  const out: DraftSegment[] = [];
  for (const block of blocks) {
    for (const [ordinal, seg] of block.content.entries()) {
      out.push({
        logical_block_id: block.logical_block_id,
        section_id: block.section_id,
        anchor: anchorOf(seg),
        ordinal,
        existing_segment_id: seg.segment_id,
      });
    }
  }
  return out;
}

/**
 * 匹配新旧片段身份。
 * 匹配顺序：logical_block_id → section_id 兜底 → 块内 anchor → 块内序号。
 */
export function matchIdentity(prev: readonly PrevSegment[], drafts: readonly DraftSegment[]): MatchResult {
  const retained: MatchResult["retained"] = [];
  const assignNew: number[] = [];
  const lineage: MatchResult["lineage"] = [];
  const usedPrev = new Set<string>();
  const invalidated: MatchResult["invalidated"] = [];

  // 1) 显式沿用：草稿已带稳定 ID
  const pending: number[] = [];
  for (const [i, d] of drafts.entries()) {
    if (d.existing_segment_id) {
      const prevSeg = prev.find((p) => p.segment_id === d.existing_segment_id);
      if (prevSeg && !usedPrev.has(prevSeg.segment_id)) {
        retained.push({ draft_index: i, segment_id: prevSeg.segment_id });
        usedPrev.add(prevSeg.segment_id);
        continue;
      }
    }
    pending.push(i);
  }

  // 2) 按块分组做结构匹配
  const groupKey = (x: { logical_block_id: string; section_id: string }) => `${x.logical_block_id}::${x.section_id}`;
  const prevByBlock = new Map<string, PrevSegment[]>();
  for (const p of prev) {
    if (usedPrev.has(p.segment_id)) continue;
    const key = groupKey(p);
    prevByBlock.set(key, [...(prevByBlock.get(key) ?? []), p]);
  }
  const draftsByBlock = new Map<string, number[]>();
  for (const i of pending) {
    const key = groupKey(drafts[i]);
    draftsByBlock.set(key, [...(draftsByBlock.get(key) ?? []), i]);
  }
  // section_id 兜底：块逻辑 ID 改名但章节相同
  const fallbackBySection = new Map<string, PrevSegment[]>();
  for (const p of prev) {
    if (usedPrev.has(p.segment_id)) continue;
    fallbackBySection.set(p.section_id, [...(fallbackBySection.get(p.section_id) ?? []), p]);
  }

  for (const [key, draftIdxs] of draftsByBlock) {
    const prevSegs = prevByBlock.get(key) ?? fallbackBySection.get(drafts[draftIdxs[0]].section_id) ?? [];
    const available = prevSegs.filter((p) => !usedPrev.has(p.segment_id));

    // 2a) 一对一：按 anchor 优先，其次序号
    const pairs: Array<[number, PrevSegment]> = [];
    const remainingDrafts: number[] = [];
    // 序号兜底只在两侧数量相同（一对一）时启用；数量不同说明发生了拆分/合并，不能用序号硬配
    const oneToOne = prevSegs.length === draftIdxs.length;
    for (const i of draftIdxs) {
      const d = drafts[i];
      const byAnchor = available.find((p) => !usedPrev.has(p.segment_id) && p.anchor === d.anchor);
      const byOrdinal = oneToOne
        ? available.find((p) => !usedPrev.has(p.segment_id) && p.ordinal === d.ordinal)
        : undefined;
      const hit = byAnchor ?? byOrdinal;
      if (hit) {
        usedPrev.add(hit.segment_id);
        pairs.push([i, hit]);
      } else {
        remainingDrafts.push(i);
      }
    }
    for (const [i, p] of pairs) retained.push({ draft_index: i, segment_id: p.segment_id });

    // 2b) 无对应：若旧片段多于新片段 → merge；反之为 split
    const leftovers = prevSegs.filter((p) => !usedPrev.has(p.segment_id));
    if (remainingDrafts.length === 0) continue;
    if (leftovers.length > 0 && remainingDrafts.length < leftovers.length) {
      lineage.push({
        type: "merge",
        from_segment_ids: leftovers.map((p) => p.segment_id),
        // to 由调用方在分配新 ID 后回填，这里先占位为草稿下标标记
        to_segment_ids: remainingDrafts.map((i) => drafts[i].existing_segment_id ?? `#${i}`),
      });
      for (const p of leftovers) usedPrev.add(p.segment_id);
      assignNew.push(...remainingDrafts);
    } else if (leftovers.length > 0 && remainingDrafts.length > leftovers.length) {
      lineage.push({
        type: "split",
        from_segment_ids: leftovers.map((p) => p.segment_id),
        to_segment_ids: remainingDrafts.map((i) => drafts[i].existing_segment_id ?? `#${i}`),
      });
      for (const p of leftovers) usedPrev.add(p.segment_id);
      assignNew.push(...remainingDrafts);
    } else {
      assignNew.push(...remainingDrafts);
    }
  }

  // 3) 未被使用的旧片段：带人工修改的进入失效待处理
  for (const p of prev) {
    if (usedPrev.has(p.segment_id)) continue;
    if (p.has_override) {
      invalidated.push({
        segment_id: p.segment_id,
        block_id: p.block_id,
        reason: "本次生成未匹配到对应片段；人工修改保留为失效待处理，不自动迁移",
      });
    }
  }

  return { retained, assign_new: assignNew, lineage, invalidated };
}

/** 校验一份匹配结果生成的 lineage 是否满足 Schema 的 split/merge 数量约束 */
export function lineageIsValid(result: MatchResult): boolean {
  return result.lineage.every((entry) => {
    const from = new Set(entry.from_segment_ids);
    const to = new Set(entry.to_segment_ids);
    if (from.size !== entry.from_segment_ids.length) return false;
    if (to.size !== entry.to_segment_ids.length) return false;
    if (entry.type === "split") return from.size === 1 && to.size >= 2;
    return from.size >= 2 && to.size === 1;
  });
}

/**
 * 把 matchIdentity 的占位 to 片段（形如 "#3"，表示草稿下标）替换为真实分配的 segment_id。
 * 未提供映射的占位会让 lineage 无法通过 Schema 校验，调用方必须补全。
 */
export function materializeLineage(
  lineage: MatchResult["lineage"],
  idByDraftIndex: ReadonlyMap<number, string>,
): MatchResult["lineage"] {
  const resolve = (token: string): string => {
    if (!token.startsWith("#")) return token;
    const idx = Number(token.slice(1));
    const id = idByDraftIndex.get(idx);
    if (!id) throw new Error(`缺失草稿 ${idx} 的新 segment_id 映射`);
    return id;
  };
  return lineage.map((entry) => ({
    ...entry,
    to_segment_ids: entry.to_segment_ids.map(resolve),
  }));
}
