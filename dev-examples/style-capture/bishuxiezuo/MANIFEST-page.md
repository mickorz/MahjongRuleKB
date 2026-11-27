# 完整页面抓取：笔枢 · 创作控制台

- 源地址：https://bishuxiezuo.cn/console/console.html
- 抓取时间：2026-11-27T06:59:42.288Z
- 渲染后 HTML：38.3 KB → `rendered.html`
- 外部脚本：184 个（成功 184）→ `js/`
- 内联脚本：2 个 → `js/`
- 样式：见 `MANIFEST-styles.md` 与 `css/`（46 个外部样式）
- 离线快照：`offline.html`（去掉脚本、样式改本地路径、图片仍走 CDN）

## 三个文件的用途

| 文件 | 用途 |
| --- | --- |
| `rendered.html` | 浏览器渲染后的完整 DOM（含 React 输出），可读结构与文案 |
| `offline.html` | 视觉快照：用本地 CSS 还原当前屏幕，不依赖网络（图片除外） |
| `js/` | 全部脚本原文，可按文件阅读实现（React vendor、业务模块、页面模块） |

## 脚本清单

| 源 | 本地文件 | 大小 |
| --- | --- | ---: |
| https://bishuxiezuo.cn/site-context.js?v=20261126_df44 | js/bishuxiezuo.cn_site-context.js_v_20261126_df44 | 4704 |
| https://bishuxiezuo.cn/console/random-uuid-fallback.js?v=20261126_df44 | js/bishuxiezuo.cn_console_random-uuid-fallback.js_v_20261126_df44 | 926 |
| https://bishuxiezuo.cn/site/page-transition.js?v=20261126_df44 | js/bishuxiezuo.cn_site_page-transition.js_v_20261126_df44 | 8208 |
| https://bishuxiezuo.cn/console/vendor/react.production.min.js | js/bishuxiezuo.cn_console_vendor_react.production.min.js | 10751 |
| https://bishuxiezuo.cn/console/vendor/react-dom.production.min.js | js/bishuxiezuo.cn_console_vendor_react-dom.production.min.js | 131835 |
| https://bishuxiezuo.cn/console/vendor/admin-components.js?v=20261126_df44 | js/bishuxiezuo.cn_console_vendor_admin-components.js_v_20261126_df44 | 698507 |
| https://bishuxiezuo.cn/console/vendor/mobile-kit.js?v=20261126_df44 | js/bishuxiezuo.cn_console_vendor_mobile-kit.js_v_20261126_df44 | 31249 |
| https://bishuxiezuo.cn/console/admin-ui-primitives.js?v=20261126_df44 | js/bishuxiezuo.cn_console_admin-ui-primitives.js_v_20261126_df44 | 6166 |
| https://bishuxiezuo.cn/console/admin-data-table.js?v=20261126_df44 | js/bishuxiezuo.cn_console_admin-data-table.js_v_20261126_df44 | 21660 |
| https://bishuxiezuo.cn/console/admin-chart.js?v=20261126_df44 | js/bishuxiezuo.cn_console_admin-chart.js_v_20261126_df44 | 11933 |
| https://bishuxiezuo.cn/console/data-console.js?v=20261126_df44 | js/bishuxiezuo.cn_console_data-console.js_v_20261126_df44 | 321436 |
| https://bishuxiezuo.cn/console/portal-cache-core.js?v=20261126_df44 | js/bishuxiezuo.cn_console_portal-cache-core.js_v_20261126_df44 | 15496 |
| https://bishuxiezuo.cn/console/portal-resource-refresh-core.js?v=20261126_df44 | js/bishuxiezuo.cn_console_portal-resource-refresh-core.js_v_20261126_df44 | 28625 |
| https://bishuxiezuo.cn/console/book-data-volume-core.js?v=20261126_df44 | js/bishuxiezuo.cn_console_book-data-volume-core.js_v_20261126_df44 | 32102 |
| https://bishuxiezuo.cn/console/custom-settings-bridge.js?v=20261126_df44 | js/bishuxiezuo.cn_console_custom-settings-bridge.js_v_20261126_df44 | 4452 |
| https://bishuxiezuo.cn/console/api-bridge.js?v=20261126_df44 | js/bishuxiezuo.cn_console_api-bridge.js_v_20261126_df44 | 358299 |
| https://bishuxiezuo.cn/console/creation-analytics.js?v=20261126_df44 | js/bishuxiezuo.cn_console_creation-analytics.js_v_20261126_df44 | 685 |
| https://bishuxiezuo.cn/console/lf-error-dialog.js?v=20261126_df44 | js/bishuxiezuo.cn_console_lf-error-dialog.js_v_20261126_df44 | 18832 |
| https://bishuxiezuo.cn/console/lf-avatar.js?v=20261126_df44 | js/bishuxiezuo.cn_console_lf-avatar.js_v_20261126_df44 | 30743 |
| https://bishuxiezuo.cn/console/creation-layout.js?v=20261126_df44 | js/bishuxiezuo.cn_console_creation-layout.js_v_20261126_df44 | 4571 |
| https://bishuxiezuo.cn/console/detail-tools.js?v=20261126_df44 | js/bishuxiezuo.cn_console_detail-tools.js_v_20261126_df44 | 646 |
| https://bishuxiezuo.cn/console/screens-shared.js?v=20261126_df44 | js/bishuxiezuo.cn_console_screens-shared.js_v_20261126_df44 | 110677 |
| https://bishuxiezuo.cn/console/book-data-volume.js?v=20261126_df44 | js/bishuxiezuo.cn_console_book-data-volume.js_v_20261126_df44 | 8203 |
| https://bishuxiezuo.cn/console/relationship-map.js?v=20261126_df44 | js/bishuxiezuo.cn_console_relationship-map.js_v_20261126_df44 | 23545 |
| https://bishuxiezuo.cn/console/character-depth.js?v=20261126_df44 | js/bishuxiezuo.cn_console_character-depth.js_v_20261126_df44 | 17905 |
| https://bishuxiezuo.cn/console/character-voice.js?v=20261126_df44 | js/bishuxiezuo.cn_console_character-voice.js_v_20261126_df44 | 14738 |
| https://bishuxiezuo.cn/console/rewrite-diff-core.js?v=20261126_df44 | js/bishuxiezuo.cn_console_rewrite-diff-core.js_v_20261126_df44 | 10420 |
| https://bishuxiezuo.cn/console/rewrite-undo-core.js?v=20261126_df44 | js/bishuxiezuo.cn_console_rewrite-undo-core.js_v_20261126_df44 | 1824 |
| https://bishuxiezuo.cn/console/field-capabilities-core.js?v=20261126_df44 | js/bishuxiezuo.cn_console_field-capabilities-core.js_v_20261126_df44 | 2368 |
| https://bishuxiezuo.cn/console/chapter-intent-core.js?v=20261126_df44 | js/bishuxiezuo.cn_console_chapter-intent-core.js_v_20261126_df44 | 1957 |
| https://bishuxiezuo.cn/console/chapter-guide-state-core.js?v=20261126_df44 | js/bishuxiezuo.cn_console_chapter-guide-state-core.js_v_20261126_df44 | 6966 |
| https://bishuxiezuo.cn/console/rewrite-diff.js?v=20261126_df44 | js/bishuxiezuo.cn_console_rewrite-diff.js_v_20261126_df44 | 10568 |
| https://bishuxiezuo.cn/console/editable.js?v=20261126_df44 | js/bishuxiezuo.cn_console_editable.js_v_20261126_df44 | 72234 |
| https://bishuxiezuo.cn/console/screens-api-keys.js?v=20261126_df44 | js/bishuxiezuo.cn_console_screens-api-keys.js_v_20261126_df44 | 10724 |
| https://bishuxiezuo.cn/console/screens-settings-notifications.js?v=20261126_df44 | js/bishuxiezuo.cn_console_screens-settings-notifications.js_v_20261126_df44 | 12327 |
| https://bishuxiezuo.cn/console/credit-ledger-core.js?v=20261126_df44 | js/bishuxiezuo.cn_console_credit-ledger-core.js_v_20261126_df44 | 12925 |
| https://bishuxiezuo.cn/console/personal-credit-ledger.js?v=20261126_df44 | js/bishuxiezuo.cn_console_personal-credit-ledger.js_v_20261126_df44 | 7243 |
| https://bishuxiezuo.cn/console/screens-settings.js?v=20261126_df44 | js/bishuxiezuo.cn_console_screens-settings.js_v_20261126_df44 | 64760 |
| https://bishuxiezuo.cn/console/screens-admin-overview.js?v=20261126_df44 | js/bishuxiezuo.cn_console_screens-admin-overview.js_v_20261126_df44 | 16963 |
| https://bishuxiezuo.cn/console/screens-admin-activity.js?v=20261126_df44 | js/bishuxiezuo.cn_console_screens-admin-activity.js_v_20261126_df44 | 14664 |
| https://bishuxiezuo.cn/console/screens-admin-paying.js?v=20261126_df44 | js/bishuxiezuo.cn_console_screens-admin-paying.js_v_20261126_df44 | 27438 |
| https://bishuxiezuo.cn/console/screens-admin-analysis.js?v=20261126_df44 | js/bishuxiezuo.cn_console_screens-admin-analysis.js_v_20261126_df44 | 30124 |
| https://bishuxiezuo.cn/console/admin-assistant-analysis-core.js?v=20261126_df44 | js/bishuxiezuo.cn_console_admin-assistant-analysis-core.js_v_20261126_df44 | 15537 |
| https://bishuxiezuo.cn/console/admin-assistant-drawer.js?v=20261126_df44 | js/bishuxiezuo.cn_console_admin-assistant-drawer.js_v_20261126_df44 | 3044 |
| https://bishuxiezuo.cn/console/admin-assistant-overview.js?v=20261126_df44 | js/bishuxiezuo.cn_console_admin-assistant-overview.js_v_20261126_df44 | 11224 |
| https://bishuxiezuo.cn/console/admin-assistant-audit.js?v=20261126_df44 | js/bishuxiezuo.cn_console_admin-assistant-audit.js_v_20261126_df44 | 16144 |
| https://bishuxiezuo.cn/console/screens-admin-assistant-analysis.js?v=20261126_df44 | js/bishuxiezuo.cn_console_screens-admin-assistant-analysis.js_v_20261126_df44 | 40902 |
| https://bishuxiezuo.cn/console/screens-admin-token-tracking.js?v=20261126_df44 | js/bishuxiezuo.cn_console_screens-admin-token-tracking.js_v_20261126_df44 | 49015 |
| https://bishuxiezuo.cn/console/screens-admin-rates.js?v=20261126_df44 | js/bishuxiezuo.cn_console_screens-admin-rates.js_v_20261126_df44 | 34707 |
| https://bishuxiezuo.cn/console/screens-admin-performance.js?v=20261126_df44 | js/bishuxiezuo.cn_console_screens-admin-performance.js_v_20261126_df44 | 42741 |
| https://bishuxiezuo.cn/console/screens-admin-seo.js?v=20261126_df44 | js/bishuxiezuo.cn_console_screens-admin-seo.js_v_20261126_df44 | 34448 |
| https://bishuxiezuo.cn/console/screens-admin-tools.js?v=20261126_df44 | js/bishuxiezuo.cn_console_screens-admin-tools.js_v_20261126_df44 | 60172 |
| https://bishuxiezuo.cn/console/screens-admin-public-api-announcements.js?v=20261126_df44 | js/bishuxiezuo.cn_console_screens-admin-public-api-announcements.js_v_20261126_df44 | 8067 |
| https://bishuxiezuo.cn/console/screens-admin-public-api.js?v=20261126_df44 | js/bishuxiezuo.cn_console_screens-admin-public-api.js_v_20261126_df44 | 7776 |
| https://bishuxiezuo.cn/console/admin-model-controls.js?v=20261126_df44 | js/bishuxiezuo.cn_console_admin-model-controls.js_v_20261126_df44 | 2921 |
| https://bishuxiezuo.cn/console/admin-output-budgets-core.js?v=20261126_df44 | js/bishuxiezuo.cn_console_admin-output-budgets-core.js_v_20261126_df44 | 3226 |
| https://bishuxiezuo.cn/console/screens-admin-output-budgets.js?v=20261126_df44 | js/bishuxiezuo.cn_console_screens-admin-output-budgets.js_v_20261126_df44 | 7894 |
| https://bishuxiezuo.cn/console/admin-memory-models.js?v=20261126_df44 | js/bishuxiezuo.cn_console_admin-memory-models.js_v_20261126_df44 | 15287 |
| https://bishuxiezuo.cn/console/screens-admin-model-routing.js?v=20261126_df44 | js/bishuxiezuo.cn_console_screens-admin-model-routing.js_v_20261126_df44 | 45191 |
| https://bishuxiezuo.cn/console/admin-prose-draw-core.js?v=20261126_df44 | js/bishuxiezuo.cn_console_admin-prose-draw-core.js_v_20261126_df44 | 7823 |
| https://bishuxiezuo.cn/console/admin-prose-draw-shared.js?v=20261126_df44 | js/bishuxiezuo.cn_console_admin-prose-draw-shared.js_v_20261126_df44 | 9988 |
| https://bishuxiezuo.cn/console/admin-prose-draw-analysis.js?v=20261126_df44 | js/bishuxiezuo.cn_console_admin-prose-draw-analysis.js_v_20261126_df44 | 35546 |
| https://bishuxiezuo.cn/console/admin-prose-draw-tasks.js?v=20261126_df44 | js/bishuxiezuo.cn_console_admin-prose-draw-tasks.js_v_20261126_df44 | 37889 |
| https://bishuxiezuo.cn/console/admin-prose-draw-schemes.js?v=20261126_df44 | js/bishuxiezuo.cn_console_admin-prose-draw-schemes.js_v_20261126_df44 | 19903 |
| https://bishuxiezuo.cn/console/screens-admin-prose-draw.js?v=20261126_df44 | js/bishuxiezuo.cn_console_screens-admin-prose-draw.js_v_20261126_df44 | 16597 |
| https://bishuxiezuo.cn/console/screens-admin-assistant-settings.js?v=20261126_df44 | js/bishuxiezuo.cn_console_screens-admin-assistant-settings.js_v_20261126_df44 | 30817 |
| https://bishuxiezuo.cn/console/screens-admin-reporting-keys.js?v=20261126_df44 | js/bishuxiezuo.cn_console_screens-admin-reporting-keys.js_v_20261126_df44 | 9835 |
| https://bishuxiezuo.cn/console/screens-admin-other-settings.js?v=20261126_df44 | js/bishuxiezuo.cn_console_screens-admin-other-settings.js_v_20261126_df44 | 18721 |
| https://bishuxiezuo.cn/console/screens-admin-messages.js?v=20261126_df44 | js/bishuxiezuo.cn_console_screens-admin-messages.js_v_20261126_df44 | 29964 |
| https://bishuxiezuo.cn/console/admin-order-refund.js?v=20261126_df44 | js/bishuxiezuo.cn_console_admin-order-refund.js_v_20261126_df44 | 11932 |
| https://bishuxiezuo.cn/console/screens-admin-users.js?v=20261126_df44 | js/bishuxiezuo.cn_console_screens-admin-users.js_v_20261126_df44 | 72215 |
| https://bishuxiezuo.cn/console/admin-user-limits-core.js?v=20261126_df44 | js/bishuxiezuo.cn_console_admin-user-limits-core.js_v_20261126_df44 | 7020 |
| https://bishuxiezuo.cn/console/screens-admin-user-limits.js?v=20261126_df44 | js/bishuxiezuo.cn_console_screens-admin-user-limits.js_v_20261126_df44 | 7273 |
| https://bishuxiezuo.cn/console/screens-admin-credit-ledger.js?v=20261126_df44 | js/bishuxiezuo.cn_console_screens-admin-credit-ledger.js_v_20261126_df44 | 15506 |
| https://bishuxiezuo.cn/console/admin-coupons-core.js?v=20261126_df44 | js/bishuxiezuo.cn_console_admin-coupons-core.js_v_20261126_df44 | 5676 |
| https://bishuxiezuo.cn/console/admin-coupons-form.js?v=20261126_df44 | js/bishuxiezuo.cn_console_admin-coupons-form.js_v_20261126_df44 | 12064 |
| https://bishuxiezuo.cn/console/screens-admin-rewrite-preview.js?v=20261126_df44 | js/bishuxiezuo.cn_console_screens-admin-rewrite-preview.js_v_20261126_df44 | 48489 |
| https://bishuxiezuo.cn/console/screens-admin-coupons.js?v=20261126_df44 | js/bishuxiezuo.cn_console_screens-admin-coupons.js_v_20261126_df44 | 12684 |
| https://bishuxiezuo.cn/console/admin-credit-packs-core.js?v=20261126_df44 | js/bishuxiezuo.cn_console_admin-credit-packs-core.js_v_20261126_df44 | 5852 |
| https://bishuxiezuo.cn/console/admin-credit-packs-form.js?v=20261126_df44 | js/bishuxiezuo.cn_console_admin-credit-packs-form.js_v_20261126_df44 | 9731 |
| https://bishuxiezuo.cn/console/admin-credit-packs-access.js?v=20261126_df44 | js/bishuxiezuo.cn_console_admin-credit-packs-access.js_v_20261126_df44 | 14804 |
| https://bishuxiezuo.cn/console/screens-admin-credit-packs.js?v=20261126_df44 | js/bishuxiezuo.cn_console_screens-admin-credit-packs.js_v_20261126_df44 | 11699 |
| https://bishuxiezuo.cn/console/screens-admin.js?v=20261126_df44 | js/bishuxiezuo.cn_console_screens-admin.js_v_20261126_df44 | 15203 |
| https://bishuxiezuo.cn/console/screens-partnerships.js?v=20261126_df44 | js/bishuxiezuo.cn_console_screens-partnerships.js_v_20261126_df44 | 32882 |
| https://bishuxiezuo.cn/console/create.js?v=20261126_df44 | js/bishuxiezuo.cn_console_create.js_v_20261126_df44 | 153064 |
| https://bishuxiezuo.cn/console/workbench-rail.js?v=20261126_df44 | js/bishuxiezuo.cn_console_workbench-rail.js_v_20261126_df44 | 2440 |
| https://bishuxiezuo.cn/console/outline-status-card.js?v=20261126_df44 | js/bishuxiezuo.cn_console_outline-status-card.js_v_20261126_df44 | 4343 |
| https://bishuxiezuo.cn/console/generation-controls.js?v=20261126_df44 | js/bishuxiezuo.cn_console_generation-controls.js_v_20261126_df44 | 19290 |
| https://bishuxiezuo.cn/console/prose-generation-summary.js?v=20261126_df44 | js/bishuxiezuo.cn_console_prose-generation-summary.js_v_20261126_df44 | 7219 |
| https://bishuxiezuo.cn/console/prose-draw-flow-core.js?v=20261126_df44 | js/bishuxiezuo.cn_console_prose-draw-flow-core.js_v_20261126_df44 | 10974 |
| https://bishuxiezuo.cn/console/prose-draw-flow.js?v=20261126_df44 | js/bishuxiezuo.cn_console_prose-draw-flow.js_v_20261126_df44 | 20078 |
| https://bishuxiezuo.cn/console/screens-prose-confirm.js?v=20261126_df44 | js/bishuxiezuo.cn_console_screens-prose-confirm.js_v_20261126_df44 | 15564 |
| https://bishuxiezuo.cn/console/screens-edit.js?v=20261126_df44 | js/bishuxiezuo.cn_console_screens-edit.js_v_20261126_df44 | 71516 |
| https://bishuxiezuo.cn/console/prose-draw-progress-core.js?v=20261126_df44 | js/bishuxiezuo.cn_console_prose-draw-progress-core.js_v_20261126_df44 | 8715 |
| https://bishuxiezuo.cn/console/prose-stage-core.js?v=20261126_df44 | js/bishuxiezuo.cn_console_prose-stage-core.js_v_20261126_df44 | 7127 |
| https://bishuxiezuo.cn/console/screens-prose-run.js?v=20261126_df44 | js/bishuxiezuo.cn_console_screens-prose-run.js_v_20261126_df44 | 20486 |
| https://bishuxiezuo.cn/console/screens-world.js?v=20261126_df44 | js/bishuxiezuo.cn_console_screens-world.js_v_20261126_df44 | 54499 |
| https://bishuxiezuo.cn/console/screens-cruise.js?v=20261126_df44 | js/bishuxiezuo.cn_console_screens-cruise.js_v_20261126_df44 | 55467 |
| https://bishuxiezuo.cn/console/screens-inbox.js?v=20261126_df44 | js/bishuxiezuo.cn_console_screens-inbox.js_v_20261126_df44 | 23333 |
| https://bishuxiezuo.cn/site/vendor/markdown-it.min.js?v=20261126_df44 | js/bishuxiezuo.cn_site_vendor_markdown-it.min.js_v_20261126_df44 | 125451 |
| https://bishuxiezuo.cn/console/assistant-markdown-core.js?v=20261126_df44 | js/bishuxiezuo.cn_console_assistant-markdown-core.js_v_20261126_df44 | 10443 |
| https://bishuxiezuo.cn/console/assistant-markdown.js?v=20261126_df44 | js/bishuxiezuo.cn_console_assistant-markdown.js_v_20261126_df44 | 3884 |
| https://bishuxiezuo.cn/console/assistant-navigation.js?v=20261126_df44 | js/bishuxiezuo.cn_console_assistant-navigation.js_v_20261126_df44 | 25190 |
| https://bishuxiezuo.cn/console/assistant-navigation-client.js?v=20261126_df44 | js/bishuxiezuo.cn_console_assistant-navigation-client.js_v_20261126_df44 | 1767 |
| https://bishuxiezuo.cn/console/assistant-presentation-core.js?v=20261126_df44 | js/bishuxiezuo.cn_console_assistant-presentation-core.js_v_20261126_df44 | 13449 |
| https://bishuxiezuo.cn/console/assistant-stream-core.js?v=20261126_df44 | js/bishuxiezuo.cn_console_assistant-stream-core.js_v_20261126_df44 | 37462 |
| https://bishuxiezuo.cn/console/assistant-checkpoint-core.js?v=20261126_df44 | js/bishuxiezuo.cn_console_assistant-checkpoint-core.js_v_20261126_df44 | 8546 |
| https://bishuxiezuo.cn/console/assistant-composer-core.js?v=20261126_df44 | js/bishuxiezuo.cn_console_assistant-composer-core.js_v_20261126_df44 | 14745 |
| https://bishuxiezuo.cn/console/assistant-cite-core.js?v=20261126_df44 | js/bishuxiezuo.cn_console_assistant-cite-core.js_v_20261126_df44 | 17987 |
| https://bishuxiezuo.cn/console/assistant-body-review-core.js?v=20261126_df44 | js/bishuxiezuo.cn_console_assistant-body-review-core.js_v_20261126_df44 | 4738 |
| https://bishuxiezuo.cn/console/assistant-field-review-core.js?v=20261126_df44 | js/bishuxiezuo.cn_console_assistant-field-review-core.js_v_20261126_df44 | 7525 |
| https://bishuxiezuo.cn/console/assistant-custom-settings-core.js?v=20261126_df44 | js/bishuxiezuo.cn_console_assistant-custom-settings-core.js_v_20261126_df44 | 9534 |
| https://bishuxiezuo.cn/console/assistant-creation-core.js?v=20261126_df44 | js/bishuxiezuo.cn_console_assistant-creation-core.js_v_20261126_df44 | 6101 |
| https://bishuxiezuo.cn/console/assistant-action-core.js?v=20261126_df44 | js/bishuxiezuo.cn_console_assistant-action-core.js_v_20261126_df44 | 41600 |
| https://bishuxiezuo.cn/console/assistant-session-page-core.js?v=20261126_df44 | js/bishuxiezuo.cn_console_assistant-session-page-core.js_v_20261126_df44 | 10121 |
| https://bishuxiezuo.cn/console/assistant-task-progress-core.js?v=20261126_df44 | js/bishuxiezuo.cn_console_assistant-task-progress-core.js_v_20261126_df44 | 10959 |
| https://bishuxiezuo.cn/console/assistant-receipt-core.js?v=20261126_df44 | js/bishuxiezuo.cn_console_assistant-receipt-core.js_v_20261126_df44 | 11819 |
| https://bishuxiezuo.cn/console/assistant-field-group-core.js?v=20261126_df44 | js/bishuxiezuo.cn_console_assistant-field-group-core.js_v_20261126_df44 | 3368 |
| https://bishuxiezuo.cn/console/assistant-examples-core.js?v=20261126_df44 | js/bishuxiezuo.cn_console_assistant-examples-core.js_v_20261126_df44 | 5101 |
| https://bishuxiezuo.cn/console/assistant-session-ops.js?v=20261126_df44 | js/bishuxiezuo.cn_console_assistant-session-ops.js_v_20261126_df44 | 23988 |
| https://bishuxiezuo.cn/console/assistant-checkpoint-ops.js?v=20261126_df44 | js/bishuxiezuo.cn_console_assistant-checkpoint-ops.js_v_20261126_df44 | 4050 |
| https://bishuxiezuo.cn/console/assistant-task-events-core.js?v=20261126_df44 | js/bishuxiezuo.cn_console_assistant-task-events-core.js_v_20261126_df44 | 7289 |
| https://bishuxiezuo.cn/console/assistant-stream.js?v=20261126_df44 | js/bishuxiezuo.cn_console_assistant-stream.js_v_20261126_df44 | 15196 |
| https://bishuxiezuo.cn/console/assistant-interaction-ui.js?v=20261126_df44 | js/bishuxiezuo.cn_console_assistant-interaction-ui.js_v_20261126_df44 | 2927 |
| https://bishuxiezuo.cn/console/assistant-body-review.js?v=20261126_df44 | js/bishuxiezuo.cn_console_assistant-body-review.js_v_20261126_df44 | 11615 |
| https://bishuxiezuo.cn/console/assistant-field-review.js?v=20261126_df44 | js/bishuxiezuo.cn_console_assistant-field-review.js_v_20261126_df44 | 11899 |
| https://bishuxiezuo.cn/console/assistant-custom-settings-review.js?v=20261126_df44 | js/bishuxiezuo.cn_console_assistant-custom-settings-review.js_v_20261126_df44 | 14619 |
| https://bishuxiezuo.cn/console/custom-settings-core.js?v=20261126_df44 | js/bishuxiezuo.cn_console_custom-settings-core.js_v_20261126_df44 | 22075 |
| https://bishuxiezuo.cn/console/custom-settings-editor-core.js?v=20261126_df44 | js/bishuxiezuo.cn_console_custom-settings-editor-core.js_v_20261126_df44 | 5688 |
| https://bishuxiezuo.cn/console/custom-settings-editor.js?v=20261126_df44 | js/bishuxiezuo.cn_console_custom-settings-editor.js_v_20261126_df44 | 19541 |
| https://bishuxiezuo.cn/console/custom-settings-parts.js?v=20261126_df44 | js/bishuxiezuo.cn_console_custom-settings-parts.js_v_20261126_df44 | 31691 |
| https://bishuxiezuo.cn/console/custom-settings-history.js?v=20261126_df44 | js/bishuxiezuo.cn_console_custom-settings-history.js_v_20261126_df44 | 17035 |
| https://bishuxiezuo.cn/console/screens-custom-settings.js?v=20261126_df44 | js/bishuxiezuo.cn_console_screens-custom-settings.js_v_20261126_df44 | 16255 |
| https://bishuxiezuo.cn/console/assistant-action-card.js?v=20261126_df44 | js/bishuxiezuo.cn_console_assistant-action-card.js_v_20261126_df44 | 17783 |
| https://bishuxiezuo.cn/console/assistant-field-group-card.js?v=20261126_df44 | js/bishuxiezuo.cn_console_assistant-field-group-card.js_v_20261126_df44 | 8806 |
| https://bishuxiezuo.cn/console/assistant-examples.js?v=20261126_df44 | js/bishuxiezuo.cn_console_assistant-examples.js_v_20261126_df44 | 1172 |
| https://bishuxiezuo.cn/console/assistant-task-progress.js?v=20261126_df44 | js/bishuxiezuo.cn_console_assistant-task-progress.js_v_20261126_df44 | 11946 |
| https://bishuxiezuo.cn/console/assistant-thread.js?v=20261126_df44 | js/bishuxiezuo.cn_console_assistant-thread.js_v_20261126_df44 | 8990 |
| https://bishuxiezuo.cn/console/assistant-checkpoint-control.js?v=20261126_df44 | js/bishuxiezuo.cn_console_assistant-checkpoint-control.js_v_20261126_df44 | 14801 |
| https://bishuxiezuo.cn/console/assistant-compose-panel.js?v=20261126_df44 | js/bishuxiezuo.cn_console_assistant-compose-panel.js_v_20261126_df44 | 6337 |
| https://bishuxiezuo.cn/console/assistant-draft-target.js?v=20261126_df44 | js/bishuxiezuo.cn_console_assistant-draft-target.js_v_20261126_df44 | 4970 |
| https://bishuxiezuo.cn/console/assistant-memory-control.js?v=20261126_df44 | js/bishuxiezuo.cn_console_assistant-memory-control.js_v_20261126_df44 | 4258 |
| https://bishuxiezuo.cn/console/assistant-memory-status.js?v=20261126_df44 | js/bishuxiezuo.cn_console_assistant-memory-status.js_v_20261126_df44 | 9625 |
| https://bishuxiezuo.cn/console/assistant-window.js?v=20261126_df44 | js/bishuxiezuo.cn_console_assistant-window.js_v_20261126_df44 | 12799 |
| https://bishuxiezuo.cn/console/assistant-scroll.js?v=20261126_df44 | js/bishuxiezuo.cn_console_assistant-scroll.js_v_20261126_df44 | 3788 |
| https://bishuxiezuo.cn/console/assistant-personalization-core.js?v=20261126_df44 | js/bishuxiezuo.cn_console_assistant-personalization-core.js_v_20261126_df44 | 11044 |
| https://bishuxiezuo.cn/console/assistant-personalization-sync.js?v=20261126_df44 | js/bishuxiezuo.cn_console_assistant-personalization-sync.js_v_20261126_df44 | 4152 |
| https://bishuxiezuo.cn/console/screens-assistant.js?v=20261126_df44 | js/bishuxiezuo.cn_console_screens-assistant.js_v_20261126_df44 | 52112 |
| https://bishuxiezuo.cn/console/assistant-personalization.js?v=20261126_df44 | js/bishuxiezuo.cn_console_assistant-personalization.js_v_20261126_df44 | 29559 |
| https://bishuxiezuo.cn/console/assistant-memory-graph-core.js?v=20261126_df44 | js/bishuxiezuo.cn_console_assistant-memory-graph-core.js_v_20261126_df44 | 22769 |
| https://bishuxiezuo.cn/console/assistant-memory-text-core.js?v=20261126_df44 | js/bishuxiezuo.cn_console_assistant-memory-text-core.js_v_20261126_df44 | 4638 |
| https://bishuxiezuo.cn/console/assistant-memory-editor.js?v=20261126_df44 | js/bishuxiezuo.cn_console_assistant-memory-editor.js_v_20261126_df44 | 8983 |
| https://bishuxiezuo.cn/console/assistant-memory-graph.js?v=20261126_df44 | js/bishuxiezuo.cn_console_assistant-memory-graph.js_v_20261126_df44 | 58737 |
| https://bishuxiezuo.cn/console/assistant-workspace-delivery.js?v=20261126_df44 | js/bishuxiezuo.cn_console_assistant-workspace-delivery.js_v_20261126_df44 | 3043 |
| https://bishuxiezuo.cn/console/assistant-workspace-core.js?v=20261126_df44 | js/bishuxiezuo.cn_console_assistant-workspace-core.js_v_20261126_df44 | 10208 |
| https://bishuxiezuo.cn/console/assistant-upload-core.js?v=20261126_df44 | js/bishuxiezuo.cn_console_assistant-upload-core.js_v_20261126_df44 | 29829 |
| https://bishuxiezuo.cn/console/assistant-upload.js?v=20261126_df44 | js/bishuxiezuo.cn_console_assistant-upload.js_v_20261126_df44 | 11351 |
| https://bishuxiezuo.cn/console/assistant-inline-core.js?v=20261126_df44 | js/bishuxiezuo.cn_console_assistant-inline-core.js_v_20261126_df44 | 2460 |
| https://bishuxiezuo.cn/console/assistant-inline-editor.js?v=20261126_df44 | js/bishuxiezuo.cn_console_assistant-inline-editor.js_v_20261126_df44 | 15032 |
| https://bishuxiezuo.cn/console/assistant-reference-core.js?v=20261126_df44 | js/bishuxiezuo.cn_console_assistant-reference-core.js_v_20261126_df44 | 6468 |
| https://bishuxiezuo.cn/console/assistant-reference-window.js?v=20261126_df44 | js/bishuxiezuo.cn_console_assistant-reference-window.js_v_20261126_df44 | 5921 |
| https://bishuxiezuo.cn/console/assistant-reference-library.js?v=20261126_df44 | js/bishuxiezuo.cn_console_assistant-reference-library.js_v_20261126_df44 | 28067 |
| https://bishuxiezuo.cn/console/assistant-workspace-preview-core.js?v=20261126_df44 | js/bishuxiezuo.cn_console_assistant-workspace-preview-core.js_v_20261126_df44 | 4424 |
| https://bishuxiezuo.cn/console/assistant-workspace-preview.js?v=20261126_df44 | js/bishuxiezuo.cn_console_assistant-workspace-preview.js_v_20261126_df44 | 5543 |
| https://bishuxiezuo.cn/console/assistant-workspace.js?v=20261126_df44 | js/bishuxiezuo.cn_console_assistant-workspace.js_v_20261126_df44 | 43764 |
| https://bishuxiezuo.cn/console/assistant-usage-settings-core.js?v=20261126_df44 | js/bishuxiezuo.cn_console_assistant-usage-settings-core.js_v_20261126_df44 | 6271 |
| https://bishuxiezuo.cn/console/assistant-usage-settings.js?v=20261126_df44 | js/bishuxiezuo.cn_console_assistant-usage-settings.js_v_20261126_df44 | 30850 |
| https://bishuxiezuo.cn/console/screens-assistant-settings.js?v=20261126_df44 | js/bishuxiezuo.cn_console_screens-assistant-settings.js_v_20261126_df44 | 6870 |
| https://bishuxiezuo.cn/console/screens-export.js?v=20261126_df44 | js/bishuxiezuo.cn_console_screens-export.js_v_20261126_df44 | 16205 |
| https://bishuxiezuo.cn/console/prose-draw-selection-core.js?v=20261126_df44 | js/bishuxiezuo.cn_console_prose-draw-selection-core.js_v_20261126_df44 | 3372 |
| https://bishuxiezuo.cn/console/screens-prose-draw-reader.js?v=20261126_df44 | js/bishuxiezuo.cn_console_screens-prose-draw-reader.js_v_20261126_df44 | 13249 |
| https://bishuxiezuo.cn/console/prose-draw-selection.js?v=20261126_df44 | js/bishuxiezuo.cn_console_prose-draw-selection.js_v_20261126_df44 | 19939 |
| https://bishuxiezuo.cn/console/mobile-layout-core.js?v=20261126_df44 | js/bishuxiezuo.cn_console_mobile-layout-core.js_v_20261126_df44 | 6259 |
| https://bishuxiezuo.cn/console/mobile-chrome.js?v=20261126_df44 | js/bishuxiezuo.cn_console_mobile-chrome.js_v_20261126_df44 | 2890 |
| https://bishuxiezuo.cn/console/mobile-pages.js?v=20261126_df44 | js/bishuxiezuo.cn_console_mobile-pages.js_v_20261126_df44 | 11115 |
| https://bishuxiezuo.cn/console/mobile-book.js?v=20261126_df44 | js/bishuxiezuo.cn_console_mobile-book.js_v_20261126_df44 | 14863 |
| https://bishuxiezuo.cn/console/mobile-outline-core.js?v=20261126_df44 | js/bishuxiezuo.cn_console_mobile-outline-core.js_v_20261126_df44 | 4511 |
| https://bishuxiezuo.cn/console/mobile-field-sheet.js?v=20261126_df44 | js/bishuxiezuo.cn_console_mobile-field-sheet.js_v_20261126_df44 | 7175 |
| https://bishuxiezuo.cn/console/mobile-outline.js?v=20261126_df44 | js/bishuxiezuo.cn_console_mobile-outline.js_v_20261126_df44 | 20398 |
| https://bishuxiezuo.cn/console/mobile-create.js?v=20261126_df44 | js/bishuxiezuo.cn_console_mobile-create.js_v_20261126_df44 | 5341 |
| https://bishuxiezuo.cn/console/mobile-console.js?v=20261126_df44 | js/bishuxiezuo.cn_console_mobile-console.js_v_20261126_df44 | 14481 |
| https://bishuxiezuo.cn/console/app.js?v=20261126_df44 | js/bishuxiezuo.cn_console_app.js_v_20261126_df44 | 199095 |
| https://bishuxiezuo.cn/site/public-announcement.js?v=20261126_df44 | js/bishuxiezuo.cn_site_public-announcement.js_v_20261126_df44 | 11837 |
| https://bishuxiezuo.cn/site/rewrite-invitation.js?v=20261126_df44 | js/bishuxiezuo.cn_site_rewrite-invitation.js_v_20261126_df44 | 4802 |
| (inline) | js/inline-003.js | 149 |
| (inline) | js/inline-021.js | 307 |

## 说明

- 抓的是**渲染后**的 DOM（React 已执行）；原始 HTML 只有空壳，不含页面内容。
- 业务脚本依赖登录态与后端 API，离线直接运行会失败，因此 `offline.html` 不含脚本。
- 脚本未做格式化（压缩文件如 react.production.min.js 保持原样）。
