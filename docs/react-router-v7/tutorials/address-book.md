```
---
title: アドレス帳
order: 1
---
```

# アドレス帳

連絡先を管理できる、小さくても機能豊富なアドレス帳アプリを作成します。データベースやその他の「本番環境対応」の要素は使用しないため、React Routerが提供する機能に集中できます。手順に従って進めれば約30分かかりますが、そうでなければ簡単に読めます。

<img class="tutorial" src="/_docs/v7_address_book_tutorial/01.webp" />

👉 **これが表示されたら、アプリで何か操作する必要があります！**

残りは情報とより深い理解のためのものです。始めましょう。

## セットアップ

👉 **基本テンプレートの生成**

```shellscript nonumber
npx create-react-router@latest --template remix-run/react-router/tutorials/address-book
```

これは非常にシンプルなテンプレートを使用しますが、CSSとデータモデルが含まれているため、React Routerに集中できます。

👉 **アプリの起動**

```shellscript nonumber
# アプリのディレクトリに移動します
cd {アプリを配置した場所}

# まだインストールしていない場合は、依存関係をインストールします
npm install

# サーバーを起動します
npm run dev
```

[http://localhost:5173][http-localhost-5173] を開くと、スタイルのない次の様な画面が表示されます。


[http-localhost-5173]: http://localhost:5173

## ルートルート

`app/root.tsx` のファイルに注目してください。これは私たちが「ルートルート」[root-route]と呼ぶものです。UIで最初にレンダリングされるコンポーネントであり、通常はページのグローバルレイアウトと、デフォルトのエラーバウンダリ[error-boundaries]を含みます。

<details>

<summary>ルートコンポーネントのコードを見るにはここをクリック</summary>

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

// レイアウトコンポーネントは、ルートルートの特別なエクスポートです。
// すべてのルートコンポーネント、HydrateFallback、ErrorBoundaryのドキュメントの「アプリシェル」として機能します。
// 詳細については、https://reactrouter.com/explanation/special-files#layout-export を参照してください。
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

// アプリの最上位エラーバウンダリ。アプリでエラーが発生したときにレンダリングされます。
// 詳細については、https://reactrouter.com/start/framework/route-module#errorboundary を参照してください。
export function ErrorBoundary({
  error,
}: Route.ErrorBoundaryProps) {
  let message = "Oops!";
  let details = "予期せぬエラーが発生しました。";
  let stack: string | undefined;

  if (isRouteErrorResponse(error)) {
    message = error.status === 404 ? "404" : "Error";
    details =
      error.status === 404
        ? "要求されたページは見つかりませんでした。"
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

## 連絡先ルートUI

サイドバーの項目をクリックすると、デフォルトの404ページが表示されます。`/contacts/1`というURLに一致するルートを作成しましょう。

👉 **連絡先ルートモジュールの作成**

```shellscript nonumber
mkdir app/routes
touch app/routes/contact.tsx
```

このファイルはどこにでも配置できますが、整理のためにすべてのルートを`app/routes`ディレクトリに配置します。

[ファイルベースのルーティング][file-route-conventions]も使用できます。

👉 **ルートの構成**

新しいルートについてReact Routerに伝える必要があります。`routes.ts`は、すべてのルートを構成できる特別なファイルです。

```tsx filename=routes.ts lines=[2,5]
import type { RouteConfig } from "@react-router/dev/routes";
import { route } from "@react-router/dev/routes";

export default [
  route("contacts/:contactId", "routes/contact.tsx"),
] satisfies RouteConfig;
```

React Routerでは、`:`はセグメントを動的にします。これにより、次のURLが`routes/contact.tsx`ルートモジュールに一致するようになりました。

* `/contacts/123`
* `/contacts/abc`

👉 **連絡先コンポーネントUIの追加**

いくつかの要素だけです。コピー＆ペーストしてください。

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

リンクをクリックするか、[`/contacts/1`][contacts-1]にアクセスしても、何も変わりませんか？

<img class="tutorial" src="/_docs/v7_address_book_tutorial/02.webp" />

## ネストされたルートとアウトレット

React Routerはネストされたルーティングをサポートしています。子ルートを親レイアウト内にレンダリングするには、親コンポーネント内に[`Outlet`][outlet-component]をレンダリングする必要があります。これを修正するために、`app/root.tsx`を開いて、アウトレットをレンダリングしましょう。

👉 **[`<Outlet />`][outlet-component]をレンダリングする**

```tsx filename=app/root.tsx lines=[3,15-17]
import {
  Form,
  Outlet,
  Scripts,
  ScrollRestoration,
  isRouteErrorResponse,
} from "react-router";

// 既存のインポートとエクスポート

export default function App() {
  return (
    <>
      <div id="sidebar">{/* その他の要素 */}</div>
      <div id="detail">
        <Outlet />
      </div>
    </>
  );
}
```

これで、子ルートがアウトレットを通してレンダリングされるはずです。

<img class="tutorial" src="/_docs/v7_address_book_tutorial/03.webp" />

## クライアントサイドルーティング

気づかれたかもしれませんが、サイドバーのリンクをクリックすると、ブラウザはクライアントサイドルーティングではなく、次のURLに対する完全なドキュメントリクエストを行い、アプリ全体を完全に再マウントしています。

クライアントサイドルーティングを使用すると、アプリはページ全体を再読み込みすることなくURLを更新できます。代わりに、アプリはすぐに新しいUIをレンダリングできます。[`<Link>`][link-component]を使って実現しましょう。

👉 **サイドバーの`<a href>`を`<Link to>`に変更してください**

```tsx filename=app/root.tsx lines=[3,20,23]
import {
  Form,
  Link,
  Outlet,
  Scripts,
  ScrollRestoration,
  isRouteErrorResponse,
} from "react-router";

// 既存のインポートとエクスポート

export default function App() {
  return (
    <>
      <div id="sidebar">
        {/* その他の要素 */}
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
      {/* その他の要素 */}
    </>
  );
}
```

ブラウザの開発ツールのネットワークタブを開くと、ドキュメントがリクエストされなくなっていることがわかります。

## データの読み込み

URL セグメント、レイアウト、データは、ほとんどの場合、密接に関連付けられています（3つ組？）。このアプリでも既に確認できます。

| URL セグメント         | コンポーネント   | データ               |
| ------------------- | ----------- | ------------------ |
| /                   | `<App>`     | 連絡先のリスト   |
| contacts/:contactId | `<Contact>` | 個々の連絡先 |

この自然な関連付けのために、React Routerには、ルートコンポーネントに簡単にデータを取得するためのデータ規則があります。

まず、ルートルートに[`clientLoader`][client-loader]関数を生成してエクスポートし、データをレンダリングします。

👉 **`app/root.tsx`から`clientLoader`関数をエクスポートしてデータをレンダリングする**

<docs-info>次のコードには型エラーが含まれています。次のセクションで修正します。</docs-info>

```tsx filename=app/root.tsx lines=[2,6-9,11-12,19-42]
// 既存のインポート
import { getContacts } from "./data";

// 既存のエクスポート

export async function clientLoader() {
  const contacts = await getContacts();
  return { contacts };
}

export default function App({ loaderData }) {
  const { contacts } = loaderData;

  return (
    <>
      <div id="sidebar">
        {/* その他の要素 */}
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
                      <i>名前なし</i>
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
              <i>連絡先なし</i>
            </p>
          )}
        </nav>
      </div>
      {/* その他の要素 */}
    </>
  );
}
```

これで完了です！React Routerは、このデータをUIと自動的に同期状態に保ちます。サイドバーは次のようになります。

<img class="tutorial" src="/_docs/v7_address_book_tutorial/04.webp" />

サーバーサイドレンダリング（SSR）を行うためにサーバーでデータを読み込むのではなく、「クライアント」でデータを読み込んでいる理由について疑問に思われるかもしれません。現時点では、連絡先サイトは[シングルページアプリケーション][spa]なので、サーバーサイドレンダリングはありません。これにより、任意の静的ホスティングプロバイダーへの展開が非常に簡単になります。ただし、React Routerが提供するさまざまな[レンダリング戦略][rendering-strategies]について学習できるように、SSRを有効にする方法については、後で詳しく説明します。


[client-loader]: #client-loader
[spa]: #spa
[rendering-strategies]: #rendering-strategies


## 型安全

`loaderData` プロップに型を割り当てていないことに気づかれたかもしれません。修正しましょう。

👉 **`App` コンポーネントに`ComponentProps`型を追加する**

```tsx filename=app/root.tsx lines=[5-7]
// 既存のインポート
import type { Route } from "./+types/root";
// 既存のインポートとエクスポート

export default function App({
  loaderData,
}: Route.ComponentProps) {
  const { contacts } = loaderData;

  // 既存のコード
}
```

ちょっと待ってください。これらの型はどこから来たのでしょうか？！

定義していませんが、`clientLoader`から返した`contacts`プロパティについて、既に知っているようです。

これは、React Routerが[アプリ内の各ルートに対して型を生成する][type-safety]ため、自動的な型安全性を提供しているためです。


[type-safety]: (React Routerの型安全に関するドキュメントへのリンクをここに挿入してください。)

## `HydrateFallback`の追加

先に述べたように、サーバーサイドレンダリングのない[シングルページアプリケーション（SPA）][spa]に取り組んでいます。[`react-router.config.ts`][react-router-config]の中身を見ると、これは単純なブール値で設定されていることがわかります。

```tsx filename=react-router.config.ts lines=[4]
import { type Config } from "@react-router/dev/config";

export default {
  ssr: false,
} satisfies Config;
```

ページを更新するたびに、アプリがロードされる前に一瞬白くフラッシュすることに気づき始めたかもしれません。クライアント側でのみレンダリングしているため、アプリのロード中にユーザーに表示するものはありません。

👉 **`HydrateFallback`エクスポートを追加する**

[`HydrateFallback`][hydrate-fallback]エクスポートを使用して、アプリがハイドレートされる（クライアント側で初めてレンダリングされる）前に表示されるフォールバックを提供できます。

```tsx filename=app/root.tsx lines=[3-10]
// 既存のインポートとエクスポート

export function HydrateFallback() {
  return (
    <div id="loading-splash">
      <div id="loading-splash-spinner" />
      <p>Loading, please wait...</p>
    </div>
  );
}
```

これで、ページを更新すると、アプリがハイドレートされる前に、 briefly ローディングスプラッシュが briefly 表示されます。

<img class="tutorial" src="/_docs/v7_address_book_tutorial/05.webp" />


[spa]:  (シングルページアプリケーションへのリンク)
[react-router-config]: (react-router.config.tsファイルへのリンク)
[hydrate-fallback]: (HydrateFallbackの説明へのリンク)

## インデックスルート

アプリをロードして、まだ連絡先のページにいない場合、リストの右側に大きな空白ページが表示されることに気付くでしょう。

<img class="tutorial" src="/_docs/v7_address_book_tutorial/06.webp" />

ルートに子ルートがあり、親ルートのパスにいる場合、`<Outlet>` は一致する子ルートがないため、何もレンダリングしません。[インデックスルート][index-route] は、その空白を埋めるデフォルトの子ルートと考えてください。

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

👉 **インデックスコンポーネントの要素を入力する**

コピー＆ペーストして構いません。特別なことは何もありません。

```tsx filename=app/routes/home.tsx
export default function Home() {
  return (
    <p id="index-page">
      これはReact Routerのデモです。
      <br />
      reactrouter.comでドキュメントをご覧ください。
      <a href="https://reactrouter.com">
        reactrouter.com
      </a>
      。
    </p>
  );
}
```

<img class="tutorial" src="/_docs/v7_address_book_tutorial/07.webp" />

できました！空白はもうありません。インデックスルートには、ダッシュボード、統計情報、フィードなどを配置することが一般的です。データの読み込みにも参加できます。


[index-route]:  (インデックスルートへのリンクをここに挿入 -  原文にはリンクの定義がないため、適宜修正してください。)

## About ルートの追加

ユーザーがインタラクトできる動的なデータの操作に移る前に、あまり変更しない静的コンテンツを含むページを追加しましょう。Aboutページが最適です。

👉 **Aboutルートの作成**

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

👉 **AboutページUIの追加**

ここでは特に難しいことはありません。コピー＆ペーストしてください。

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

👉 **サイドバーにAboutページへのリンクを追加**

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

これで、[Aboutページ][about-page] に移動すると、次のようになります。

<img class="tutorial" src="/_docs/v7_address_book_tutorial/08.webp" />


[about-page]: # (Aboutページへのリンク -  実際にはこのMarkdown内で定義されていません。文脈からAboutページへのリンクを示しています。)

## レイアウトルート

アバウトページをサイドバーレイアウト内にネストする必要はありません。サイドバーをレイアウトに移動して、アバウトページでのレンダリングを回避しましょう。さらに、アバウトページですべての連絡先データを読み込むことを避けたいです。

👉 **サイドバーのレイアウトルートを作成する**

このレイアウトルートの名前と場所は任意ですが、`layouts`ディレクトリ内に配置すると、シンプルなアプリの整理に役立ちます。

```shellscript nonumber
mkdir app/layouts
touch app/layouts/sidebar.tsx
```

今のところ、[`<Outlet>`][outlet-component] を返すだけです。

```tsx filename=app/layouts/sidebar.tsx
import { Outlet } from "react-router";

export default function SidebarLayout() {
  return <Outlet />;
}
```

👉 **サイドバーレイアウトの下にルート定義を移動する**

`layout`ルートを定義して、その中に含まれるすべてのマッチしたルートに対してサイドバーを自動的にレンダリングできます。これは基本的に私たちの`root`と同じですが、特定のルートにスコープできます。

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

`clientLoader`と`App`コンポーネント内のすべてをサイドバーレイアウトに移動する必要があります。次のようになります。

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

そして`app/root.tsx`内では、`App`は[`<Outlet>`][outlet-component]を返すだけで、使用されていないインポートはすべて削除できます。`root.tsx`に`clientLoader`がないことを確認してください。

```tsx filename=app/root.tsx lines=[3-10]
// 既存のインポートとエクスポート

export default function App() {
  return <Outlet />;
}
```

これで並べ替えが完了したので、アバウトページは連絡先データを読み込まなくなり、サイドバーレイアウト内にネストされなくなりました。

<img class="tutorial" src="/_docs/v7_address_book_tutorial/09.webp" />

## 静的ルートの事前レンダリング

もしAboutページを更新すると、クライアントサイドでページがレンダリングされるほんの一瞬だけ、ローディングスピナーが表示されます。これは本当に良い体験とは言えず、ページは静的な情報だけなので、ビルド時に静的HTMLとして事前レンダリングする必要があります。

👉 **Aboutページを事前レンダリングする**

`react-router.config.ts`内で、ビルド時に特定のURLを事前レンダリングするようにReact Routerに指示する、[`prerender`][pre-rendering]配列をconfigに追加できます。この場合、Aboutページだけを事前レンダリングします。

```ts filename=app/react-router.config.ts lines=[5]
import { type Config } from "@react-router/dev/config";

export default {
  ssr: false,
  prerender: ["/about"],
} satisfies Config;
```

これで、[Aboutページ][about-page]にアクセスして更新しても、ローディングスピナーが表示されなくなります！


[pre-rendering]: <プレレンダリングの説明へのリンクをここに挿入>
[about-page]: <Aboutページへのリンクをここに挿入>

## サーバーサイドレンダリング

React Routerは[シングルページアプリケーション (SPA)][spa]を構築するための優れたフレームワークです。多くのアプリケーションはクライアントサイドレンダリングのみで十分であり、ビルド時にいくつかのページを静的にプリレンダリングするだけで*十分かもしれません*。

React Routerアプリケーションにサーバーサイドレンダリングを導入したい場合、非常に簡単です（前のセクションの`ssr: false`ブール値を覚えていますか？）。

👉 **サーバーサイドレンダリングを有効化**

```ts filename=app/react-router.config.ts lines=[2]
export default {
  ssr: true,
  prerender: ["/about"],
} satisfies Config;
```

そして…何も変わりませんか？ページがクライアント上でレンダリングされる前に、一瞬スピナーが表示されますか？さらに、`clientLoader`を使用しているので、データは依然としてクライアント側でフェッチされているのではないでしょうか？

その通りです！React Routerでは、`clientLoader`（と`clientAction`）を引き続き使用して、必要に応じてクライアントサイドでデータフェッチを行うことができます。React Routerは、適切なツールを柔軟に使用できます。

[`loader`][loader]を使用するように切り替えましょう。これは（予想通り）サーバーでデータを取得するために使用されます。

👉 **`loader`を使用してデータを取得するように切り替え**

```tsx filename=app/layouts/sidebar.tsx lines=[3]
// 既存のインポート

export async function loader() {
  const contacts = await getContacts();
  return { contacts };
}
```

`ssr`を`true`または`false`に設定するかどうかは、ユーザーのニーズによって異なります。どちらの戦略も完全に有効です。このチュートリアルの残りの部分ではサーバーサイドレンダリングを使用しますが、すべてのレンダリング戦略がReact Routerでファーストクラスシチズンであることを知っておいてください。


[spa]: <a href="ここにSPAの説明へのリンクを挿入">シングルページアプリケーション</a>
[loader]: <a href="ここにloaderの説明へのリンクを挿入">loader</a>

## ローダーにおけるURLパラメーター

👉 **サイドバーのリンクのいずれかをクリックしてください**

以前の静的な連絡先ページが表示されますが、1点違いがあります。URLにレコードの実際のIDが含まれるようになりました。

<img class="tutorial" src="/_docs/v7_address_book_tutorial/10.webp" />

`app/routes.ts`のルート定義における`:contactId`の部分を覚えていますか？これらの動的なセグメントは、URLのその位置にある動的な（変化する）値と一致します。これらのURL内の値を「URLパラメーター」、または単に「パラメーター」と呼びます。

これらの`params`は、動的なセグメントと一致するキーを使用してローダーに渡されます。たとえば、セグメントの名前が`:contactId`である場合、値は`params.contactId`として渡されます。

これらのパラメーターは、ほとんどの場合、IDでレコードを見つけるために使用されます。試してみましょう。

👉 **連絡先ページに`loader`関数を追加し、`loaderData`を使用してデータにアクセスします**

<docs-info>次のコードには型エラーが含まれています。これは次のセクションで修正します。</docs-info>

```tsx filename=app/routes/contact.tsx lines=[2-3,5-8,10-13]
// 既存のインポート
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

  // 既存のコード
}

// 既存のコード
```

<img class="tutorial" src="/_docs/v7_address_book_tutorial/11.webp" />

## レスポンスの送出

`loaderData.contact` の型が `ContactRecord | null` であることに注目してください。自動的な型安全性の仕組みにより、TypeScript は既に `params.contactId` が文字列であることを認識していますが、それが有効なIDであることを確認する処理は行っていません。連絡先が存在しない可能性があるため、`getContact` は `null` を返す可能性があり、これが型エラーの原因となっています。

コンポーネントコード内で連絡先が見つからない可能性に対処することもできますが、Webアプリケーションとして適切な方法は、適切な404エラーを送信することです。ローダー内でこれを行うことで、すべての問題を一度に解決できます。

```tsx filename=app/routes/contacts.$contactId.tsx lines=[5-7]
// 既存のインポート

export async function loader({ params }: Route.LoaderArgs) {
  const contact = await getContact(params.contactId);
  if (!contact) {
    throw new Response("Not Found", { status: 404 });
  }
  return { contact };
}

// 既存のコード
```

これで、ユーザーが見つからない場合、このパスでのコード実行が停止し、React Routerが代わりにエラーパスをレンダリングします。React Router のコンポーネントは、ハッピーパスにのみ集中できます 😁

## データの変更

最初の連絡先をすぐに作成しますが、まずはHTMLについて説明しましょう。

React Routerは、HTMLフォームのナビゲーションをデータ変更のプリミティブとしてエミュレートします。これは、JavaScriptのカンブリア爆発以前は唯一の方法でした。そのシンプルさに騙されてはいけません！React Routerのフォームは、クライアントサイドレンダリングアプリのUX機能を、「旧式の」Webモデルのシンプルさで実現します。

一部のWeb開発者には馴染みがありませんが、HTMLの`form`は実際にはリンクをクリックするのと同じように、ブラウザ内でナビゲーションを引き起こします。唯一の違いはリクエストにあります。リンクはURLのみを変更できますが、`form`はリクエストメソッド（`GET`と`POST`）とリクエストボディ（`POST`フォームデータ）も変更できます。

クライアントサイドルーティングがない場合、ブラウザは`form`のデータを自動的にシリアライズし、`POST`のリクエストボディとして、そして`GET`の[`URLSearchParams`][url-search-params]としてサーバーに送信します。React Routerも同じことを行いますが、サーバーにリクエストを送信する代わりに、クライアントサイドルーティングを使用して、ルートの[`action`][action]関数に送信します。

アプリの「新規」ボタンをクリックして、これを試すことができます。

<img class="tutorial" src="/_docs/v7_address_book_tutorial/12.webp" />

サーバーにこのフォームナビゲーションを処理するコードがないため、React Routerは405エラーを送信します。

[url-search-params]: <URL_FOR_URLSEARCHPARAMS>  (URLSearchParamsへのリンクをここに挿入してください)
[action]: <URL_FOR_ACTION> (actionへのリンクをここに挿入してください)

## 連絡先の作成

ルートルートから`action`関数をエクスポートして、新しい連絡先を作成します。ユーザーが「新規」ボタンをクリックすると、フォームはルートルートアクションに`POST`を送信します。

👉 **`app/root.tsx`から`action`関数をエクスポートする**

```tsx filename=app/root.tsx lines=[3,5-8]
// 既存のインポート

import { createEmptyContact } from "./data";

export async function action() {
  const contact = await createEmptyContact();
  return { contact };
}

// 既存のコード
```

以上です！「新規」ボタンをクリックすると、新しいレコードがリストに表示されます🥳

<img class="tutorial" src="/_docs/v7_address_book_tutorial/13.webp" />

`createEmptyContact`メソッドは、名前やデータのない空の連絡先を作成するだけです。しかし、レコードは作成されます！

> 🧐ちょっと待って…サイドバーはどうやって更新されたの？`action`関数はどこで呼び出されたの？データを再取得するコードはどこ？`useState`、`onSubmit`、`useEffect`はどこ？

ここで「旧来のウェブ」プログラミングモデルが登場します。[`<Form>`][form-component]は、ブラウザがサーバーへのリクエストを送信するのを防ぎ、代わりに[`fetch`][fetch]を使ってルートの`action`関数に送信します。

ウェブセマンティクスでは、`POST`は通常、データが変更されていることを意味します。慣例により、React Routerはこれをヒントとして使用し、`action`が完了した後にページ上のデータを自動的に再検証します。

実際、すべてがHTMLとHTTPであるため、JavaScriptを無効にしても、すべて動作します。React Routerがフォームをシリアル化してサーバーに[`fetch`][fetch]リクエストを行う代わりに、ブラウザがフォームをシリアル化してドキュメントリクエストを行います。そこからReact Routerはサーバーサイドでページをレンダリングして送信します。最終的には同じUIです。

しかし、ファビコンの回転や静的なドキュメントよりも優れたユーザーエクスペリエンスを作成するため、JavaScriptを使い続けます。


[form-component]: #
[fetch]: #

## データの更新

新しいレコードの情報を追加する方法を追加しましょう。

データの作成と同様に、[`<Form>`][form-component] を使用してデータを更新します。`app/routes/edit-contact.tsx` の中に新しいルートモジュールを作成しましょう。

👉 **編集用コンタクトルートの作成**

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
      "routes/edit-contact.tsx"
    ),
  ]),
  route("about", "routes/about.tsx"),
] satisfies RouteConfig;
```

👉 **編集ページUIの追加**

これまでに見たことのないものはありません。コピー＆ペーストして自由に使用してください。

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

これで、新しいレコードをクリックし、「編集」ボタンをクリックすると、新しいルートが表示されます。

<img class="tutorial" src="/_docs/v7_address_book_tutorial/14.webp" />

## `FormData`を使った連絡先の更新

作成したばかりの編集ルートはすでに`form`をレンダリングしています。必要なのは`action`関数を追加することだけです。React Routerは`form`をシリアライズし、[`fetch`][fetch]を使って`POST`し、すべてのデータを自動的に再検証します。

👉 **編集ルートに`action`関数を追加する**

```tsx filename=app/routes/edit-contact.tsx lines=[1,4,8,6-15]
import { Form, redirect } from "react-router";
// 既存のインポート

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

// 既存のコード
```

フォームに記入して保存ボタンを押すと、このような表示になります！<small>(ただし、見やすく、スイカを切るのに根気がいるかもしれません。)</small>

<img class="tutorial" src="/_docs/v7_address_book_tutorial/15.webp" />

## Mutationに関する議論

> 😑 動いたけど、何が起きているのか全く分からない…

少し詳しく見ていきましょう…

`app/routes/edit-contact.tsx`を開き、`form`要素を見てください。それぞれに`name`属性があることに注目してください。

```tsx filename=app/routes/edit-contact.tsx lines=[4]
<input
  aria-label="First name"
  defaultValue={contact.first}
  name="first"
  placeholder="First"
  type="text"
/>
```

JavaScriptを使用しない場合、フォームが送信されると、ブラウザは[`FormData`][form-data]を作成し、サーバーに送信するリクエストのボディとして設定します。先に述べたように、React Routerはそれを阻止し、代わりに[`fetch`][fetch]を使って`action`関数にリクエストを送信することでブラウザをエミュレートし、[`FormData`][form-data]を含めます。

`form`内の各フィールドは、`formData.get(name)`でアクセスできます。例えば、上記の入力フィールドの場合、名前を次のようにアクセスできます。

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

フォームフィールドがいくつかあるので、[`Object.fromEntries`][object-from-entries]を使ってそれらをすべてオブジェクトに収集しました。これはまさに`updateContact`関数が期待しているものです。

```tsx filename=app/routes/edit-contact.tsx nocopy
const updates = Object.fromEntries(formData);
updates.first; // "Some"
updates.last; // "Name"
```

`action`関数以外、ここで説明しているAPIはReact Routerによって提供されているものではありません。[`request`][request]、[`request.formData`][request-form-data]、[`Object.fromEntries`][object-from-entries]はすべてウェブプラットフォームによって提供されています。

`action`関数が終了した後、最後にある[`redirect`][redirect]に注目してください。

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

`action`関数と`loader`関数はどちらも`Response`を返すことができます（[`Request`][request]を受け取っているので理にかなっています！）。[`redirect`][redirect]ヘルパーは、アプリに場所の変更を指示する[`Response`][response]を返すことを容易にします。

クライアントサイドルーティングがない場合、`POST`リクエスト後にサーバーがリダイレクトすると、新しいページは最新のデータを取得してレンダリングします。先に学んだように、React Routerはこのモデルをエミュレートし、`action`呼び出し後にページのデータを自動的に再検証します。そのため、フォームを保存するとサイドバーが自動的に更新されます。クライアントサイドルーティングがない場合は、追加の再検証コードは存在しないため、React Routerでのクライアントサイドルーティングでも存在する必要はありません！

最後にもう一つ。JavaScriptがない場合、[`redirect`][redirect]は通常のredirectになります。しかし、JavaScriptを使用すると、クライアントサイドのリダイレクトになるため、スクロール位置やコンポーネントの状態などのクライアントの状態が失われることはありません。


[form-data]: https://developer.mozilla.org/en-US/docs/Web/API/FormData
[fetch]: https://developer.mozilla.org/en-US/docs/Web/API/fetch
[object-from-entries]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/fromEntries
[request]: https://remix.run/docs/en/v1/api/remix#request
[request-form-data]: https://remix.run/docs/en/v1/api/remix#request-formdata
[redirect]: https://remix.run/docs/en/v1/api/remix#redirect
[response]: https://developer.mozilla.org/en-US/docs/Web/API/Response


## 新規レコードを編集ページへリダイレクト

リダイレクトの方法が分かったところで、新規連絡先を作成するアクションを編集ページへリダイレクトするように更新しましょう。

👉 **新規レコードの編集ページへリダイレクト**

```tsx filename=app/root.tsx lines=[6,12]
import {
  Outlet,
  Scripts,
  ScrollRestoration,
  isRouteErrorResponse,
  redirect,
} from "react-router";
// 既存のインポート

export async function action() {
  const contact = await createEmptyContact();
  return redirect(`/contacts/${contact.id}/edit`);
}

// 既存のコード
```

これで、「新規」をクリックすると、編集ページに移動するようになります。

<img class="tutorial" src="/_docs/v7_address_book_tutorial/16.webp" />

## アクティブリンクのスタイル設定

多くのレコードがあるため、サイドバーで現在見ているレコードが分かりにくくなっています。これを修正するために[`NavLink`][nav-link]を使用できます。

👉 **サイドバーで`<Link>`を`<NavLink>`に置き換えます**

```tsx filename=app/layouts/sidebar.tsx lines=[1,17-26,28]
import { Form, Link, NavLink, Outlet } from "react-router";

// 既存のインポートとエクスポート

export default function SidebarLayout({
  loaderData,
}: Route.ComponentProps) {
  const { contacts } = loaderData;

  return (
    <>
      <div id="sidebar">
        {/* 既存の要素 */}
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
                {/* 既存の要素 */}
              </NavLink>
            </li>
          ))}
        </ul>
        {/* 既存の要素 */}
      </div>
      {/* 既存の要素 */}
    </>
  );
}
```

`className`に関数を渡していることに注意してください。ユーザーが`<NavLink to>`と一致するURLにいる場合、`isActive`は`true`になります。アクティブになる*直前*（データの読み込み中）の場合、`isPending`は`true`になります。これにより、ユーザーの現在位置を簡単に示し、リンクをクリックしてもデータの読み込みが必要な場合にすぐにフィードバックを提供できます。

<img class="tutorial" src="/_docs/v7_address_book_tutorial/17.webp" />

## グローバルな読み込み中UI

ユーザーがアプリを操作する際に、React Routerは次のページのデータを読み込んでいる間、*古いページを表示したままにします*。リスト間を移動すると、アプリが少し反応しないように感じることに気づいたかもしれません。アプリが反応しないように感じさせないように、ユーザーにフィードバックを提供しましょう。

React Routerは舞台裏で全ての状態を管理しており、動的なウェブアプリを構築するために必要な部品を公開します。この場合、[`useNavigation`][use-navigation]フックを使用します。

👉 **`useNavigation` を使用してグローバルな読み込み中UIを追加する**

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
      {/* 既存の要素 */}
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

[`useNavigation`][use-navigation] は現在のナビゲーションの状態を返します。状態は`"idle"`、`"loading"`、または`"submitting"`のいずれかになります。

私たちの場合、アイドル状態ではない場合、アプリの主要部分に`"loading"`クラスを追加します。(高速な読み込みでUIがちらつくのを避けるため)短い遅延後にフェードを追加するCSSを使用します。ただし、スピナーやトップバー全体にロードバーを表示するなど、何でも実行できます。

<img class="tutorial" src="/_docs/v7_address_book_tutorial/18.webp" />

## レコードの削除

contact ルートのコードを確認すると、削除ボタンは次のようになっていることがわかります。

```tsx filename=app/routes/contact.tsx lines=[2]
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
```

`action` が `"destroy"` を指していることに注意してください。`<Link to>` と同様に、`<Form action>` は*相対的な*値を取ることができます。フォームは `contacts/:contactId` ルートでレンダリングされるため、`destroy` という相対的なアクションは、クリックされるとフォームを `contacts/:contactId/destroy` に送信します。

この時点で、削除ボタンを機能させるために必要なことはすべて知っているはずです。先に進む前に、試してみてはどうでしょうか？ 次のものが必要です。

1. 新しいルート
2. そのルートのアクション
3. `app/data.ts` からの `deleteContact`
4. どこかにリダイレクトする `redirect`

👉 **"destroy" ルートモジュールの設定**

```shellscript nonumber
touch app/routes/destroy-contact.tsx
```

```tsx filename=app/routes.ts lines=[3-6]
export default [
  // 既存のルート
  route(
    "contacts/:contactId/destroy",
    "routes/destroy-contact.tsx"
  ),
  // 既存のルート
] satisfies RouteConfig;
```

👉 **destroy アクションの追加**

```tsx filename=app/routes/destroy-contact.tsx
import { redirect } from "react-router";
import type { Route } from "./+types/destroy-contact";

import { deleteContact } from "../data";

export async function action({ params }: Route.ActionArgs) {
  await deleteContact(params.contactId);
  return redirect("/");
}
```

さて、レコードに移動して「削除」ボタンをクリックしてみましょう。機能します！

> 😅 なぜこれが機能するのかまだよく分かりません

ユーザーが送信ボタンをクリックすると：

1. `<Form>` は、サーバーに新しいドキュメント `POST` リクエストを送信するというデフォルトのブラウザの動作を阻止しますが、代わりにクライアントサイドルーティングと[`fetch`][fetch]を使用してブラウザをエミュレートし、`POST`リクエストを作成します。
2. `<Form action="destroy">` は `contacts/:contactId/destroy` の新しいルートと一致し、リクエストを送信します。
3. `action` がリダイレクトした後、React Router はページ上のデータのすべての `loader` を呼び出して最新の値を取得します（これは「再検証」です）。`routes/contact.tsx` の `loaderData` には新しい値が入っており、コンポーネントが更新されます！

`Form` を追加し、`action` を追加すると、React Router が残りの処理を行います。

## キャンセルボタン

編集ページには、まだ何も機能していないキャンセルボタンがあります。ブラウザの戻るボタンと同じ動作をするようにしたいです。

ボタンのクリックハンドラと[`useNavigate`][use-navigate]が必要です。

👉 **`useNavigate` を使用してキャンセルボタンのクリックハンドラを追加する**

```tsx filename=app/routes/edit-contact.tsx lines=[1,8,15]
import { Form, redirect, useNavigate } from "react-router";
// 既存のインポートとエクスポート

export default function EditContact({
  loaderData,
}: Route.ComponentProps) {
  const { contact } = loaderData;
  const navigate = useNavigate();

  return (
    <Form key={contact.id} id="contact-form" method="post">
      {/* 既存の要素 */}
      <p>
        <button type="submit">保存</button>
        <button onClick={() => navigate(-1)} type="button">
          キャンセル
        </button>
      </p>
    </Form>
  );
}
```

これで、ユーザーが「キャンセル」をクリックすると、ブラウザの履歴で1つ前に戻ります。

> 🧐 なぜボタンに`event.preventDefault()`がないのですか？

`<button type="button">`は、一見冗長に見えますが、ボタンがフォームを送信するのを防ぐHTMLの方法です。

あと2つの機能が残っています。もうすぐ完了です！

## `URLSearchParams` と `GET` サブミッション

これまでのインタラクティブなUIは、URLを変更するリンクか、`action`関数にデータを送信する`form`のいずれかでした。検索フィールドは、その両方の混合で興味深いものです。`form`ですが、データは変更せず、URLのみを変更します。

検索フォームを送信したときに何が起こるか見てみましょう。

👉 **検索フィールドに名前を入力してEnterキーを押してください**

ブラウザのURLに、クエリが[`URLSearchParams`][url-search-params]として含まれていることに注目してください。

```
http://localhost:5173/?q=ryan
```

`<Form method="post">`ではないため、React Routerはブラウザをエミュレートし、リクエストボディではなく[`FormData`][form-data]を[`URLSearchParams`][url-search-params]にシリアライズします。

`loader`関数は、`request`から検索パラメータにアクセスできます。リストのフィルタリングに使用してみましょう。

👉 **`URLSearchParams`があればリストをフィルタリングする**

```tsx filename=app/layouts/sidebar.tsx lines=[3-8]
// 既存のインポートとエクスポート

export async function loader({
  request,
}: Route.LoaderArgs) {
  const url = new URL(request.url);
  const q = url.searchParams.get("q");
  const contacts = await getContacts(q);
  return { contacts };
}

// 既存のコード
```

<img class="tutorial" src="/_docs/v7_address_book_tutorial/19.webp" />

これは`GET`であり`POST`ではないため、React Routerは`action`関数を呼び出しません。`GET` `form`を送信することは、リンクをクリックすることと同じです。URLのみが変更されます。

これはまた、通常のページナビゲーションであることを意味します。戻るボタンをクリックして、以前の位置に戻ることができます。


[url-search-params]: <URL_SEARCH_PARAMS_LINK>  // URLSearchParamsへのリンクをここに挿入してください
[form-data]: <FORM_DATA_LINK>  // FormDataへのリンクをここに挿入してください


## URLとフォーム状態の同期化

いくつかのUX上の問題を迅速に解決しましょう。

1. 検索後、戻るボタンをクリックしても、リストはフィルタリングされなくなっているのに、フォームフィールドには入力した値が残っています。
2. 検索後、ページを更新すると、リストはフィルタリングされているのに、フォームフィールドには値が入っていません。

つまり、URLと入力の状態が同期していません。

(2)を先に解決し、URLの値で入力を開始しましょう。

👉 **`loader`から`q`を返し、それを入力のデフォルト値として設定します**

```tsx filename=app/layouts/sidebar.tsx lines=[9,15,26]
// 既存のインポートとエクスポート

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
        {/* 既存の要素 */}
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
            {/* 既存の要素 */}
          </Form>
          {/* 既存の要素 */}
        </div>
        {/* 既存の要素 */}
      </div>
      {/* 既存の要素 */}
    </>
  );
}
```

これで、検索後にページを更新した場合、入力フィールドにクエリが表示されます。

次に、問題(1)、戻るボタンをクリックして入力を更新する方法です。DOMの入力値を直接操作するために、Reactから`useEffect`を取り込みます。

👉 **`URLSearchParams`と入力値を同期します**

```tsx filename=app/layouts/sidebar.tsx lines=[2,12-17]
// 既存のインポート
import { useEffect } from "react";

// 既存のインポートとエクスポート

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

  // 既存のコード
}
```

> 🤔 コントロールされたコンポーネントとReactの状態を使うべきではないでしょうか？

コントロールされたコンポーネントとしてこれを行うこともできます。同期ポイントは増えますが、それはあなた次第です。

<details>

<summary>展開して、どのようなものになるかを確認する</summary>

```tsx filename=app/root.tsx lines=[2,11-12,14-18,30-33,36-37]
// 既存のインポート
import { useEffect, useState } from "react";

// 既存のインポートとエクスポート

export default function SidebarLayout({
  loaderData,
}: Route.ComponentProps) {
  const { contacts, q } = loaderData;
  const navigation = useNavigation();
  // クエリは状態に保持する必要があります
  const [query, setQuery] = useState(q || "");

  // 戻る/進むボタンをクリックしたときにクエリをコンポーネントの状態に同期するための`useEffect`は依然として存在します
  useEffect(() => {
    setQuery(q || "");
  }, [q]);

  return (
    <>
      <div id="sidebar">
        {/* 既存の要素 */}
        <div>
          <Form id="search-form" role="search">
            <input
              aria-label="Search contacts"
              id="q"
              name="q"
              // ユーザーの入力をコンポーネントの状態に同期
              onChange={(event) =>
                setQuery(event.currentTarget.value)
              }
              placeholder="Search"
              type="search"
              // `defaultValue`から`value`に変更
              value={query}
            />
            {/* 既存の要素 */}
          </Form>
          {/* 既存の要素 */}
        </div>
        {/* 既存の要素 */}
      </div>
      {/* 既存の要素 */}
    </>
  );
}
```

</details>

これで、戻る/進む/更新ボタンをクリックしても、入力値はURLと結果と同期するはずです。

## `Form`の`onChange`の送信

ここで製品に関する決定を下す必要があります。ユーザーに`form`を送信して結果をフィルタリングさせたい場合と、ユーザーが入力する際にフィルタリングしたい場合があります。前者は既に実装しているので、後者の様子を見てみましょう。

`useNavigate`は既に見てきましたが、今回はその仲間である[`useSubmit`][use-submit]を使用します。

```tsx filename=app/layouts/sidebar.tsx lines=[7,16,27-29]
import {
  Form,
  Link,
  NavLink,
  Outlet,
  useNavigation,
  useSubmit,
} from "react-router";
// 既存のインポートとエクスポート

export default function SidebarLayout({
  loaderData,
}: Route.ComponentProps) {
  const { contacts, q } = loaderData;
  const navigation = useNavigation();
  const submit = useSubmit();

  // 既存のコード

  return (
    <>
      <div id="sidebar">
        {/* 既存の要素 */}
        <div>
          <Form
            id="search-form"
            onChange={(event) =>
              submit(event.currentTarget)
            }
            role="search"
          >
            {/* 既存の要素 */}
          </Form>
          {/* 既存の要素 */}
        </div>
        {/* 既存の要素 */}
      </div>
      {/* 既存の要素 */}
    </>
  );
}
```

入力するたびに、`form`が自動的に送信されるようになりました！

[`submit`][use-submit]への引数に注目してください。`submit`関数は、渡されたフォームをシリアライズして送信します。ここでは`event.currentTarget`を渡しています。`currentTarget`は、イベントがアタッチされたDOMノード（`form`）です。


[use-submit]: <リンクをここに挿入>

## 検索スピナーの追加

本番アプリでは、この検索は一度にすべてを送信してクライアント側でフィルタリングするには大きすぎるデータベース内のレコードを検索している可能性があります。そのため、このデモではネットワーク遅延を偽装しています。

ローディングインジケーターがないと、検索は少し遅く感じられます。データベースを高速化できたとしても、ユーザーのネットワーク遅延は常に存在し、制御できません。

より良いユーザーエクスペリエンスのために、検索に対する即時のUIフィードバックを追加しましょう。[`useNavigation`][use-navigation]を再び使用します。

👉 **検索中かどうかを知るための変数の追加**

```tsx filename=app/layouts/sidebar.tsx lines=[9-13]
// 既存のインポートとエクスポート

export default function SidebarLayout({
  loaderData,
}: Route.ComponentProps) {
  const { contacts, q } = loaderData;
  const navigation = useNavigation();
  const submit = useSubmit();
  const searching =
    navigation.location &&
    new URLSearchParams(navigation.location.search).has(
      "q"
    );

  // 既存のコード
}
```

何も起こっていない場合、`navigation.location`は`undefined`になりますが、ユーザーが移動すると、データの読み込み中に次の場所が設定されます。その後、`location.search`を使用して検索中かどうかを確認します。


👉 **新しい`searching`状態を使用して検索フォーム要素にクラスを追加**

```tsx filename=app/layouts/sidebar.tsx lines=[22,31]
// 既存のインポートとエクスポート

export default function SidebarLayout({
  loaderData,
}: Route.ComponentProps) {
  // 既存のコード

  return (
    <>
      <div id="sidebar">
        {/* 既存の要素 */}
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
          {/* 既存の要素 */}
        </div>
        {/* 既存の要素 */}
      </div>
      {/* 既存の要素 */}
    </>
  );
}
```

ボーナスポイントとして、検索時にメイン画面をフェードアウトしないようにします。

```tsx filename=app/layouts/sidebar.tsx lines=[13]
// 既存のインポートとエクスポート

export default function SidebarLayout({
  loaderData,
}: Route.ComponentProps) {
  // 既存のコード

  return (
    <>
      {/* 既存の要素 */}
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
      {/* 既存の要素 */}
    </>
  );
}
```

これで、検索入力の左側に素敵なスピナーが表示されるはずです。

<img class="tutorial" src="/_docs/v7_address_book_tutorial/20.webp" />

## ヒストリスタックの管理

フォームはキーストロークごとに送信されるため、「alex」と入力してからバックスペースで削除すると、膨大なヒストリスタックが生成されます😂。これは明らかに避けなければなりません。

<img class="tutorial" src="/_docs/v7_address_book_tutorial/21.webp" />

ヒストリスタックにプッシュするのではなく、現在のエントリを次のページで*置き換える*ことで、これを回避できます。

👉 **`submit` で `replace` を使用**

```tsx filename=app/layouts/sidebar.tsx lines=[16-19]
// 既存のインポートとエクスポート

export default function SidebarLayout({
  loaderData,
}: Route.ComponentProps) {
  // 既存のコード

  return (
    <>
      <div id="sidebar">
        {/* 既存の要素 */}
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
            {/* 既存の要素 */}
          </Form>
          {/* 既存の要素 */}
        </div>
        {/* 既存の要素 */}
      </div>
      {/* 既存の要素 */}
    </>
  );
}
```

これが最初の検索かどうかを簡単に確認した後、置き換えるかどうかを決定します。最初の検索では新しいエントリが追加されますが、それ以降のキーストロークでは現在のエントリが置き換えられます。検索を削除するために7回戻るボタンをクリックする代わりに、ユーザーは1回戻るボタンをクリックするだけで済みます。

## ナビゲーションのない`Form`

これまでのフォームはすべてURLを変更していました。これらのユーザーフローは一般的ですが、ナビゲーションを引き起こさずにフォームを送信したい場合も同様に一般的です。

このような場合、[`useFetcher`][use-fetcher]を使用します。これにより、ナビゲーションを引き起こすことなく`action`と`loader`と通信できます。

連絡先ページの★ボタンはこれに適しています。新しいレコードを作成または削除するわけではなく、ページを変更する必要もありません。単に見ているページのデータを変更したいだけです。

👉 **`<Favorite>`フォームをfetcherフォームに変更する**

```tsx filename=app/routes/contact.tsx lines=[1,10,14,26]
import { Form, useFetcher } from "react-router";

// 既存のインポートとエクスポート

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
            ? "お気に入りを削除する"
            : "お気に入りに追加する"
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

このフォームはもはやナビゲーションを引き起こさず、単に`action`にフェッチします。それについては…`action`を作成するまで動作しません。

👉 **`action`を作成する**

```tsx filename=app/routes/contact.tsx lines=[2,5-13]
// 既存のインポート
import { getContact, updateContact } from "../data";
// 既存のインポート

export async function action({
  params,
  request,
}: Route.ActionArgs) {
  const formData = await request.formData();
  return updateContact(params.contactId, {
    favorite: formData.get("favorite") === "true",
  });
}

// 既存のコード
```

さあ、ユーザーの名前の横にある星をクリックする準備ができました！

<img class="tutorial" src="/_docs/v7_address_book_tutorial/22.webp" />

見てください、両方の星が自動的に更新されます。新しい`<fetcher.Form method="post">`は、これまで使用してきた`<Form>`とほぼ同じように機能します。アクションを呼び出し、その後すべてのデータが自動的に再検証されます—エラーも同様にキャッチされます。

ただし、重要な違いが1つあります。ナビゲーションではないため、URLは変更されず、履歴スタックは影響を受けません。



## 楽観的UI

前のセクションのお気に入りボタンをクリックしたときに、アプリが反応しにくいと感じたかもしれません。もう一度、現実世界でも発生するネットワーク遅延を追加しました。

ユーザーにフィードバックを与えるために、`fetcher.state`（以前の`navigation.state`と非常によく似ています）を使用して星をローディング状態にすることもできますが、今回はさらに優れた方法があります。「楽観的UI」と呼ばれる戦略を使用できます。

fetcherは`action`に送信される[`FormData`][form-data]を知っているので、`fetcher.formData`で利用できます。ネットワークが終了する前でも、星の状態をすぐに更新するためにそれを使用します。更新が最終的に失敗した場合、UIは実際のデータに戻ります。

👉 **`fetcher.formData`から楽観的な値を読み取る**

```tsx filename=app/routes/contact.tsx lines=[9-11]
// 既存のコード

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
            ? "お気に入りから削除"
            : "お気に入りに追加"
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

これで、星はクリックするとすぐに新しい状態に*即座に*変わります。

***

以上です！React Routerを試していただきありがとうございます。このチュートリアルが、優れたユーザーエクスペリエンスを構築するための堅実なスタートになることを願っています。できることは他にもたくさんあるので、すべての[API][react-router-apis]を確認してください 😀

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

