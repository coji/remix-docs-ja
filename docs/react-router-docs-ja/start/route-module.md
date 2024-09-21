---
title: ルートモジュール
order: 3
---

# ルートモジュール

`routes.ts` で参照されるファイルは、すべてのルートのエントリポイントです。

```tsx filename=app/routes.ts
route("teams/:teamId", "./team.tsx");
//           ルートモジュール ^^^^^^^^
```

ルートモジュールは、モジュールのデフォルトエクスポートとして `defineRoute$` で定義されます。

```tsx filename=app/team.tsx
import { defineRoute$ } from "react-router";

export default defineRoute$({
  params: ["teamId"],

  async loader({ params }) {
    let team = await fetchTeam(params.teamId);
    return { name: team.name };
  },

  Component({ data }) {
    return <h1>{data.name}</h1>;
  },
});
```

これらのルートモジュールは、React Router の動作の大部分を定義します。

- 自動コード分割
- データの読み込み
- アクション
- 再検証
- エラー境界
- など

この後のチュートリアルでは、これらの機能について詳しく説明します。

## 静的解析

奇妙な $ 記号は、Vite プラグインがソースコードで何らかの処理を行う必要があり、静的に解析する必要があることを意味します。このため、すべての JavaScript パターンがここで有効なわけではありません。制限の詳細については、[ルートモジュール制限](../discussion/route-module-limitations) を参照してください。

## 型安全性

`params` キーは、モジュール内とビルド時の両方で型安全性を提供し、ルートが正しく構成されていることを保証します。たとえば、ルートが `:id` を使用しているが、ルートモジュールが `params: ['teamId']` を宣言している場合、ビルド時に通知されます。

```tsx filename=app/routes.ts
route("teams/:id", "./team.tsx");
```

```tsx filename=app/team.tsx
import { defineRoute$ } from "react-router";

export default defineRoute$({
  params: ["teamId"],
  // ビルドエラー: 'teamId' は 'teams/:id' と一致しません

  // ...
});
```

