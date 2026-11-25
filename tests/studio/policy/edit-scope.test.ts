// W0-1：编辑范围策略测试
// 重点：基座/继承内容一律不可编辑；变体自有内容可编辑；拒绝时必须给出两条正确处理方向。
import { describe, it, expect } from "vitest";

import { assertEditable, canEdit, editScopeOf, type EditContext } from "../../../studio/policy/edit-scope.ts";

const baseDoc: EditContext = { targetVariant: "hangzhou", isBaseDocument: true };
const xiaoshanDoc: EditContext = { targetVariant: "xiaoshan", isBaseDocument: false };

const seg = (lineage: "base" | "default_inherited" | "explicit_inherited" | "modified" | "added", id = "SEG-000001") =>
  ({ lineage, segment_id: id }) as const;

describe("W0-1 编辑范围判定", () => {
  it("lineage 到编辑范围的映射", () => {
    expect(editScopeOf(seg("base"), xiaoshanDoc)).toBe("base");
    expect(editScopeOf(seg("default_inherited"), xiaoshanDoc)).toBe("inherit");
    expect(editScopeOf(seg("explicit_inherited"), xiaoshanDoc)).toBe("inherit");
    expect(editScopeOf(seg("modified"), xiaoshanDoc)).toBe("variant");
    expect(editScopeOf(seg("added"), xiaoshanDoc)).toBe("variant");
  });

  it("基座文档整体不可人工编辑，且只给「重新生成基座」一条方向", () => {
    const d = canEdit(seg("base"), baseDoc);
    expect(d.ok).toBe(false);
    expect(d.reason).toMatch(/基座文档/);
    expect(d.escalate?.map((e) => e.action)).toEqual(["regenerate-base"]);
  });

  it("变体文档里的基座片段不可编辑，给出两条方向", () => {
    const d = canEdit(seg("base"), xiaoshanDoc);
    expect(d.ok).toBe(false);
    expect(d.escalate?.map((e) => e.action).sort()).toEqual(["create-modified", "regenerate-base"]);
  });

  it("继承片段（默认/显式）不可编辑", () => {
    for (const lineage of ["default_inherited", "explicit_inherited"] as const) {
      const d = canEdit(seg(lineage), xiaoshanDoc);
      expect(d.ok).toBe(false);
      expect(d.reason).toMatch(/继承自杭州基座/);
    }
  });

  it("modified / added 可编辑", () => {
    for (const lineage of ["modified", "added"] as const) {
      const d = canEdit(seg(lineage), xiaoshanDoc);
      expect(d.ok).toBe(true);
      expect(d.scope).toBe("variant");
      expect(d.reason).toMatch(/xiaoshan/);
    }
  });

  it("基座文档里即使出现 modified/added 也按基座处理（防御脏数据）", () => {
    expect(canEdit(seg("modified"), baseDoc).ok).toBe(false);
    expect(canEdit(seg("added"), baseDoc).ok).toBe(false);
  });

  it("assertEditable 在不可编辑时抛错并带片段 ID", () => {
    expect(() => assertEditable(seg("default_inherited", "SEG-000042"), xiaoshanDoc)).toThrow(/SEG-000042/);
    expect(() => assertEditable(seg("added", "SEG-000043"), xiaoshanDoc)).not.toThrow();
  });

  it("不同变体上下文互不影响（同一片段在萧山可编，在杭州不可编）", () => {
    expect(canEdit(seg("modified"), xiaoshanDoc).ok).toBe(true);
    expect(canEdit(seg("modified"), baseDoc).ok).toBe(false);
    expect(canEdit(seg("modified"), { targetVariant: "shaoxing", isBaseDocument: false }).ok).toBe(true);
  });
});
