---
title: チュートリアル (30m)
order: 2
---

# Remix チュートリアル

<docs-warning>Remix を始めたばかりですか？最新バージョンの [Remix は現在 React Router v7 です][remix-now-react-router]。最新のフレームワーク機能を使用したい場合は、[React Router ドキュメントの同じチュートリアル][react-router-tutorial]に従うことができます。</docs-warning>

ここでは、連絡先を管理できる、小さくても機能豊富なアプリを構築します。データベースやその他の「本番環境向け」のものは含まれていないため、Remix に集中できます。このチュートリアルに沿って進めると約30分かかりますが、読むだけならすぐに終わります。

<img class="tutorial" src="/docs-images/contacts/01.webp" />

👉 **このマークが表示されたら、アプリで何かをする必要があります！**

それ以外の部分は、情報提供とより深い理解のためのものです。それでは始めましょう。

## セットアップ

👉 **基本的なテンプレートを生成する**

```shellscript nonumber
npx create-remix@latest --template remix-run/remix/templates/remix-tutorial
```

これは非常にシンプルなテンプレートですが、CSSとデータモデルが含まれているため、Remix に集中できます。[クイックスタート][quickstart]で Remix プロジェクトの基本的なセットアップについて詳しく学ぶことができます。

👉 **アプリを起動する**

```shellscript nonumber
# cd into the app directory
cd {wherever you put the app}

# install dependencies if you haven't already
npm install

# start the server
npm run dev
```

[http://localhost:5173][http-localhost-5173] を開くと、スタイルが適用されていない画面が表示されるはずです。

<img class="tutorial" src="/docs-images/contacts/03.webp" />

## ルートルート

`app/root.tsx` というファイルに注目してください。これは「ルートルート」と呼ばれるものです。UI で最初にレンダリングされるコンポーネントなので、通常はページのグローバルレイアウトを含みます。

<details>

<summary>ルートコンポーネントのコードを見るにはここを展開してください</summary>

```tsx filename=app/root.tsx
import {
  Form,
  Links,
  Meta,
  Scripts,
  ScrollRestoration,
} from "@remix-run/react";

export default function App() {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1"
        />
        <Meta />
        <Links />
      </head>
      <body>
        <div id="sidebar">
          <h1>Remix Contacts</h1>
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

        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}
```

</details>

## `links` を使ってスタイルシートを追加する

Remix アプリをスタイリングする方法は複数ありますが、Remix に集中するために、すでに書かれているプレーンなスタイルシートを使用します。

CSS ファイルは JavaScript モジュールに直接インポートできます。Vite はアセットにフィンガープリントを付け、ビルドのクライアントディレクトリに保存し、モジュールに公開アクセス可能な `href` を提供します。

👉 **アプリのスタイルをインポートする**

```tsx filename=app/root.tsx lines=[1,4,6-8]
import type { LinksFunction } from "@remix-run/node";
// existing imports

import appStylesHref from "./app.css?url";

export const links: LinksFunction = () => [
  { rel: "stylesheet", href: appStylesHref },
];
```

すべてのルートは [`links`][links] 関数をエクスポートできます。これらは収集され、`app/root.tsx` でレンダリングした `<Links />` コンポーネントにレンダリングされます。

アプリは現在、次のように表示されるはずです。CSS も書けるデザイナーがいるのは素晴らしいことですね？（[Jim][jim] さん、ありがとうございます 🙏）。

<img class="tutorial" loading="lazy" src="/docs-images/contacts/04.webp" />

## 連絡先ルートの UI

サイドバーの項目をクリックすると、デフォルトの 404 ページが表示されます。`/contacts/1` の URL に一致するルートを作成しましょう。

👉 **`app/routes` ディレクトリと連絡先ルートモジュールを作成する**

```shellscript nonumber
mkdir app/routes
touch app/routes/contacts.\$contactId.tsx
```

Remix の [ルートファイル命名規則][routes-file-conventions]では、`.` は URL に `/` を作成し、`$` はセグメントを動的にします。これにより、次のような URL に一致するルートを作成しました。

- `/contacts/123`
- `/contacts/abc`

👉 **連絡先コンポーネントの UI を追加する**

たくさんの要素があるだけなので、コピー＆ペーストしてください。

```tsx filename=app/routes/contacts.$contactId.tsx
import { Form } from "@remix-run/react";
import type { FunctionComponent } from "react";

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
          )}{" "}
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

const Favorite: FunctionComponent<{
  contact: Pick<ContactRecord, "favorite">;
}> = ({ contact }) => {
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
};
```

これで、サイドバーのリンクをクリックするか、`/contacts/1` にアクセスしても...何も新しいことはありませんか？

<img class="tutorial" loading="lazy" alt="contact route with blank main content" src="/docs-images/contacts/05.webp" />

## ネストされたルートとアウトレット

Remix は React Router の上に構築されているため、ネストされたルーティングをサポートしています。子ルートが親レイアウト内でレンダリングされるためには、親で [`Outlet`][outlet-component] をレンダリングする必要があります。これを修正しましょう。`app/root.tsx` を開いて、内部に `Outlet` をレンダリングします。

👉 **[`<Outlet />`][outlet-component] をレンダリングする**

```tsx filename=app/root.tsx lines=[6,19-21]
// existing imports
import {
  Form,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "@remix-run/react";

// existing imports & code

export default function App() {
  return (
    <html lang="en">
      {/* other elements */}
      <body>
        <div id="sidebar">{/* other elements */}</div>
        <div id="detail">
          <Outlet />
        </div>
        {/* other elements */}
      </body>
    </html>
  );
}
```

これで、子ルートが `Outlet` を通してレンダリングされるはずです。

<img class="tutorial" loading="lazy" alt="contact route with the main content" src="/docs-images/contacts/06.webp" />

## クライアントサイドルーティング

気づいたかもしれませんが、サイドバーのリンクをクリックすると、ブラウザはクライアントサイドルーティングではなく、次の URL に対して完全なドキュメントリクエストを行っています。

クライアントサイドルーティングにより、アプリはサーバーから別のドキュメントをリクエストすることなく URL を更新できます。代わりに、アプリはすぐに新しい UI をレンダリングできます。[`<Link>`][link-component] を使ってこれを実現しましょう。

👉 **サイドバーの `<a href>` を `<Link to>` に変更する**

```tsx filename=app/root.tsx lines=[4,24,27]
// existing imports
import {
  Form,
  Link,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "@remix-run/react";

// existing imports and exports

export default function App() {
  return (
    <html lang="en">
      {/* other elements */}
      <body>
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
      </body>
    </html>
  );
}
```

ブラウザの開発者ツールのネットワークタブを開くと、ドキュメントがリクエストされなくなったことが確認できます。

## データの読み込み

URL セグメント、レイアウト、データは、多くの場合、結合されています（3つ組？）。このアプリでもすでにそれが見られます。

| URL セグメント         | コンポーネント   | データ               |
| ------------------- | ----------- | ------------------ |
| /                   | `<Root>`    | 連絡先リスト       |
| contacts/:contactId | `<Contact>` | 個々の連絡先       |

この自然な結合のため、Remix にはルートコンポーネントにデータを簡単に取得するためのデータ規約があります。

データをロードするために使用する API は [`loader`][loader] と [`useLoaderData`][use-loader-data] の2つです。まず、ルートルートで `loader` 関数を作成してエクスポートし、次にデータをレンダリングします。

👉 **`app/root.tsx` から `loader` 関数をエクスポートし、データをレンダリングする**

<docs-info>以下のコードには型エラーがありますが、次のセクションで修正します</docs-info>

```tsx filename=app/root.tsx lines=[10,14,18-21,24,33-56]
// existing imports
import {
  Form,
  Link,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
} from "@remix-run/react";

// existing imports
import { getContacts } from "./data";

// existing exports

export const loader = async () => {
  const contacts = await getContacts();
  return { contacts };
};

export default function App() {
  const { contacts } = useLoaderData();

  return (
    <html lang="en">
      {/* other elements */}
      <body>
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
                      )}{" "}
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
      </body>
    </html>
  );
}
```

これだけです！Remix は、このデータを UI と自動的に同期させます。サイドバーは次のようになるはずです。

<img class="tutorial" loading="lazy" src="/docs-images/contacts/07.webp" />

## 型推論

`map` 内の `contact` の型について TypeScript が文句を言っていることに気づいたかもしれません。`typeof loader` を使ってデータに関する型推論を得るために、簡単なアノテーションを追加できます。

```tsx filename=app/root.tsx lines=[4]
// existing imports and exports

export default function App() {
  const { contacts } = useLoaderData<typeof loader>();

  // existing code
}
```

## ローダー内の URL パラメータ

👉 **サイドバーのリンクのいずれかをクリックする**

古い静的な連絡先ページが再び表示されるはずですが、1つ違いがあります。URL にはレコードの実際の ID が含まれています。

<img class="tutorial" loading="lazy" src="/docs-images/contacts/08.webp" />

`app/routes/contacts.$contactId.tsx` のファイル名にある `$contactId` の部分を覚えていますか？これらの動的セグメントは、URL のその位置にある動的な（変化する）値に一致します。URL 内のこれらの値を「URL パラメータ」、または略して「params」と呼びます。

これらの [`params`][params] は、動的セグメントに一致するキーを持つ `loader` に渡されます。たとえば、セグメントの名前が `$contactId` の場合、値は `params.contactId` として渡されます。

これらの `params` は、ID でレコードを検索するためによく使用されます。試してみましょう。

👉 **連絡先ページに `loader` 関数を追加し、`useLoaderData` でデータにアクセスする**

<docs-info>以下のコードには型エラーがありますが、次のセクションで修正します</docs-info>

```tsx filename=app/routes/contacts.$contactId.tsx lines=[1,4,6-9,12]
import { Form, useLoaderData } from "@remix-run/react";
// existing imports

import { getContact } from "../data";

export const loader = async ({ params }) => {
  const contact = await getContact(params.contactId);
  return { contact };
};

export default function Contact() {
  const { contact } = useLoaderData<typeof loader>();

  // existing code
}

// existing code
```

<img class="tutorial" loading="lazy" src="/docs-images/contacts/10.webp" />

## パラメータの検証とレスポンスのスロー

TypeScript が私たちに非常に怒っています。TypeScript を満足させて、それが私たちに何を考慮させるか見てみましょう。

```tsx filename=app/routes/contacts.$contactId.tsx lines=[1,3,7-10]
import type { LoaderFunctionArgs } from "@remix-run/node";
// existing imports
import invariant from "tiny-invariant";

// existing imports

export const loader = async ({
  params,
}: LoaderFunctionArgs) => {
  invariant(params.contactId, "Missing contactId param");
  const contact = await getContact(params.contactId);
  return { contact };
};

// existing code
```

これが最初に浮き彫りにする問題は、ファイル名とコードの間でパラメータの名前を間違えた可能性があることです（ファイルの名前を変更したかもしれません！）。`invariant` は、コードに潜在的な問題があることを予期していた場合に、カスタムメッセージでエラーをスローするための便利な関数です。

次に、`useLoaderData<typeof loader>()` は、連絡先を取得したか `null` であるかを知っています（その ID を持つ連絡先がない可能性があります）。この潜在的な `null` はコンポーネントコードにとって扱いにくく、TS エラーがまだ飛び交っています。

コンポーネントコードで連絡先が見つからない可能性を考慮することもできますが、Web 的なやり方は適切な 404 を送信することです。これを `loader` で行い、すべての問題を一度に解決できます。

```tsx filename=app/routes/contacts.$contactId.tsx lines=[8-10]
// existing imports

export const loader = async ({
  params,
}: LoaderFunctionArgs) => {
  invariant(params.contactId, "Missing contactId param");
  const contact = await getContact(params.contactId);
  if (!contact) {
    throw new Response("Not Found", { status: 404 });
  }
  return { contact };
};

// existing code
```

これで、ユーザーが見つからない場合、このパスでのコード実行は停止し、Remix は代わりにエラーパスをレンダリングします。Remix のコンポーネントはハッピーパスにのみ集中できます😁

## データミューテーション

すぐに最初の連絡先を作成しますが、まず HTML について話しましょう。

Remix は、HTML Form ナビゲーションをデータミューテーションのプリミティブとしてエミュレートします。これは、JavaScript のカンブリア爆発以前は唯一の方法でした。そのシンプルさに騙されてはいけません！Remix の Form は、クライアントレンダリングされたアプリの UX 機能と、「昔ながらの」Web モデルのシンプルさを提供します。

一部の Web 開発者には馴染みがないかもしれませんが、HTML の `form` は、リンクをクリックするのと同じように、ブラウザでナビゲーションを引き起こします。唯一の違いはリクエストにあります。リンクは URL のみを変更できますが、`form` はリクエストメソッド（`GET` と `POST`）とリクエストボディ（`POST` フォームデータ）も変更できます。

クライアントサイドルーティングがない場合、ブラウザは `form` のデータを自動的にシリアライズし、`POST` の場合はリクエストボディとして、`GET` の場合は [`URLSearchParams`][url-search-params] としてサーバーに送信します。Remix も同じことを行いますが、リクエストをサーバーに送信する代わりに、クライアントサイドルーティングを使用してルートの [`action`][action] 関数に送信します。

アプリの「New」ボタンをクリックして、これを試すことができます。

<img class="tutorial" loading="lazy" src="/docs-images/contacts/09.webp" />

Remix は 405 を送信します。これは、このフォームナビゲーションを処理するコードがサーバーにないためです。

## 連絡先の作成

ルートルートで `action` 関数をエクスポートして、新しい連絡先を作成します。ユーザーが「New」ボタンをクリックすると、フォームはルートルートの `action` に `POST` されます。

👉 **`app/root.tsx` から `action` 関数をエクスポートする**

```tsx filename=app/root.tsx lines=[3,5-8]
// existing imports

import { createEmptyContact, getContacts } from "./data";

export const action = async () => {
  const contact = await createEmptyContact();
  return { contact };
};

// existing code
```

これだけです！「New」ボタンをクリックすると、リストに新しいレコードがポップアップ表示されるはずです🥳

<img class="tutorial" loading="lazy" src="/docs-images/contacts/11.webp" />

`createEmptyContact` メソッドは、名前やデータなどがない空の連絡先を作成するだけです。しかし、それでもレコードは作成されます、約束します！

> 🧐 ちょっと待って...サイドバーはどのように更新されたの？`action` 関数はどこで呼び出されたの？データを再フェッチするコードはどこにあるの？`useState`、`onSubmit`、`useEffect` はどこに？

ここに「昔ながらの Web」プログラミングモデルが現れます。[`<Form>`][form-component] は、ブラウザがサーバーに新しいドキュメント `POST` リクエストを送信するのを防ぎ、代わりに [`fetch`][fetch] を使用してルートの `action` 関数に送信します。

Web のセマンティクスでは、`POST` は通常、データが変更されることを意味します。慣例により、Remix はこれをヒントとして使用し、`action` が完了した後にページのデータを自動的に再検証します。

実際、すべてが HTML と HTTP なので、JavaScript を無効にしても全体が機能します。Remix がフォームをシリアライズしてサーバーに [`fetch`][fetch] リクエストを行う代わりに、ブラウザがフォームをシリアライズしてドキュメントリクエストを行います。そこから Remix はページをサーバーサイドでレンダリングして送信します。最終的にはどちらの方法でも同じ UI になります。

しかし、スピニングするファビコンや静的なドキュメントよりも優れたユーザーエクスペリエンスを実現するため、JavaScript はそのままにしておきます。

## データの更新

新しいレコードの情報を入力する方法を追加しましょう。

データの作成と同様に、[`<Form>`][form-component] を使用してデータを更新します。`app/routes/contacts.$contactId_.edit.tsx` に新しいルートを作成しましょう。

👉 **編集コンポーネントを作成する**

```shellscript nonumber
touch app/routes/contacts.\$contactId_.edit.tsx
```

`$contactId_` の奇妙な `_` に注目してください。デフォルトでは、ルートは同じプレフィックス名を持つルート内に自動的にネストされます。末尾に `_` を追加すると、ルートが `app/routes/contacts.$contactId.tsx` 内にネスト**しない**ように指示されます。[ルートファイル命名][routes-file-conventions]ガイドで詳細を確認してください。

👉 **編集ページの UI を追加する**

これまで見たことのないものは何もありません。コピー＆ペーストしてください。

```tsx filename=app/routes/contacts.$contactId_.edit.tsx
import type { LoaderFunctionArgs } from "@remix-run/node";
import { Form, useLoaderData } from "@remix-run/react";
import invariant from "tiny-invariant";

import { getContact } from "../data";

export const loader = async ({
  params,
}: LoaderFunctionArgs) => {
  invariant(params.contactId, "Missing contactId param");
  const contact = await getContact(params.contactId);
  if (!contact) {
    throw new Response("Not Found", { status: 404 });
  }
  return { contact };
};

export default function EditContact() {
  const { contact } = useLoaderData<typeof loader>();

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

新しいレコードをクリックし、「Edit」ボタンをクリックしてください。新しいルートが表示されるはずです。

<img class="tutorial" loading="lazy" src="/docs-images/contacts/12.webp" />

## `FormData` を使って連絡先を更新する

先ほど作成した編集ルートはすでに `form` をレンダリングしています。必要なのは `action` 関数を追加することだけです。Remix は `form` をシリアライズし、[`fetch`][fetch] で `POST` し、すべてのデータを自動的に再検証します。

👉 **編集ルートに `action` 関数を追加する**

```tsx filename=app/routes/contacts.$contactId_.edit.tsx lines=[2,5,8,10-19]
import type {
  ActionFunctionArgs,
  LoaderFunctionArgs,
} from "@remix-run/node";
import { redirect } from "@remix-run/node";
// existing imports

import { getContact, updateContact } from "../data";

export const action = async ({
  params,
  request,
}: ActionFunctionArgs) => {
  invariant(params.contactId, "Missing contactId param");
  const formData = await request.formData();
  const updates = Object.fromEntries(formData);
  await updateContact(params.contactId, updates);
  return redirect(`/contacts/${params.contactId}`);
};

// existing code
```

フォームに入力し、「Save」をクリックすると、次のようなものが表示されるはずです！<small>（ただし、もっと見やすく、毛が少ないかもしれません。）</small>

<img class="tutorial" loading="lazy" src="/docs-images/contacts/13.webp" />

## ミューテーションの議論

> 😑 うまくいったけど、何が起こっているのか全くわからない...

少し掘り下げてみましょう...

`contacts.$contactId_.edit.tsx` を開いて、`form` 要素を見てください。それぞれに名前があることに注目してください。

```tsx filename=app/routes/contacts.$contactId_.edit.tsx lines=[4]
<input
  aria-label="First name"
  defaultValue={contact.first}
  name="first"
  placeholder="First"
  type="text"
/>
```

JavaScript がない場合、フォームが送信されると、ブラウザは [`FormData`][form-data] を作成し、それをリクエストのボディとしてサーバーに送信します。前述したように、Remix はこれを防ぎ、ブラウザをエミュレートして、代わりに [`fetch`][fetch] を使用してリクエストを `action` 関数に送信します。これには [`FormData`][form-data] も含まれます。

`form` の各フィールドは `formData.get(name)` でアクセスできます。たとえば、上記の入力フィールドの場合、名と姓は次のようにアクセスできます。

```tsx filename=app/routes/contacts.$contactId_.edit.tsx lines=[6,7] nocopy
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

フォームフィールドがいくつかあるため、[`Object.fromEntries`][object-from-entries] を使用してそれらすべてをオブジェクトに収集しました。これはまさに `updateContact` 関数が求めているものです。

```tsx filename=app/routes/contacts.$contactId_.edit.tsx nocopy
const updates = Object.fromEntries(formData);
updates.first; // "Some"
updates.last; // "Name"
```

`action` 関数を除いて、Remix はここで議論している API のどれも提供していません。[`request`][request]、[`request.formData`][request-form-data]、[`Object.fromEntries`][object-from-entries] はすべて Web プラットフォームによって提供されています。

`action` が完了した後、末尾の [`redirect`][redirect] に注目してください。

```tsx filename=app/routes/contacts.$contactId_.edit.tsx lines=[9]
export const action = async ({
  params,
  request,
}: ActionFunctionArgs) => {
  invariant(params.contactId, "Missing contactId param");
  const formData = await request.formData();
  const updates = Object.fromEntries(formData);
  await updateContact(params.contactId, updates);
  return redirect(`/contacts/${params.contactId}`);
};
```

`action` 関数と `loader` 関数はどちらも [`Response` を返す][returning-response-instances]ことができます（[`Request`][request] を受け取ったので、これは理にかなっています！）。[`redirect`][redirect] ヘルパーは、アプリに場所を変更するように指示する [`Response`][response] を返すのを容易にするだけです。

クライアントサイドルーティングがない場合、サーバーが `POST` リクエストの後にリダイレクトすると、新しいページは最新のデータをフェッチしてレンダリングします。以前に学んだように、Remix はこのモデルをエミュレートし、`action` 呼び出しの後にページのデータを自動的に再検証します。そのため、フォームを保存するとサイドバーが自動的に更新されます。余分な再検証コードはクライアントサイドルーティングなしでは存在しないため、Remix のクライアントサイドルーティングでも存在する必要はありません！

最後に1つ。JavaScript がない場合、[`redirect`][redirect] は通常のリダイレクトになります。しかし、JavaScript がある場合、それはクライアントサイドのリダイレクトなので、ユーザーはスクロール位置やコンポーネントの状態のようなクライアントの状態を失いません。

## 新しいレコードを編集ページにリダイレクトする

リダイレクトの方法がわかったので、新しい連絡先を作成する `action` を更新して、編集ページにリダイレクトするようにしましょう。

👉 **新しいレコードの編集ページにリダイレクトする**

```tsx filename=app/root.tsx lines=[2,7]
// existing imports
import { redirect } from "@remix-run/node";
// existing imports

export const action = async () => {
  const contact = await createEmptyContact();
  return redirect(`/contacts/${contact.id}/edit`);
};

// existing code
```

これで「New」をクリックすると、編集ページに移動するはずです。

<img class="tutorial" loading="lazy" src="/docs-images/contacts/14.webp" />

## アクティブリンクのスタイリング

たくさんのレコードがあるため、サイドバーでどのレコードを見ているのかが明確ではありません。これを修正するために [`NavLink`][nav-link] を使用できます。

👉 **サイドバーの `<Link>` を `<NavLink>` に置き換える**

```tsx filename=app/root.tsx lines=[6,27-36,38]
// existing imports
import {
  Form,
  Links,
  Meta,
  NavLink,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
} from "@remix-run/react";

// existing imports and exports

export default function App() {
  const { contacts } = useLoaderData<typeof loader>();

  return (
    <html lang="en">
      {/* existing elements */}
      <body>
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
      </body>
    </html>
  );
}
```

`className` に関数を渡していることに注目してください。ユーザーが `<NavLink to>` に一致する URL にいる場合、`isActive` は `true` になります。アクティブになる直前（データがまだロード中）の場合、`isPending` は `true` になります。これにより、ユーザーがどこにいるかを簡単に示し、リンクがクリックされたときに即座にフィードバックを提供できますが、データはロードされる必要があります。

<img class="tutorial" loading="lazy" src="/docs-images/contacts/15.webp"/>

## グローバルな保留中 UI

ユーザーがアプリをナビゲートする際、Remix は次のページのデータがロードされている間、_古いページを表示したまま_にします。リスト間をクリックすると、アプリが少し反応しないように感じることに気づいたかもしれません。アプリが反応しないように感じさせないように、ユーザーにフィードバックを提供しましょう。

Remix はすべての状態を舞台裏で管理し、動的な Web アプリを構築するために必要な要素を公開します。この場合、[`useNavigation`][use-navigation] フックを使用します。

👉 **`useNavigation` を使用してグローバルな保留中 UI を追加する**

```tsx filename=app/root.tsx lines=[11,18,26-28]
// existing imports
import {
  Form,
  Links,
  Meta,
  NavLink,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
  useNavigation,
} from "@remix-run/react";

// existing imports and exports

export default function App() {
  const { contacts } = useLoaderData<typeof loader>();
  const navigation = useNavigation();

  return (
    <html lang="en">
      {/* existing elements */}
      <body>
        {/* existing elements */}
        <div
          className={
            navigation.state === "loading" ? "loading" : ""
          }
          id="detail"
        >
          <Outlet />
        </div>
        {/* existing elements */}
      </body>
    </html>
  );
}
```

[`useNavigation`][use-navigation] は現在のナビゲーション状態を返します。これは `"idle"`、`"loading"`、または `"submitting"` のいずれかになります。

この場合、アイドル状態でない場合は、アプリのメイン部分に `"loading"` クラスを追加します。CSS は短い遅延の後（高速ロードでの UI のちらつきを避けるため）に素敵なフェードを追加します。ただし、スピナーや上部にローディングバーを表示するなど、好きなようにできます。

<img class="tutorial" loading="lazy" src="/docs-images/contacts/16.webp" />

## レコードの削除

連絡先ルートのコードを確認すると、削除ボタンは次のようになっています。

```tsx filename=app/routes/contact.$contactId.tsx lines=[2]
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

`action` が `"destroy"` を指していることに注目してください。`<Link to>` と同様に、`<Form action>` は_相対的な_値を取ることができます。フォームが `contacts.$contactId.tsx` でレンダリングされているため、`destroy` を持つ相対的な `action` は、クリックされたときにフォームを `contacts.$contactId.destroy` に送信します。

この時点で、削除ボタンを機能させるために必要なことはすべて知っているはずです。先に進む前に試してみませんか？必要なものは次のとおりです。

1.  新しいルート
2.  そのルートでの `action`
3.  `app/data.ts` からの `deleteContact`
4.  どこかへの `redirect`

👉 **「destroy」ルートモジュールを作成する**

```shellscript nonumber
touch app/routes/contacts.\$contactId_.destroy.tsx
```

👉 **destroy `action` を追加する**

```tsx filename=app/routes/contacts.$contactId_.destroy.tsx
import type { ActionFunctionArgs } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import invariant from "tiny-invariant";

import { deleteContact } from "../data";

export const action = async ({
  params,
}: ActionFunctionArgs) => {
  invariant(params.contactId, "Missing contactId param");
  await deleteContact(params.contactId);
  return redirect("/");
};
```

よし、レコードに移動して「Delete」ボタンをクリックしてください。動作します！

> 😅 なぜこれがすべて機能するのか、まだ混乱しています

ユーザーが送信ボタンをクリックすると：

1.  `<Form>` は、新しいドキュメント `POST` リクエストをサーバーに送信するというブラウザのデフォルトの動作を防ぎますが、代わりにクライアントサイドルーティングと [`fetch`][fetch] を使用して `POST` リクエストを作成することでブラウザをエミュレートします。
2.  `<Form action="destroy">` は `contacts.$contactId_.destroy.tsx` の新しいルートに一致し、リクエストを送信します。
3.  `action` がリダイレクトした後、Remix はページのデータに対してすべての `loader` を呼び出して最新の値を取得します（これが「再検証」です）。`useLoaderData` は新しい値を返し、コンポーネントを更新させます！

`Form` を追加し、`action` を追加すれば、残りは Remix が行います。

## インデックスルート

アプリをロードすると、リストの右側に大きな空白ページが表示されることに気づくでしょう。

<img class="tutorial" loading="lazy" src="/docs-images/contacts/17.webp" />

ルートに子があり、親ルートのパスにいる場合、`<Outlet>` は一致する子がいないため何もレンダリングしません。インデックスルートは、そのスペースを埋めるデフォルトの子ルートと考えることができます。

👉 **ルートルートのインデックスルートを作成する**

```shellscript nonumber
touch app/routes/_index.tsx
```

👉 **インデックスコンポーネントの要素を埋める**

コピー＆ペーストしてください。特別なことは何もありません。

```tsx filename=app/routes/_index.tsx
export default function Index() {
  return (
    <p id="index-page">
      This is a demo for Remix.
      <br />
      Check out{" "}
      <a href="https://remix.run">the docs at remix.run</a>.
    </p>
  );
}
```

ルート名 `_index` は特別です。これは、ユーザーが親ルートの正確なパスにいるときに、Remix にこのルートを一致させてレンダリングするように指示します。そのため、`<Outlet />` にレンダリングする他の子ルートはありません。

<img class="tutorial" loading="lazy" src="/docs-images/contacts/18.webp" />

ほら！もう空白スペースはありません。ダッシュボード、統計、フィードなどをインデックスルートに配置するのは一般的です。これらはデータロードにも参加できます。

## キャンセルボタン

編集ページには、まだ何も機能しないキャンセルボタンがあります。ブラウザの戻るボタンと同じ機能をさせたいと思います。

ボタンにクリックハンドラーと [`useNavigate`][use-navigate] が必要です。

👉 **`useNavigate` を使ってキャンセルボタンのクリックハンドラーを追加する**

```tsx filename=app/routes/contacts.$contactId_.edit.tsx lines=[5,11,18]
// existing imports
import {
  Form,
  useLoaderData,
  useNavigate,
} from "@remix-run/react";
// existing imports and exports

export default function EditContact() {
  const { contact } = useLoaderData<typeof loader>();
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

これで、ユーザーが「Cancel」をクリックすると、ブラウザの履歴で1つ前のエントリに戻されます。

> 🧐 なぜボタンに `event.preventDefault()` がないの？

`<button type="button">` は、一見冗長に見えますが、ボタンがフォームを送信するのを防ぐ HTML の方法です。

あと2つの機能が残っています。もうすぐ終わりです！

## `URLSearchParams` と `GET` 送信

これまでのすべてのインタラクティブな UI は、URL を変更するリンクか、`action` 関数にデータを `POST` する `form` のいずれかでした。検索フィールドは、その両方が混ざっているため興味深いものです。`form` ですが、URL を変更するだけで、データを変更しません。

検索フォームを送信するとどうなるか見てみましょう。

👉 **検索フィールドに名前を入力して Enter キーを押す**

ブラウザの URL に、[`URLSearchParams`][url-search-params] としてクエリが含まれていることに注目してください。

```
http://localhost:5173/?q=ryan
```

`<Form method="post">` ではないため、Remix はブラウザをエミュレートし、[`FormData`][form-data] をリクエストボディではなく [`URLSearchParams`][url-search-params] にシリアライズします。

`loader` 関数は `request` から検索パラメータにアクセスできます。これを使用してリストをフィルタリングしましょう。

👉 **`URLSearchParams` がある場合はリストをフィルタリングする**

```tsx filename=app/root.tsx lines=[3,8-13]
import type {
  LinksFunction,
  LoaderFunctionArgs,
} from "@remix-run/node";

// existing imports and exports

export const loader = async ({
  request,
}: LoaderFunctionArgs) => {
  const url = new URL(request.url);
  const q = url.searchParams.get("q");
  const contacts = await getContacts(q);
  return { contacts };
};

// existing code
```

<img class="tutorial" loading="lazy" src="/docs-images/contacts/19.webp" />

これは `GET` であり `POST` ではないため、Remix は `action` 関数を呼び出しません。`GET` `form` を送信することは、リンクをクリックするのと同じです。URL のみが変更されます。

これはまた、通常のページナビゲーションを意味します。戻るボタンをクリックして元の場所に戻ることができます。

## URL とフォームの状態の同期

ここでは、すぐに解決できるいくつかの UX の問題があります。

1.  検索後に「戻る」をクリックすると、リストがフィルタリングされなくなっても、フォームフィールドには入力した値が残っています。
2.  検索後にページを更新すると、リストがフィルタリングされていても、フォームフィールドに値が残っていません。

言い換えれば、URL と入力の状態が同期していません。

まず (2) を解決し、URL の値で入力を開始しましょう。

👉 **`loader` から `q` を返し、それを入力のデフォルト値として設定する**

```tsx filename=app/root.tsx lines=[9,13,26]
// existing imports and exports

export const loader = async ({
  request,
}: LoaderFunctionArgs) => {
  const url = new URL(request.url);
  const q = url.searchParams.get("q");
  const contacts = await getContacts(q);
  return { contacts, q };
};

export default function App() {
  const { contacts, q } = useLoaderData<typeof loader>();
  const navigation = useNavigation();

  return (
    <html lang="en">
      {/* existing elements */}
      <body>
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
      </body>
    </html>
  );
}
```

これで、検索後にページを更新すると、入力フィールドにクエリが表示されるようになります。

次に問題 (1) です。戻るボタンをクリックして入力を更新します。React の `useEffect` を使用して、DOM 内の入力の値を直接操作できます。

👉 **入力値を `URLSearchParams` と同期させる**

```tsx filename=app/root.tsx lines=[2,10-15]
// existing imports
import { useEffect } from "react";

// existing imports and exports

export default function App() {
  const { contacts, q } = useLoaderData<typeof loader>();
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

> 🤔 これには制御されたコンポーネントと React State を使うべきではないの？

確かに、これを制御されたコンポーネントとして行うこともできます。同期ポイントは増えますが、それはあなた次第です。

<details>

<summary>展開してその様子を見る</summary>

```tsx filename=app/root.tsx lines=[2,9-10,12-16,30-33,36-37]
// We no longer need useEffect
import { useState } from "react";

// existing imports and exports

export default function App() {
  const { contacts, q } = useLoaderData<typeof loader>();
  const navigation = useNavigation();
  // the query now needs to be kept in state
  const [prevQ, setPrevQ] = useState(q);
  const [query, setQuery] = useState(q || "");

  // We can avoid using `useEffect` to synchronize the query
  // by using a separate piece of state to store the previous
  // value
  if (q !== prevQ) {
    setPrevQ(q);
    setQuery(q || "");
  }

  return (
    <html lang="en">
      {/* existing elements */}
      <body>
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
      </body>
    </html>
  );
}
```

</details>

これで、戻る/進む/更新ボタンをクリックしても、入力値が URL と結果と同期するはずです。

## `Form` の `onChange` での送信

ここで製品に関する決定を下す必要があります。ユーザーに `form` を送信させて結果をフィルタリングしたい場合もあれば、ユーザーが入力するたびにフィルタリングしたい場合もあります。前者はすでに実装したので、後者がどのようなものか見てみましょう。

`useNavigate` はすでに見てきましたが、ここではその仲間である [`useSubmit`][use-submit] を使用します。

```tsx filename=app/root.tsx lines=[12,19,32-34]
// existing imports
import {
  Form,
  Links,
  Meta,
  NavLink,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
  useNavigation,
  useSubmit,
} from "@remix-run/react";
// existing imports and exports

export default function App() {
  const { contacts, q } = useLoaderData<typeof loader>();
  const navigation = useNavigation();
  const submit = useSubmit();

  // existing code

  return (
    <html lang="en">
      {/* existing elements */}
      <body>
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
      </body>
    </html>
  );
}
```

入力すると、`form` が自動的に送信されるようになりました！

[`submit`][use-submit] の引数に注目してください。`submit` 関数は、渡された任意のフォームをシリアライズして送信します。ここでは `event.currentTarget` を渡しています。`currentTarget` は、イベントがアタッチされている DOM ノード（`form`）です。

## 検索スピナーの追加

本番環境のアプリでは、この検索は、一度にすべてを送信してクライアントサイドでフィルタリングするには大きすぎるデータベース内のレコードを探している可能性が高いです。そのため、このデモでは偽のネットワーク遅延が設定されています。

ローディングインジケーターがないと、検索が少しもっさり感じられます。データベースを高速化できたとしても、常にユーザーのネットワーク遅延が邪魔になり、私たちの制御外です。

より良いユーザーエクスペリエンスのために、検索に即座の UI フィードバックを追加しましょう。ここでも [`useNavigation`][use-navigation] を使用します。

👉 **検索中かどうかを知るための変数を追加する**

```tsx filename=app/root.tsx lines=[7-11]
// existing imports and exports

export default function App() {
  const { contacts, q } = useLoaderData<typeof loader>();
  const navigation = useNavigation();
  const submit = useSubmit();
  const searching =
    navigation.location &&
    new URLSearchParams(navigation.location.search).has(
      "q"
    );

  // existing code
}
```

何も起こっていないときは `navigation.location` は `undefined` ですが、ユーザーがナビゲートすると、データがロードされている間、次の `location` で値が設定されます。次に、`location.search` を使用して検索中かどうかを確認します。

👉 **新しい `searching` 状態を使用して検索フォーム要素にクラスを追加する**

```tsx filename=app/root.tsx lines=[22,31]
// existing imports and exports

export default function App() {
  // existing code

  return (
    <html lang="en">
      {/* existing elements */}
      <body>
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
      </body>
    </html>
  );
}
```

おまけとして、検索中にメイン画面がフェードアウトするのを避けます。

```tsx filename=app/root.tsx lines=[13]
// existing imports and exports

export default function App() {
  // existing code

  return (
    <html lang="en">
      {/* existing elements */}
      <body>
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
      </body>
    </html>
  );
}
```

これで、検索入力の左側に素敵なスピナーが表示されるはずです。

<img class="tutorial" loading="lazy" src="/docs-images/contacts/20.webp" />

## 履歴スタックの管理

フォームはキーストロークごとに送信されるため、「alex」と入力してからバックスペースで削除すると、巨大な履歴スタックができてしまいます 😂。これは絶対に避けたいことです。

<img class="tutorial" loading="lazy" src="/docs-images/contacts/21.webp" />

これを避けるには、履歴スタックにプッシュする代わりに、現在のエントリを次のページで_置き換える_ことができます。

👉 **`submit` で `replace` を使用する**

```tsx filename=app/root.tsx lines=[16-19]
// existing imports and exports

export default function App() {
  // existing code

  return (
    <html lang="en">
      {/* existing elements */}
      <body>
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
      </body>
    </html>
  );
}
```

これが最初の検索かどうかを素早く確認した後、置き換えるかどうかを決定します。これで、最初の検索は新しいエントリを追加しますが、それ以降のすべてのキーストロークは現在のエントリを置き換えます。検索を削除するために7回戻るボタンをクリックする代わりに、ユーザーは1回だけ戻るボタンをクリックすればよくなります。

## ナビゲーションなしの `Form`

これまでのすべてのフォームは URL を変更してきました。これらのユーザーフローは一般的ですが、ナビゲーションを引き起こさずにフォームを送信したい場合も同様に一般的です。

このような場合、[`useFetcher`][use-fetcher] があります。これにより、ナビゲーションを引き起こすことなく `action` や `loader` と通信できます。

連絡先ページの ★ ボタンはこれに理にかなっています。新しいレコードを作成したり削除したりするわけではなく、ページを変更したいわけでもありません。単に表示しているページのデータを変更したいだけです。

👉 **`<Favorite>` フォームをフェッチャーフォームに変更する**

```tsx filename=app/routes/contacts.$contactId.tsx lines=[4,14,18,30]
// existing imports
import {
  Form,
  useFetcher,
  useLoaderData,
} from "@remix-run/react";
// existing imports and exports

// existing code

const Favorite: FunctionComponent<{
  contact: Pick<ContactRecord, "favorite">;
}> = ({ contact }) => {
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
};
```

このフォームはナビゲーションを引き起こさず、単に `action` にフェッチするだけになります。そういえば... `action` を作成するまでこれは機能しません。

👉 **`action` を作成する**

```tsx filename=app/routes/contacts.$contactId.tsx lines=[2,7,10-19]
import type {
  ActionFunctionArgs,
  LoaderFunctionArgs,
} from "@remix-run/node";
// existing imports

import { getContact, updateContact } from "../data";
// existing imports

export const action = async ({
  params,
  request,
}: ActionFunctionArgs) => {
  invariant(params.contactId, "Missing contactId param");
  const formData = await request.formData();
  return updateContact(params.contactId, {
    favorite: formData.get("favorite") === "true",
  });
};

// existing code
```

よし、ユーザー名の横にある星をクリックする準備ができました！

<img class="tutorial" loading="lazy" src="/docs-images/contacts/22.webp" />

見てください、両方の星が自動的に更新されます。新しい `<fetcher.Form method="post">` は、これまで使用してきた `<Form>` とほぼ同じように機能します。`action` を呼び出し、すべてのデータが自動的に再検証されます。エラーも同じように捕捉されます。

ただし、1つの重要な違いがあります。これはナビゲーションではないため、URL は変更されず、履歴スタックも影響を受けません。

## オプティミスティック UI

前回のセクションで、お気に入りボタンをクリックしたときにアプリが少し反応しないように感じたかもしれません。ここでも、実際の環境ではネットワーク遅延が発生するため、偽のネットワーク遅延を追加しました。

ユーザーにフィードバックを提供するために、[`fetcher.state`][fetcher-state]（以前の `navigation.state` と非常によく似ています）を使用して星をローディング状態にすることもできますが、今回はさらに良いことができます。「オプティミスティック UI」と呼ばれる戦略を使用できます。

フェッチャーは `action` に送信される [`FormData`][form-data] を知っているため、`fetcher.formData` で利用できます。これを使用して、ネットワークが完了していなくても、星の状態を即座に更新します。更新が最終的に失敗した場合、UI は実際のデータに戻ります。

👉 **`fetcher.formData` からオプティミスティックな値を読み取る**

```tsx filename=app/routes/contacts.$contactId.tsx lines=[7-9]
// existing code

const Favorite: FunctionComponent<{
  contact: Pick<ContactRecord, "favorite">;
}> = ({ contact }) => {
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
};
```

これで、星はクリックすると_即座に_新しい状態に変わります。

---

これで終わりです！Remix を試していただきありがとうございます。このチュートリアルが、素晴らしいユーザーエクスペリエンスを構築するための確かなスタートとなることを願っています。できることは他にもたくさんありますので、すべての API をぜひチェックしてください 😀

[jim]: https://blog.jim-nielsen.com
[outlet-component]: ../components/outlet
[link-component]: ../components/link
[loader]: ../route/loader
[use-loader-data]: ../hooks/use-loader-data
[action]: ../route/action
[params]: ../route/loader#params
[form-component]: ../components/form
[request]: https://developer.mozilla.org/en-US/docs/Web/API/Request
[form-data]: https://developer.mozilla.org/en-US/docs/Web/API/FormData
[object-from-entries]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/fromEntries
[request-form-data]: https://developer.mozilla.org/en-US/docs/Web/API/Request/formData
[response]: https://developer.mozilla.org/en-US/docs/Web/API/Response
[redirect]: ../utils/redirect
[returning-response-instances]: ../route/loader#returning-response-instances
[use-navigation]: ../hooks/use-navigation
[use-navigate]: ../hooks/use-navigate
[url-search-params]: https://developer.mozilla.org/en-US/docs/Web/API/URLSearchParams
[use-submit]: ../hooks/use-submit
[nav-link]: ../components/nav-link
[use-fetcher]: ../hooks/use-fetcher
[fetcher-state]: ../hooks/use-fetcher#fetcherstate
[assets-build-directory]: ../file-conventions/remix-config#assetsbuilddirectory
[links]: ../route/links
[routes-file-conventions]: ../file-conventions/routes
[quickstart]: ./quickstart
[http-localhost-5173]: http://localhost:5173
[fetch]: https://developer.mozilla.org/en-US/docs/Web/API/fetch
[remix-now-react-router]: https://remix.run/blog/incremental-path-to-react-19
[react-router-tutorial]: https://reactrouter.com/tutorials/address-book