// 一次性补丁：更新首页 HTML 断言（S1/S2 布局标记）
import { readFileSync, writeFileSync } from "node:fs";

const path = "tests/server/app.test.ts";
let s = readFileSync(path, "utf8").replace(/\r\n/g, "\n");

const oldBlock = `    expect(html).toContain("Rule Studio 需求文档工作台");
    expect(html).toContain("<nav>");
    expect(html).toContain("<aside>");`;

const newBlock = `    expect(html).toContain("Rule Studio 需求文档工作台");
    // S1/S2：外壳不滚 + 可拖拽分栏 + 状态栏
    expect(html).toContain('data-layout="three-pane"');
    expect(html).toContain('class="splitter"');
    expect(html).toContain('aria-label="状态栏"');
    expect(html).toContain('id="pane-nav"');
    expect(html).toContain('id="pane-aside"');`;

if (!s.includes(oldBlock)) throw new Error("首页断言块未匹配");
s = s.replace(oldBlock, newBlock);
writeFileSync(path, s, "utf8");
console.log("首页断言已更新");
