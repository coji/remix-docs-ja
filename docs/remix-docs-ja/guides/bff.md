---
title: フロントエンドのためのバックエンド
toc: false
---

# フロントエンドのためのバックエンド

Remixはフルスタックアプリケーションとして機能しますが、"フロントエンドのためのバックエンド"アーキテクチャにも完全に適合します。

BFF戦略は、フロントエンドのウェブアプリを提供し、必要なサービス（データベース、メーラー、ジョブキュー、既存のバックエンドAPI（REST、GraphQL）など）に接続する役割を持つウェブサーバーを使用します。UIがブラウザからこれらのサービスに直接統合するのではなく、BFFに接続し、BFFがサービスに接続します。

成熟したアプリはすでにRuby、Elixir、PHPなどで多くのバックエンドアプリケーションコードを持っていますが、Remixの利点を得るために、すべてをサーバーサイドのJavaScriptランタイムに移行する正当な理由はありません。代わりに、Remixアプリをフロントエンドのためのバックエンドとして使用できます。

RemixはWeb Fetch APIをポリフィルするため、ローダーとアクションからバックエンドに`fetch`を直接使用できます。

```tsx lines=[11,17,21]
import type { LoaderFunctionArgs } from "@remix-run/node"; // またはcloudflare/deno
import { json } from "@remix-run/node"; // またはcloudflare/deno
import escapeHtml from "escape-html";

export async function loader({
  request,
}: LoaderFunctionArgs) {
  const apiUrl = "http://api.example.com/some-data.json";
  const res = await fetch(apiUrl, {
    headers: {
      Authorization: `Bearer ${process.env.API_TOKEN}`,
    },
  });

  const data = await res.json();

  const prunedData = data.map((record) => {
    return {
      id: record.id,
      title: record.title,
      formattedBody: escapeHtml(record.content),
    };
  });
  return json(prunedData);
}
```

このアプローチには、ブラウザから直接フェッチするよりもいくつかの利点があります。上記の強調表示された行は、以下を行う方法を示しています。

1. サードパーティの統合を簡素化し、トークンとシークレットをクライアントバンドルから排除します。
2. データを削減してネットワークに送信されるkBを減らし、アプリの速度を大幅に向上させます。
3. `escapeHtml`などの多くのコードをブラウザバンドルからサーバーに移動し、アプリの速度を向上させます。さらに、コードをサーバーに移動すると、通常、サーバー側のコードは非同期操作のUI状態を気にする必要がないため、コードの保守が容易になります。

繰り返しますが、Remixは、サーバーサイドのJavaScript APIを使用してデータベースやその他のサービスに直接アクセスすることで、唯一のサーバーとして使用できますが、フロントエンドのためのバックエンドとしても完璧に機能します。アプリケーションロジックのために既存のAPIサーバーを維持し、Remixを使用してUIを接続しましょう。
