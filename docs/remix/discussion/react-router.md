---
title: React Router
order: 6
---

# React Router

Remixはマルチページアプリとして機能しますが、JavaScriptがロードされると、クライアントサイドルーティングを使用して、フルシングルページアプリのユーザーエクスペリエンスを提供します。これには、スピードとネットワーク効率が向上するという利点があります。

Remixは[React Router][react_router]をベースにして構築されており、同じチームによってメンテナンスされています。つまり、RemixアプリでReact Routerのすべての機能を使用できます。

これはまた、Remixの90％が実際にはReact Routerであることを意味します。React Routerは非常に古く、非常に安定したライブラリであり、おそらくReactエコシステムで最大の依存関係です。Remixは単にその背後にサーバーを追加するだけです。

## コンポーネントとフックのインポート

Remixは、React Router DOMのすべてのコンポーネントとフックを再エクスポートするため、React Routerを自分でインストールする必要はありません。

🚫 これは行わないでください。

```tsx bad
import { useLocation } from "react-router-dom";
```

✅ これは行います。

```tsx good
import { useLocation } from "@remix-run/react";
```

## 拡張された動作

いくつかのコンポーネントとフックは、Remixのサーバーレンダリングとデータフェッチ機能で動作するように拡張されています。たとえば、`Link`はReact Routerバージョンでは不可能な、Remixでデータとリソースをプリフェッチできます。

🚫 これは行わないでください。

```tsx bad
import { Link } from "react-router-dom";

// これは何も行いません
<Link prefetch="intent" />;
```

✅ これは行います。

```tsx good
import { Link } from "@remix-run/react";

// これはデータとアセットをプリフェッチします
<Link prefetch="intent" />;
```

[react_router]: https://reactrouter.com

