// 目录重构计划：标记验收完成并追加执行结果（2026-11-24）
import fs from "node:fs";

const f = "dev-docs/planning/2026-11-24-目录重新规划与重构执行计划.md";
let s = fs.readFileSync(f, "utf8");

for (const [a, b] of [
  ["**P1-B 验收**", "**P1-B 验收（已完成）**"],
  ["**P1-C 验收**", "**P1-C 验收（已完成）**"],
]) {
  if (s.includes(a)) s = s.split(a).join(b);
}

const block = `
## 九、执行结果（2026-11-24）

| 阶段 | 状态 | 关键证据 |
| --- | --- | --- |
| P1-A 类型判定解耦 | 完成 | 新增 \`RuleSetKind\` 与 \`LoadedRuleset.kind\`；\`validateRuleset\` 不再读 \`dir.startsWith("variants")\`；CLI 支持 \`--kind\`；把 base 目录按 variant 校验必报 \`manifest.base Required\` |
| P1-B 规则与产物迁移 | 完成 | \`rulesets/\` → \`rulebook/specs/base/hangzhou\`、\`variants/\` → \`rulebook/specs/variants/xiaoshan\`、\`compiled/\` → \`rulebook/compiled\`；迁移前后产物忽略行尾后 **158 文件零差异** |
| P1-C sources 迁移 | 完成 | \`sources/\` → \`rulebook/sources/\`；108 张卡 provenance 与 2 个 manifest 同步；杭州 **1.2.0** + \`content_hash 93b4d75…\`；萧山 **0.3.0** + \`base.version 1.2.0\` |
| P2 Change 归档目录 | 完成（仅目录与忽略规则） | \`rulebook/changes/archive/README.md\` 建立；\`.gitignore\` 收口 \`.rule-studio/\`。**归档写入实现属 Change Manager 的 P2，尚未开始** |
| P3 路径常量集中 | 完成 | \`compiler/paths.ts\` 成为根路径唯一定义处；\`tests/compiler/paths.test.ts\` 禁止 \`compiler/\` 其他文件出现根路径字面量；\`compile.test\` 改为编译到临时目录，消除与其他测试文件的并发竞争 |

验收命令结果：\`npm test\` **95 通过**（8 个测试文件）、\`npm run typecheck\` 通过、\`node compiler/compile.ts\` 产物稳定、两个规则集校验通过。

**遗留**：\`rulebook/changes/archive/\` 的归档写入逻辑依赖 Change Manager，本计划范围内只建立目录与规则说明。
`;

s = s.trimEnd() + "\n" + block;
fs.writeFileSync(f, s);
console.log("执行结果已追加");
