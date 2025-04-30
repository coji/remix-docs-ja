---
title: コンポーネント
---

# ルートコンポーネント

ルートモジュールのデフォルトエクスポートは、ルートが一致したときにレンダリングされるコンポーネントを定義します。

```tsx filename=app/routes/my-route.tsx
export default function MyRouteComponent() {
  return (
    <div>
      <h1>見てママ！</h1>
      <p>8年くらい経ってもまだReactを使ってるよ。</p>
    </div>
  );
}
```

