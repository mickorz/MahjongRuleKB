# 修订记录浮层（本地复刻）

## 来源

- 原站：`https://bishuxiezuo.cn/console/console.html`
- 样式：从 `css/bishuxiezuo.cn_console_console.css_v_20261126_df44` 抽取 `.c-revpop` 相关 16 条规则 → `../revision-popup.css`
- 变量：从 `design-tokens.css`（`:root` 计算值）筛出浮层用到的部分 → `tokens-subset.css`，缺失项用近似值兜底
- 组件来源：原站 JS `create.js` 中的 `CreateRevisionHistory` / `RevisionHistoryButton`（触发器类名 `cr-history-trigger`，文案「修订记录」）
- **线上真实浮层 DOM 未抓到**：该按钮只在特定流程状态的屏幕上出现，当前会话里多次尝试未再进入该屏幕；因此 DOM 按 CSS 类名语义重建，样式为原样抽取
- 原站 `.rv-conn svg` 带 `rotate(90deg)`，所以本复刻的源箭头朝右，旋转后朝下

## 复刻程度

| 部分 | 保真度 |
| --- | --- |
| 浮层外观（尺寸、圆角、投影、金色描边、箭头、行样式） | **原站 CSS 原样** |
| 配色与字体变量 | 取自原站 `:root` 计算值 |
| DOM 结构与类名 | 按 CSS 选择器语义重建（`rv-head / rv-diff / rv-row.old / rv-conn / rv-row.new / rv-why / rv-acts`） |
| 数据 | 示例值，非线上数据 |
| 交互 | 本地点开/关闭/恢复按钮（不调用后端） |

## 未复刻的部分

- 原组件的多资源切换（`config.resources`）、版本列表与详情拉取、恢复确认二次弹窗、国际化文案切换
- 线上浮层的触发位置依赖角色详情头部（`.c-character-header-actions`），该屏幕需要特定流程状态才会出现

## 预览

```bash
node dev-examples/serve-snapshot.mjs dev-examples/style-capture/bishuxiezuo 4180
# 打开 http://127.0.0.1:4180/revision-popup/index.html
```
