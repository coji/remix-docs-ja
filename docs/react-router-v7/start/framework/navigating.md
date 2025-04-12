---
title: ナビゲーション
order: 6
---

# ナビゲーション

[MODES: framework]

## はじめに

ユーザーは、`<Link>`、`<NavLink>`、`<Form>`、`redirect`、および `useNavigate` を使用してアプリケーション内を移動します。

## NavLink

このコンポーネントは、アクティブ状態と保留状態をレンダリングする必要があるナビゲーションリンク用です。

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

`NavLink` は、CSS で簡単にスタイルを設定できるように、さまざまな状態のデフォルトのクラス名をレンダリングします。

```css
a.active {
  color: red;
}

a.pending {
  animate: pulse 1s infinite;
}

a.transitioning {
  /* css transition is running */
}
```

また、インラインスタイルや条件付きレンダリングのために、状態を持つ `className`、`style`、および `children` にコールバックプロパティがあります。

```tsx
// className
<NavLink
  to="/messages"
  className={({ isActive, isPending, isTransitioning }) =>
    [
      isPending ? "pending" : "",
      isActive ? "active" : "",
      isTransitioning ? "transitioning" : "",
    ].join(" ")
  }
>
  メッセージ
</NavLink>
```

```tsx
// style
<NavLink
  to="/messages"
  style={({ isActive, isPending, isTransitioning }) => {
    return {
      fontWeight: isActive ? "bold" : "",
      color: isPending ? "red" : "black",
      viewTransitionName: isTransitioning ? "slide" : "",
    };
  }}
>
  メッセージ
</NavLink>
```

```tsx
// children
<NavLink to="/tasks">
  {({ isActive, isPending, isTransitioning }) => (
    <span className={isActive ? "active" : ""}>タスク</span>
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

## Form

フォームコンポーネントは、ユーザーが提供する `URLSearchParams` を使用してナビゲートするために使用できます。

```tsx
<Form action="/search">
  <input type="text" name="q" />
</Form>
```

ユーザーが入力に「journey」と入力して送信すると、次の場所に移動します。

```
/search?q=journey
```

`<Form method="post" />` を使用したフォームも、action プロパティに移動しますが、データを `URLSearchParams` の代わりに `FormData` として送信します。ただし、`useFetcher()` を使用してフォームデータを POST する方が一般的です。[Fetcher の使用](../../how-to/fetchers) を参照してください。

## redirect

ルートローダーとアクション内で、別の URL への `redirect` を返すことができます。

```tsx
import { redirect } from "react-router";

export async function loader({ request }) {
  let user = await getUser(request);
  if (!user) {
    return redirect("/login");
  }
  return { userName: user.name };
}
```

新しいレコードが作成された後にリダイレクトするのが一般的です。

```tsx
import { redirect } from "react-router";

export async function action({ request }) {
  let formData = await request.formData();
  let project = await createProject(formData);
  return redirect(`/projects/${project.id}`);
}
```

## useNavigate

このフックを使用すると、プログラマーはユーザーの操作なしにユーザーを新しいページに移動させることができます。このフックの使用は一般的ではありません。可能な場合は、このガイドの他の API を使用することをお勧めします。

`useNavigate` の使用は、ユーザーが操作していないが、ナビゲートする必要がある状況のために予約してください。例：

- 非アクティブ後にログアウトする
- クイズなどの時間制限付き UI

```tsx
import { useNavigate } from "react-router";

export function useLogoutAfterInactivity() {
  let navigate = useNavigate();

  useFakeInactivityHook(() => {
    navigate("/logout");
  });
}
```

---

次: [保留中の UI](./pending-ui)
