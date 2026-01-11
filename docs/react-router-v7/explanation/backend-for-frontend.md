---
title: Backend For Frontend
---

# Backend For Frontend

[MODES: framework]

<br/>
<br/>

React Router はフルスタックアプリケーションとして機能しますが、「Backend For Frontend」アーキテクチャにも完璧に適合します。

BFF戦略は、フロントエンドWebアプリを提供し、必要なサービス（データベース、メーラー、ジョブキュー、既存のバックエンドAPI（REST、GraphQL）など）に接続するという役割に範囲を限定したWebサーバーを採用します。UIがブラウザからこれらのサービスに直接連携するのではなく、BFFに接続し、BFFがサービスに接続します。

成熟したアプリには、Ruby、Elixir、PHP などで書かれた多くのバックエンドアプリケーションコードがすでに存在します。React Router の利点を得るためだけに、それらすべてをサーバーサイドJavaScriptランタイムに移行させる正当な理由はありません。その代わりに、React Router アプリをフロントエンドのバックエンドとして利用できます。

loaders や actions から、バックエンドに直接 `fetch` を使用できます。

```tsx lines=[7,13,17]
import escapeHtml from "escape-html";

export async function loader() {
  const apiUrl = "https://api.example.com/some-data.json";
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
  return { prunedData };
}
```

ブラウザから直接フェッチする場合と比較して、このアプローチにはいくつかの利点があります。上記の強調された行は、以下の方法を示しています。

1.  サードパーティの連携を簡素化し、トークンやシークレットをクライアントバンドルから除外する
2.  データを剪定してネットワーク経由で送信するKBを減らし、アプリを大幅に高速化する
3.  `escapeHtml` のような多くのコードをブラウザバンドルからサーバーに移動することで、アプリを高速化します。さらに、サーバーサイドのコードは非同期操作のためのUIの状態を心配する必要がないため、コードをサーバーに移動すると、通常、コードの保守が容易になります。

繰り返しになりますが、React Router は、サーバーサイドJavaScript API を使用してデータベースやその他のサービスと直接通信することで、唯一のサーバーとして使用できます。しかし、フロントエンドのバックエンドとしても完璧に機能します。既存のAPIサーバーをアプリケーションロジックのために保持し、React Router にUIを接続させましょう。