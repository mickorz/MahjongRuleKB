// W3-1 入口：只监听 127.0.0.1
import { createWorkbenchServer } from "./app.ts";

const port = Number(process.env.PORT ?? 4173);
const kbRoot = process.env.RULE_STUDIO_KB ?? ".";
const server = createWorkbenchServer({ kbRoot });
server.listen(port, "127.0.0.1", () => {
  console.log(`[W3] 本地只读工作台：http://127.0.0.1:${port}/`);
  console.log(`[W3] 知识库根目录：${kbRoot}`);
  console.log("[W3] 仅监听 127.0.0.1；当前阶段只读（写请求返回 405）");
});
