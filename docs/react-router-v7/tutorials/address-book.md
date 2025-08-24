---
title: アドレス帳
order: 2
---

# アドレス帳

[MODES: framework]

<br />
<br />

ここでは、連絡先を管理できる、小さくても機能豊富なアドレス帳アプリを構築します。データベースやその他の「本番環境対応」のものは使用しないため、React Router が提供する機能に集中できます。もし一緒に進める場合は30〜45分程度、そうでなければすぐに読み終えることができるでしょう。

<docs-info>

もしよろしければ、[React Routerチュートリアルのウォークスルー](https://www.youtube.com/watch?v=pw8FAg07kdo)の動画もご覧ください 🎥

</docs-info>

<img class="tutorial" src="/_docs/v7_address_book_tutorial/01.webp" />

👉 **このマークが表示されたら、アプリで何かをする必要があることを意味します！**

それ以外は、あなたの情報とより深い理解のためのものです。それでは始めましょう。

## セットアップ

👉 **基本的なテンプレートを生成する**

```shellscript nonumber
npx create-react-router@latest --template remix-run/react-router/tutorials/address-book
```

これは非常にシンプルなテンプレートを使用していますが、CSSとデータモデルが含まれているため、React Routerに集中できます。

👉 **アプリを起動する**

```shellscript nonumber
# アプリのディレクトリに移動
cd {アプリを置いた場所}

# まだインストールしていない場合は依存関係をインストール
npm install

# サーバーを起動
npm run dev
```

[http://localhost:5173][http-localhost-5173] を開くと、次のようなスタイルが適用されていない画面が表示されるはずですが、まだ何も表示されていません。

## ルートルート

`app/root.tsx`にあるファイルに注目してください。これは、私たちが["ルートルート"][root-route]と呼ぶものです。これはUIで最初にレンダリングされるコンポーネントであり、通常はページのグローバルレイアウトと、デフォルトの[エラー境界][error-boundaries]が含まれています。

<details>

<summary>ルートコンポーネントのコードを表示するには、ここを展開してください</summary>

```tsx filename=app/root.tsx
import {
  Form,
  Scripts,
  ScrollRestoration,
  isRouteErrorResponse,
} from "react-router";
import type { Route } from "./+types/root";

import appStylesHref from "./app.css?url";

export default function App() {
  return (
    <>
      <div id="sidebar">
        <h1>React Router Contacts</h1>
        <div>
          <Form id="search-form" role="search">
            <input
              aria-label="Search contacts"
              id="q"
              name="q"
              placeholder="Search"
              type="search"
            />
            <div
              aria-hidden
              hidden={true}
              id="search-spinner"
            />
          </Form>
          <Form method="post">
            <button type="submit">New</button>
          </Form>
        </div>
        <nav>
          <ul>
            <li>
              <a href={`/contacts/1`}>Your Name</a>
            </li>
            <li>
              <a href={`/contacts/2`}>Your Friend</a>
            </li>
          </ul>
        </nav>
      </div>
    </>
  );
}

// Layoutコンポーネントは、ルートルートの特別なエクスポートです。
// これは、すべてのルートコンポーネント、HydrateFallback、およびErrorBoundaryのドキュメントの「アプリシェル」として機能します。
// 詳細については、https://reactrouter.com/explanation/special-files#layout-exportを参照してください。
export function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1"
        />
        <link rel="stylesheet" href={appStylesHref} />
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

// アプリケーションの最上位のエラー境界。アプリがエラーをスローしたときにレンダリングされます。
// 詳細については、https://reactrouter.com/start/framework/route-module#errorboundaryを参照してください。
export function ErrorBoundary({
  error,
}: Route.ErrorBoundaryProps) {
  let message = "おっと！";
  let details = "予期しないエラーが発生しました。";
  let stack: string | undefined;

  if (isRouteErrorResponse(error)) {
    message = error.status === 404 ? "404" : "エラー";
    details =
      error.status === 404
        ? "リクエストされたページが見つかりませんでした。"
        : error.statusText || details;
  } else if (
    import.meta.env.DEV &&
    error &&
    error instanceof Error
  ) {
    details = error.message;
    stack = error.stack;
  }

  return (
    <main id="error-page">
      <h1>{message}</h1>
      <p>{details}</p>
      {stack && (
        <pre>
          <code>{stack}</code>
        </pre>
      )}
    </main>
  );
}
```

</details>

## コンタクトルートのUI

サイドバーの項目をクリックすると、デフォルトの404ページが表示されます。URL `/contacts/1` に一致するルートを作成しましょう。

👉 **コンタクトルートモジュールを作成する**

```shellscript nonumber
mkdir app/routes
touch app/routes/contact.tsx
```

このファイルはどこにでも配置できますが、少し整理するために、すべてのルートを `app/routes` ディレクトリ内に配置します。

[ファイルベースルーティング][file-route-conventions]を使用することもできます。

👉 **ルートを設定する**

新しいルートについてReact Routerに伝える必要があります。`routes.ts` は、すべてのルートを設定できる特別なファイルです。

```tsx filename=routes.ts lines=[2,5]
import type { RouteConfig } from "@react-router/dev/routes";
import { route } from "@react-router/dev/routes";

export default [
  route("contacts/:contactId", "routes/contact.tsx"),
] satisfies RouteConfig;
```

React Routerでは、`:` はセグメントを動的にします。これにより、次のURLが `routes/contact.tsx` ルートモジュールに一致するようになりました。

* `/contacts/123`
* `/contacts/abc`

👉 **コンポーネントUIを追加する**

これは単なる要素の集まりです。自由にコピー/ペーストしてください。

```tsx filename=app/routes/contact.tsx
import { Form } from "react-router";

import type { ContactRecord } from "../data";

export default function Contact() {
  const contact = {
    first: "Your",
    last: "Name",
    avatar: "https://placecats.com/200/200",
    twitter: "your_handle",
    notes: "Some notes",
    favorite: true,
  };

  return (
    <div id="contact">
      <div>
        <img
          alt={`${contact.first} ${contact.last} avatar`}
          key={contact.avatar}
          src={contact.avatar}
        />
      </div>

      <div>
        <h1>
          {contact.first || contact.last ? (
            <>
              {contact.first} {contact.last}
            </>
          ) : (
            <i>No Name</i>
          )}
          <Favorite contact={contact} />
        </h1>

        {contact.twitter ? (
          <p>
            <a
              href={`https://twitter.com/${contact.twitter}`}
            >
              {contact.twitter}
            </a>
          </p>
        ) : null}

        {contact.notes ? <p>{contact.notes}</p> : null}

        <div>
          <Form action="edit">
            <button type="submit">Edit</button>
          </Form>

          <Form
            action="destroy"
            method="post"
            onSubmit={(event) => {
              const response = confirm(
                "Please confirm you want to delete this record."
              );
              if (!response) {
                event.preventDefault();
              }
            }}
          >
            <button type="submit">Delete</button>
          </Form>
        </div>
      </div>
    </div>
  );
}

function Favorite({
  contact,
}: {
  contact: Pick<ContactRecord, "favorite">;
}) {
  const favorite = contact.favorite;

  return (
    <Form method="post">
      <button
        aria-label={
          favorite
            ? "Remove from favorites"
            : "Add to favorites"
        }
        name="favorite"
        value={favorite ? "false" : "true"}
      >
        {favorite ? "★" : "☆"}
      </button>
    </Form>
  );
}
```

リンクをクリックするか、[`/contacts/1`][contacts-1] にアクセスすると、何も新しいものが表示されませんか？

<img class="tutorial" src="/_docs/v7_address_book_tutorial/02.webp" />

## ネストされたルートとアウトレット

React Router はネストされたルーティングをサポートしています。子ルートを親レイアウト内でレンダリングするには、親に [`Outlet`][outlet-component] をレンダリングする必要があります。修正しましょう。`app/root.tsx` を開き、中にアウトレットをレンダリングします。

👉 **[`<Outlet />`][outlet-component] をレンダリングする**

```tsx filename=app/root.tsx lines=[3,15-17]
import {
  Form,
  Outlet,
  Scripts,
  ScrollRestoration,
  isRouteErrorResponse,
} from "react-router";

// existing imports & exports

export default function App() {
  return (
    <>
      <div id="sidebar">{/* other elements */}</div>
      <div id="detail">
        <Outlet />
      </div>
    </>
  );
}
```

これで、子ルートがアウトレットを通してレンダリングされるはずです。

<img class="tutorial" loading="lazy" src="/_docs/v7_address_book_tutorial/03.webp" />

## クライアントサイドルーティング

お気づきかもしれませんが、サイドバーのリンクをクリックすると、ブラウザはクライアントサイドルーティングではなく、次のURLに対して完全なドキュメントリクエストを行っており、アプリが完全に再マウントされています。

クライアントサイドルーティングを使用すると、ページ全体をリロードせずにアプリのURLを更新できます。代わりに、アプリは新しいUIをすぐにレンダリングできます。[`<Link>`][link-component]を使って実現しましょう。

👉 **サイドバーの `<a href>` を `<Link to>` に変更してください**

```tsx filename=app/root.tsx lines=[3,20,23]
import {
  Form,
  Link,
  Outlet,
  Scripts,
  ScrollRestoration,
  isRouteErrorResponse,
} from "react-router";

// existing imports & exports

export default function App() {
  return (
    <>
      <div id="sidebar">
        {/* other elements */}
        <nav>
          <ul>
            <li>
              <Link to={`/contacts/1`}>Your Name</Link>
            </li>
            <li>
              <Link to={`/contacts/2`}>Your Friend</Link>
            </li>
          </ul>
        </nav>
      </div>
      {/* other elements */}
    </>
  );
}
```

ブラウザの開発者ツールのネットワークタブを開くと、ドキュメントをリクエストしなくなったことがわかります。

## データのロード

URLセグメント、レイアウト、データは、多くの場合、組み合わさって（3つ組？）います。このアプリでもすでに確認できます。

| URLセグメント         | コンポーネント   | データ               |
| ------------------- | ----------- | ------------------ |
| /                   | `<App>`     | コンタクトのリスト   |
| contacts/:contactId | `<Contact>` | 個々のコンタクト |

この自然な結合のため、React Routerには、ルートコンポーネントにデータを簡単に取り込むためのデータ規約があります。

まず、ルートルートで[`clientLoader`][client-loader]関数を作成してエクスポートし、データをレンダリングします。

👉 **`app/root.tsx`から`clientLoader`関数をエクスポートし、データをレンダリングします**

<docs-info>次のコードには型エラーが含まれています。次のセクションで修正します</docs-info>

```tsx filename=app/root.tsx lines=[2,6-9,11-12,19-42]
// existing imports
import { getContacts } from "./data";

// existing exports

export async function clientLoader() {
  const contacts = await getContacts();
  return { contacts };
}

export default function App({ loaderData }) {
  const { contacts } = loaderData;

  return (
    <>
      <div id="sidebar">
        {/* other elements */}
        <nav>
          {contacts.length ? (
            <ul>
              {contacts.map((contact) => (
                <li key={contact.id}>
                  <Link to={`contacts/${contact.id}`}>
                    {contact.first || contact.last ? (
                      <>
                        {contact.first} {contact.last}
                      </>
                    ) : (
                      <i>No Name</i>
                    )}
                    {contact.favorite ? (
                      <span>★</span>
                    ) : null}
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p>
              <i>No contacts</i>
            </p>
          )}
        </nav>
      </div>
      {/* other elements */}
    </>
  );
}
```

以上です！React Routerは、このデータをUIと自動的に同期させます。サイドバーは次のようになります。

<img class="tutorial" loading="lazy" src="/_docs/v7_address_book_tutorial/04.webp" />

サーバーサイドレンダリング（SSR）を実行できるように、サーバーでデータをロードするのではなく、なぜ「クライアント」でデータをロードしているのか疑問に思うかもしれません。現在、コンタクトサイトは[シングルページアプリ][spa]であるため、サーバーサイドレンダリングはありません。これにより、静的ホスティングプロバイダーへのデプロイが非常に簡単になりますが、React Routerが提供するさまざまな[レンダリング戦略][rendering-strategies]について学ぶことができるように、SSRを有効にする方法について少し詳しく説明します。

## 型安全性

`loaderData` プロパティに型を割り当てていないことに気づいたかもしれません。これを修正しましょう。

👉 **`App` コンポーネントに `ComponentProps` 型を追加してください**

```tsx filename=app/root.tsx lines=[5-7]
// existing imports
import type { Route } from "./+types/root";
// existing imports & exports

export default function App({
  loaderData,
}: Route.ComponentProps) {
  const { contacts } = loaderData;

  // existing code
}
```

ちょっと待って、これは何？これらの型はどこから来たの？！

私たちは定義していませんが、なぜか `clientLoader` から返した `contacts` プロパティについて既に知っています。

これは、React Router が自動的な型安全性を実現するために、[アプリ内の各ルートの型を生成している][type-safety]からです。

## `HydrateFallback` の追加

先ほど、サーバーサイドレンダリングを行わない[シングルページアプリケーション][spa]に取り組んでいると述べました。[`react-router.config.ts`][react-router-config]の中を見ると、これが単純なブール値で設定されていることがわかります。

```tsx filename=react-router.config.ts lines=[4]
import { type Config } from "@react-router/dev/config";

export default {
  ssr: false,
} satisfies Config;
```

ページをリロードするたびに、アプリが読み込まれる前に白い画面が一瞬表示されることに気づき始めたかもしれません。クライアント側でのみレンダリングしているため、アプリの読み込み中にユーザーに表示するものがありません。

👉 **`HydrateFallback` エクスポートを追加する**

[`HydrateFallback`][hydrate-fallback]エクスポートを使用すると、アプリがハイドレートされる（クライアントで初めてレンダリングされる）前に表示されるフォールバックを提供できます。

```tsx filename=app/root.tsx lines=[3-10]
// existing imports & exports

export function HydrateFallback() {
  return (
    <div id="loading-splash">
      <div id="loading-splash-spinner" />
      <p>Loading, please wait...</p>
    </div>
  );
}
```

これで、ページをリロードすると、アプリがハイドレートされる前に、読み込みスプラッシュが一瞬表示されるようになります。

<img class="tutorial" loading="lazy" src="/_docs/v7_address_book_tutorial/05.webp" />

## インデックスルート

アプリをロードしたとき、まだ連絡先ページにいない場合、リストの右側に大きな空白ページが表示されることに気づくでしょう。

<img class="tutorial" loading="lazy" src="/_docs/v7_address_book_tutorial/06.webp" />

ルートに子ルートがある場合、親ルートのパスにいるとき、子ルートが一致しないため、`<Outlet>` は何もレンダリングしません。[インデックスルート][index-route]は、そのスペースを埋めるデフォルトの子ルートと考えることができます。

👉 **ルートルートのインデックスルートを作成する**

```shellscript nonumber
touch app/routes/home.tsx
```

```ts filename=app/routes.ts lines=[2,5]
import type { RouteConfig } from "@react-router/dev/routes";
import { index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("contacts/:contactId", "routes/contact.tsx"),
] satisfies RouteConfig;
```

👉 **インデックスコンポーネントの要素を埋める**

コピー＆ペーストしても構いません。特に変わったことはありません。

```tsx filename=app/routes/home.tsx
export default function Home() {
  return (
    <p id="index-page">
      This is a demo for React Router.
      <br />
      Check out{" "}
      <a href="https://reactrouter.com">
        the docs at reactrouter.com
      </a>
      .
    </p>
  );
}
```

<img class="tutorial" loading="lazy" src="/_docs/v7_address_book_tutorial/07.webp" />

はい、これで空白スペースはなくなりました。ダッシュボード、統計、フィードなどをインデックスルートに配置するのが一般的です。これらはデータローディングにも参加できます。

## Aboutルートの追加

ユーザーが操作できる動的なデータに取り組む前に、めったに変更されない静的なコンテンツを含むページを追加しましょう。Aboutページがこれに最適です。

👉 **aboutルートを作成する**

```shellscript nonumber
touch app/routes/about.tsx
```

`app/routes.ts`にルートを追加することを忘れないでください。

```tsx filename=app/routes.ts lines=[4]
export default [
  index("routes/home.tsx"),
  route("contacts/:contactId", "routes/contact.tsx"),
  route("about", "routes/about.tsx"),
] satisfies RouteConfig;
```

👉 **aboutページのUIを追加する**

特に難しいことはありません。コピー＆ペーストしてください。

```tsx filename=app/routes/about.tsx
import { Link } from "react-router";

export default function About() {
  return (
    <div id="about">
      <Link to="/">← Go to demo</Link>
      <h1>About React Router Contacts</h1>

      <div>
        <p>
          This is a demo application showing off some of the
          powerful features of React Router, including
          dynamic routing, nested routes, loaders, actions,
          and more.
        </p>

        <h2>Features</h2>
        <p>
          Explore the demo to see how React Router handles:
        </p>
        <ul>
          <li>
            Data loading and mutations with loaders and
            actions
          </li>
          <li>
            Nested routing with parent/child relationships
          </li>
          <li>URL-based routing with dynamic segments</li>
          <li>Pending and optimistic UI</li>
        </ul>

        <h2>Learn More</h2>
        <p>
          Check out the official documentation at{" "}
          <a href="https://reactrouter.com">
            reactrouter.com
          </a>{" "}
          to learn more about building great web
          applications with React Router.
        </p>
      </div>
    </div>
  );
}
```

👉 **サイドバーにaboutページへのリンクを追加する**

```tsx filename=app/root.tsx lines=[5-7]
export default function App() {
  return (
    <>
      <div id="sidebar">
        <h1>
          <Link to="about">React Router Contacts</Link>
        </h1>
        {/* other elements */}
      </div>
      {/* other elements */}
    </>
  );
}
```

[aboutページ][about-page]に移動すると、次のようになります。

<img class="tutorial" loading="lazy" src="/_docs/v7_address_book_tutorial/08.webp" />

## レイアウトルート

実際には、aboutページをサイドバーレイアウトの中にネストさせたくありません。サイドバーをレイアウトに移動して、aboutページでレンダリングされないようにしましょう。さらに、aboutページですべての連絡先データをロードするのを避けたいと考えています。

👉 **サイドバーのレイアウトルートを作成する**

このレイアウトルートは好きな場所に名前を付けて配置できますが、`layouts`ディレクトリ内に配置すると、シンプルなアプリの整理に役立ちます。

```shellscript nonumber
mkdir app/layouts
touch app/layouts/sidebar.tsx
```

今のところは、[`<Outlet>`][outlet-component]を返すだけです。

```tsx filename=app/layouts/sidebar.tsx
import { Outlet } from "react-router";

export default function SidebarLayout() {
  return <Outlet />;
}
```

👉 **ルート定義をサイドバーレイアウトの下に移動する**

`layout`ルートを定義して、その中のすべてのマッチしたルートに対してサイドバーを自動的にレンダリングできます。これは基本的に以前の`root`と同じですが、特定のルートにスコープを絞ることができます。

```ts filename=app/routes.ts lines=[4,9,12]
import type { RouteConfig } from "@react-router/dev/routes";
import {
  index,
  layout,
  route,
} from "@react-router/dev/routes";

export default [
  layout("layouts/sidebar.tsx", [
    index("routes/home.tsx"),
    route("contacts/:contactId", "routes/contact.tsx"),
  ]),
  route("about", "routes/about.tsx"),
] satisfies RouteConfig;
```

👉 **レイアウトとデータフェッチをサイドバーレイアウトに移動する**

`clientLoader`と`App`コンポーネント内のすべてをサイドバーレイアウトに移動します。次のようになります。

```tsx filename=app/layouts/sidebar.tsx
import { Form, Link, Outlet } from "react-router";
import { getContacts } from "../data";
import type { Route } from "./+types/sidebar";

export async function clientLoader() {
  const contacts = await getContacts();
  return { contacts };
}

export default function SidebarLayout({
  loaderData,
}: Route.ComponentProps) {
  const { contacts } = loaderData;

  return (
    <>
      <div id="sidebar">
        <h1>
          <Link to="about">React Router Contacts</Link>
        </h1>
        <div>
          <Form id="search-form" role="search">
            <input
              aria-label="Search contacts"
              id="q"
              name="q"
              placeholder="Search"
              type="search"
            />
            <div
              aria-hidden
              hidden={true}
              id="search-spinner"
            />
          </Form>
          <Form method="post">
            <button type="submit">New</button>
          </Form>
        </div>
        <nav>
          {contacts.length ? (
            <ul>
              {contacts.map((contact) => (
                <li key={contact.id}>
                  <Link to={`contacts/${contact.id}`}>
                    {contact.first || contact.last ? (
                      <>
                        {contact.first} {contact.last}
                      </>
                    ) : (
                      <i>No Name</i>
                    )}
                    {contact.favorite ? (
                      <span>★</span>
                    ) : null}
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p>
              <i>No contacts</i>
            </p>
          )}
        </nav>
      </div>
      <div id="detail">
        <Outlet />
      </div>
    </>
  );
}
```

そして、`app/root.tsx`内では、`App`は[`<Outlet>`][outlet-component]を返すだけで、未使用のインポートはすべて削除できます。`root.tsx`に`clientLoader`がないことを確認してください。

```tsx filename=app/root.tsx lines=[3-10]
// existing imports and exports

export default function App() {
  return <Outlet />;
}
```

これで、シャッフルが完了し、aboutページは連絡先データをロードしなくなり、サイドバーレイアウトの中にネストされなくなりました。

<img class="tutorial" loading="lazy" src="/_docs/v7_address_book_tutorial/09.webp" />

## 静的ルートのプリレンダリング

aboutページをリロードすると、クライアントでページがレンダリングされる前に、ほんの一瞬だけローディングスピナーが表示されます。これはあまり良い体験ではありませんし、ページは静的な情報だけなので、ビルド時に静的なHTMLとしてプリレンダリングできるはずです。

👉 **aboutページをプリレンダリングする**

`react-router.config.ts`の中で、React Routerにビルド時に特定のURLをプリレンダリングするように指示するために、設定に[`prerender`][pre-rendering]配列を追加できます。この場合、aboutページだけをプリレンダリングしたいとします。

```ts filename=app/react-router.config.ts lines=[5]
import { type Config } from "@react-router/dev/config";

export default {
  ssr: false,
  prerender: ["/about"],
} satisfies Config;
```

これで、[aboutページ][about-page]に移動してリロードしても、ローディングスピナーは表示されません！

<docs-warning>

リロード時にまだスピナーが表示される場合は、`root.tsx`の`clientLoader`を削除したことを確認してください。

</docs-warning>

## サーバーサイドレンダリング

React Router は、[シングルページアプリケーション][spa]を構築するための優れたフレームワークです。多くのアプリケーションはクライアントサイドレンダリングのみで十分に機能し、*場合によっては*ビルド時にいくつかのページを静的にプリレンダリングするだけで済みます。

もし React Router アプリケーションにサーバーサイドレンダリングを導入したい場合、それは非常に簡単です（以前の `ssr: false` ブール値を覚えていますか？）。

👉 **サーバーサイドレンダリングを有効にする**

```ts filename=app/react-router.config.ts lines=[2]
export default {
  ssr: true,
  prerender: ["/about"],
} satisfies Config;
```

そして今...何も変わっていない？ページがクライアントでレンダリングされる前に、まだ一瞬だけスピナーが表示されていますか？さらに、`clientLoader` を使用しているので、データはまだクライアントでフェッチされているのではないでしょうか？

その通りです！React Router では、必要に応じてクライアントサイドのデータフェッチを行うために `clientLoader`（および `clientAction`）を依然として使用できます。React Router は、仕事に適したツールを使用するための多くの柔軟性を提供します。

サーバーでデータをフェッチするために使用される [`loader`][loader] の使用に切り替えましょう（ご想像の通り）。

👉 **`loader` を使用してデータをフェッチするように切り替える**

```tsx filename=app/layouts/sidebar.tsx lines=[3]
// existing imports

export async function loader() {
  const contacts = await getContacts();
  return { contacts };
}
```

`ssr` を `true` に設定するか `false` に設定するかは、あなたとユーザーのニーズによって異なります。どちらの戦略も完全に有効です。このチュートリアルの残りの部分ではサーバーサイドレンダリングを使用しますが、すべてのレンダリング戦略が React Router のファーストクラスシチズンであることを知っておいてください。

## ローダーにおける URL パラメータ

👉 **サイドバーのリンクのいずれかをクリックしてください**

以前の静的な連絡先ページが再び表示されるはずですが、1つ違いがあります。URL にレコードの実際の ID が含まれるようになりました。

<img class="tutorial" loading="lazy" src="/_docs/v7_address_book_tutorial/10.webp" />

`app/routes.ts` のルート定義の `:contactId` の部分を覚えていますか？これらの動的なセグメントは、URL のその位置にある動的な（変化する）値と一致します。URL 内のこれらの値を「URL パラメータ」、または略して「パラメータ」と呼びます。

これらの `params` は、動的なセグメントと一致するキーを持つローダーに渡されます。たとえば、セグメントの名前は `:contactId` なので、値は `params.contactId` として渡されます。

これらのパラメータは、ID でレコードを検索するためによく使用されます。試してみましょう。

👉 **連絡先ページに `loader` 関数を追加し、`loaderData` でデータにアクセスします**

<docs-info>次のコードには型エラーが含まれています。次のセクションで修正します</docs-info>

```tsx filename=app/routes/contact.tsx lines=[2-3,5-8,10-13]
// existing imports
import { getContact } from "../data";
import type { Route } from "./+types/contact";

export async function loader({ params }: Route.LoaderArgs) {
  const contact = await getContact(params.contactId);
  return { contact };
}

export default function Contact({
  loaderData,
}: Route.ComponentProps) {
  const { contact } = loaderData;

  // existing code
}

// existing code
```

<img class="tutorial" loading="lazy" src="/_docs/v7_address_book_tutorial/11.webp" />

## レスポンスをスローする

`loaderData.contact` の型が `ContactRecord | null` であることに気づくでしょう。自動的な型安全性に基づいて、TypeScript はすでに `params.contactId` が文字列であることを認識していますが、それが有効な ID であることを確認するための処理は何もしていません。連絡先が存在しない可能性があるため、`getContact` は `null` を返す可能性があり、それが型エラーの原因となっています。

コンポーネントコードで連絡先が見つからない可能性を考慮することもできますが、Web 的なやり方としては適切な 404 を送信することです。ローダーでそれを行うことで、すべての問題を一度に解決できます。

```tsx filename=app/routes/contact.tsx lines=[5-7]
// existing imports

export async function loader({ params }: Route.LoaderArgs) {
  const contact = await getContact(params.contactId);
  if (!contact) {
    throw new Response("Not Found", { status: 404 });
  }
  return { contact };
}

// existing code
```

これで、ユーザーが見つからない場合、このパスでのコード実行は停止し、代わりに React Router がエラーパスをレンダリングします。React Router のコンポーネントは、ハッピーパスのみに集中できます 😁

## データミューテーション

すぐに最初の連絡先を作成しますが、その前にHTMLについてお話しましょう。

React Routerは、データミューテーションのプリミティブとしてHTMLフォームのナビゲーションをエミュレートします。これは、JavaScriptのカンブリア爆発以前は唯一の方法でした。そのシンプルさに騙されないでください！React Routerのフォームは、「昔ながらの」Webモデルのシンプルさを持ちながら、クライアントレンダリングアプリのUX機能を提供します。

一部のWeb開発者には馴染みがないかもしれませんが、HTMLの`form`は、リンクをクリックするのと同じように、ブラウザでナビゲーションを引き起こします。唯一の違いはリクエストにあります。リンクはURLのみを変更できますが、`form`はリクエストメソッド（`GET` vs. `POST`）とリクエストボディ（`POST`フォームデータ）も変更できます。

クライアントサイドルーティングがない場合、ブラウザは`form`のデータを自動的にシリアライズし、`POST`の場合はリクエストボディとして、`GET`の場合は[`URLSearchParams`][url-search-params]としてサーバーに送信します。React Routerも同じことを行いますが、リクエストをサーバーに送信する代わりに、クライアントサイドルーティングを使用し、ルートの[`action`][action]関数に送信します。

アプリの「新規」ボタンをクリックして、これを試してみましょう。

<img class="tutorial" loading="lazy" src="/_docs/v7_address_book_tutorial/12.webp" />

React Routerは、このフォームナビゲーションを処理するサーバー側のコードがないため、405を送信します。

## コンタクトの作成

ルートルートで `action` 関数をエクスポートすることで、新しいコンタクトを作成します。ユーザーが「新規」ボタンをクリックすると、フォームはルートルートの action に `POST` します。

👉 **`app/root.tsx` から `action` 関数をエクスポートします**

```tsx filename=app/root.tsx lines=[3,5-8]
// existing imports

import { createEmptyContact } from "./data";

export async function action() {
  const contact = await createEmptyContact();
  return { contact };
}

// existing code
```

以上です！「新規」ボタンをクリックすると、新しいレコードがリストに表示されるはずです 🥳

<img class="tutorial" loading="lazy" src="/_docs/v7_address_book_tutorial/13.webp" />

`createEmptyContact` メソッドは、名前やデータなどが何もない空のコンタクトを作成するだけです。しかし、それでもレコードは作成されます、約束します！

> 🧐 ちょっと待って... サイドバーはどうやって更新されたの？`action` 関数をどこで呼び出したの？データを再取得するコードはどこにあるの？`useState`、`onSubmit`、`useEffect` はどこ？

ここで「昔ながらのウェブ」プログラミングモデルが登場します。[`<Form>`][form-component] は、ブラウザがサーバーにリクエストを送信するのを防ぎ、代わりに [`fetch`][fetch] を使用してルートの `action` 関数に送信します。

ウェブのセマンティクスでは、`POST` は通常、何らかのデータが変更されていることを意味します。慣例により、React Router はこれをヒントとして使用し、`action` が完了した後、ページ上のデータを自動的に再検証します。

実際、すべてが HTML と HTTP であるため、JavaScript を無効にしても、すべてが機能します。React Router がフォームをシリアライズしてサーバーに [`fetch`][fetch] リクエストを行う代わりに、ブラウザがフォームをシリアライズしてドキュメントリクエストを行います。そこから React Router はページをサーバー側でレンダリングして送信します。どちらの場合でも、最終的には同じ UI になります。

ただし、JavaScript は残しておきます。なぜなら、回転するファビコンや静的なドキュメントよりも優れたユーザーエクスペリエンスを実現するつもりだからです。

## データの更新

新しいレコードの情報を入力する方法を追加しましょう。

データの作成と同様に、[`<Form>`][form-component] を使用してデータを更新します。`app/routes/edit-contact.tsx` 内に新しいルートモジュールを作成しましょう。

👉 **連絡先編集ルートを作成する**

```shellscript nonumber
touch app/routes/edit-contact.tsx
```

`app/routes.ts` にルートを追加することを忘れないでください。

```tsx filename=app/routes.ts lines=[5-8]
export default [
  layout("layouts/sidebar.tsx", [
    index("routes/home.tsx"),
    route("contacts/:contactId", "routes/contact.tsx"),
    route(
      "contacts/:contactId/edit",
      "routes/edit-contact.tsx",
    ),
  ]),
  route("about", "routes/about.tsx"),
] satisfies RouteConfig;
```

👉 **編集ページの UI を追加する**

これまで見てきたものと変わりません。自由にコピー/ペーストしてください。

```tsx filename=app/routes/edit-contact.tsx
import { Form } from "react-router";
import type { Route } from "./+types/edit-contact";

import { getContact } from "../data";

export async function loader({ params }: Route.LoaderArgs) {
  const contact = await getContact(params.contactId);
  if (!contact) {
    throw new Response("Not Found", { status: 404 });
  }
  return { contact };
}

export default function EditContact({
  loaderData,
}: Route.ComponentProps) {
  const { contact } = loaderData;

  return (
    <Form key={contact.id} id="contact-form" method="post">
      <p>
        <span>Name</span>
        <input
          aria-label="First name"
          defaultValue={contact.first}
          name="first"
          placeholder="First"
          type="text"
        />
        <input
          aria-label="Last name"
          defaultValue={contact.last}
          name="last"
          placeholder="Last"
          type="text"
        />
      </p>
      <label>
        <span>Twitter</span>
        <input
          defaultValue={contact.twitter}
          name="twitter"
          placeholder="@jack"
          type="text"
        />
      </label>
      <label>
        <span>Avatar URL</span>
        <input
          aria-label="Avatar URL"
          defaultValue={contact.avatar}
          name="avatar"
          placeholder="https://example.com/avatar.jpg"
          type="text"
        />
      </label>
      <label>
        <span>Notes</span>
        <textarea
          defaultValue={contact.notes}
          name="notes"
          rows={6}
        />
      </label>
      <p>
        <button type="submit">Save</button>
        <button type="button">Cancel</button>
      </p>
    </Form>
  );
}
```

新しいレコードをクリックし、「編集」ボタンをクリックしてください。新しいルートが表示されるはずです。

<img class="tutorial" loading="lazy" src="/_docs/v7_address_book_tutorial/14.webp" />

## `FormData` を使った連絡先の更新

先ほど作成した編集ルートは、すでに `form` をレンダリングしています。必要なのは `action` 関数を追加することだけです。React Router は `form` をシリアライズし、[`fetch`][fetch] で `POST` し、すべてのデータを自動的に再検証します。

👉 **編集ルートに `action` 関数を追加する**

```tsx filename=app/routes/edit-contact.tsx lines=[1,4,8,6-15]
import { Form, redirect } from "react-router";
// existing imports

import { getContact, updateContact } from "../data";

export async function action({
  params,
  request,
}: Route.ActionArgs) {
  const formData = await request.formData();
  const updates = Object.fromEntries(formData);
  await updateContact(params.contactId, updates);
  return redirect(`/contacts/${params.contactId}`);
}

// existing code
```

フォームに入力して保存を押すと、このような表示になるはずです！ <small>（スイカを切る忍耐力があれば、もっと見やすくなるかもしれません。）</small>

<img class="tutorial" loading="lazy" src="/_docs/v7_address_book_tutorial/15.webp" />

## ミューテーションに関する議論

> 😑 うまく動いたけど、何が起こっているのか全くわからない...

もう少し詳しく見ていきましょう...

`app/routes/edit-contact.tsx` を開き、`form` 要素を見てください。それぞれに名前が付いていることに注目してください。

```tsx filename=app/routes/edit-contact.tsx lines=[4]
<input
  aria-label="First name"
  defaultValue={contact.first}
  name="first"
  placeholder="First"
  type="text"
/>
```

JavaScript がない場合、フォームが送信されると、ブラウザは [`FormData`][form-data] を作成し、サーバーに送信する際にリクエストのボディとして設定します。前述したように、React Router はそれを防ぎ、代わりに [`fetch`][fetch] を使用してリクエストを `action` 関数に送信することでブラウザをエミュレートします。その際、[`FormData`][form-data] も含めます。

`form` の各フィールドには `formData.get(name)` でアクセスできます。たとえば、上記の入力フィールドの場合、次のようにして姓と名にアクセスできます。

```tsx filename=app/routes/edit-contact.tsx  lines=[6,7] nocopy
export const action = async ({
  params,
  request,
}: ActionFunctionArgs) => {
  const formData = await request.formData();
  const firstName = formData.get("first");
  const lastName = formData.get("last");
  // ...
};
```

フォームフィールドがいくつかあるため、[`Object.fromEntries`][object-from-entries] を使用してそれらをすべてオブジェクトに収集しました。これはまさに `updateContact` 関数が求めているものです。

```tsx filename=app/routes/edit-contact.tsx nocopy
const updates = Object.fromEntries(formData);
updates.first; // "Some"
updates.last; // "Name"
```

`action` 関数を除いて、ここで議論している API はどれも React Router によって提供されているものではありません。[`request`][request]、[`request.formData`][request-form-data]、[`Object.fromEntries`][object-from-entries] はすべて Web プラットフォームによって提供されています。

`action` を完了した後、最後に [`redirect`][redirect] があることに注目してください。

```tsx filename=app/routes/edit-contact.tsx lines=[9]
export async function action({
  params,
  request,
}: Route.ActionArgs) {
  invariant(params.contactId, "Missing contactId param");
  const formData = await request.formData();
  const updates = Object.fromEntries(formData);
  await updateContact(params.contactId, updates);
  return redirect(`/contacts/${params.contactId}`);
}
```

`action` 関数と `loader` 関数はどちらも `Response` を返すことができます（[`Request`][request] を受け取っているので当然です！）。[`redirect`][redirect] ヘルパーは、アプリに場所を変更するように指示する [`Response`][response] を返すのを簡単にするだけです。

クライアントサイドルーティングがない場合、サーバーが `POST` リクエスト後にリダイレクトすると、新しいページは最新のデータをフェッチしてレンダリングします。以前に学習したように、React Router はこのモデルをエミュレートし、`action` 呼び出し後にページ上のデータを自動的に再検証します。そのため、フォームを保存するとサイドバーが自動的に更新されます。クライアントサイドルーティングがない場合、追加の再検証コードは存在しないため、React Router でクライアントサイドルーティングを使用する場合も存在する必要はありません。

最後に一つ。JavaScript がない場合、[`redirect`][redirect] は通常のリダイレクトになります。ただし、JavaScript がある場合はクライアントサイドのリダイレクトになるため、ユーザーはスクロール位置やコンポーネントの状態などのクライアントの状態を失うことはありません。

## 新規レコードを編集ページにリダイレクトする

リダイレクトの方法がわかったので、新規連絡先を作成するアクションを更新して、編集ページにリダイレクトするようにしましょう。

👉 **新規レコードの編集ページにリダイレクトする**

```tsx filename=app/root.tsx lines=[6,12]
import {
  Outlet,
  Scripts,
  ScrollRestoration,
  isRouteErrorResponse,
  redirect,
} from "react-router";
// existing imports

export async function action() {
  const contact = await createEmptyContact();
  return redirect(`/contacts/${contact.id}/edit`);
}

// existing code
```

これで「新規」をクリックすると、編集ページに移動するはずです。

<img class="tutorial" loading="lazy" src="/_docs/v7_address_book_tutorial/16.webp" />

## アクティブなリンクのスタイリング

レコードがたくさんある今、サイドバーでどのレコードを見ているのかが明確ではありません。[`NavLink`][nav-link] を使用してこれを修正できます。

👉 **サイドバーの `<a href>` を `<Link to>` に置き換えてください**

```tsx filename=app/layouts/sidebar.tsx lines=[1,17-26,28]
import { Form, Link, NavLink, Outlet } from "react-router";

// existing imports and exports

export default function SidebarLayout({
  loaderData,
}: Route.ComponentProps) {
  const { contacts } = loaderData;

  return (
    <>
      <div id="sidebar">
        {/* existing elements */}
        <ul>
          {contacts.map((contact) => (
            <li key={contact.id}>
              <NavLink
                className={({ isActive, isPending }) =>
                  isActive
                    ? "active"
                    : isPending
                      ? "pending"
                      : ""
                }
                to={`contacts/${contact.id}`}
              >
                {/* existing elements */}
              </NavLink>
            </li>
          ))}
        </ul>
        {/* existing elements */}
      </div>
      {/* existing elements */}
    </>
  );
}
```

`className` に関数を渡していることに注意してください。ユーザーが `<NavLink to>` に一致する URL にいる場合、`isActive` は true になります。アクティブになろうとしている（データがまだ読み込まれている）場合は、`isPending` が true になります。これにより、ユーザーがどこにいるかを簡単に示すことができ、リンクがクリックされたがデータの読み込みが必要な場合に即座にフィードバックを提供できます。

<img class="tutorial" loading="lazy" src="/_docs/v7_address_book_tutorial/17.webp" />

## グローバルな保留中UI

ユーザーがアプリ内を移動する際、React Routerは次のページのデータが読み込まれている間、*古いページを表示したまま*にします。リスト間をクリックすると、アプリが少し反応しないように感じたかもしれません。アプリが反応しないように感じさせないために、ユーザーに何らかのフィードバックを提供しましょう。

React Routerは、舞台裏で全ての状態を管理し、動的なWebアプリを構築するために必要な要素を明らかにします。この場合、[`useNavigation`][use-navigation]フックを使用します。

👉 **`useNavigation`を使用してグローバルな保留中UIを追加する**

```tsx filename=app/layouts/sidebar.tsx lines=[6,13,19-21]
import {
  Form,
  Link,
  NavLink,
  Outlet,
  useNavigation,
} from "react-router";

export default function SidebarLayout({
  loaderData,
}: Route.ComponentProps) {
  const { contacts } = loaderData;
  const navigation = useNavigation();

  return (
    <>
      {/* existing elements */}
      <div
        className={
          navigation.state === "loading" ? "loading" : ""
        }
        id="detail"
      >
        <Outlet />
      </div>
    </>
  );
}
```

[`useNavigation`][use-navigation]は、現在のナビゲーション状態を返します。これは、`"idle"`、`"loading"`、または`"submitting"`のいずれかになります。

この例では、アイドル状態でない場合に、アプリのメイン部分に`"loading"`クラスを追加します。CSSは、短い遅延の後（高速な読み込みでUIがちらつくのを避けるため）に、素敵なフェードを追加します。ただし、上部にスピナーやローディングバーを表示するなど、好きなように変更できます。

<img class="tutorial" loading="lazy" src="/_docs/v7_address_book_tutorial/18.webp" />

## レコードの削除

連絡先ルートのコードを確認すると、削除ボタンは次のようになっていることがわかります。

```tsx filename=app/routes/contact.tsx lines=[2]
<Form
  action="destroy"
  method="post"
  onSubmit={(event) => {
    const response = confirm(
      "このレコードを削除してもよろしいですか？"
    );
    if (!response) {
      event.preventDefault();
    }
  }}
>
  <button type="submit">削除</button>
</Form>
```

`action` が `"destroy"` を指していることに注目してください。`<Link to>` と同様に、`<Form action>` は *相対的な* 値を取ることができます。フォームが `contacts/:contactId` ルートでレンダリングされているため、`destroy` を持つ相対的なアクションは、クリック時にフォームを `contacts/:contactId/destroy` に送信します。

この時点で、削除ボタンを機能させるために必要なことはすべて理解しているはずです。先に進む前に試してみませんか？必要なものは次のとおりです。

1. 新しいルート
2. そのルートでの `action`
3. `app/data.ts` からの `deleteContact`
4. その後のリダイレクト先

👉 **"destroy" ルートモジュールを設定する**

```shellscript nonumber
touch app/routes/destroy-contact.tsx
```

```tsx filename=app/routes.ts lines=[3-6]
export default [
  // existing routes
  route(
    "contacts/:contactId/destroy",
    "routes/destroy-contact.tsx",
  ),
  // existing routes
] satisfies RouteConfig;
```

👉 **destroy アクションを追加する**

```tsx filename=app/routes/destroy-contact.tsx
import { redirect } from "react-router";
import type { Route } from "./+types/destroy-contact";

import { deleteContact } from "../data";

export async function action({ params }: Route.ActionArgs) {
  await deleteContact(params.contactId);
  return redirect("/");
}
```

さて、レコードに移動して「削除」ボタンをクリックしてください。動作します！

> 😅 なぜこれがすべて機能するのか、まだ混乱しています

ユーザーが送信ボタンをクリックすると：

1. `<Form>` は、新しいドキュメント `POST` リクエストをサーバーに送信するというデフォルトのブラウザの動作を防ぎますが、代わりにクライアント側のルーティングと [`fetch`][fetch] を使用してブラウザをエミュレートすることにより、`POST` リクエストを作成します。
2. `<Form action="destroy">` は `contacts/:contactId/destroy` の新しいルートと一致し、リクエストを送信します。
3. `action` がリダイレクトした後、React Router はページのデータを取得するためにすべての `loader` を呼び出して最新の値を取得します（これが「再検証」です）。`routes/contact.tsx` の `loaderData` には新しい値が入り、コンポーネントが更新されます！

`Form` を追加し、`action` を追加すると、残りは React Router が処理します。

## キャンセルボタン

編集ページには、まだ何も機能しないキャンセルボタンがあります。これをブラウザの戻るボタンと同じように機能させたいと思います。

ボタンのクリックハンドラーと[`useNavigate`][use-navigate]が必要です。

👉 **`useNavigate`を使用してキャンセルボタンのクリックハンドラーを追加する**

```tsx filename=app/routes/edit-contact.tsx lines=[1,8,15]
import { Form, redirect, useNavigate } from "react-router";
// existing imports & exports

export default function EditContact({
  loaderData,
}: Route.ComponentProps) {
  const { contact } = loaderData;
  const navigate = useNavigate();

  return (
    <Form key={contact.id} id="contact-form" method="post">
      {/* existing elements */}
      <p>
        <button type="submit">Save</button>
        <button onClick={() => navigate(-1)} type="button">
          Cancel
        </button>
      </p>
    </Form>
  );
}
```

これで、ユーザーが「キャンセル」をクリックすると、ブラウザの履歴で1つ前のエントリに戻ります。

> 🧐 なぜボタンに `event.preventDefault()` がないのですか？

`<button type="button">` は、一見冗長に見えますが、ボタンがフォームを送信するのを防ぐためのHTMLの方法です。

あと2つの機能で終わりです。ゴールは目前です！

## `URLSearchParams` と `GET` 送信

これまでのインタラクティブな UI はすべて、URL を変更するリンクか、データを `action` 関数に POST する `form` のいずれかでした。検索フィールドは、両方の混合であるため興味深いものです。つまり、`form` ですが、URL を変更するだけで、データは変更しません。

検索フォームを送信するとどうなるか見てみましょう。

👉 **検索フィールドに名前を入力して Enter キーを押してください**

ブラウザの URL に、[`URLSearchParams`][url-search-params] としてクエリが含まれるようになったことに注目してください。

```
http://localhost:5173/?q=ryan
```

`<Form method="post">` ではないため、React Router はブラウザをエミュレートし、リクエストボディの代わりに [`FormData`][form-data] を [`URLSearchParams`][url-search-params] にシリアライズします。

`loader` 関数は、`request` から検索パラメータにアクセスできます。これを使用してリストをフィルタリングしてみましょう。

👉 **`URLSearchParams` がある場合はリストをフィルタリングする**

```tsx filename=app/layouts/sidebar.tsx lines=[3-8]
// existing imports & exports

export async function loader({
  request,
}: Route.LoaderArgs) {
  const url = new URL(request.url);
  const q = url.searchParams.get("q");
  const contacts = await getContacts(q);
  return { contacts };
}

// existing code
```

<img class="tutorial" loading="lazy" src="/_docs/v7_address_book_tutorial/19.webp" />

これは `POST` ではなく `GET` であるため、React Router は `action` 関数を呼び出しません。`GET` `form` を送信することは、リンクをクリックすることと同じです。URL のみが変更されます。

これは通常のページナビゲーションでもあることを意味します。戻るボタンをクリックして、元の場所に戻ることができます。

## URLとフォームの状態の同期

ここでは、すぐに対応できるUX上の問題がいくつかあります。

1. 検索後に「戻る」をクリックすると、リストがフィルタリングされなくなったにもかかわらず、フォームフィールドには入力した値が残っています。
2. 検索後にページをリロードすると、リストはフィルタリングされているにもかかわらず、フォームフィールドには値がなくなっています。

言い換えれば、URLと入力の状態が同期していないのです。

まず(2)を解決し、URLの値で入力を開始しましょう。

👉 **`loader`から`q`を返し、それを入力のデフォルト値として設定します**

```tsx filename=app/layouts/sidebar.tsx lines=[9,15,26]
// existing imports & exports

export async function loader({
  request,
}: Route.LoaderArgs) {
  const url = new URL(request.url);
  const q = url.searchParams.get("q");
  const contacts = await getContacts(q);
  return { contacts, q };
}

export default function SidebarLayout({
  loaderData,
}: Route.ComponentProps) {
  const { contacts, q } = loaderData;
  const navigation = useNavigation();

  return (
    <>
      <div id="sidebar">
        {/* existing elements */}
        <div>
          <Form id="search-form" role="search">
            <input
              aria-label="Search contacts"
              defaultValue={q || ""}
              id="q"
              name="q"
              placeholder="Search"
              type="search"
            />
            {/* existing elements */}
          </Form>
          {/* existing elements */}
        </div>
        {/* existing elements */}
      </div>
      {/* existing elements */}
    </>
  );
}
```

これで、検索後にページをリロードすると、入力フィールドにクエリが表示されるようになります。

次に、(1)の問題、つまり「戻る」ボタンをクリックして入力を更新する問題です。Reactから`useEffect`を導入して、DOM内の入力値を直接操作することができます。

👉 **入力値を`URLSearchParams`と同期させます**

```tsx filename=app/layouts/sidebar.tsx lines=[2,12-17]
// existing imports
import { useEffect } from "react";

// existing imports & exports

export default function SidebarLayout({
  loaderData,
}: Route.ComponentProps) {
  const { contacts, q } = loaderData;
  const navigation = useNavigation();

  useEffect(() => {
    const searchField = document.getElementById("q");
    if (searchField instanceof HTMLInputElement) {
      searchField.value = q || "";
    }
  }, [q]);

  // existing code
}
```

> 🤔 このために制御されたコンポーネントとReact Stateを使うべきではないでしょうか？

確かに、これを制御されたコンポーネントとして行うこともできます。同期ポイントが増えますが、それはあなた次第です。

<details>

<summary>展開して、どのようなものかを確認してください</summary>

```tsx filename=app/layouts/sidebar.tsx lines=[2,11-12,14-18,30-33,36-37]
// existing imports
import { useEffect, useState } from "react";

// existing imports & exports

export default function SidebarLayout({
  loaderData,
}: Route.ComponentProps) {
  const { contacts, q } = loaderData;
  const navigation = useNavigation();
  // the query now needs to be kept in state
  const [query, setQuery] = useState(q || "");

  // we still have a `useEffect` to synchronize the query
  // to the component state on back/forward button clicks
  useEffect(() => {
    setQuery(q || "");
  }, [q]);

  return (
    <>
      <div id="sidebar">
        {/* existing elements */}
        <div>
          <Form id="search-form" role="search">
            <input
              aria-label="Search contacts"
              id="q"
              name="q"
              // synchronize user's input to component state
              onChange={(event) =>
                setQuery(event.currentTarget.value)
              }
              placeholder="Search"
              type="search"
              // switched to `value` from `defaultValue`
              value={query}
            />
            {/* existing elements */}
          </Form>
          {/* existing elements */}
        </div>
        {/* existing elements */}
      </div>
      {/* existing elements */}
    </>
  );
}
```

</details>

これで、「戻る/進む/リロード」ボタンをクリックすると、入力値がURLと結果と同期するはずです。

## `Form` の `onChange` を送信する

ここで製品に関する意思決定を行う必要があります。ユーザーに `form` を送信させて結果をフィルタリングしたい場合もあれば、ユーザーが入力するにつれてフィルタリングしたい場合もあります。最初のケースはすでに実装済みなので、2番目のケースがどのようなものか見てみましょう。

`useNavigate` はすでに見てきたので、その仲間である [`useSubmit`][use-submit] を使用します。

```tsx filename=app/layouts/sidebar.tsx lines=[7,16,27-29]
import {
  Form,
  Link,
  NavLink,
  Outlet,
  useNavigation,
  useSubmit,
} from "react-router";
// existing imports & exports

export default function SidebarLayout({
  loaderData,
}: Route.ComponentProps) {
  const { contacts, q } = loaderData;
  const navigation = useNavigation();
  const submit = useSubmit();

  // existing code

  return (
    <>
      <div id="sidebar">
        {/* existing elements */}
        <div>
          <Form
            id="search-form"
            onChange={(event) =>
              submit(event.currentTarget)
            }
            role="search"
          >
            {/* existing elements */}
          </Form>
          {/* existing elements */}
        </div>
        {/* existing elements */}
      </div>
      {/* existing elements */}
    </>
  );
}
```

入力すると、`form` が自動的に送信されるようになりました。

[`submit`][use-submit] への引数に注目してください。`submit` 関数は、渡されたフォームをシリアライズして送信します。ここでは `event.currentTarget` を渡しています。`currentTarget` は、イベントがアタッチされている DOM ノード（`form`）です。

## 検索スピナーの追加

本番アプリでは、この検索は、一度にすべてを送信してクライアント側でフィルタリングするには大きすぎるデータベース内のレコードを検索する可能性が高くなります。そのため、このデモにはフェイクのネットワーク遅延が含まれています。

ローディングインジケーターがないと、検索が少し遅く感じられます。データベースを高速化できたとしても、常にユーザーのネットワーク遅延が邪魔になり、制御できません。

より良いユーザーエクスペリエンスのために、検索に対する即時のUIフィードバックを追加しましょう。ここでも[`useNavigation`][use-navigation]を使用します。

👉 **検索中かどうかを判断する変数を追加します**

```tsx filename=app/layouts/sidebar.tsx lines=[9-13]
// existing imports & exports

export default function SidebarLayout({
  loaderData,
}: Route.ComponentProps) {
  const { contacts, q } = loaderData;
  const navigation = useNavigation();
  const submit = useSubmit();
  const searching =
    navigation.location &&
    new URLSearchParams(navigation.location.search).has(
      "q",
    );

  // existing code
}
```

何も起こっていない場合、`navigation.location`は`undefined`になりますが、ユーザーがナビゲートすると、データがロードされている間、次のロケーションが設定されます。次に、`location.search`で検索しているかどうかを確認します。

👉 **新しい`searching`状態を使用して、検索フォーム要素にクラスを追加します**

```tsx filename=app/layouts/sidebar.tsx lines=[22,31]
// existing imports & exports

export default function SidebarLayout({
  loaderData,
}: Route.ComponentProps) {
  // existing code

  return (
    <>
      <div id="sidebar">
        {/* existing elements */}
        <div>
          <Form
            id="search-form"
            onChange={(event) =>
              submit(event.currentTarget)
            }
            role="search"
          >
            <input
              aria-label="Search contacts"
              className={searching ? "loading" : ""}
              defaultValue={q || ""}
              id="q"
              name="q"
              placeholder="Search"
              type="search"
            />
            <div
              aria-hidden
              hidden={!searching}
              id="search-spinner"
            />
          </Form>
          {/* existing elements */}
        </div>
        {/* existing elements */}
      </div>
      {/* existing elements */}
    </>
  );
}
```

ボーナスポイントとして、検索時にメイン画面がフェードアウトしないようにします。

```tsx filename=app/layouts/sidebar.tsx lines=[13]
// existing imports & exports

export default function SidebarLayout({
  loaderData,
}: Route.ComponentProps) {
  // existing code

  return (
    <>
      {/* existing elements */}
      <div
        className={
          navigation.state === "loading" && !searching
            ? "loading"
            : ""
        }
        id="detail"
      >
        <Outlet />
      </div>
      {/* existing elements */}
    </>
  );
}
```

これで、検索入力の左側に素敵なスピナーが表示されるはずです。

<img class="tutorial" loading="lazy" src="/_docs/v7_address_book_tutorial/20.webp" />

## 履歴スタックの管理

フォームはキー入力ごとに送信されるため、「alex」と入力してバックスペースで削除すると、巨大な履歴スタックができてしまいます 😂。これは絶対に避けたいです。

<img class="tutorial" loading="lazy" src="/_docs/v7_address_book_tutorial/21.webp" />

これを避けるには、履歴スタックにプッシュするのではなく、次のページで現在のエントリを*置き換える*ことで対応できます。

👉 **`submit` で `replace` を使用する**

```tsx filename=app/layouts/sidebar.tsx lines=[16-19]
// existing imports & exports

export default function SidebarLayout({
  loaderData,
}: Route.ComponentProps) {
  // existing code

  return (
    <>
      <div id="sidebar">
        {/* existing elements */}
        <div>
          <Form
            id="search-form"
            onChange={(event) => {
              const isFirstSearch = q === null;
              submit(event.currentTarget, {
                replace: !isFirstSearch,
              });
            }}
            role="search"
          >
            {/* existing elements */}
          </Form>
          {/* existing elements */}
        </div>
        {/* existing elements */}
      </div>
      {/* existing elements */}
    </>
  );
}
```

これが最初の検索かどうかを簡単に確認した後、置き換えるかどうかを決定します。これで、最初の検索は新しいエントリを追加しますが、それ以降のすべてのキー入力は現在のエントリを置き換えます。検索を削除するために7回戻るボタンをクリックする代わりに、ユーザーは1回だけ戻るボタンをクリックすればよくなります。

## ナビゲーションなしの`Form`

これまでのところ、すべてのフォームはURLを変更していました。これらのユーザーフローは一般的ですが、ナビゲーションを引き起こさずにフォームを送信したい場合も同様に一般的です。

このような場合のために、[`useFetcher`][use-fetcher]があります。これにより、ナビゲーションを引き起こすことなく、`action`と`loader`と通信できます。

連絡先ページの★ボタンはこれに適しています。新しいレコードを作成または削除するわけではなく、ページを変更したくもありません。単に表示しているページのデータを変更したいだけです。

👉 **`<Favorite>`フォームをフェッチャーフォームに変更する**

```tsx filename=app/routes/contact.tsx lines=[1,10,14,26]
import { Form, useFetcher } from "react-router";

// existing imports & exports

function Favorite({
  contact,
}: {
  contact: Pick<ContactRecord, "favorite">;
}) {
  const fetcher = useFetcher();
  const favorite = contact.favorite;

  return (
    <fetcher.Form method="post">
      <button
        aria-label={
          favorite
            ? "Remove from favorites"
            : "Add to favorites"
        }
        name="favorite"
        value={favorite ? "false" : "true"}
      >
        {favorite ? "★" : "☆"}
      </button>
    </fetcher.Form>
  );
}
```

このフォームはナビゲーションを引き起こさなくなり、単に`action`をフェッチするだけになります。ところで...これは`action`を作成するまで機能しません。

👉 **`action`を作成する**

```tsx filename=app/routes/contact.tsx lines=[2,5-13]
// existing imports
import { getContact, updateContact } from "../data";
// existing imports

export async function action({
  params,
  request,
}: Route.ActionArgs) {
  const formData = await request.formData();
  return updateContact(params.contactId, {
    favorite: formData.get("favorite") === "true",
  });
}

// existing code
```

Alright, we're ready to click the star next to the user's name!

<img class="tutorial" loading="lazy" src="/_docs/v7_address_book_tutorial/22.webp" />

見てください、両方の星が自動的に更新されます。新しい`<fetcher.Form method="post">`は、これまで使用してきた`<Form>`とほぼ同じように機能します。アクションを呼び出し、すべてのデータが自動的に再検証されます。エラーも同じようにキャッチされます。

ただし、1つ重要な違いがあります。ナビゲーションではないため、URLは変更されず、履歴スタックも影響を受けません。

## オプティミスティック UI

前のセクションで、お気に入りボタンをクリックしたときにアプリの反応が少し鈍く感じたかもしれません。現実世界で発生するであろうネットワーク遅延を再び追加しました。

ユーザーに何らかのフィードバックを与えるために、以前の `navigation.state` とよく似た `fetcher.state` を使って、星をローディング状態にすることができますが、今回はさらに良い方法があります。「オプティミスティック UI」と呼ばれる戦略を使用できます。

fetcher は `action` に送信される [`FormData`][form-data] を認識しているため、`fetcher.formData` で利用できます。これを使用して、ネットワークが完了していなくても、星の状態をすぐに更新します。更新が最終的に失敗した場合、UI は実際のデータに戻ります。

👉 **`fetcher.formData` からオプティミスティックな値を読み取る**

```tsx filename=app/routes/contact.tsx lines=[9-11]
// existing code

function Favorite({
  contact,
}: {
  contact: Pick<ContactRecord, "favorite">;
}) {
  const fetcher = useFetcher();
  const favorite = fetcher.formData
    ? fetcher.formData.get("favorite") === "true"
    : contact.favorite;

  return (
    <fetcher.Form method="post">
      <button
        aria-label={
          favorite
            ? "Remove from favorites"
            : "Add to favorites"
        }
        name="favorite"
        value={favorite ? "false" : "true"}
      >
        {favorite ? "★" : "☆"}
      </button>
    </fetcher.Form>
  );
}
```

これで、星をクリックすると、*すぐに*新しい状態に変わります。

---

以上です！React Router を試していただきありがとうございます。このチュートリアルが、優れたユーザーエクスペリエンスを構築するための確かなスタートとなることを願っています。他にもできることはたくさんあるので、必ずすべての [API][react-router-apis] を確認してください 😀

[http-localhost-5173]: http://localhost:5173
[root-route]: ../explanation/special-files#roottsx
[error-boundaries]: ../how-to/error-boundary
[links]: ../start/framework/route-module#links
[outlet-component]: https://api.reactrouter.com/v7/functions/react_router.Outlet
[file-route-conventions]: ../how-to/file-route-conventions
[contacts-1]: http://localhost:5173/contacts/1
[link-component]: https://api.reactrouter.com/v7/functions/react_router.Link
[client-loader]: ../start/framework/route-module#clientloader
[spa]: ../how-to/spa
[type-safety]: ../explanation/type-safety
[react-router-config]: ../explanation/special-files#react-routerconfigts
[rendering-strategies]: ../start/framework/rendering
[index-route]: ../start/framework/routing#index-routes
[layout-route]: ../start/framework/routing#layout-routes
[hydrate-fallback]: ../start/framework/route-module#hydratefallback
[about-page]: http://localhost:5173/about
[pre-rendering]: ../how-to/pre-rendering
[url-search-params]: https://developer.mozilla.org/en-US/docs/Web/API/URLSearchParams
[loader]: ../start/framework/route-module#loader
[action]: ../start/framework/route-module#action
[form-component]: https://api.reactrouter.com/v7/functions/react_router.Form
[fetch]: https://developer.mozilla.org/en-US/docs/Web/API/fetch
[form-data]: https://developer.mozilla.org/en-US/docs/Web/API/FormData
[object-from-entries]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/fromEntries
[request-form-data]: https://developer.mozilla.org/en-US/docs/Web/API/Request/formData
[request]: https://developer.mozilla.org/en-US/docs/Web/API/Request
[redirect]: https://api.reactrouter.com/v7/functions/react_router.redirect
[response]: https://developer.mozilla.org/en-US/docs/Web/API/Response
[nav-link]: https://api.reactrouter.com/v7/functions/react_router.NavLink
[use-navigation]: https://api.reactrouter.com/v7/functions/react_router.useNavigation
[use-navigate]: https://api.reactrouter.com/v7/functions/react_router.useNavigate
[use-submit]: https://api.reactrouter.com/v7/functions/react_router.useSubmit
[use-fetcher]: https://api.reactrouter.com/v7/functions/react_router.useFetcher
[react-router-apis]: https://api.reactrouter.com/v7/modules/react_router