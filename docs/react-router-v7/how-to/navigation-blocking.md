---
title: ナビゲーションブロッキング
---

# ナビゲーションブロッキング

[MODES: framework, data]

<br/>
<br/>

ユーザーが重要なフォームの入力など、ワークフローの途中にいる場合、ページからの離脱を防ぎたい場合があります。

この例では、以下を示します。

- フォームとフェッチャーで呼び出されるアクションを持つルートの設定
- フォームがダーティな場合のナビゲーションのブロック
- ユーザーがページを離れようとしたときの確認の表示

## 1. フォームを持つルートを設定する

フォームを持つルートを追加します。この例では "contact" ルートを使用します。

```ts filename=routes.ts
import {
  type RouteConfig,
  index,
  route,
} from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("contact", "routes/contact.tsx"),
] satisfies RouteConfig;
```

contact ルートモジュールにフォームを追加します。

```tsx filename=routes/contact.tsx
import { useFetcher } from "react-router";
import type { Route } from "./+types/contact";

export async function action({
  request,
}: Route.ActionArgs) {
  let formData = await request.formData();
  let email = formData.get("email");
  let message = formData.get("message");
  console.log(email, message);
  return { ok: true };
}

export default function Contact() {
  let fetcher = useFetcher();

  return (
    <fetcher.Form method="post">
      <p>
        <label>
          Email: <input name="email" type="email" />
        </label>
      </p>
      <p>
        <textarea name="message" />
      </p>
      <p>
        <button type="submit">
          {fetcher.state === "idle" ? "Send" : "Sending..."}
        </button>
      </p>
    </fetcher.Form>
  );
}
```

## 2. ダーティ状態と onChange ハンドラを追加する

フォームのダーティ状態を追跡するために、単一のブール値と簡単なフォームの onChange ハンドラを使用します。ダーティ状態の追跡方法は異なる場合がありますが、このガイドではこれで機能します。

```tsx filename=routes/contact.tsx lines=[2,8-12]
export default function Contact() {
  let [isDirty, setIsDirty] = useState(false);
  let fetcher = useFetcher();

  return (
    <fetcher.Form
      method="post"
      onChange={(event) => {
        let email = event.currentTarget.email.value;
        let message = event.currentTarget.message.value;
        setIsDirty(Boolean(email || message));
      }}
    >
      {/* 既存のコード */}
    </fetcher.Form>
  );
}
```

## 3. フォームがダーティな場合にナビゲーションをブロックする

```tsx filename=routes/contact.tsx lines=[1,6-8]
import { useBlocker } from "react-router";

export default function Contact() {
  let [isDirty, setIsDirty] = useState(false);
  let fetcher = useFetcher();
  let blocker = useBlocker(
    useCallback(() => isDirty, [isDirty])
  );

  // ... 既存のコード
}
```

これでナビゲーションはブロックされますが、ユーザーがそれを確認する方法はありません。

## 4. 確認UIを表示する

これは単純な div を使用しますが、モーダルダイアログを使用することもできます。

```tsx filename=routes/contact.tsx lines=[19-41]
export default function Contact() {
  let [isDirty, setIsDirty] = useState(false);
  let fetcher = useFetcher();
  let blocker = useBlocker(
    useCallback(() => isDirty, [isDirty])
  );

  return (
    <fetcher.Form
      method="post"
      onChange={(event) => {
        let email = event.currentTarget.email.value;
        let message = event.currentTarget.message.value;
        setIsDirty(Boolean(email || message));
      }}
    >
      {/* 既存のコード */}

      {blocker.state === "blocked" && (
        <div>
          <p>待ってください！まだメッセージを送信していません:</p>
          <p>
            <button
              type="button"
              onClick={() => blocker.proceed()}
            >
              離れる
            </button>{" "button"> 
            <button
              type="button"
              onClick={() => blocker.reset()}
            >
              ここに留まる
            </button>
          </p>
        </div>
      )}
    </fetcher.Form>
  );
}
```

ユーザーが「離れる」をクリックすると、`blocker.proceed()` がナビゲーションを続行します。「ここに留まる」をクリックすると、`blocker.reset()` がブロッカーをクリアし、現在のページに留まります。

## 5. アクションが解決したときにブロッカーをリセットする

ユーザーが「離れる」または「ここに留まる」のどちらもクリックせずにフォームを送信した場合、ブロッカーはまだアクティブなままです。エフェクトを使用して、アクションが解決したときにブロッカーをリセットしましょう。

```tsx filename=routes/contact.tsx
useEffect(() => {
  if (fetcher.data?.ok) {
    if (blocker.state === "blocked") {
      blocker.reset();
    }
  }
}, [fetcher.data]);
```

## 6. アクションが解決したときにフォームをクリアする

ナビゲーションブロッキングとは無関係ですが、ref を使用してアクションが解決したときにフォームをクリアしましょう。

```tsx
let formRef = useRef<HTMLFormElement>(null);

// フォームに設定します
<fetcher.Form
  ref={formRef}
  method="post"
  onChange={(event) => {
    // ... 既存のコード
  }}
>
  {/* 既存のコード */}
</fetcher.Form>;
```

```tsx
useEffect(() => {
  if (fetcher.data?.ok) {
    // エフェクト内でフォームをクリアします
    formRef.current?.reset();
    if (blocker.state === "blocked") {
      blocker.reset();
    }
  }
}, [fetcher.data]);
```

あるいは、ナビゲーションが現在ブロックされている場合、ブロッカーをリセットする代わりに、ブロックされたナビゲーションを続行することもできます。

```tsx
useEffect(() => {
  if (fetcher.data?.ok) {
    if (blocker.state === "blocked") {
      // ブロックされたナビゲーションを続行します
      blocker.proceed();
    } else {
      formRef.current?.reset();
    }
  }
}, [fetcher.data]);
```

この場合のユーザーフローは次のとおりです。

- ユーザーがフォームに入力する
- ユーザーが「送信」をクリックするのを忘れて、代わりにリンクをクリックする
- ナビゲーションがブロックされ、確認メッセージが表示される
- 「離れる」または「ここに留まる」をクリックする代わりに、ユーザーはフォームを送信する
- ユーザーは要求されたページに移動する