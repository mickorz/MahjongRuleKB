// 对参考项目 worktree 应用聊天框所需的最小 patch（幂等：按步骤标记判断）
// 只在 worktree 内生效，绝不修改 thirdparties/xc-ui-flow 只读副本。
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const MARK = "spike patch";
const CR = String.fromCharCode(13, 10);
const LF = String.fromCharCode(10);

export function patchAgentTimeline(forkDir) {
  const file = join(forkDir, "src/renderer/agent-timeline.tsx");
  const raw = readFileSync(file, "utf8");
  const crlf = raw.includes(CR);
  // Windows 上 git checkout 是 CRLF；统一成 LF 再匹配锚点，写回时还原
  let src = raw.split(CR).join(LF);
  const before = src;
  let applied = false;

  // 1) 去掉 api.ts（1,594 行）与 asset-gallery 依赖，改为注入式 + 内联 hook
  if (!src.includes("把 asset-gallery 的 useNearViewport 内联")) {
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

    if (!src.includes('import * as React from "react"')) {
      throw new Error("patch 失败：React 命名空间导入未插入");
    }
    applied = true;
  }

  // 2) ArtifactPreview：hook 在组件体里取，避免在 useEffect 内调用 useContext
  if (!src.includes("const loadAsset = React.useContext(AssetLoaderContext);")) {
    const anchor = `  const [target, visible] = useNearViewport<HTMLDivElement>();
  useEffect(() => {
    if (!visible) return;
    let disposed = false;
    let objectUrl: string | undefined;
    setUrl(undefined);
    void getWorkspaceAsset(projectId, artifact.path).then((blob) => {`;
    if (!src.includes(anchor)) throw new Error("patch 锚点缺失：ArtifactPreview 主体");
    src = src.replace(
      anchor,
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
    applied = true;
  }

  // 3) 亚秒级 / 没有时间戳的会话不显示「工作了 0 秒」，直接「已完成」
  const LF_CH = String.fromCharCode(10);
  const oldMark = "  /* spike patch: 历史会话没有时间戳，0 毫秒显示「已完成」而不是「工作了 0 秒」 */" + LF_CH + '  if (milliseconds <= 0) return "已完成";' + LF_CH;
  const newMark = "  /* spike patch: 亚秒级或没有时间戳的会话直接显示「已完成」 */" + LF_CH + '  if (milliseconds < 1_000) return "已完成";' + LF_CH;
  if (src.includes(oldMark)) {
    src = src.replace(oldMark, newMark);
    applied = true;
  } else if (!src.includes("亚秒级或没有时间戳")) {
    const anchor = "function formatRoundedDuration(milliseconds: number): string {" + LF_CH + '  if (milliseconds < 1_000) return t("timeline.duration.seconds", { seconds: 0 });';
    if (!src.includes(anchor)) throw new Error("patch 锚点缺失：formatRoundedDuration");
    src = src.replace(
      anchor,
      "function formatRoundedDuration(milliseconds: number): string {" + LF_CH + newMark + '  if (milliseconds < 1_000) return t("timeline.duration.seconds", { seconds: 0 });',
    );
    applied = true;
  }

  // 4) 工作总结不使用「工作了 {{duration}}」前缀拼接「已完成」
  const LF2 = String.fromCharCode(10);
  if (!src.includes("/* spike patch: 总结行直接给出终态 */")) {
    const spanAnchor = '        <span>{t("timeline.workedFor", { duration: turnDuration(display) })}</span>' + LF2 + '        <ChevronRight className="work-chevron" size={13} />';
    if (!src.includes(spanAnchor)) throw new Error("patch 锚点缺失：work-activity 总结行");
    src = src.replace(
      spanAnchor,
      '        <span>{display.durationMs < 1_000 ? "已完成" : t("timeline.workedFor", { duration: turnDuration(display) })}</span>' + LF2 + '        <ChevronRight className="work-chevron" size={13} />',
    );
    applied = true;
  }

  if (src !== before) writeFileSync(file, crlf ? src.split(LF).join(CR) : src, "utf8");
  return { file, applied };
}
