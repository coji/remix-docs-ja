---
title: React Router
order: 6
---

# React Router

Remixはマルチページアプリとして動作しますが、JavaScriptがロードされると、クライアントサイドのルーティングを使用して、完全なシングルページアプリのユーザーエクスペリエンスを実現し、それに伴うすべての速度とネットワーク効率を実現します。

Remixは[React Router][react_router]の上に構築されており、同じチームによってメンテナンスされています。これは、RemixアプリでReact Routerのすべての機能を使用できることを意味します。

また、Remixの90％は実際にはReact Routerに過ぎないことも意味します。Reactエコシステムで最大の依存関係である、非常に古く、非常に安定したライブラリです。Remixは単にその背後にサーバーを追加するだけです。

## コンポーネントとフックのインポート

RemixはReact Router DOMのすべてのコンポーネントとフックを再エクスポートするため、React Routerを自分でインストールする必要はありません。

🚫 これはしないでください:

```tsx bad
import { useLocation } from "react-router-dom";
```

✅ これをしてください:

```tsx good
import { useLocation } from "@remix-run/react";
```

## 拡張された動作

一部のコンポーネントとフックは、Remixのサーバーレンダリングおよびデータフェッチ機能と連携するように拡張されています。たとえば、`Link`はRemixでデータとリソースをプリフェッチできますが、React Routerバージョンではできません。

🚫 これはしないでください:

```tsx bad
import { Link } from "react-router-dom";

// これは何も行いません
<Link prefetch="intent" />;
```

✅ これをしてください:

```tsx good
import { Link } from "@remix-run/react";

// これはデータとアセットをプリフェッチします
<Link prefetch="intent" />;
```

[react_router]: https://reactrouter.com
