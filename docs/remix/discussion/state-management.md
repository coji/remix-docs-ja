---
title: State Management
order: 9
---

# ステート管理

Reactにおけるステート管理は、通常、クライアント側でサーバーデータの同期されたキャッシュを維持することを伴います。しかし、Remixでは、データ同期を本質的に処理する方法のため、従来のキャッシュソリューションのほとんどが冗長になります。

## Reactにおける状態管理の理解

一般的なReactの文脈で「状態管理」と言う場合、主にサーバーの状態とクライアントの状態をどのように同期させるかについて議論しています。より適切な用語としては「キャッシュ管理」と言えるかもしれません。なぜなら、サーバーが真実の情報源であり、クライアントの状態は主にキャッシュとして機能しているからです。

Reactでよく使われるキャッシュソリューションには、以下のようなものがあります。

* **Redux:** JavaScriptアプリのための予測可能な状態コンテナ。
* **React Query:** Reactで非同期データをフェッチ、キャッシュ、更新するためのフック。
* **Apollo:** GraphQLと統合されたJavaScriptのための包括的な状態管理ライブラリ。

特定のシナリオでは、これらのライブラリの使用が正当化される場合があります。しかし、Remixのユニークなサーバー中心のアプローチでは、これらのライブラリの有用性は低下します。実際、ほとんどのRemixアプリケーションでは、これらのライブラリを完全に使用していません。

## Remix が状態をどのように簡略化するか

[フルスタックデータフロー][fullstack_data_flow]で議論したように、Remix はローダー、アクション、フォームなどのメカニズムを通じて、バックエンドとフロントエンド間のギャップをシームレスに埋め、リバリデーションによる自動同期を実現します。これにより、開発者はキャッシュ、ネットワーク通信、データのリバリデーションを管理することなく、コンポーネント内でサーバーの状態を直接使用できるようになり、ほとんどのクライアント側のキャッシュが冗長になります。

Remix では、典型的な React の状態パターンを使用することがアンチパターンになる可能性がある理由を以下に示します。

1. **ネットワーク関連の状態:** React の状態が、ローダーからのデータ、保留中のフォーム送信、ナビゲーション状態など、ネットワークに関連するものを管理している場合、それは Remix がすでに管理している状態を管理している可能性が高いです。

   * **[`useNavigation`][use_navigation]**: このフックは、`navigation.state`、`navigation.formData`、`navigation.location` などへのアクセスを提供します。
   * **[`useFetcher`][use_fetcher]**: これは、`fetcher.state`、`fetcher.formData`、`fetcher.data` などとのインタラクションを容易にします。
   * **[`useLoaderData`][use_loader_data]**: ルートのデータにアクセスします。
   * **[`useActionData`][use_action_data]**: 最新のアクションからのデータにアクセスします。

2. **Remix でのデータの保存:** 開発者が React の状態に保存したくなる多くのデータは、Remix により自然な場所があります。例えば：

   * **URL 検索パラメータ:** 状態を保持する URL 内のパラメータ。
   * **Cookie:** ユーザーのデバイスに保存される小さなデータ。
   * **サーバーセッション:** サーバーで管理されるユーザーセッション。
   * **サーバーキャッシュ:** より迅速な取得のためにサーバー側でキャッシュされたデータ。

3. **パフォーマンスに関する考慮事項:** クライアントの状態は、冗長なデータフェッチを避けるために利用されることがあります。Remix では、`loader` 内で [`Cache-Control`][cache_control_header] ヘッダーを使用することで、ブラウザのネイティブキャッシュを活用できます。ただし、このアプローチには制限があり、慎重に使用する必要があります。通常は、バックエンドクエリを最適化するか、サーバーキャッシュを実装する方が有益です。これは、そのような変更がすべてのユーザーに利益をもたらし、個々のブラウザキャッシュの必要性をなくすためです。

Remix に移行する開発者として、従来の React パターンを適用するのではなく、その固有の効率性を認識し、受け入れることが不可欠です。Remix は、より少ないコード、最新のデータ、状態同期のバグがない、合理化された状態管理ソリューションを提供します。

[fullstack_data_flow]: ./data-flow
[use_navigation]: ../hooks/use-navigation
[use_fetcher]: ../hooks/use-fetcher
[use_loader_data]: ../hooks/use-loader-data
[use_action_data]: ../hooks/use-action-data
[cache_control_header]: https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Cache-Control

## 例

### ネットワーク関連の状態

ネットワーク関連の状態を管理するためにRemixの内部状態を使用する例については、[保留中のUI][pending_ui]を参照してください。

### URL検索パラメータ

ユーザーがリスト表示と詳細表示を切り替えられるUIを考えてみましょう。直感的にはReactのstateを使うかもしれません。

```tsx bad lines=[2,6,9]
export function List() {
  const [view, setView] = React.useState("list");
  return (
    <div>
      <div>
        <button onClick={() => setView("list")}>
          リスト表示
        </button>
        <button onClick={() => setView("details")}>
          詳細表示
        </button>
      </div>
      {view === "list" ? <ListView /> : <DetailView />}
    </div>
  );
}
```

次に、ユーザーがビューを変更したときにURLを更新したいとします。stateの同期に注目してください。

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
          リスト表示
        </button>
        <button
          onClick={() => {
            setView("details");
            navigate(`?view=details`);
          }}
        >
          詳細表示
        </button>
      </div>
      {view === "list" ? <ListView /> : <DetailView />}
    </div>
  );
}
```

stateを同期する代わりに、退屈な昔ながらのHTMLフォームを使って、URL内のstateを直接読み書きできます。

```tsx good lines=[5,9-16]
import { Form, useSearchParams } from "@remix-run/react";

export function List() {
  const [searchParams] = useSearchParams();
  const view = searchParams.get("view") || "list";

  return (
    <div>
      <Form>
        <button name="view" value="list">
          リスト表示
        </button>
        <button name="view" value="details">
          詳細表示
        </button>
      </Form>
      {view === "list" ? <ListView /> : <DetailView />}
    </div>
  );
}
```

### 持続的なUI状態

サイドバーの表示/非表示を切り替えるUIを考えてみましょう。状態を管理する方法は3つあります。

1. Reactの状態
2. ブラウザのローカルストレージ
3. Cookie

この議論では、それぞれの方法に関連するトレードオフを分析します。

#### React ステート

React ステートは、一時的な状態を保存するためのシンプルなソリューションを提供します。

**利点**:

* **シンプル**: 実装と理解が容易です。
* **カプセル化**: ステートはコンポーネントのスコープに限定されます。

**欠点**:

* **一時的**: ページのリフレッシュ、後でページに戻る、またはコンポーネントのマウント解除と再マウントをしても保持されません。

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

コンポーネントのライフサイクルを超えて状態を永続化するには、ブラウザのローカルストレージが一段上の選択肢となります。

**利点**:

* **永続的**: ページのリフレッシュやコンポーネントのマウント/アンマウントをまたいで状態を維持します。
* **カプセル化**: 状態はコンポーネントのスコープに限定されます。

**欠点**:

* **同期が必要**: Reactコンポーネントは、現在の状態を初期化および保存するためにローカルストレージと同期する必要があります。
* **サーバーレンダリングの制限**: [`window`][window_global] および [`localStorage`][local_storage_global] オブジェクトはサーバーサイドレンダリング中はアクセスできないため、状態はエフェクトを使用してブラウザで初期化する必要があります。
* **UIのちらつき**: 初期のページロード時、ローカルストレージの状態がサーバーによってレンダリングされたものと一致しない場合があり、JavaScriptがロードされるとUIがちらつきます。

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

このアプローチでは、状態はエフェクト内で初期化する必要があります。これは、サーバーサイドレンダリング中の問題を回避するために重要です。`localStorage`から直接Reactの状態を初期化すると、サーバーレンダリング中に`window.localStorage`が利用できないため、エラーが発生します。さらに、アクセスできたとしても、ユーザーのブラウザのローカルストレージを反映しません。

```tsx bad lines=[4]
function Sidebar() {
  const [isOpen, setIsOpen] = React.useState(
    // エラー: windowが定義されていません
    window.localStorage.getItem("sidebar")
  );

  // ...
}
```

エフェクト内で状態を初期化することにより、サーバーでレンダリングされた状態とローカルストレージに保存された状態との間に不一致が生じる可能性があります。この不一致は、ページがレンダリングされた直後にUIがわずかにちらつく原因となり、避けるべきです。

#### クッキー

クッキーはこのユースケースに対して包括的なソリューションを提供します。ただし、この方法では、コンポーネント内で状態にアクセス可能にする前に、追加の事前設定が必要になります。

**利点**:

* **サーバーレンダリング**: 状態はレンダリングのため、さらにはサーバーアクションのためにもサーバー上で利用可能です。
* **単一の信頼できる情報源**: 状態の同期の手間を排除します。
* **永続性**: ページロードやコンポーネントのマウント/アンマウントをまたいで状態を維持します。データベースバックアップのセッションに切り替えれば、デバイスをまたいで状態を永続化することも可能です。
* **プログレッシブエンハンスメント**: JavaScriptがロードされる前でも機能します。

**欠点**:

* **ボイラープレート**: ネットワークを考慮する必要があるため、より多くのコードが必要です。
* **露出**: 状態は単一のコンポーネントにカプセル化されず、アプリの他の部分もクッキーを認識する必要があります。

**実装**:

まず、クッキーオブジェクトを作成する必要があります。

```tsx
import { createCookie } from "@remix-run/node";
export const prefs = createCookie("prefs");
```

次に、クッキーを読み書きするためのサーバーアクションとローダーを設定します。

```tsx
import type {
  ActionFunctionArgs,
  LoaderFunctionArgs,
} from "@remix-run/node"; // or cloudflare/deno
import { json } from "@remix-run/node"; // or cloudflare/deno

import { prefs } from "./prefs-cookie";

// クッキーから状態を読み取る
export async function loader({
  request,
}: LoaderFunctionArgs) {
  const cookieHeader = request.headers.get("Cookie");
  const cookie = (await prefs.parse(cookieHeader)) || {};
  return json({ sidebarIsOpen: cookie.sidebarIsOpen });
}

// クッキーに状態を書き込む
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

サーバーコードの設定が完了したら、UIでクッキーの状態を使用できます。

```tsx
function Sidebar({ children }) {
  const fetcher = useFetcher();
  let { sidebarIsOpen } = useLoaderData<typeof loader>();

  // オプティミスティックUIを使用して、UIの状態を即座に変更する
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

これは、ネットワークリクエストとレスポンスを考慮するためにアプリケーションのより多くの部分に触れるコードであることは確かですが、UXは大幅に向上します。さらに、状態は状態同期を必要とせずに単一の信頼できる情報源から取得されます。

要約すると、議論された各方法は、それぞれ独自の利点と課題を提供します。

* **React state**: シンプルだが一時的な状態管理を提供します。
* **ローカルストレージ**: 永続性を提供しますが、同期の要件とUIのちらつきがあります。
* **クッキー**: 追加のボイラープレートを犠牲にして、堅牢で永続的な状態管理を提供します。

これらのどれも間違っているわけではありませんが、訪問をまたいで状態を永続化したい場合は、クッキーが最高のユーザーエクスペリエンスを提供します。

### フォームのバリデーションとアクションデータ

クライアントサイドでのバリデーションはユーザーエクスペリエンスを向上させることができますが、サーバーサイド処理に重点を置き、複雑な処理をサーバーに任せることで、同様の改善を実現できます。

以下の例は、ネットワーク状態の管理、サーバーからの状態の調整、クライアントとサーバーの両側での冗長なバリデーションの実装という、本質的な複雑さを示しています。これはあくまで例示なので、明らかなバグや問題点についてはご容赦ください。

```tsx bad lines=[2,14,30,41,66]
export function Signup() {
  // 多数のReact State宣言
  const [isSubmitting, setIsSubmitting] =
    React.useState(false);

  const [userName, setUserName] = React.useState("");
  const [userNameError, setUserNameError] =
    React.useState(null);

  const [password, setPassword] = React.useState(null);
  const [passwordError, setPasswordError] =
    React.useState("");

  // クライアントでサーバーサイドのロジックを複製
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

  // 手動でのネットワークインタラクション処理
  async function handleSubmit() {
    if (validateForm()) {
      setSubmitting(true);
      const res = await postJSON("/api/signup", {
        userName,
        password,
      });
      const json = await res.json();
      setIsSubmitting(false);

      // サーバーの状態をクライアントに同期
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
            // fetchのためのフォーム状態の同期
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
            // fetchのためのフォーム状態の同期
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

バックエンドのエンドポイント `/api/signup` もバリデーションを実行し、エラーフィードバックを送信します。重複したユーザー名の検出など、クライアントがアクセスできない情報を使用してサーバー側でのみ実行できる重要なバリデーションがあることに注意してください。

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

次に、これをRemixベースの実装と比較してみましょう。アクションは一貫していますが、[`useActionData`][use_action_data] を介してサーバーの状態を直接利用し、Remixが本質的に管理するネットワーク状態を活用することで、コンポーネントは大幅に簡素化されます。

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

前の例の広範な状態管理は、わずか3行のコードに凝縮されています。このようなネットワークインタラクションのために、Reactの状態、変更イベントリスナー、送信ハンドラー、状態管理ライブラリの必要性がなくなります。

サーバーの状態への直接アクセスは `useActionData` を通じて可能になり、ネットワークの状態は `useNavigation` (または `useFetcher`) を通じて可能になります。

おまけとして、フォームはJavaScriptが読み込まれる前でも機能します。Remixがネットワーク操作を管理する代わりに、デフォルトのブラウザの動作が介入します。

ネットワーク操作の状態を管理および同期することに苦労している場合は、Remixがよりエレガントなソリューションを提供してくれる可能性があります。

[fullstack_data_flow]: ./data-flow
[use_navigation]: ../hooks/use-navigation
[use_fetcher]: ../hooks/use-fetcher
[use_loader_data]: ../hooks/use-loader-data
[use_action_data]: ../hooks/use-action-data
[cache_control_header]: https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Cache-Control
[pending_ui]: ./pending-ui
[window_global]: https://developer.mozilla.org/en-US/docs/Web/API/Window/window
[local_storage_global]: https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage
