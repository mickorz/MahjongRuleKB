// 对参考项目 worktree 应用聊天框所需的最小 patch（幂等：已打过则跳过）
// 只在 worktree 内生效，绝不修改 thirdparties/xc-ui-flow 只读副本。
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const MARK = "spike patch";

export function patchAgentTimeline(forkDir) {
  const file = join(forkDir, "src/renderer/agent-timeline.tsx");
  const raw = readFileSync(file, "utf8");
  const crlf = raw.includes(String.fromCharCode(13, 10));
  // Windows 上 git checkout 是 CRLF；统一成 LF 再匹配锚点，写回时还原
  let src = raw.split(String.fromCharCode(13, 10)).join(String.fromCharCode(10));
  if (src.includes(MARK)) return { file, applied: false };

  // 1) 去掉 api.ts（1,594 行）与 asset-gallery 依赖，改为注入式 + 内联 hook
  const importBlock = `import { getWorkspaceAsset } from "./api.js";
import { ConversationImage } from "./image-attachments.js";
import { useNearViewport } from "./asset-gallery.js";`;
  if (!src.includes(importBlock)) throw new Error("patch 锚点缺失：agent-timeline 的 import 段");
  src = src.replace(
    importBlock,
    `import * as React from "react";
import { ConversationImage } from "./image-attachments.js";

/* ${MARK}: 把 asset-gallery 的 useNearViewport 内联，避免拖入资源画廊模块 */
function useNearViewport<T extends Element>(): readonly [React.RefObject<T | null>, boolean] {
  const target = React.useRef<T>(null);
  const [visible, setVisible] = React.useState(false);
  React.useEffect(() => {
    const node = target.current;
    if (!node || typeof IntersectionObserver === "undefined") {
      setVisible(true);
      return;
    }
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry?.isIntersecting) return;
      setVisible(true);
      observer.disconnect();
    }, { rootMargin: "160px" });
    observer.observe(node);
    return () => observer.disconnect();
  }, []);
  return [target, visible] as const;
}

/** ${MARK}: 工作区资源由宿主注入；未注入时视为没有资源 */
const AssetLoaderContext = React.createContext<((projectId: string, path: string) => Promise<Blob>) | undefined>(undefined);`,
  );

  // React.* 用到但未默认导入时补一行（该文件原本只按名导入）
  if (!src.includes('import * as React from "react"')) {
    throw new Error("patch 失败：React 命名空间导入未插入");
  }

  // 2) ArtifactPreview：hook 在组件体里取，避免在 useEffect 内调用 useContext
  const before = `  const [target, visible] = useNearViewport<HTMLDivElement>();
  useEffect(() => {
    if (!visible) return;
    let disposed = false;
    let objectUrl: string | undefined;
    setUrl(undefined);
    void getWorkspaceAsset(projectId, artifact.path).then((blob) => {`;
  if (!src.includes(before)) throw new Error("patch 锚点缺失：ArtifactPreview 主体");
  src = src.replace(
    before,
    `  const [target, visible] = useNearViewport<HTMLDivElement>();
  const loadAsset = React.useContext(AssetLoaderContext);
  useEffect(() => {
    if (!visible) return;
    if (!loadAsset) return;
    let disposed = false;
    let objectUrl: string | undefined;
    setUrl(undefined);
    void loadAsset(projectId, artifact.path).then((blob) => {`,
  );
  src = src.replace(
    "  }, [artifact.path, projectId, visible]);",
    "  }, [artifact.path, projectId, visible, loadAsset]);",
  );

  writeFileSync(file, crlf ? src.split(String.fromCharCode(10)).join(String.fromCharCode(13, 10)) : src, "utf8");
  return { file, applied: true };
}
