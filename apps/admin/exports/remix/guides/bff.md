---
title: フロントエンドのためのバックエンド
toc: false
---

# フロントエンドのためのバックエンド

Remixはフルスタックアプリケーションとして機能しますが、「フロントエンドのためのバックエンド」アーキテクチャにも完璧に適合します。

BFF戦略では、フロントエンドWebアプリを提供し、必要なサービス（データベース、メーラー、ジョブキュー、既存のバックエンドAPI（REST、GraphQL）など）に接続することを目的としたWebサーバーを使用します。UIがブラウザからこれらのサービスに直接統合するのではなく、BFFに接続し、BFFがサービスに接続します。

成熟したアプリには、すでにRuby、Elixir、PHPなどで多くのバックエンドアプリケーションコードがあり、Remixのメリットを得るためだけに、すべてをサーバーサイドのJavaScriptランタイムに移行する理由はありません。代わりに、Remixアプリをフロントエンドのバックエンドとして使用できます。

RemixはWeb Fetch APIをポリフィルするため、ローダーとアクションからバックエンドに直接`fetch`を使用できます。

```tsx lines=[11,17,21]
import type { LoaderFunctionArgs } from "@remix-run/node"; // or cloudflare/deno
import { json } from "@remix-run/node"; // or cloudflare/deno
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

ブラウザから直接フェッチするのではなく、このアプローチにはいくつかの利点があります。上記のハイライトされた行は、次の方法を示しています。

1. サードパーティの統合を簡素化し、トークンとシークレットをクライアントバンドルから除外します。
2. ネットワーク経由で送信するkBを減らすためにデータを削減し、アプリを大幅に高速化します。
3. `escapeHtml`のように、多くのコードをブラウザバンドルからサーバーに移動し、アプリを高速化します。さらに、コードをサーバーに移動すると、サーバー側のコードは非同期操作のUI状態を気にする必要がないため、通常、コードの保守が容易になります。

繰り返しますが、RemixはサーバーサイドのJavaScript APIを使用してデータベースやその他のサービスと直接通信することで、唯一のサーバーとして使用できますが、フロントエンドのバックエンドとしても完璧に機能します。アプリケーションロジックのために既存のAPIサーバーをそのままにして、RemixにUIを接続させましょう。

