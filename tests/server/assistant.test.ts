// 助手改稿提案的纯函数：JSON 抽取与校验（不触发网络）
import { describe, it, expect } from "vitest";

import { extractJson, validateProposal, EditProposalError } from "../../server/assistant.ts";

describe("助手改稿提案：JSON 抽取", () => {
  it("裸 JSON 直接解析", () => {
    expect(extractJson('{"segment_id":"SEG-1","after_text":"新","reason":"r"}')).toEqual({
      segment_id: "SEG-1",
      after_text: "新",
      reason: "r",
    });
  });

  it("容忍 ```json 围栏与前后闲话", () => {
    const text = '好的，提案如下：\n```json\n{"segment_id":"SEG-1","after_text":"新"}\n```\n请确认。';
    expect(extractJson(text)).toEqual({ segment_id: "SEG-1", after_text: "新" });
  });

  it("没有 JSON 就报错", () => {
    expect(() => extractJson("我无法完成这个请求")).toThrow(EditProposalError);
  });
});

describe("助手改稿提案：校验", () => {
  const ids = ["SEG-1", "SEG-2"];

  it("合法提案通过", () => {
    expect(validateProposal({ segment_id: "SEG-2", after_text: "新文本", reason: "更简洁" }, ids)).toEqual({
      segment_id: "SEG-2",
      after_text: "新文本",
      reason: "更简洁",
    });
  });

  it("段落不在清单内 → 拒绝（防模型虚构 ID）", () => {
    expect(() => validateProposal({ segment_id: "SEG-999", after_text: "x" }, ids)).toThrow(/不在可编辑清单内/);
  });

  it("改写文本为空 → 拒绝", () => {
    expect(() => validateProposal({ segment_id: "SEG-1", after_text: "   " }, ids)).toThrow(/没有给出改写后的文字/);
  });

  it("缺字段 / 非对象 → 拒绝", () => {
    expect(() => validateProposal(null, ids)).toThrow(/不是对象/);
    expect(() => validateProposal({ after_text: "x" }, ids)).toThrow(/不在可编辑清单内/);
  });
});
