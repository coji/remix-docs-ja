---
title: コンポーネント
---

# ルートコンポーネント

ルートモジュールのデフォルトエクスポートは、ルートが一致した場合にレンダリングされるコンポーネントを定義します。

```tsx filename=app/routes/my-route.tsx
export default function MyRouteComponent() {
  return (
    <div>
      <h1>Look ma!</h1>
      <p>I'm still using React after like 8 years.</p>
    </div>
  );
}
```
