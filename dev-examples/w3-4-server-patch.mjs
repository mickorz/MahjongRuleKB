// 一次性补丁脚本：给 server/app.ts 接入写接口（避免 shell 转义问题）
import { readFileSync, writeFileSync } from "node:fs";

const path = "server/app.ts";
let s = readFileSync(path, "utf8").replace(/\r\n/g, "\n");

// 1) 写入分支替换
const oldBranch = `    // 只读阶段：任何写入一律拒绝，且不回 CORS 头
    if (req.method !== "GET" && req.method !== "HEAD") {
      res.writeHead(405, { "content-type": "text/plain; charset=utf-8", allow: "GET, HEAD" });
      res.end("只读工作台：仅支持 GET");
      return;
    }

    const url = new URL(req.url ?? "/", \`http://\${req.headers.host}\`);
    const route = resolveRoute(url.pathname);`;

const newBranch = `    const url = new URL(req.url ?? "/", \`http://\${req.headers.host}\`);

    // 写入接口：必须带自定义头 + 同源 Origin（评审 P1-5）
    if (req.method === "POST") {
      handleWrite(req, res, { kbRoot, url }).catch((e: Error) =>
        json(res, 500, { error: "internal_error", message: e.message }),
      );
      return;
    }
    if (req.method !== "GET" && req.method !== "HEAD") {
      res.writeHead(405, { "content-type": "text/plain; charset=utf-8", allow: "GET, HEAD, POST" });
      res.end("工作台只支持 GET / POST");
      return;
    }

    const route = resolveRoute(url.pathname);`;

if (!s.includes(oldBranch)) throw new Error("写入分支未匹配");
s = s.replace(oldBranch, newBranch);

// 2) reviews 路由处理
const oldReviewsHandler = `    if (route.kind === "segment") {`;
const newReviewsHandler = `    if (route.kind === "reviews") {
      const doc = projectDocument(kbRoot, route.variant);
      if (!doc) return json(res, 404, { error: "document_not_found" });
      const file = readReviewFile(kbRoot, route.variant, doc.ruleset_id);
      return json(res, 200, reviewSummary(file, doc.ruleset_id, doc.document_version, doc.blocks.map((b) => b.section_id)));
    }
    if (route.kind === "segment") {`;
if (!s.includes(oldReviewsHandler)) throw new Error("segment 分支未匹配");
s = s.replace(oldReviewsHandler, newReviewsHandler);

// 3) 写接口实现插入到 viewerHtml 之前
const helpers = `const readBody = (req: IncomingMessage): Promise<unknown> =>
  new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on("data", (c: Buffer) => chunks.push(c));
    req.on("end", () => {
      try {
        resolve(JSON.parse(Buffer.concat(chunks).toString("utf8") || "{}"));
      } catch (e) {
        reject(new Error(\`请求体不是合法 JSON：\${(e as Error).message}\`));
      }
    });
    req.on("error", reject);
  });

interface WriteContext {
  kbRoot: string;
  url: URL;
}

/** 写接口统一入口：来源校验 → 分流到 proposal / apply / review */
async function handleWrite(req: IncomingMessage, res: ServerResponse, ctx: WriteContext): Promise<void> {
  // CSRF：必须带自定义头（浏览器跨源表单无法自由添加）
  if (req.headers["x-rule-studio"] !== "1") {
    return json(res, 403, { error: "missing_csrf_header", hint: "写入请求必须带 X-Rule-Studio: 1" });
  }
  // Origin：给了就必须同源；缺失视为同源工具调用（curl/测试）
  const origin = req.headers.origin;
  if (origin) {
    let originHost = "";
    try {
      originHost = new URL(origin).host;
    } catch {
      return json(res, 403, { error: "bad_origin" });
    }
    if (originHost.toLowerCase() !== (req.headers.host ?? "").toLowerCase()) {
      return json(res, 403, { error: "cross_origin_denied" });
    }
  }

  let body: Record<string, unknown>;
  try {
    body = (await readBody(req)) as Record<string, unknown>;
  } catch (e) {
    return json(res, 400, { error: "bad_body", message: (e as Error).message });
  }

  const variant = typeof body.variant === "string" ? body.variant : "";
  if (!variantPattern.test(variant)) return json(res, 400, { error: "bad_variant" });

  if (ctx.url.pathname === "/api/proposal") return proposalPreview(res, ctx.kbRoot, variant, body);
  if (ctx.url.pathname === "/api/apply") return applyBatch(res, ctx.kbRoot, variant, body);
  if (ctx.url.pathname === "/api/review") return writeReview(res, ctx.kbRoot, variant, body);
  return json(res, 404, { error: "not_found" });
}

function loadDocument(kbRoot: string, variant: string) {
  const file = join(kbRoot, "documents", variant, "document.json");
  if (!existsSync(file)) return undefined;
  return documentSchema.parse(JSON.parse(readFileSync(file, "utf8")));
}

/** POST /api/proposal：只预览，不写盘 */
function proposalPreview(res: ServerResponse, kbRoot: string, variant: string, body: Record<string, unknown>): void {
  const document = loadDocument(kbRoot, variant);
  if (!document) return json(res, 404, { error: "document_not_found" });

  const parsed = mutationSchema.safeParse(body.mutation);
  if (!parsed.success) {
    return json(res, 400, {
      error: "bad_mutation",
      issues: parsed.error.issues.map((i) => \`\${i.path.join(".")} \${i.message}\`),
    });
  }
  const check = checkMutation(parsed.data, { document, targetVariant: variant, isBaseDocument: variant === "hangzhou" });
  if (!check.ok) return json(res, 403, { ok: false, reasons: check.reasons });

  const proposal = mutationToProposalInput({
    mutation: parsed.data,
    document,
    rulesetId: document.ruleset_id,
    targetVariant: variant,
  });
  const revision = computeBaseRevision(kbRoot, variant, [\`documents/\${variant}/editorial-overrides.yaml\`]);
  return json(res, 200, {
    ok: true,
    before: check.segment?.before ?? null,
    after: proposal.after_text ?? null,
    proposal,
    base_revision: revision,
  });
}

/** POST /api/apply：一批 mutation 作为一次会话提交（全或无） */
function applyBatch(res: ServerResponse, kbRoot: string, variant: string, body: Record<string, unknown>): void {
  const document = loadDocument(kbRoot, variant);
  if (!document) return json(res, 404, { error: "document_not_found" });

  const raw = Array.isArray(body.mutations) ? body.mutations : [];
  if (raw.length === 0) return json(res, 400, { error: "no_mutations" });

  const mutations = [];
  for (const item of raw) {
    const parsed = mutationSchema.safeParse(item);
    if (!parsed.success) {
      return json(res, 400, {
        error: "bad_mutation",
        issues: parsed.error.issues.map((i) => \`\${i.path.join(".")} \${i.message}\`),
      });
    }
    mutations.push(parsed.data);
  }

  const sessionId = typeof body.session_id === "string" ? body.session_id : \`SES-\${String(Date.now()).slice(-4)}\`;
  try {
    createSession({
      kbRoot,
      sessionId,
      rulesetId: document.ruleset_id,
      targetVariant: variant,
      documentVersion: document.document_version,
    });
    for (const m of mutations) addMutation(kbRoot, variant, sessionId, m);
    const result = applySession({
      kbRoot,
      variant,
      sessionId,
      ...(typeof body.transaction_id === "string" ? { transactionId: body.transaction_id } : {}),
      ...(typeof body.proposal_id === "string" ? { proposalId: body.proposal_id } : {}),
    });
    return json(res, result.ok ? 200 : 409, result);
  } catch (e) {
    return json(res, 409, { ok: false, error: "apply_failed", message: (e as Error).message });
  }
}

/** POST /api/review：写一条审查记录（actor=server） */
function writeReview(res: ServerResponse, kbRoot: string, variant: string, body: Record<string, unknown>): void {
  const document = loadDocument(kbRoot, variant);
  if (!document) return json(res, 404, { error: "document_not_found" });
  const target = body.target as { type?: string; id?: string } | undefined;
  if (!target || !["document", "section", "segment"].includes(target.type ?? "") || !target.id) {
    return json(res, 400, { error: "bad_target" });
  }
  const status = body.status === "reviewed" ? "reviewed" : body.status === "unreviewed" ? "unreviewed" : undefined;
  if (!status) return json(res, 400, { error: "bad_status" });
  const reviewer = typeof body.reviewer === "string" && body.reviewer.trim() ? body.reviewer.trim() : "策划";

  const file = markReviewed({
    kbRoot,
    variant,
    rulesetId: document.ruleset_id,
    target: { type: target.type as "document" | "section" | "segment", id: target.id },
    status,
    documentVersion: document.document_version,
    reviewer,
    ...(typeof body.note === "string" ? { note: body.note } : {}),
  });
  const summary = reviewSummary(
    file,
    document.ruleset_id,
    document.document_version,
    document.blocks.map((b) => b.section_id),
  );
  return json(res, 200, { ok: true, file, summary });
}

`;

const marker = "/** 无构建前端：三栏只读视图。";
if (!s.includes(marker)) throw new Error("viewerHtml 标记未找到");
s = s.replace(marker, `${helpers}${marker}`);

writeFileSync(path, s, "utf8");
console.log("server/app.ts 已接入写接口（proposal / apply / review / reviews）");
