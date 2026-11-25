// P1-B 文档路径同步（2026-11-24）
// 只更新「现行」文档；历史评审原文与已冻结的 2025-11-24 计划/需求文档保持原样。
import fs from "node:fs";

const FILES = [
  "README.md",
  "docs/getting-started.md",
  "docs/zh-CN/getting-started.md",
  "docs/zh-CN/how-to-guides.md",
  "docs/zh-CN/development.md",
  "docs/zh-CN/configuration.md",
  "docs/zh-CN/testing.md",
  "docs/zh-CN/troubleshooting.md",
  "docs/development.md",
  "docs/configuration.md",
  "docs/testing.md",
  "docs/troubleshooting.md",
  "docs/how-to-guides.md",
  "dev-docs/design/2026-11-24-RuleStudio需求文档.md",
  "dev-docs/design/2026-11-24-RuleStudio需求覆盖与补齐.md",
  "dev-docs/design/2026-11-24-需求全文生成与变体差异标注.md",
  "dev-docs/design/2026-11-24-规则命名规范与术语拼音表.md",
  "dev-docs/design/2026-11-24-RuleStudio技术路线对比.md",
  "dev-docs/planning/2026-11-24-需求全文生成执行计划.md",
  "dev-docs/planning/2026-11-24-需求全文生成v1.3修订清单.md",
  "dev-docs/troubleshooting/发现的名字bug.md",
];

// 顺序重要：先长后短；negative lookbehind 防止重复加前缀
const RULES = [
  [/(?<!rulebook\/)sources\//g, "rulebook/sources/"],
  [/(?<!rulebook\/)rulesets\/hangzhou/g, "rulebook/specs/base/hangzhou"],
  [/(?<!rulebook\/)(?<!specs\/)variants\/xiaoshan/g, "rulebook/specs/variants/xiaoshan"],
  [/(?<!rulebook\/)(?<!specs\/)variants\//g, "rulebook/specs/variants/"],
  [/(?<!rulebook\/)compiled\//g, "rulebook/compiled/"],
];

let changed = 0;
for (const f of FILES) {
  if (!fs.existsSync(f)) continue;
  const before = fs.readFileSync(f, "utf8");
  let s = before;
  for (const [re, to] of RULES) s = s.replace(re, to);
  if (s !== before) {
    fs.writeFileSync(f, s);
    changed++;
    console.log(`ok ${f}`);
  }
}
console.log(`\n更新文档 ${changed} 个`);
