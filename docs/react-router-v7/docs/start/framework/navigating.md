---
title: ナビゲーション
order: 6
---

# ナビゲーション

ユーザーは、`<Link>`、`<NavLink>`、`<Form>`、`redirect`、`useNavigate` を使用してアプリケーション内を移動します。

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
        注目のコンサート
      </NavLink>
      <NavLink to="/concerts">全てのコンサート</NavLink>
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

また、`className`、`style`、`children` には、インラインスタイルや条件付きレンダリングのための状態を持つコールバックプロップもあります。

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

アクティブなスタイルを必要としないリンクには `<Link>` を使用します。

```tsx
import { Link } from "react-router";

export function LoggedOutMessage() {
  return (
    <p>
      ログアウトされました。{" "}
      <Link to="/login">再度ログイン</Link>
    </p>
  );
}
```

## Form

フォームコンポーネントは、ユーザーが提供した `URLSearchParams` を使用してナビゲーションに使用できます。

```tsx
<Form action="/search">
  <input type="text" name="q" />
</Form>
```

ユーザーが入力に「journey」と入力して送信すると、次の場所に移動します。

```
/search?q=journey
```

`<Form method="post" />` を持つフォームも、action プロップに移動しますが、`URLSearchParams` ではなく `FormData` としてデータを送信します。ただし、フォームデータの POST には `useFetcher()` を使用する方が一般的です。[フェッチャの使用](../how-to/fetchers) を参照してください。


## redirect

ルートローダーとアクション内では、別の URL に `redirect` することができます。

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

作成後に新しいレコードにリダイレクトするのが一般的です。

```tsx
import { redirect } from "react-router";

export async function action({ request }) {
  let formData = await request.formData();
  let project = await createProject(formData);
  return redirect(`/projects/${project.id}`);
}
```

## useNavigate

このフックにより、プログラマーはユーザーの操作なしにユーザーを新しいページに移動できます。このフックの使用はまれであるべきです。可能な場合は、このガイドの他のAPIを使用することをお勧めします。

`useNavigate` の使用は、ユーザーが操作していないがナビゲーションが必要な状況に限定してください。例：

- 非アクティブ後のログアウト
- クイズなどの時間制限のあるUI


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

次：[保留中のUI](./pending-ui)

