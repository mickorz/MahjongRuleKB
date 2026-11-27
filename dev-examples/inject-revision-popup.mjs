// 把「修订记录」浮层注入已抓取的快照，并绑定到 .cr-history-trigger
// 目标：offline.html（单状态）与 tabbed.html（两状态）点按钮即可看到浮层效果
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { join } from "node:path";

const DIR = "dev-examples/style-capture/bishuxiezuo";
const MARK = "<!-- rs-revision-popup:injected -->";
const TARGETS = ["offline.html", "tabbed.html"];

const popupMarkup = `${MARK}
<link rel="stylesheet" href="revision-popup.css" />
<style>
  /* 注入版浮层：改为 fixed 定位，由 JS 按按钮位置摆放（原站是 absolute 挂在触发器内） */
  .c-revpop.rs-injected { position: fixed; top: 0; left: 0; z-index: 100000; }
  .c-revpop.rs-injected[hidden] { display: none; }
  .c-revpop .rv-acts .c-content-action {
    border: 1px solid rgba(34,29,22,.14); background: #fff; color: var(--ink);
    border-radius: 7px; padding: 5px 11px; font: inherit; font-size: 12px; cursor: pointer;
  }
  .c-revpop .rv-acts .c-content-action:hover { border-color: var(--gold-deep); color: var(--gold-deep); }
</style>
<div class="c-revpop rs-injected" id="rs-revpop" hidden role="dialog" aria-label="修订记录">
  <div class="rv-arrow"></div>
  <div class="rv-head">
    <span class="rv-ad">陈</span>
    <span>修订记录 · 核心欲望</span>
  </div>
  <div class="rv-diff">
    <div class="rv-row old">
      <span class="rv-k">原</span>
      <span class="rv-orig">活下去。</span>
    </div>
    <div class="rv-conn">
      <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true"><path d="M2 6h6M5 3l3 3-3 3" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" /></svg>
    </div>
    <div class="rv-row new">
      <span class="rv-k">新</span>
      <span class="rv-new">活下去，并弄清楚自己为什么会记得别人的死。</span>
    </div>
  </div>
  <div class="rv-why">
    <span class="rv-k">为什么</span>
    <span>原句只给出生存目标；本版把「记得别人的死」写进欲望，为与鬼医的师徒线留钩子。</span>
  </div>
  <div class="rv-acts">
    <button class="c-content-action" data-rs-act="restore">恢复此版本</button>
    <button class="c-content-action" data-rs-act="close">关闭</button>
  </div>
</div>
<script>
(function () {
  var pop = document.getElementById('rs-revpop');
  if (!pop) return;
  var anchor = null;

  function place(btn) {
    var r = btn.getBoundingClientRect();
    var w = 382;
    var left = Math.min(Math.max(8, r.left), window.innerWidth - w - 8);
    var top = r.bottom + 8;
    if (top + 300 > window.innerHeight) top = Math.max(8, r.top - 300);
    pop.style.left = left + 'px';
    pop.style.top = top + 'px';
    var arrow = pop.querySelector('.rv-arrow');
    if (arrow) arrow.style.left = Math.max(12, Math.min(w - 24, r.left + r.width / 2 - left)) + 'px';
  }

  function open(btn) {
    anchor = btn;
    place(btn);
    pop.hidden = false;
    btn.setAttribute('aria-expanded', 'true');
  }
  function close() {
    if (pop.hidden) return;
    pop.hidden = true;
    if (anchor) anchor.setAttribute('aria-expanded', 'false');
    anchor = null;
  }

  document.addEventListener('click', function (e) {
    var btn = e.target.closest && e.target.closest('.cr-history-trigger');
    if (btn) {
      e.preventDefault();
      e.stopPropagation();
      if (pop.hidden) open(btn); else close();
      return;
    }
    var act = e.target.closest && e.target.closest('[data-rs-act]');
    if (act) { e.preventDefault(); close(); return; }
    if (!pop.hidden && !e.target.closest('#rs-revpop')) close();
  }, true);

  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') close(); });
  window.addEventListener('resize', function () { if (anchor && !pop.hidden) place(anchor); });
  window.addEventListener('scroll', function () { if (anchor && !pop.hidden) place(anchor); }, true);
})();
</script>
`;

let patched = 0;
for (const name of TARGETS) {
  const file = join(DIR, name);
  if (!existsSync(file)) {
    console.log(`跳过（不存在）：${name}`);
    continue;
  }
  let html = readFileSync(file, "utf8");
  if (html.includes(MARK)) {
    console.log(`已注入过，跳过：${name}`);
    continue;
  }
  // 插到 </body> 之前
  html = html.replace(/<\/body>/i, `${popupMarkup}</body>`);
  writeFileSync(file, html, "utf8");
  patched += 1;
  console.log(`已注入：${name}`);
}

console.log(`完成，注入 ${patched} 个文件`);
