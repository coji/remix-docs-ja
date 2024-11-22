---
title: Webhooks
# Webhook作成方法のクイックガイドを作成できます。これは別のドキュメントからコピー＆ペーストされたもので、最初にレビューする必要があります。
hidden: true
---

# Webhooks

リソースルートはWebhookを処理するために使用できます。たとえば、新しいコミットがリポジトリにプッシュされたときにGitHubから通知を受け取るWebhookを作成できます。

```tsx
import type { Route } from "./+types/github";

import crypto from "node:crypto";

export const action = async ({
  request,
}: Route.ActionArgs) => {
  if (request.method !== "POST") {
    return Response.json(
      { message: "Method not allowed" },
      {
        status: 405,
      }
    );
  }
  const payload = await request.json();

  /* Webhookの検証 */
  const signature = request.headers.get(
    "X-Hub-Signature-256"
  );
  const generatedSignature = `sha256=${crypto
    .createHmac("sha256", process.env.GITHUB_WEBHOOK_SECRET)
    .update(JSON.stringify(payload))
    .digest("hex")}`;
  if (signature !== generatedSignature) {
    return Response.json(
      { message: "Signature mismatch" },
      {
        status: 401,
      }
    );
  }

  /* Webhookを処理する（例：バックグラウンドジョブをエンキューする）*/

  return Response.json({ success: true });
};
```

