---
title: ナビゲーションのブロック
---

# ナビゲーションのブロック

[MODES: framework, data]

<br/>
<br/>

ユーザーが重要なフォームへの入力などのワークフローの途中にいる場合、そのページから移動するのを防ぎたいことがあります。

この例では以下を示します。

- フォームと、fetcher を用いて呼び出される action を持つ route の設定
- フォームが dirty な状態のときにナビゲーションをブロックする
- ユーザーがページを離れようとしたときに確認を表示する

## 1. フォームを持つ route の設定

フォームを持つ route を追加します。この例では「contact」route を使用します。

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

contact route モジュールにフォームを追加します。

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

## 2. dirty state と onChange handler の追加

フォームの dirty state を追跡するために、単一の boolean と簡単なフォームの onChange handler を使用します。dirty state の追跡方法は異なる場合がありますが、このガイドではこの方法で動作します。

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
      {/* existing code */}
    </fetcher.Form>
  );
}
```

## 3. フォームが dirty な状態のときにナビゲーションをブロックする

```tsx filename=routes/contact.tsx lines=[1,6-8]
import { useBlocker } from "react-router";

export default function Contact() {
  let [isDirty, setIsDirty] = useState(false);
  let fetcher = useFetcher();
  let blocker = useBlocker(
    useCallback(() => isDirty, [isDirty]),
  );

  // ... existing code
}
```

これでナビゲーションはブロックされますが、ユーザーがそれを確認する方法はありません。

## 4. 確認 UI の表示

これはシンプルな div を使用していますが、モーダルダイアログを使用することもできます。

```tsx filename=routes/contact.tsx lines=[19-41]
export default function Contact() {
  let [isDirty, setIsDirty] = useState(false);
  let fetcher = useFetcher();
  let blocker = useBlocker(
    useCallback(() => isDirty, [isDirty]),
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
      {/* existing code */}

      {blocker.state === "blocked" && (
        <div>
          <p>Wait! You didn't send the message yet:</p>
          <p>
            <button
              type="button"
              onClick={() => blocker.proceed()}
            >
              Leave
            </button>{" "}
            <button
              type="button"
              onClick={() => blocker.reset()}
            >
              Stay here
            </button>
          </p>
        </div>
      )}
    </fetcher.Form>
  );
}
```

ユーザーが「Leave」をクリックすると `blocker.proceed()` によってナビゲーションが続行されます。「Stay here」をクリックすると `blocker.reset()` によって blocker がクリアされ、現在のページに留まります。

## 5. action が解決したときに blocker をリセットする

ユーザーが「Leave」または「Stay here」のどちらもクリックせずにフォームを送信した場合、blocker はまだアクティブなままです。action が effect とともに解決したときに blocker をリセットしましょう。

```tsx filename=routes/contact.tsx
useEffect(() => {
  if (fetcher.data?.ok) {
    if (blocker.state === "blocked") {
      blocker.reset();
    }
  }
}, [fetcher.data]);
```

## 6. action が解決したときにフォームをクリアする

ナビゲーションのブロックとは直接関係ありませんが、action が ref とともに解決したときにフォームをクリアしましょう。

```tsx
let formRef = useRef<HTMLFormElement>(null);

// put it on the form
<fetcher.Form
  ref={formRef}
  method="post"
  onChange={(event) => {
    // ... existing code
  }}
>
  {/* existing code */}
</fetcher.Form>;
```

```tsx
useEffect(() => {
  if (fetcher.data?.ok) {
    // clear the form in the effect
    formRef.current?.reset();
    if (blocker.state === "blocked") {
      blocker.reset();
    }
  }
}, [fetcher.data]);
```

あるいは、ナビゲーションが現在ブロックされている場合、blocker をリセットする代わりに、ブロックされたナビゲーションに進むことができます。

```tsx
useEffect(() => {
  if (fetcher.data?.ok) {
    if (blocker.state === "blocked") {
      // proceed with the blocked navigation
      blocker.proceed();
    } else {
      formRef.current?.reset();
    }
  }
}, [fetcher.data]);
```

この場合のユーザーフローは次のとおりです。

- ユーザーがフォームに入力する
- ユーザーが「送信」をクリックするのを忘れ、代わりにリンクをクリックする
- ナビゲーションがブロックされ、確認メッセージが表示される
- ユーザーは「Leave」または「Stay here」をクリックする代わりにフォームを送信する
- ユーザーは要求されたページに移動する