---
title: ナビゲーション
order: 3
---

# ナビゲーション

ユーザーは `<Link>`、`<NavLink>`、`useNavigate` を使用してアプリケーション内を移動します。

## NavLink

このコンポーネントは、アクティブ状態をレンダリングする必要があるナビゲーションリンク用です。

```tsx
import { NavLink } from "react-router";

export function MyAppNav() {
  return (
    <nav>
      <NavLink to="/" end>
        ホーム
      </NavLink>
      <NavLink to="/trending" end>
        注目のコンサート
      </NavLink>
      <NavLink to="/concerts">すべてのコンサート</NavLink>
      <NavLink to="/account">アカウント</NavLink>
    </nav>
  );
}
```

`NavLink` がアクティブなときはいつでも、CSS を使用した簡単なスタイル設定のために `.active` クラス名が自動的に追加されます。

```css
a.active {
  color: red;
}
```

また、アクティブ状態を使用してインラインスタイルや条件付きレンダリングを行う `className`、`style`、`children` のコールバックプロップも備えています。

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

アクティブなスタイルが不要なリンクには `<Link>` を使用します。

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

このフックを使用すると、プログラマーはユーザーの操作なしにユーザーを新しいページに移動できます。

通常のナビゲーションには、`Link` または `NavLink` を使用するのが最適です。これらは、キーボードイベント、アクセシビリティのラベル付け、「新しいウィンドウで開く」、右クリックコンテキストメニューなど、より良いデフォルトのユーザーエクスペリエンスを提供します。

`useNavigate` の使用は、ユーザーが操作していないがナビゲーションが必要な状況に限定してください。例：

- フォーム送信完了後
- 非アクティブ後のログアウト
- クイズなどの時間制限のあるUI

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

