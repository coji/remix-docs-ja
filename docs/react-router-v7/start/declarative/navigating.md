---
title: ナビゲーション
order: 3
---

# ナビゲーション

[MODES: declarative]

## はじめに

ユーザーは、`<Link>`、`<NavLink>`、および `useNavigate` を使用してアプリケーション内を移動します。

## NavLink

このコンポーネントは、アクティブな状態をレンダリングする必要があるナビゲーションリンク用です。

```tsx
import { NavLink } from "react-router";

export function MyAppNav() {
  return (
    <nav>
      <NavLink to="/" end>
        ホーム
      </NavLink>
      <NavLink to="/trending" end>
        トレンドのコンサート
      </NavLink>
      <NavLink to="/concerts">すべてのコンサート</NavLink>
      <NavLink to="/account">アカウント</NavLink>
    </nav>
  );
}
```

`NavLink` がアクティブな場合、CSS で簡単にスタイルを設定できるように、自動的に `.active` クラス名が設定されます。

```css
a.active {
  color: red;
}
```

また、`className`、`style`、および `children` には、インラインスタイルや条件付きレンダリングのためのアクティブな状態を持つコールバックプロパティがあります。

```tsx
// className
<NavLink
  to="/messages"
  className={({ isActive }) =>
    isActive ? "text-red-500" : "text-black"
  }
>
  メッセージ
</NavLink>
```

```tsx
// style
<NavLink
  to="/messages"
  style={({ isActive }) => ({
    color: isActive ? "red" : "black",
  })}
>
  メッセージ
</NavLink>
```

```tsx
// children
<NavLink to="/message">
  {({ isActive }) => (
    <span className={isActive ? "active" : ""}>
      {isActive ? "👉" : ""} タスク
    </span>
  )}
</NavLink>
```

## Link

リンクにアクティブなスタイルが必要ない場合は、`<Link>` を使用します。

```tsx
import { Link } from "react-router";

export function LoggedOutMessage() {
  return (
    <p>
      ログアウトしました。{" "}
      <Link to="/login">再度ログイン</Link>
    </p>
  );
}
```

## useNavigate

このフックを使用すると、ユーザーの操作なしに、プログラマーがユーザーを新しいページに移動させることができます。

通常のナビゲーションには、`Link` または `NavLink` を使用するのが最適です。これらは、キーボードイベント、アクセシビリティラベル、「新しいウィンドウで開く」、右クリックコンテキストメニューなど、より優れたデフォルトのユーザーエクスペリエンスを提供します。

`useNavigate` の使用は、ユーザーが操作していないが、ナビゲートする必要がある状況に限定してください。例：

- フォームの送信が完了した後
- 非アクティブ後にログアウトさせる
- クイズなどの時間制限付き UI

```tsx
import { useNavigate } from "react-router";

export function LoginPage() {
  let navigate = useNavigate();

  return (
    <>
      <MyHeader />
      <MyLoginForm
        onSuccess={() => {
          navigate("/dashboard");
        }}
      />
      <MyFooter />
    </>
  );
}
```

---

次へ: [URL 値](./url-values)