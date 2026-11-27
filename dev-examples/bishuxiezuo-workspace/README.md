# bishuxiezuo 站点离线回放（完整拷贝）

## 来源

- 原目录：`E:\WorkProjects\webbuild-kb\workspace`（规则方本地生成的 UIForge 归档工程）
- 目标站：`https://bishuxiezuo.cn/console/console.html`
- 拷贝日期：2026-11-27

## 拷贝了什么

| 路径 | 内容 |
| --- | --- |
| `archive-bishu/` | **277 个录制响应** + `serve.mjs` 回放服务器 + `index.json` 请求→文件映射 + `files/` 可读镜像（真实目录、真实文件名，不是二进制块） |
| `login.mjs` | 原工程的登录脚本（Playwright） |
| `package.json` / `package-lock.json` | 依赖声明（`playwright`） |
| `inject-ls.json` | 原工程的注入配置 |

## 没有拷贝（有意排除）

| 项 | 原因 |
| --- | --- |
| `auth.json`（53 KB） | 含登录会话与 Cookie，**不能进仓库** |
| `credentials.json` | 账号密码，**不能进仓库** |
| `node_modules/`（19 MB） | 可重装：`npm install`（只在需要跑 `login.mjs` 时用到） |
| `serve.log` | 运行日志 |

## 怎么跑

```bash
node archive-bishu/serve.mjs          # 默认 http://127.0.0.1:8787
PORT=4188 node archive-bishu/serve.mjs
```

回放服务器**零依赖**，按 URL 精确匹配 → 归一化匹配 → 路径匹配逐级找录制响应。页面里的交互（tab、列表、折叠、滚动）因为是**站点自己的 JS 在跑**，所以真的能动。

## 与之前抓取产物的区别

| 产物 | 位置 | 性质 |
| --- | --- | --- |
| 本次回放工程 | `dev-examples/bishuxiezuo-workspace/` | **真交互**：真 JS + 录制数据 |
| 静态快照 | `dev-examples/style-capture/bishuxiezuo/` | 静态 DOM + 抽取的 CSS，只能看不能点 |
| 样式原件 | 同上 `css/`、`js/` | 逐文件可读，用于比对实现 |

## 已知边界

- 只有**录制过的请求**能响应；没录到的动作会 204/404（`serve.mjs` 会打印 `[replay] missing file`）
- 时间是冻结的（`serve.mjs` 注入固定时间戳），避免出现「3 天前」变「1234 天前」
- CSS/JS 是原站产物，License 归原站所有（AGPL-3.0）；**仅作只读参考，不得复制进产品代码**
