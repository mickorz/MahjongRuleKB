// 修订记录：把内联浮层换成参考站的右侧抽屉（cr-drawer + 版本列表 + 差异详情）
import { readFileSync, writeFileSync } from "node:fs";
const p = "server/viewer.ts";
let s = readFileSync(p, "utf8").replace(/\r\n/g, "\n");
const must = (n, k) => { if (!s.includes(n)) throw new Error("锚点缺失：" + k); };

/* ---------- 1) CSS：删掉 .c-revpop，换成抽屉 ---------- */
const cssStart = s.indexOf("  /* 修订记录浮层：尺寸/内距/箭头/行样式取自原站 .c-revpop */");
must("  .c-revpop .rv-acts { display: flex; justify-content: flex-end; gap: 8px; }", "revpop css end");
const cssEnd = s.indexOf("  .c-revpop .rv-acts { display: flex; justify-content: flex-end; gap: 8px; }");
const afterCss = s.indexOf("\n", cssEnd) + 1;

const drawerCss = `  /* 修订记录抽屉（原站 .cr-drawer / .cr-revision-*） */
  .cr-drawer-mask {
    position: fixed; inset: 0; z-index: 90000; background: rgba(34,29,22,.18);
    display: flex; justify-content: flex-end;
  }
  .cr-drawer-mask[hidden] { display: none; }
  .cr-drawer {
    width: 680px; max-width: 96vw; height: 100%; background: var(--paper);
    border-left: 1px solid var(--line); box-shadow: -30px 0 80px -30px var(--shadow);
    display: flex; flex-direction: column;
  }
  .cr-drawer-head {
    flex: none; display: flex; align-items: center; gap: 12px; padding: 16px 20px;
    border-bottom: 1px solid var(--line); background: var(--paper-2);
  }
  .cr-drawer-head .ad {
    width: 38px; height: 38px; border-radius: 7px; flex: none; background: var(--gold-deep);
    color: #fff; display: grid; place-items: center;
  }
  .cr-drawer-head .ht { display: flex; flex-direction: column; line-height: 1.3; min-width: 0; }
  .cr-drawer-head .ht b { font-family: var(--serif); font-size: 17px; font-weight: 600; }
  .cr-drawer-head .ht i { font-style: normal; font-size: 11.5px; color: var(--ink-3); }
  .edt-x {
    width: 22px; height: 22px; border-radius: 4px; border: none; background: transparent;
    color: var(--ink-3); font-size: 18px; line-height: 1; cursor: pointer; flex: none; margin-left: auto;
  }
  .edt-x:hover { color: var(--terra); }

  .cr-revision-body { display: grid; grid-template-columns: 250px minmax(0, 1fr); flex: 1; min-height: 0; }
  .cr-revision-list {
    overflow-y: auto; padding: 10px; border-right: 1px solid var(--line);
    display: flex; flex-direction: column; gap: 7px;
  }
  .cr-revision-item {
    display: flex; flex-direction: column; gap: 5px; padding: 10px 11px;
    border: 1px solid var(--line); border-radius: 8px; background: var(--card); color: var(--ink-2);
    font-family: var(--sans); text-align: left; cursor: pointer;
  }
  .cr-revision-item.on {
    border-color: var(--gold-deep); background: color-mix(in srgb, var(--gold-deep) 7%, var(--card));
  }
  .cr-revision-item-top { display: flex; align-items: center; justify-content: space-between; gap: 8px; }
  .cr-revision-item-top b { font-size: 13.5px; }
  .cr-revision-item time, .cr-revision-item small { font-size: 11px; color: var(--ink-3); }
  .cr-revision-item small { color: var(--ink-2); }

  .cr-revision-detail { display: flex; flex-direction: column; min-width: 0; min-height: 0; }
  .cr-revision-detailbar {
    display: flex; align-items: center; justify-content: space-between; gap: 16px;
    padding: 12px 15px; border-bottom: 1px solid var(--line);
  }
  .cr-revision-detailbar b { font-size: 14px; }
  .cr-revision-detailbar span { font-size: 12px; color: var(--ink-3); margin-left: 8px; }
  .cr-revision-detail-actions { display: flex; align-items: center; justify-content: flex-end; gap: 8px; flex: none; }
  .cr-revision-progress {
    display: flex; align-items: center; justify-content: space-between; gap: 12px;
    padding: 9px 15px; background: var(--gold-wash); border-bottom: 1px solid var(--gold-soft);
    font-size: 12px; color: var(--ink-3);
  }
  .cr-revision-progress b { color: var(--ink); font-weight: 600; }
  .cr-revision-diff { flex: 1; overflow-y: auto; padding: 14px 15px 24px; display: flex; flex-direction: column; gap: 10px; }
  .cr-rdiff-row { display: flex; flex-direction: column; gap: 6px; }
  .cr-rdiff-row > h4 {
    margin: 0; font: 600 11px/1.4 var(--sans); letter-spacing: .04em; color: var(--ink-3);
  }
  .cr-rdiff-old {
    padding: 9px 11px; border-radius: 6px; background: var(--paper-2); color: var(--ink-3);
    font-family: var(--serif); font-size: 12.5px; line-height: 1.7;
    text-decoration: line-through; text-decoration-color: color-mix(in srgb, var(--terra) 60%, transparent);
  }
  .cr-rdiff-new {
    padding: 9px 11px; border-radius: 6px; background: var(--gold-wash);
    border: 1px solid var(--gold-soft); color: var(--ink);
    font-family: var(--serif); font-size: 12.5px; line-height: 1.7;
  }
  .cr-revision-empty { padding: 24px 4px; text-align: center; color: var(--ink-3); font-size: 12.5px; }
  .c-btn.sm { min-height: 26px; padding: 3px 10px; font-size: 11.5px; }
  .c-btn.gold { border-color: var(--gold-deep); background: var(--gold-deep); color: #fff; }
`;
s = s.slice(0, cssStart) + drawerCss + s.slice(afterCss);

/* ---------- 2) DOM：删掉 .c-revpop，加抽屉容器 ---------- */
const popStart = s.indexOf('<div class="c-revpop" id="revpop"');
must('<div class="c-revpop" id="revpop"', "popup dom");
const popEnd = s.indexOf("</div>\n\n<script>", popStart);
must("</div>\n\n<script>", "popup dom end");
s = s.slice(0, popStart) + `<div class="cr-drawer-mask" id="rev-drawer" hidden>
  <aside class="cr-drawer cr-revision-drawer" role="dialog" aria-modal="true" aria-label="修订记录">
    <div class="cr-drawer-head">
      <span class="ad" id="rev-drawer-icon"></span>
      <div class="ht">
        <b id="rev-drawer-title">修订记录</b>
        <i>每次修改都保留为独立版本，可查看差异或恢复</i>
      </div>
      <button class="edt-x" id="rev-drawer-close" title="关闭" type="button">×</button>
    </div>
    <div class="cr-revision-body">
      <div class="cr-revision-list" id="rev-list"></div>
      <div class="cr-revision-detail">
        <div class="cr-revision-detailbar">
          <div><b class="c-latin" id="rev-ver">—</b><span id="rev-meta"></span></div>
          <div class="cr-revision-detail-actions">
            <button class="c-btn sm" id="rev-original" type="button">查看原版</button>
            <button class="c-btn gold sm" id="rev-restore" type="button">恢复此版本</button>
          </div>
        </div>
        <div class="cr-revision-progress"><span>写入这个版本时</span><b id="rev-progress">—</b></div>
        <div class="cr-revision-diff" id="rev-diff"></div>
      </div>
    </div>
  </aside>
</div>` + s.slice(popEnd + "</div>".length);

writeFileSync(p, s, "utf8");
console.log("抽屉 DOM 与样式已替换");
