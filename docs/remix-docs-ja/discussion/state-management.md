---
title: 状態管理
order: 9
---

# 状態管理

Reactでの状態管理は、通常、クライアント側でサーバーデータの同期されたキャッシュを維持することを伴います。しかし、Remixでは、データ同期をどのように処理するかによって、従来のキャッシュソリューションのほとんどが冗長になります。

## Reactにおける状態管理の理解

一般的なReactコンテキストでは、「状態管理」という用語は、サーバーの状態とクライアントをどのように同期するかを主に指しています。より適切な用語は「キャッシュ管理」かもしれません。なぜなら、サーバーは真実の源であり、クライアントの状態はほとんどキャッシュとして機能しているからです。

Reactにおける一般的なキャッシュソリューションには、以下のようなものがあります。

- **Redux:** JavaScriptアプリケーション向けの予測可能な状態コンテナ。
- **React Query:** Reactで非同期データをフェッチ、キャッシュ、更新するためのフック。
- **Apollo:** GraphQLと統合するJavaScriptのための包括的な状態管理ライブラリ。

特定のシナリオでは、これらのライブラリを使用する必要がある場合もありますが、Remix独自のサーバー重視のアプローチでは、それらの有用性は低くなります。実際、ほとんどのRemixアプリケーションでは、これらのライブラリはまったく使用されていません。

## Remixによる状態の簡素化

[フルスタックデータフロー][fullstack_data_flow]で説明したように、Remixは、ローダー、アクション、フォームなどのメカニズムを通じて、バックエンドとフロントエンド間のギャップをシームレスに橋渡しし、再検証を通じて自動同期を実現します。これにより、開発者は、キャッシュ、ネットワーク通信、データ再検証を管理することなく、コンポーネント内でサーバー状態を直接使用することができ、クライアント側のキャッシュのほとんどが冗長になります。

一般的なReactの状態パターンがRemixでアンチパターンになる理由を以下に示します。

1. **ネットワーク関連の状態:** Reactの状態がネットワーク関連のものを管理している場合（ローダーからのデータ、保留中のフォーム送信、ナビゲーション状態など）、それはRemixがすでに管理している状態を管理している可能性があります。

   - **[`useNavigation`][use_navigation]**: このフックは、`navigation.state`、`navigation.formData`、`navigation.location`などにアクセスできます。
   - **[`useFetcher`][use_fetcher]**: これは、`fetcher.state`、`fetcher.formData`、`fetcher.data`などと対話することを容易にします。
   - **[`useLoaderData`][use_loader_data]**: ルートのデータにアクセスします。
   - **[`useActionData`][use_action_data]**: 最新のアクションからのデータにアクセスします。

2. **Remixでのデータの格納:** 開発者がReactの状態に格納しようとするかもしれない多くのデータは、Remixでより自然な場所があります。たとえば、次のようなものがあります。

   - **URL検索パラメータ:** URL内の状態を保持するパラメータ。
   - **Cookie:** ユーザーのデバイスに保存される小さなデータ。
   - **サーバーセッション:** サーバーで管理されるユーザーセッション。
   - **サーバーキャッシュ:** より迅速な取得のためにサーバー側にキャッシュされたデータ。

3. **パフォーマンスの考慮事項:** 場合によっては、クライアントの状態は、冗長なデータフェッチを回避するために使用されます。Remixでは、[`Cache-Control`][cache_control_header]ヘッダーを`loader`で使用して、ブラウザのネイティブキャッシュを利用できます。しかし、このアプローチには限界があり、慎重に使用する必要があります。通常は、バックエンドクエリを最適化するか、サーバーキャッシュを実装する方が有益です。これは、このような変更はすべてのユーザーに恩恵をもたらし、個々のブラウザキャッシュの必要性を排除するためです。

Remixに移行する開発者として、従来のReactパターンを適用するのではなく、Remix固有の効率性を認識し、受け入れることが重要です。Remixは、状態管理に対する簡素化されたソリューションを提供し、コードの削減、最新データ、状態同期バグの解消につながります。

## 例

### ネットワーク関連の状態

Remixの内部状態を使用してネットワーク関連の状態を管理する方法の例については、[保留中のUI][pending_ui]を参照してください。

### URL検索パラメータ

ユーザーがリストビューと詳細ビューを切り替えることができるUIを考えてみましょう。Reactの状態に手を伸ばしたくなるかもしれません。

```tsx bad lines=[2,6,9]
export function List() {
  const [view, setView] = React.useState("list");
  return (
    <div>
      <div>
        <button onClick={() => setView("list")}>
          リストとして表示
        </button>
        <button onClick={() => setView("details")}>
          詳細を表示
        </button>
      </div>
      {view === "list" ? <ListView /> : <DetailView />}
    </div>
  );
}
```

ユーザーがビューを変更したときにURLが更新されるようにしましょう。状態の同期に注意してください。

```tsx bad lines=[10,19,27]
import {
  useNavigate,
  useSearchParams,
} from "@remix-run/react";

export function List() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [view, setView] = React.useState(
    searchParams.get("view") || "list"
  );

  return (
    <div>
      <div>
        <button
          onClick={() => {
            setView("list");
            navigate(`?view=list`);
          }}
        >
          リストとして表示
        </button>
        <button
          onClick={() => {
            setView("details");
            navigate(`?view=details`);
          }}
        >
          詳細を表示
        </button>
      </div>
      {view === "list" ? <ListView /> : <DetailView />}
    </div>
  );
}
```

状態を同期する代わりに、退屈な古いHTMLフォームを使用して、URLで直接状態の読み取りと設定を行うことができます。

```tsx good lines=[5,9-16]
import { Form, useSearchParams } from "@remix-run/react";

export function List() {
  const [searchParams] = useSearchParams();
  const view = searchParams.get("view") || "list";

  return (
    <div>
      <Form>
        <button name="view" value="list">
          リストとして表示
        </button>
        <button name="view" value="details">
          詳細を表示
        </button>
      </Form>
      {view === "list" ? <ListView /> : <DetailView />}
    </div>
  );
}
```

### 永続的なUI状態

サイドバーの表示を切り替えるUIを考えてみましょう。状態を処理するには3つの方法があります。

1. Reactの状態
2. ブラウザのローカルストレージ
3. Cookie

この議論では、各方法に関連するトレードオフを分析します。

#### Reactの状態

Reactの状態は、一時的な状態の格納のための簡単なソリューションを提供します。

**メリット**:

- **シンプル**: 実装と理解が簡単。
- **カプセル化**: 状態はコンポーネントにスコープされます。

**デメリット**:

- **一時的**: ページのリフレッシュ、ページへの後からの復帰、コンポーネントのアンマウントと再マウントでは維持されません。

**実装**:

```tsx
function Sidebar({ children }) {
  const [isOpen, setIsOpen] = React.useState(false);
  return (
    <div>
      <button onClick={() => setIsOpen((open) => !open)}>
        {isOpen ? "閉じる" : "開く"}
      </button>
      <aside hidden={!isOpen}>{children}</aside>
    </div>
  );
}
```

#### ローカルストレージ

コンポーネントのライフサイクルを超えて状態を永続化するには、ブラウザのローカルストレージが一段上のソリューションとなります。

**メリット**:

- **永続的**: ページのリフレッシュやコンポーネントのマウント/アンマウントを跨いで状態を維持します。
- **カプセル化**: 状態はコンポーネントにスコープされます。

**デメリット**:

- **同期が必要**: Reactコンポーネントは、ローカルストレージと同期して、現在の状態を初期化および保存する必要があります。
- **サーバーサイドレンダリングの制限**: [`window`][window_global]および[`localStorage`][local_storage_global]オブジェクトは、サーバーサイドレンダリング中はアクセスできないため、状態はエフェクトを使用してブラウザで初期化する必要があります。
- **UIのちらつき**: ページの最初の読み込み時には、ローカルストレージの状態がサーバーでレンダリングされた状態と一致せず、JavaScriptが読み込まれるとUIがちらつきます。

**実装**:

```tsx
function Sidebar({ children }) {
  const [isOpen, setIsOpen] = React.useState(false);

  // 初期同期
  useLayoutEffect(() => {
    const isOpen = window.localStorage.getItem("sidebar");
    setIsOpen(isOpen);
  }, []);

  // 変更時の同期
  useEffect(() => {
    window.localStorage.setItem("sidebar", isOpen);
  }, [isOpen]);

  return (
    <div>
      <button onClick={() => setIsOpen((open) => !open)}>
        {isOpen ? "閉じる" : "開く"}
      </button>
      <aside hidden={!isOpen}>{children}</aside>
    </div>
  );
}
```

このアプローチでは、状態はエフェクト内で初期化する必要があります。これは、サーバーサイドレンダリング中に問題が発生しないようにするために重要です。`localStorage`からReactの状態を直接初期化すると、サーバーサイドレンダリング中は`window.localStorage`が利用できないためエラーが発生します。さらに、アクセスできたとしても、ユーザーのブラウザのローカルストレージを反映しません。

```tsx bad lines=[4]
function Sidebar() {
  const [isOpen, setIsOpen] = React.useState(
    // エラー: windowは定義されていません
    window.localStorage.getItem("sidebar")
  );

  // ...
}
```

エフェクト内で状態を初期化することで、サーバーでレンダリングされた状態とローカルストレージに保存されている状態の間に不一致が生じる可能性があります。この不一致は、ページがレンダリングされた直後に短いUIのちらつきにつながり、避けるべきです。

#### Cookie

Cookieは、このユースケースのための包括的なソリューションを提供します。ただし、この方法では、コンポーネント内で状態にアクセスできるようにするための予備的な設定が追加で必要になります。

**メリット**:

- **サーバーサイドレンダリング**: 状態はサーバーでレンダリングのために、さらにはサーバーアクションのために利用可能です。
- **単一の真実の源**: 状態の同期の手間を省きます。
- **永続性**: ページの読み込みやコンポーネントのマウント/アンマウントを跨いで状態を維持します。データベースでバックアップされたセッションに切り替えると、デバイス間でも状態を維持できます。
- **漸進的強化**: JavaScriptが読み込まれる前から機能します。

**デメリット**:

- **ボイラープレート**: ネットワークのためにコードの量が増える。
- **露出**: 状態は単一のコンポーネントにカプセル化されていないため、アプリの他の部分ではCookieを認識する必要があります。

**実装**:

まず、Cookieオブジェクトを作成する必要があります。

```tsx
import { createCookie } from "@remix-run/node";
export const prefs = createCookie("prefs");
```

次に、Cookieの読み取りと書き込みを行うサーバーアクションとローダーを設定します。

```tsx
import type {
  ActionFunctionArgs,
  LoaderFunctionArgs,
} from "@remix-run/node"; // or cloudflare/deno
import { json } from "@remix-run/node"; // or cloudflare/deno

import { prefs } from "./prefs-cookie";

// Cookieから状態を読み取る
export async function loader({
  request,
}: LoaderFunctionArgs) {
  const cookieHeader = request.headers.get("Cookie");
  const cookie = (await prefs.parse(cookieHeader)) || {};
  return json({ sidebarIsOpen: cookie.sidebarIsOpen });
}

// Cookieに状態を書き込む
export async function action({
  request,
}: ActionFunctionArgs) {
  const cookieHeader = request.headers.get("Cookie");
  const cookie = (await prefs.parse(cookieHeader)) || {};
  const formData = await request.formData();

  const isOpen = formData.get("sidebar") === "open";
  cookie.sidebarIsOpen = isOpen;

  return json(isOpen, {
    headers: {
      "Set-Cookie": await prefs.serialize(cookie),
    },
  });
}
```

サーバー側のコードが設定されたら、Cookieの状態をUIで使用できます。

```tsx
function Sidebar({ children }) {
  const fetcher = useFetcher();
  let { sidebarIsOpen } = useLoaderData<typeof loader>();

  // 楽観的なUIを使用して、UIの状態をすぐに変更する
  if (fetcher.formData?.has("sidebar")) {
    sidebarIsOpen =
      fetcher.formData.get("sidebar") === "open";
  }

  return (
    <div>
      <fetcher.Form method="post">
        <button
          name="sidebar"
          value={sidebarIsOpen ? "closed" : "open"}
        >
          {sidebarIsOpen ? "閉じる" : "開く"}
        </button>
      </fetcher.Form>
      <aside hidden={!sidebarIsOpen}>{children}</aside>
    </div>
  );
}
```

これは確かに、ネットワークのリクエストとレスポンスを考慮するために、アプリケーションのより多くの部分を扱う必要があるコードですが、UXは大幅に改善されます。さらに、状態は、状態の同期が不要な単一の真実の源から取得されます。

要約すると、議論された各方法は、独自の利点と課題を提供します。

- **Reactの状態**: シンプルながらも一時的な状態管理を提供します。
- **ローカルストレージ**: 永続性を提供しますが、同期とUIのちらつきが必要です。
- **Cookie**: 追加のボイラープレートを犠牲にして、堅牢な永続的な状態管理を提供します。

これらのどれが間違っているわけではありませんが、状態を訪問間で永続化したい場合は、Cookieが最高のユーザーエクスペリエンスを提供します。

### フォームの検証とアクションデータ

クライアント側の検証はユーザーエクスペリエンスを向上させることができますが、サーバー側の処理にさらに重点を置き、複雑さを処理させることで同様の強化を実現できます。

次の例は、ネットワーク状態の管理、サーバーからの状態の調整、クライアント側とサーバー側の両方で検証を冗長に実装することの固有の複雑さを示しています。これは単なる説明なので、明らかなバグや問題があればご容赦ください。

```tsx bad lines=[2,14,30,41,66]
export function Signup() {
  // 多数のReact状態宣言
  const [isSubmitting, setIsSubmitting] =
    React.useState(false);

  const [userName, setUserName] = React.useState("");
  const [userNameError, setUserNameError] =
    React.useState(null);

  const [password, setPassword] = React.useState(null);
  const [passwordError, setPasswordError] =
    React.useState("");

  // サーバー側のロジックをクライアントで複製する
  function validateForm() {
    setUserNameError(null);
    setPasswordError(null);
    const errors = validateSignupForm(userName, password);
    if (errors) {
      if (errors.userName) {
        setUserNameError(errors.userName);
      }
      if (errors.password) {
        setPasswordError(errors.password);
      }
    }
    return Boolean(errors);
  }

  // 手動のネットワークインタラクション処理
  async function handleSubmit() {
    if (validateForm()) {
      setSubmitting(true);
      const res = await postJSON("/api/signup", {
        userName,
        password,
      });
      const json = await res.json();
      setIsSubmitting(false);

      // サーバーの状態をクライアントに同期する
      if (json.errors) {
        if (json.errors.userName) {
          setUserNameError(json.errors.userName);
        }
        if (json.errors.password) {
          setPasswordError(json.errors.password);
        }
      }
    }
  }

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        handleSubmit();
      }}
    >
      <p>
        <input
          type="text"
          name="username"
          value={userName}
          onChange={() => {
            // fetchのためのフォーム状態を同期する
            setUserName(event.target.value);
          }}
        />
        {userNameError ? <i>{userNameError}</i> : null}
      </p>

      <p>
        <input
          type="password"
          name="password"
          onChange={(event) => {
            // fetchのためのフォーム状態を同期する
            setPassword(event.target.value);
          }}
        />
        {passwordError ? <i>{passwordError}</i> : null}
      </p>

      <button disabled={isSubmitting} type="submit">
        サインアップ
      </button>

      {isSubmitting ? <BusyIndicator /> : null}
    </form>
  );
}
```

バックエンドのエンドポイント`/api/signup`も検証を実行し、エラーフィードバックを送信します。重複したユーザー名の検出など、クライアントがアクセスできない情報を使用する必要がある重要な検証は、サーバー側でしか実行できません。

```tsx bad
export async function signupHandler(request: Request) {
  const errors = await validateSignupRequest(request);
  if (errors) {
    return json({ ok: false, errors: errors });
  }
  await signupUser(request);
  return json({ ok: true, errors: null });
}
```

では、これをRemixベースの実装と対比してみましょう。アクションは同じですが、[`useActionData`][use_action_data]を使用してサーバー状態を直接利用し、Remixが本質的に管理するネットワーク状態を活用することで、コンポーネントは大幅に簡素化されています。

```tsx filename=app/routes/signup.tsx good lines=[23-25]
import type { ActionFunctionArgs } from "@remix-run/node"; // or cloudflare/deno
import { json } from "@remix-run/node"; // or cloudflare/deno
import {
  useActionData,
  useNavigation,
} from "@remix-run/react";

export async function action({
  request,
}: ActionFunctionArgs) {
  const errors = await validateSignupRequest(request);
  if (errors) {
    return json({ ok: false, errors: errors });
  }
  await signupUser(request);
  return json({ ok: true, errors: null });
}

export function Signup() {
  const navigation = useNavigation();
  const actionData = useActionData<typeof action>();

  const userNameError = actionData?.errors?.userName;
  const passwordError = actionData?.errors?.password;
  const isSubmitting = navigation.formAction === "/signup";

  return (
    <Form method="post">
      <p>
        <input type="text" name="username" />
        {userNameError ? <i>{userNameError}</i> : null}
      </p>

      <p>
        <input type="password" name="password" />
        {passwordError ? <i>{passwordError}</i> : null}
      </p>

      <button disabled={isSubmitting} type="submit">
        サインアップ
      </button>

      {isSubmitting ? <BusyIndicator /> : null}
    </Form>
  );
}
```

前の例で見た、広範囲にわたる状態管理は、わずか3行のコードに凝縮されています。Reactの状態、変更イベントリスナー、送信ハンドラー、このようなネットワークインタラクションのための状態管理ライブラリの必要性を排除します。

`useActionData`を通してサーバー状態への直接アクセスが可能になり、`useNavigation`（または`useFetcher`）を通してネットワーク状態へのアクセスが可能になります。

さらに、JavaScriptが読み込まれる前にフォームが機能します。Remixがネットワーク操作を管理する代わりに、ブラウザのデフォルトの動作が介入します。

ネットワーク操作の状態管理と同期に苦労している場合は、Remixがより洗練されたソリューションを提供している可能性があります。

[fullstack_data_flow]: ./data-flow
[use_navigation]: ../hooks/use-navigation
[use_fetcher]: ../hooks/use-fetcher
[use_loader_data]: ../hooks/use-loader-data
[use_action_data]: ../hooks/use-action-data
[cache_control_header]: https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Cache-Control
[pending_ui]: ./pending-ui
[window_global]: https://developer.mozilla.org/en-US/docs/Web/API/Window/window
[local_storage_global]: https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage


