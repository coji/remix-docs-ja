---
title: ステート管理
---

# ステート管理

[MODES: framework, data]
<br/>
<br/>

React におけるステート管理は、通常、クライアント側でサーバーデータの同期されたキャッシュを維持することを含みます。しかし、React Router をフレームワークとして使用する場合、その本質的なデータ同期の処理方法により、従来のキャッシュソリューションのほとんどが冗長になります。

## React におけるステート管理の理解

典型的な React のコンテキストでは、「ステート管理」と言うとき、主にサーバーの状態とクライアントをどのように同期させるかについて議論しています。より適切な用語は「キャッシュ管理」かもしれません。なぜなら、サーバーが信頼できる唯一の情報源であり、クライアントの状態は主にキャッシュとして機能しているからです。

React で一般的なキャッシュソリューションには、以下のようなものがあります。

- **Redux:** JavaScript アプリケーションのための予測可能な状態コンテナ。
- **React Query:** React で非同期データをフェッチ、キャッシュ、更新するためのフック。
- **Apollo:** GraphQL と統合された JavaScript のための包括的な状態管理ライブラリ。

特定のシナリオでは、これらのライブラリの使用が正当化される場合があります。ただし、React Router のユニークなサーバー中心のアプローチでは、その有用性は低下します。実際、ほとんどの React Router アプリケーションはそれらを完全に省略しています。

## React Router が状態をどのように簡素化するか

React Router は、ローダー、アクション、および再検証による自動同期を備えたフォームなどのメカニズムを介して、バックエンドとフロントエンドの間のギャップをシームレスに埋めます。これにより、開発者はキャッシュ、ネットワーク通信、またはデータ再検証を管理することなく、コンポーネント内でサーバーの状態を直接使用できるようになり、クライアント側のキャッシュのほとんどが冗長になります。

React Router では、典型的な React の状態パターンを使用することがアンチパターンになる可能性がある理由を以下に示します。

1.  **ネットワーク関連の状態:** React の状態がネットワークに関連するものを管理している場合（ローダーからのデータ、保留中のフォーム送信、ナビゲーション状態など）、React Router がすでに管理している状態を管理している可能性があります。

    -   **[`useNavigation`][use_navigation]**: このフックを使用すると、`navigation.state`、`navigation.formData`、`navigation.location` などにアクセスできます。
    -   **[`useFetcher`][use_fetcher]**: これにより、`fetcher.state`、`fetcher.formData`、`fetcher.data` などとのやり取りが容易になります。
    -   **[`loaderData`][loader_data]**: ルートのデータにアクセスします。
    -   **[`actionData`][action_data]**: 最新のアクションからのデータにアクセスします。

2.  **React Router へのデータの保存:** 開発者が React の状態に保存しようとする多くのデータは、React Router により自然な場所があります。

    -   **URL Search Params:** 状態を保持する URL 内のパラメータ。
    -   **[Cookie][cookies]:** ユーザーのデバイスに保存される小さなデータ。
    -   **[サーバーセッション][sessions]:** サーバーで管理されるユーザーセッション。
    -   **サーバーキャッシュ:** より迅速な取得のためにサーバー側でキャッシュされたデータ。

3.  **パフォーマンスに関する考慮事項:** クライアントの状態は、冗長なデータフェッチを回避するために利用されることがあります。React Router では、`loader` 内で [`Cache-Control`][cache_control_header] ヘッダーを使用することで、ブラウザのネイティブキャッシュを利用できます。ただし、このアプローチには制限があり、慎重に使用する必要があります。通常、バックエンドクエリを最適化するか、サーバーキャッシュを実装する方が有益です。これは、そのような変更がすべてのユーザーにメリットをもたらし、個々のブラウザキャッシュの必要性をなくすためです。

React Router に移行する開発者として、従来の React パターンを適用するのではなく、その固有の効率性を認識し、受け入れることが不可欠です。React Router は、状態管理に対する合理化されたソリューションを提供し、コードの削減、最新のデータ、および状態同期のバグをなくします。

## 例

### ネットワーク関連の状態

ネットワーク関連の状態を管理するための React Router の内部状態の使用例については、[保留中の UI][pending_ui] を参照してください。

### URL Search Params

ユーザーがリストビューまたは詳細ビューの間でカスタマイズできる UI を考えてみましょう。あなたの直感は React の状態に手を伸ばすかもしれません。

```tsx bad lines=[2,6,9]
export function List() {
  const [view, setView] = useState("list");
  return (
    <div>
      <div>
        <button onClick={() => setView("list")}>
          リストとして表示
        </button>
        <button onClick={() => setView("details")}>
          詳細付きで表示
        </button>
      </div>
      {view === "list" ? <ListView /> : <DetailView />}
    </div>
  );
}
```

ここで、ユーザーがビューを変更したときに URL を更新したいとします。状態の同期に注意してください。

```tsx bad lines=[7,16,24]
import { useNavigate, useSearchParams } from "react-router";

export function List() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [view, setView] = useState(
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
          詳細付きで表示
        </button>
      </div>
      {view === "list" ? <ListView /> : <DetailView />}
    </div>
  );
}
```

状態を同期する代わりに、退屈な古い HTML フォームを使用して、URL の状態を直接読み取り、設定できます。

```tsx good lines=[5,9-16]
import { Form, useSearchParams } from "react-router";

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
          詳細付きで表示
        </button>
      </Form>
      {view === "list" ? <ListView /> : <DetailView />}
    </div>
  );
}
```

### 永続的な UI の状態

サイドバーの表示/非表示を切り替える UI を考えてみましょう。状態を処理する方法は 3 つあります。

1.  React の状態
2.  ブラウザのローカルストレージ
3.  Cookie

この議論では、各方法に関連するトレードオフを分析します。

#### React の状態

React の状態は、一時的な状態ストレージのためのシンプルなソリューションを提供します。

**長所**:

-   **シンプル**: 実装と理解が簡単。
-   **カプセル化**: 状態はコンポーネントにスコープされます。

**短所**:

-   **一時的**: ページのリフレッシュ、後でページに戻る、またはコンポーネントのマウント解除と再マウントを乗り越えられません。

**実装**:

```tsx
function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div>
      <button onClick={() => setIsOpen((open) => !open)}>
        {isOpen ? "閉じる" : "開く"}
      </button>
      <aside hidden={!isOpen}>
        <Outlet />
      </aside>
    </div>
  );
}
```

#### ローカルストレージ

コンポーネントのライフサイクルを超えて状態を永続化するには、ブラウザのローカルストレージがステップアップです。より高度な例については、[クライアントデータ][client_data] に関するドキュメントを参照してください。

**長所**:

-   **永続的**: ページのリフレッシュやコンポーネントのマウント/アンマウントを超えて状態を維持します。
-   **カプセル化**: 状態はコンポーネントにスコープされます。

**短所**:

-   **同期が必要**: React コンポーネントは、現在の状態を初期化および保存するためにローカルストレージと同期する必要があります。
-   **サーバーレンダリングの制限**: [`window`][window_global] および [`localStorage`][local_storage_global] オブジェクトはサーバー側のレンダリング中はアクセスできないため、状態はエフェクトを使用してブラウザで初期化する必要があります。
-   **UI のちらつき**: 最初のページロードでは、ローカルストレージの状態がサーバーによってレンダリングされたものと一致しない可能性があり、JavaScript がロードされると UI がちらつきます。

**実装**:

```tsx
function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);

  // 最初に同期する
  useLayoutEffect(() => {
    const isOpen = window.localStorage.getItem("sidebar");
    setIsOpen(isOpen);
  }, []);

  // 変更時に同期する
  useEffect(() => {
    window.localStorage.setItem("sidebar", isOpen);
  }, [isOpen]);

  return (
    <div>
      <button onClick={() => setIsOpen((open) => !open)}>
        {isOpen ? "閉じる" : "開く"}
      </button>
      <aside hidden={!isOpen}>
        <Outlet />
      </aside>
    </div>
  );
}
```

このアプローチでは、状態はエフェクト内で初期化する必要があります。これは、サーバー側のレンダリング中の問題を回避するために重要です。`localStorage` から React の状態を直接初期化すると、`window.localStorage` がサーバーレンダリング中に利用できないため、エラーが発生します。

```tsx bad lines=[4]
function Sidebar() {
  const [isOpen, setIsOpen] = useState(
    // エラー: window が定義されていません
    window.localStorage.getItem("sidebar"),
  );

  // ...
}
```

エフェクト内で状態を初期化すると、サーバーでレンダリングされた状態とローカルストレージに保存された状態との間に不一致が生じる可能性があります。この不一致により、ページがレンダリングされた直後に UI が短時間ちらつき、回避する必要があります。

#### Cookie

Cookie は、このユースケースに対する包括的なソリューションを提供します。ただし、この方法では、コンポーネント内で状態にアクセスできるようにする前に、追加の予備設定が必要になります。

**長所**:

-   **サーバーレンダリング**: 状態は、レンダリングやサーバーアクションのためにサーバー上で利用できます。
-   **信頼できる唯一の情報源**: 状態の同期の手間を省きます。
-   **永続性**: ページロードやコンポーネントのマウント/アンマウントを超えて状態を維持します。データベースバックアップセッションに切り替えると、状態はデバイス間で永続化することもできます。
-   **プログレッシブエンハンスメント**: JavaScript がロードされる前でも機能します。

**短所**:

-   **ボイラープレート**: ネットワークのため、より多くのコードが必要です。
-   **公開**: 状態は単一のコンポーネントにカプセル化されておらず、アプリの他の部分も Cookie を認識する必要があります。

**実装**:

まず、Cookie オブジェクトを作成する必要があります。

```tsx
import { createCookie } from "react-router";
export const prefs = createCookie("prefs");
```

次に、サーバーアクションとローダーを設定して、Cookie を読み書きします。

```tsx filename=app/routes/sidebar.tsx
import { data, Outlet } from "react-router";
import type { Route } from "./+types/sidebar";

import { prefs } from "./prefs-cookie";

// Cookie から状態を読み取る
export async function loader({
  request,
}: Route.LoaderArgs) {
  const cookieHeader = request.headers.get("Cookie");
  const cookie = (await prefs.parse(cookieHeader)) || {};
  return data({ sidebarIsOpen: cookie.sidebarIsOpen });
}

// Cookie に状態を書き込む
export async function action({
  request,
}: Route.ActionArgs) {
  const cookieHeader = request.headers.get("Cookie");
  const cookie = (await prefs.parse(cookieHeader)) || {};
  const formData = await request.formData();

  const isOpen = formData.get("sidebar") === "open";
  cookie.sidebarIsOpen = isOpen;

  return data(isOpen, {
    headers: {
      "Set-Cookie": await prefs.serialize(cookie),
    },
  });
}
```

サーバーコードが設定されたら、UI で Cookie の状態を使用できます。

```tsx
function Sidebar({ loaderData }: Route.ComponentProps) {
  const fetcher = useFetcher();
  let { sidebarIsOpen } = loaderData;

  // 楽観的な UI を使用して、UI の状態をすぐに変更する
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
      <aside hidden={!sidebarIsOpen}>
        <Outlet />
      </aside>
    </div>
  );
}
```

これは確かに、ネットワークリクエストとレスポンスを考慮するためにアプリケーションのより多くの部分に触れるより多くのコードですが、UX は大幅に改善されています。さらに、状態は状態の同期を必要とせずに、信頼できる唯一の情報源から取得されます。

要約すると、議論された各方法は、独自の利点と課題を提供します。

-   **React の状態**: シンプルだが一時的な状態管理を提供します。
-   **ローカルストレージ**: 永続性を提供しますが、同期の要件と UI のちらつきがあります。
-   **Cookie**: 追加のボイラープレートのコストで、堅牢で永続的な状態管理を提供します。

これらのいずれも間違っていませんが、訪問を超えて状態を永続化したい場合は、Cookie が最高のユーザーエクスペリエンスを提供します。

### フォームの検証とアクションデータ

クライアント側の検証はユーザーエクスペリエンスを向上させることができますが、サーバー側の処理に重点を置き、複雑さを処理させることで、同様の機能強化を実現できます。

次の例は、ネットワーク状態の管理、サーバーからの状態の調整、およびクライアント側とサーバー側の両方で冗長な検証の実装に伴う固有の複雑さを示しています。これは単なる例示であるため、見つかった明らかなバグや問題はご容赦ください。

```tsx bad lines=[2,11,27,38,63]
export function Signup() {
  // 多数の React の状態宣言
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [userName, setUserName] = useState("");
  const [userNameError, setUserNameError] = useState(null);

  const [password, setPassword] = useState(null);
  const [passwordError, setPasswordError] = useState("");

  // クライアント側のサーバー側ロジックの複製
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

  // 手動ネットワークインタラクション処理
  async function handleSubmit() {
    if (validateForm()) {
      setSubmitting(true);
      const res = await postJSON("/api/signup", {
        userName,
        password,
      });
      const json = await res.json();
      setIsSubmitting(false);

      // クライアントへのサーバー状態の同期
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
            // フェッチのためのフォーム状態の同期
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
            // フェッチのためのフォーム状態の同期
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

バックエンドエンドポイント `/api/signup` も検証を実行し、エラーフィードバックを送信します。重複するユーザー名の検出など、一部の重要な検証は、クライアントがアクセスできない情報を使用してサーバー側でのみ実行できることに注意してください。

```tsx bad
export async function signupHandler(request: Request) {
  const errors = await validateSignupRequest(request);
  if (errors) {
    return { ok: false, errors: errors };
  }
  await signupUser(request);
  return { ok: true, errors: null };
}
```

次に、これを React Router ベースの実装と比較してみましょう。アクションは一貫していますが、`actionData` を介してサーバーの状態を直接利用し、React Router が本質的に管理するネットワーク状態を活用することで、コンポーネントが大幅に簡素化されています。

```tsx filename=app/routes/signup.tsx good lines=[20-22]
import { useNavigation } from "react-router";
import type { Route } from "./+types/signup";

export async function action({
  request,
}: ActionFunctionArgs) {
  const errors = await validateSignupRequest(request);
  if (errors) {
    return { ok: false, errors: errors };
  }
  await signupUser(request);
  return { ok: true, errors: null };
}

export function Signup({
  actionData,
}: Route.ComponentProps) {
  const navigation = useNavigation();

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

前の例からの広範な状態管理は、わずか 3 行のコードに凝縮されています。このようなネットワークインタラクションのために、React の状態、変更イベントリスナー、送信ハンドラー、および状態管理ライブラリの必要性を排除します。

サーバーの状態への直接アクセスは、`actionData` を介して、ネットワークの状態は `useNavigation` (または `useFetcher`) を介して可能になります。

ボーナスパーティーのトリックとして、フォームは JavaScript がロードされる前でも機能します ([プログレッシブエンハンスメント][progressive_enhancement] を参照)。React Router がネットワーク操作を管理する代わりに、デフォルトのブラウザの動作が介入します。

ネットワーク操作の状態の管理と同期に苦労している場合は、React Router がよりエレガントなソリューションを提供する可能性があります。

[use_navigation]: https://api.reactrouter.com/v7/functions/react_router.useNavigation
[use_fetcher]: https://api.reactrouter.com/v7/functions/react_router.useFetcher
[loader_data]: ../start/framework/data-loading
[action_data]: ../start/framework/actions
[cookies]: ./sessions-and-cookies#cookies
[sessions]: ./sessions-and-cookies#sessions
[cache_control_header]: https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Cache-Control
[pending_ui]: ../start/framework/pending-ui
[client_data]: ../how-to/client-data
[window_global]: https://developer.mozilla.org/en-US/docs/Web/API/Window/window
[local_storage_global]: https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage
[progressive_enhancement]: ./progressive-enhancement