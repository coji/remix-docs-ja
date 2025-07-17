---
title: Backend For Frontend
---

# Backend For Frontend

[MODES: framework]

<br/>
<br/>

React Routerはフルスタックアプリケーションとして機能しますが、「Backend for Frontend」アーキテクチャにも完璧に適合します。

BFF戦略では、フロントエンドのWebアプリを提供し、必要なサービス（データベース、メーラー、ジョブキュー、既存のバックエンドAPI（REST、GraphQL）など）に接続することを目的としたWebサーバーを使用します。UIがブラウザからこれらのサービスに直接統合するのではなく、BFFに接続し、BFFがサービスに接続します。

成熟したアプリには、すでにRuby、Elixir、PHPなどで多くのバックエンドアプリケーションコードがあります。React Routerの利点を得るためだけに、それらすべてをサーバーサイドJavaScriptランタイムに移行する正当な理由はありません。代わりに、React Routerアプリをフロントエンドのバックエンドとして使用できます。

ローダーやアクションからバックエンドに直接`fetch`を使用できます。

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

このアプローチには、ブラウザから直接フェッチする場合と比較して、いくつかの利点があります。上記のハイライトされた行は、次の方法を示しています。

1. サードパーティの統合を簡素化し、トークンとシークレットをクライアントバンドルから除外する
2. データを削減してネットワーク経由で送信するデータ量を減らし、アプリを大幅に高速化する
3. `escapeHtml`のような多くのコードをブラウザバンドルからサーバーに移動し、アプリを高速化します。さらに、サーバーサイドのコードは非同期操作のUI状態を気にする必要がないため、コードをサーバーに移動すると、通常、コードの保守が容易になります。

繰り返しになりますが、React RouterはサーバーサイドJavaScript APIを使用してデータベースや他のサービスと直接通信することで、唯一のサーバーとして使用できますが、フロントエンドのバックエンドとしても完璧に機能します。既存のAPIサーバーをアプリケーションロジックのために保持し、React RouterにUIを接続させましょう。