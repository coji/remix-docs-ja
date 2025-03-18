---
title: Webhooks
# can make a quick how-to on creating a webhook, this was copy/pasted from another doc, needs to be reviewed first
hidden: true
---

# Webhooks

リソースルートは、Webhook を処理するために使用できます。たとえば、新しいコミットがリポジトリにプッシュされたときに GitHub から通知を受け取る Webhook を作成できます。

```tsx
import type { Route } from "./+types/github";

import crypto from "node:crypto";

export const action = async ({
  request,
}: Route.ActionArgs) => {
  if (request.method !== "POST") {
    return Response.json(
      { message: "許可されていないメソッドです" },
      {
        status: 405,
      }
    );
  }
  const payload = await request.json();

  /* Webhook を検証する */
  const signature = request.headers.get(
    "X-Hub-Signature-256"
  );
  const generatedSignature = `sha256=${crypto
    .createHmac("sha256", process.env.GITHUB_WEBHOOK_SECRET)
    .update(JSON.stringify(payload))
    .digest("hex")}`;
  if (signature !== generatedSignature) {
    return Response.json(
      { message: "署名が一致しません" },
      {
        status: 401,
      }
    );
  }

  /* Webhook を処理する (例: バックグラウンドジョブをエンキューする) */

  return Response.json({ success: true });
};
```

