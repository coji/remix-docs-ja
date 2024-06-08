---
title: チュートリアル (30分)
order: 2
---

# Remix チュートリアル

連絡先を管理する小さいけれど機能豊富なアプリを作ります。データベースや他の "プロダクションレディ" なものはないので、 Remix に集中できます。一緒に進めていけば約30分かかると思いますが、さらっと読むだけでも結構です。

<img class="tutorial" src="/docs-images/contacts/01.webp" />

👉 **これが出てくるたびに、アプリで何かをする必要があります！**

残りはあなたの情報と理解を深めるためだけのものです。始めましょう。

## セットアップ

👉 **基本的なテンプレートを生成する**

```shellscript nonumber
npx create-remix@latest --template remix-run/remix/templates/remix-tutorial
```

これはかなり基本的なテンプレートを使用しますが、 CSS とデータモデルが含まれているので、 Remix に集中できます。 Remix プロジェクトの基本的なセットアップについて詳しく知りたい場合は、[クイックスタート][quickstart] をご覧ください。

👉 **アプリを起動する**

```shellscript nonumber
# アプリのディレクトリに移動
cd {アプリを置いた場所}

# まだ依存関係をインストールしていない場合
npm install

# サーバーを起動
npm run dev 
```

[http://localhost:5173][http-localhost-5173] を開くと、次のようなスタイルのない画面が表示されるはずです。

<img class="tutorial" src="/docs-images/contacts/03.webp" />

## ルートルート

`app/root.tsx` のファイルに注目してください。これは "ルートルート" と呼ばれるものです。 UI でレンダリングする最初のコンポーネントなので、通常はページのグローバルレイアウトが含まれています。

<details>

<summary>ここを展開してルートコンポーネントのコードを表示</summary>

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

## `links` を使ったスタイルシートの追加

Remix アプリのスタイリングには複数の方法がありますが、ここでは Remix に集中できるよう、すでに書かれているプレーンなスタイルシートを使用します。

CSS ファイルは JavaScript モジュールに直接インポートできます。 Vite はアセットにフィンガープリントを付け、ビルドのクライアントディレクトリに保存し、公開アクセス可能な href をモジュールに提供します。

👉 **アプリのスタイルをインポートする**

```tsx filename=app/root.tsx lines=[1,4,6-8]
import type { LinksFunction } from "@remix-run/node";
// 既存のインポート

import appStylesHref from "./app.css?url";

export const links: LinksFunction = () => [
  { rel: "stylesheet", href: appStylesHref },
];
```

すべてのルートは [`links`][links] 関数をエクスポートできます。それらは収集され、 `app/root.tsx` でレンダリングした `<Links />` コンポーネントにレンダリングされます。

アプリは次のようになっているはずです。 CSS も書ける デザイナーがいるのは素晴らしいですね。 ( [Jim][jim] ありがとう 🙏)

<img class="tutorial" loading="lazy" src="/docs-images/contacts/04.webp" />

## 連絡先ルートの UI

サイドバーのアイテムをクリックすると、デフォルトの404ページが表示されます。 URL `/contacts/1` に一致するルートを作成しましょう。

👉 **`app/routes` ディレクトリと連絡先ルートモジュールを作成する**

```shellscript nonumber
mkdir app/routes
touch app/routes/contacts.\$contactId.tsx
```

Remix の [ルートファイルの規約][routes-file-conventions] では、 `.` が URL に `/` を作成し、 `$` がセグメントを動的にします。 URL が次のようになるルートを作成しました。

- `/contacts/123`
- `/contacts/abc`

👉 **連絡先コンポーネントの UI を追加する**

要素がたくさんありますが、コピー/ペーストしてください。

```tsx filename=app/routes/contacts.$contactId.tsx
import { Form } from "@remix-run/react";
import type { FunctionComponent } from "react";

import type { ContactRecord } from "../data";

export default function Contact() {
  const contact = {
    first: "Your",
    last: "Name",
    avatar: "https://placekitten.com/200/200",
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

リンクをクリックするか、 `/contacts/1` にアクセスしても、新しいものは何も表示されません。

<img class="tutorial" loading="lazy" alt="メインコンテンツが空白の連絡先ルート" src="/docs-images/contacts/05.webp" />

## ネストされたルートとアウトレット

Remix は React Router の上に構築されているので、ネストされたルーティングをサポートしています。子ルートを親レイアウト内にレンダリングするには、親に [`Outlet`][outlet-component] をレンダリングする必要があります。修正しましょう。 `app/root.tsx` を開いて、その中にアウトレットをレンダリングします。

👉 **[`<Outlet />`][outlet-component] をレンダリングする**

```tsx filename=app/root.tsx lines=[6,19-21]
// 既存のインポート
import {
  Form,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "@remix-run/react";

// 既存のインポートとコード

export default function App() {
  return (
    <html lang="en">
      {/* 他の要素 */}
      <body>
        <div id="sidebar">{/* 他の要素 */}</div>
        <div id="detail">
          <Outlet />
        </div>
        {/* 他の要素 */}
      </body>
    </html>
  );
}
```

これで、子ルートがアウトレットを通してレンダリングされるはずです。

<img class="tutorial" loading="lazy" alt="メインコンテンツのある連絡先ルート" src="/docs-images/contacts/06.webp" />

## クライアントサイドルーティング

気づいたかもしれませんが、サイドバーのリンクをクリックすると、ブラウザはクライアントサイドルーティングの代わりに、次の URL の完全なドキュメントリクエストを行います。

クライアントサイドルーティングを使用すると、サーバーから別のドキュメントを要求せずに、アプリで URL を更新できます。代わりに、アプリはすぐに新しい UI をレンダリングできます。 [`<Link>`][link-component] を使って実現しましょう。

👉 **サイドバーの `<a href>` を `<Link to>` に変更する**

```tsx filename=app/root.tsx lines=[4,24,27]
// 既存のインポート 
import {
  Form,
  Link,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "@remix-run/react";

// 既存のインポートとエクスポート

export default function App() {
  return (
    <html lang="en">
      {/* 他の要素 */}
      <body>
        <div id="sidebar">
          {/* 他の要素 */}
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
        {/* 他の要素 */}
      </body>
    </html>
  );
}
```

ブラウザの開発者ツールのネットワークタブを開くと、ドキュメントを要求しなくなったことがわかります。

## データの読み込み

URL セグメント、レイアウト、データは、多くの場合、一緒に (3倍に？) カップリングされています。このアプリですでにそれを見ることができます。

| URL セグメント         | コンポーネント   | データ               |
| ------------------- | ----------- | ------------------ |
| /                   | `<Root>`    | 連絡先のリスト           |
| contacts/:contactId | `<Contact>` | 個々の連絡先            |

この自然なカップリングにより、 Remix にはデータをルートコンポーネントに簡単に取り込むためのデータ規約があります。

データを読み込むために使用する API は2つあります。 [`loader`][loader] と [`useLoaderData`][use-loader-data] です。最初にルートルートで `loader` 関数を作成してエクスポートし、それからデータをレンダリングします。

👉 **`app/root.tsx` から `loader` 関数をエクスポートし、データをレンダリングする**

<docs-info>次のコードには型エラーがあります。次のセクションで修正します</docs-info>

```tsx filename=app/root.tsx lines=[2,11,15,19-22,25,34-57]
// 既存のインポート
import { json } from "@remix-run/node";
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

// 既存のインポート
import { getContacts } from "./data";

// 既存のエクスポート

export const loader = async () => {
  const contacts = await getContacts();
  return json({ contacts });
};

export default function App() {
  const { contacts } = useLoaderData();

  return (
    <html lang="en">
      {/* 他の要素 */}
      <body>
        <div id="sidebar">
          {/* 他の要素 */}
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
        {/* 他の要素 */}
      </body>
    </html>
  );
}
```

以上です！ Remix は自動的にそのデータと UI の同期を維持します。サイドバーは次のようになっているはずです。

<img class="tutorial" loading="lazy" src="/docs-images/contacts/07.webp" />

## 型推論

マップ内の `contact` 型について TypeScript が警告しているのに気づいたかもしれません。 `typeof loader` で注釈を追加すると、データについての型推論を取得できます。

```tsx filename=app/root.tsx lines=[4]
// 既存のインポートとエクスポート

export default function App() {
  const { contacts } = useLoaderData<typeof loader>();

  // 既存のコード
}
```

## ローダーの URL パラメータ

👉 **サイドバーのリンクの1つをクリックする**

以前の静的な連絡先ページが再び表示されるはずですが、1つ違いがあります。 URL にはレコードの実際の ID が含まれています。

<img class="tutorial" loading="lazy" src="/docs-images/contacts/08.webp" />

`app/routes/contacts.$contactId.tsx` のファイル名の `$contactId` 部分を覚えていますか？これらの動的セグメントは、 URL のその位置にある動的な (変化する) 値に一致します。これらの URL の値を "URL パラメータ"、または単に "パラメータ" と呼びます。

これらの [`params`][params] は、動的セグメントと一致するキーを持つローダーに渡されます。たとえば、セグメントの名前が `$contactId` なので、値は `params.contactId` として渡されます。

これらのパラメータは、多くの場合、 ID でレコードを見つけるために使用されます。試してみましょう。

👉 **連絡先ページに `loader` 関数を追加し、 `useLoaderData` でデータにアクセスする**

<docs-info>次のコードには型エラーがあります。次のセクションで修正します</docs-info>

```tsx filename=app/routes/contacts.$contactId.tsx lines=[1-2,5,7-10,13]
import { json } from "@remix-run/node";
import { Form, useLoaderData } from "@remix-run/react";
// 既存のインポート

import { getContact } from "../data";

export const loader = async ({ params }) => {
  const contact = await getContact(params.contactId);
  return json({ contact });
};

export default function Contact() {
  const { contact } = useLoaderData<typeof loader>();

  // 既存のコード
}

// 既存のコード
```

<img class="tutorial" loading="lazy" src="/docs-images/contacts/10.webp" />

## パラメータの検証とレスポンスのスロー

TypeScript は私たちに非常に怒っています。それを幸せにして、何を考慮する必要があるかを見てみましょう。

```tsx filename=app/routes/contacts.$contactId.tsx lines=[1,3,7-10]
import type { LoaderFunctionArgs } from "@remix-run/node";
// 既存のインポート
import invariant from "tiny-invariant";

// 既存のインポート

export const loader = async ({
  params,
}: LoaderFunctionArgs) => {
  invariant(params.contactId, "Missing contactId param");
  const contact = await getContact(params.contactId);
  return json({ contact });
};

// 既存のコード
```

最初の問題は、ファイル名とコードの間でパラメータの名前を間違えた可能性があることを示しています (ファイルの名前を変更したかもしれません！)。 Invariant は、コードに潜在的な問題があると予想される場合に、カスタムメッセージでエラーをスローするのに便利な関数です。

次に、 `useLoaderData<typeof loader>()` は連絡先を取得したか `null` であることを知っています (その ID の連絡先がない可能性があります)。この潜在的な `null` はコンポーネントコードにとって扱いにくく、 TS エラーがまだ発生しています。

コンポーネントコードで連絡先が見つからない可能性を考慮することもできますが、ウェブっぽいことは適切な404を送信することです。ローダーでそれを行い、一度にすべての問題を解決できます。

```tsx filename=app/routes/contacts.$contactId.tsx lines=[8-10]
// 既存のインポート

export const loader = async ({
  params,
}: LoaderFunctionArgs) => {
  invariant(params.contactId, "Missing contactId param");
  const contact = await getContact(params.contactId);
  if (!contact) {
    throw new Response("Not Found", { status: 404 });
  }
  return json({ contact });
};

// 既存のコード
```

これで、ユーザーが見つからない場合、このパスに沿ったコード実行が停止し、 Remix はエラーパスをレンダリングします。 Remix のコンポーネントは、ハッピーパスにのみ集中できます 😁

## データの変更

すぐに最初の連絡先を作成しますが、その前に HTML について話しましょう。

Remix は、 JavaScript カンブリア紀の大爆発以前は唯一の方法だった HTML フォームのナビゲーションをデータ変更のプリミティブとしてエミュレートします。単純さにだまされないでください！ Remix のフォームでは、クライアントレンダリングされたアプリの UX 機能と、"古い学校" の Web モデルのシンプルさを組み合わせています。

一部の Web 開発者には馴染みがないかもしれませんが、 HTML `form` は実際にブラウザでナビゲーションを引き起こします。リンクをクリックする場合と同様です。違いはリクエストだけです。リンクは URL しか変更できませんが、 `form` はリクエストメソッド (`GET` と `POST`) とリクエストボディ (`POST`フォームデータ) も変更できます。

クライアントサイドルーティングがない場合、ブラウザは `form` のデータを自動的にシリアライズし、 `POST` のリクエストボディとして、 `GET` の [`URLSearchParams`][url-search-params] としてサーバーに送信します。 Remix も同じことを行いますが、リクエストをサーバーに送信するのではなく、クライアントサイドルーティングを使用して、ルートの [`action`][action] 関数にリクエストを送信します。

アプリの "New" ボタンをクリックすることでこれをテストできます。

<img class="tutorial" loading="lazy" src="/docs-images/contacts/09.webp" />

このフォームナビゲーションを処理するサーバー上のコードがないため、 Remix は405を送信します。

## 連絡先の作成

ルートルートで `action` 関数をエクスポートすることで、新しい連絡先を作成します。ユーザーが "new" ボタンをクリックすると、フォームはルートルートアクションに `POST` されます。

👉 **`app/root.tsx` から `action` 関数をエクスポートする**

```tsx filename=app/root.tsx lines=[3,5-8]
// 既存のインポート

import { createEmptyContact, getContacts } from "./data";

export const action = async () => {
  const contact = await createEmptyContact();
  return json({ contact });
};

// 既存のコード
```

以上です！ "New" ボタンをクリックすると、新しいレコードがリストに表示されるはずです 🥳

<img class="tutorial" loading="lazy" src="/docs-images/contacts/11.webp" />

`createEmptyContact` メソッドは、名前もデータも何もない空の連絡先を作成するだけです。しかし、それでもレコードを作成します。約束します！

> 🧐 ちょっと待って ... サイドバーはどのように更新されたのですか？ `action` 関数はどこで呼び出されましたか？データを再取得するコードはどこにありますか？ `useState`、`onSubmit`、`useEffect` はどこにありますか？！

ここで "古い学校の Web" プログラミングモデルが登場します。 [`<Form>`][form-component] は、ブラウザがリクエストをサーバーに送信するのを防ぎ、代わりに [`fetch`][fetch] でルートの `action` 関数にリクエストを送信します。

Web のセマンティクスでは、 `POST` は通常、一部のデータが変更されることを意味します。慣例により、 Remix はこれをヒントとして使用して、 `action` が終了した後、ページ上のデータを自動的に再検証します。

実際、すべて HTML と HTTP なので、 JavaScript を無効にしても、すべてが引き続き機能します。 Remix がフォームをシリアル化して [`fetch`][fetch] リクエストをサーバーに送信する代わりに、ブラウザがフォームをシリアル化してドキュメントリクエストを行います。そこから、 Remix はページをサーバーサイドでレンダリングして送信します。どちらの方法でも、最終的には同じ UI になります。

ただし、スピニングファビコンや静的ドキュメントよりも優れたユーザーエクスペリエンスを提供するので、 JavaScript は残しておきます。

## データの更新

新しいレコードの情報を入力する方法を追加しましょう。

データの作成と同様に、 [`<Form>`][form-component] を使用してデータを更新します。 `app/routes/contacts.$contactId_.edit.tsx` に新しいルートを作成しましょう。

👉 **編集コンポーネントを作成する**

```shellscript nonumber
touch app/routes/contacts.\$contactId_.edit.tsx
```

`$contactId_` の `_` に注目してください。デフォルトでは、ルートは同じプレフィックス名のルート内に自動的にネストされます。末尾に `_` を追加すると、ルートが `app/routes/contacts.$contactId.tsx` 内にネストされ**ない**ことを示します。詳しくは、[ルートファイルの命名][routes-file-conventions]ガイドをお読みください。

👉 **編集ページの UI を追加する**

これまでに見たことのないものはありません。コピー/ペーストしてください。

```tsx filename=app/routes/contacts.$contactId_.edit.tsx
import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
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
  return json({ contact });
};

export default function EditContact() {
  const { contact } = useLoaderData<typeof loader>();

  return (
    <Form key={contact.id} id="contact-form" method="post">
      <p>
        <span>Name</span>
        <input
          defaultValue={contact.first}
          aria-label="First name"
          name="first"
          type="text"
          placeholder="First"
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

新しいレコードをクリックし、 "Edit" ボタンをクリックします。新しいルートが表示されるはずです。

<img class="tutorial" loading="lazy" src="/docs-images/contacts/12.webp" />

## `FormData` で連絡先を更新する

先ほど作成した編集ルートには、すでに `form` がレンダリングされています。必要なのは `action` 関数を追加することだけです。 Remix は `form` をシリアル化し、 [`fetch`][fetch] で `POST` し、すべてのデータを自動的に再検証します。

👉 **編集ルートに `action` 関数を追加する**

```tsx filename=app/routes/contacts.$contactId_.edit.tsx lines=[2,5,8,10-19]
import type {
  ActionFunctionArgs,
  LoaderFunctionArgs,
} from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
// 既存のインポート

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

// 既存のコード
```

フォームに入力し、保存すると、次のようなものが表示されるはずです！ <small>(目に優しく、毛深くないかもしれませんが。)</small>

<img class="tutorial" loading="lazy"src="/docs-images/contacts/13.webp" />

## 変更の議論

> 😑 うまくいきましたが、ここで何が起こっているのかわかりません...

少し掘り下げてみましょう...

`contacts.$contactId_.edit.tsx` を開いて、 `form` 要素を見てください。それぞれに名前があることに注目してください。

```tsx filename=app/routes/contacts.$contactId_.edit.tsx lines=[4]
<input
  defaultValue={contact.first}
  aria-label="First name"
  name="first"
  type="text"
  placeholder="First"
/>
```

JavaScript なしでは、フォームが送信されると、ブラウザは [`FormData`][form-data] を作成し、それをサーバーに送信するリクエストのボディとして設定します。前述のように、 Remix はこれを防止し、 [`fetch`][fetch] を使用してリクエストを `action` 関数に送信することでブラウザをエミュレートし、 [`FormData`][form-data] を含めます。

`form` の各フィールドは、 `formData.get(name)` でアクセスできます。たとえば、上記の入力フィールドを指定すると、次のように名と姓にアクセスできます。

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

いくつかのフォームフィールドがあるので、 [`Object.fromEntries`][object-from-entries] を使用してそれらをすべてオブジェクトに収集しました。これは `updateContact` 関数が求めているものとまったく同じです。

```tsx filename=app/routes/contacts.$contactId_.edit.tsx nocopy
const updates = Object.fromEntries(formData);
updates.first; // "Some"
updates.last; // "Name"
```

`action` 関数は別として、ここで説明している API は Remix によって提供されているわけではありません。 [`request`][request]、 [`request.formData`][request-form-data]、 [`Object.fromEntries`][object-from-entries] はすべて Web プラットフォームによって提供されています。

`action` を終了した後、最後の [`redirect`][redirect] に注目してください。

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

`action` と `loader` 関数はどちらも [(`Response` を返す)][returning-response-instances] ことができます (リクエストを受け取ったので、理にかなっています！)。 [`redirect`][redirect] ヘルパーは、アプリに場所を変更するように指示する [`Response`][response] を返すだけで簡単です。

クライアントサイドルーティングがない場合、サーバーが `POST` リクエストの後にリダイレクトすると、新しいページが最新のデータをフェッチしてレンダリングします。以前学んだように、 Remix はこのモデルをエミュレートし、 `action` の呼び出しの後、ページ上のデータを自動的に再検証します。そのため、フォームを保存するとサイドバーが自動的に更新されるのです。クライアントサイドルーティングがない場合、追加の再検証コードは存在しないため、 Remix のクライアントサイドルーティングでも存在する必要はありません！

最後にもう1つ。 JavaScript なしでは、 [`redirect`][redirect] は通常のリダイレクトになります。ただし、 JavaScript を使用すると、クライアントサイドのリダイレクトになるため、ユーザーはスクロール位置やコンポーネントの状態などのクライアントの状態を失うことはありません。

## 新しいレコードを編集ページにリダイレクトする

リダイレクトする方法がわかったので、新しい連絡先を作成するアクションを更新して、編集ページにリダイレクトしましょう。

👉 **新しいレコードの編集ページにリダイレクトする**

```tsx filename=app/root.tsx lines=[2,7]
// 既存のインポート
import { json, redirect } from "@remix-run/node";
// 既存のインポート

export const action = async () => {
  const contact = await createEmptyContact();
  return redirect(`/contacts/${contact.id}/edit`);
};

// 既存のコード
```

これで、 "New" をクリックすると、編集ページに移動するはずです。

<img class="tutorial" loading="lazy" src="/docs-images/contacts/14.webp" />

## アクティブリンクのスタイリング

レコードがたくさんあるので、サイドバーのどれを見ているのかわかりません。 [`NavLink`][nav-link] を使ってこれを修正できます。

👉 **サイドバーの `<Link>` を `<NavLink>` に置き換える**

```tsx filename=app/root.tsx lines=[6,27-36,38]
// 既存のインポート
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

// 既存のインポートとエクスポート

export default function App() {
  const { contacts } = useLoaderData<typeof loader>();

  return (
    <html lang="en">
      {/* 既存の要素 */}
      <body>
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
      </body>
    </html>
  );
}
```

`className` に関数を渡していることに注意してください。ユーザーが `<NavLink to>` に一致する URL にいる場合、 `isActive` は true になります。アクティブになろうとしている (データがまだ読み込み中) 場合、 `isPending` は true になります。これにより、ユーザーがどこにいるかを簡単に示し、リンクがクリックされてもデータを読み込む必要がある場合にすぐにフィードバックを提供できます。

<img class="tutorial" loading="lazy" src="/docs-images/contacts/15.webp"/>

## グローバルな保留中の UI

ユーザーがアプリを移動すると、 Remix は次のページのデータが読み込まれている間、 _古いページをそのまま残します_。リストの間をクリックすると、アプリの反応が少し鈍くなることに気づいたかもしれません。アプリが反応しないように見えないように、ユーザーにフィードバックを提供しましょう。

Remix はバックグラウンドですべての状態を管理し、動的な Web アプリを構築するために必要な部分を明らかにします。この場合、 [`useNavigation`][use-navigation] フックを使用します。

👉 **`useNavigation` を使用してグローバルな保留中の UI を追加する**

```tsx filename=app/root.tsx lines=[11,18,26-28]
// 既存のインポート
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
// 既存のインポートとエクスポート

export default function App() {
  const { contacts } = useLoaderData<typeof loader>();
  const navigation = useNavigation();

  return (
    <html lang="en">
      {/* 既存の要素 */}
      <body>
        {/* 既存の要素 */}
        <div
          className={
            navigation.state === "loading" ? "loading" : ""
          }
          id="detail"
        >
          <Outlet />
        </div>
        {/* 既存の要素 */}
      </body>
    </html>
  );
}
```

[`useNavigation`][use-navigation] は現在のナビゲーション状態を返します。これは `"idle"`、 `"loading"`、 `"submitting"` のいずれかになります。

この場合、アイドル状態でない場合は、アプリのメイン部分に `"loading"` クラスを追加します。 CSS は、短い遅延の後に素晴らしいフェードを追加します (高速読み込みの UI のちらつきを避けるため)。ただし、スピナーやローディングバーをトップに表示するなど、好きなことができます。

<img class="tutorial" loading="lazy" src="/docs-images/contacts/16.webp" />

## レコードの削除

連絡先ルートのコードを確認すると、削除ボタンが次のようになっていることがわかります。

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

`action` が `"destroy"` を指していることに注目してください。 `<Link to>` と同様に、 `<Form action>` は _相対的な_ 値を取ることができます。フォームは `contacts.$contactId.tsx` でレンダリングされるので、 `destroy` の相対的なアクションは、クリックされたときにフォームを `contacts.$contactId.destroy` に送信します。

この時点で、削除ボタンを機能させるために必要なことはすべてわかっているはずです。先に進む前に、試してみるのもいいかもしれません。必要なのは次のとおりです。

1. 新しいルート
2. そのルートの `action`
3. `app/data.ts` からの `deleteContact`
4. その後のどこかへの `redirect`

👉 **"destroy" ルートモジュールを作成する**

```shellscript nonumber
touch app/routes/contacts.\$contactId.destroy.tsx
```

👉 **destroy アクションを追加する**

```tsx filename=app/routes/contacts.$contactId.destroy.tsx
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

さて、レコードに移動して "Delete" ボタンをクリックします。できました！

> 😅 なぜこれがすべて機能するのかまだ混乱しています

ユーザーが送信ボタンをクリックすると、次のようになります。

1. `<Form>` は、新しいドキュメント `POST` リクエストをサーバーに送信するブラウザのデフォルトの動作を防止しますが、代わりにクライアントサイドルーティングと [`fetch`][fetch] で `POST` リクエストを作成することでブラウザをエミュレートします
2. `<Form action="destroy">` は `"contacts.$contactId.destroy"` の新しいルートと一致し、リクエストを送信します
3. `action` がリダイレクトした後、 Remix はページ上のデータの `loader` をすべて呼び出して最新の値を取得します (これは "再検証" です)。 `useLoaderData` は新しい値を返し、コンポーネントを更新させます！

`Form` を追加し、 `action` を追加すると、 Remix が残りを処理します。

## インデックスルート

アプリを読み込むと、リストの右側に大きな空白ページがあることに気づくでしょう。

<img class="tutorial" loading="lazy" src="/docs-images/contacts/17.webp" />

ルートに子がある場合、親ルートのパスにいると、一致する子がないため `<Outlet>` にレンダリングするものがありません。インデックスルートは、そのスペースを埋めるためのデフォルトの子ルートと考えることができます。

👉 **ルートルートのインデックスルートを作成する**

```shellscript nonumber
touch app/routes/_index.tsx
```

👉 **インデックスコンポーネントの要素を入力する**

コピー/ペーストしてください。特別なことはありません。

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

ルート名 `_index` は特別です。ユーザーが親ルートの正確なパスにいて、 `<Outlet />` にレンダリングする他の子ルートがない場合に、このルートを一致させてレンダリングするように Remix に指示します。

<img class="tutorial" loading="lazy" src="/docs-images/contacts/18.webp" />

ボイラ！空白はなくなりました。インデックスルートにダッシュボード、統計、フィードなどを置くのが一般的です。それらもデータの読み込みに参加できます。

## キャンセルボタン

編集ページには、まだ何もしていないキャンセルボタンがあります。ブラウザの戻るボタンと同じことをしてほしいと思います。

ボタンのクリックハンドラと [`useNavigate`][use-navigate] が必要です。

👉 **`useNavigate` でキャンセルボタンのクリックハンドラを追加する**

```tsx filename=app/routes/contacts.$contactId_.edit.tsx lines=[5,11,18]
// 既存のインポート
import {
  Form,
  useLoaderData,
  useNavigate,
} from "@remix-run/react";
// 既存のインポートとエクスポート

export default function EditContact() {
  const { contact } = useLoaderData<typeof loader>();
  const navigate = useNavigate();

  return (
    <Form key={contact.id} id="contact-form" method="post">
      {/* 既存の要素 */}
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

これで、ユーザーが "Cancel" をクリックすると、ブラウザの履歴の1つ前のエントリに送られます。

> 🧐 なぜボタンに `event.preventDefault()` がないのですか？

一見冗長に見える `<button type="button">` は、ボタンがフォームを送信しないようにする HTML の方法です。

あと2つの機能があります。ホームストレッチです！

## `URLSearchParams` と `GET` 送信

これまでのインタラクティブな UI はすべて、 URL を変更するリンクか、 `action` 関数にデータを送信する `form` のいずれかでした。検索フィールドは興味深いです。 `form` ですが、 URL を変更するだけで、データは変更しません。

検索フォームを送信するとどうなるか見てみましょう。

👉 **検索フィールドに名前を入力し、 Enter キーを押す**

ブラウザの URL には、 [`URLSearchParams`][url-search-params] として URL にクエリが含まれていることに注意してください。

```
http://localhost:5173/?q=ryan
```

`<Form method="post">` ではないため、 Remix は [`FormData`][form-data] を [`URLSearchParams`][url-search-params] にシリアル化することでブラウザをエミュレートし、リクエストボディにはシリアル化しません。

`loader` 関数は、 `request` から検索パラメータにアクセスできます。それを使用してリストをフィルタリングしましょう。

👉 **`URLSearchParams` がある場合はリストをフィルタリングする**

```tsx filename=app/root.tsx lines=[3,8-13]
import type {
  LinksFunction,
  LoaderFunctionArgs,
} from "@remix-run/node";

// 既存のインポートとエクスポート

export const loader = async ({
  request,
}: LoaderFunctionArgs) => {
  const url = new URL(request.url);
  const q = url.searchParams.get("q");
  const contacts = await getContacts(q);
  return json({ contacts });
};

// 既存のコード
```

<img class="tutorial" loading="lazy" src="/docs-images/contacts/19.webp" />

これは `GET` であり、 `POST` ではないため、 Remix は `action` 関数を呼び出し*ません*。 `GET` `form` を送信することは、リンクをクリックすることと同じです。 URL だけが変更されます。

これはまた、通常のページナビゲーションを意味します。戻るボタンをクリックすると、元の場所に戻ることができます。

## URL をフォームの状態と同期する

ここにはすぐに対処できる UX の問題がいくつかあります。

1. 検索後に戻るボタンをクリックすると、リストがフィルタリングされなくなったにもかかわらず、フォームフィールドには入力した値がまだ表示されます
2. 検索後にページを更新すると、リストはフィルタリングされていますが、フォームフィールドに値が表示されなくなります

つまり、 URL と入力の状態が同期していません。

まず (2) を解決し、 URL の値で入力を開始します。

👉 **`loader` から `q` を返し、それを入力のデフォルト値として設定する**

```tsx filename=app/root.tsx lines=[9,13,26]
// 既存のインポートとエクスポート

export const loader = async ({
  request,
}: LoaderFunctionArgs) => {
  const url = new URL(request.url);
  const q = url.searchParams.get("q");
  const contacts = await getContacts(q);
  return json({ contacts, q });
};

export default function App() {
  const { contacts, q } = useLoaderData<typeof loader>();
  const navigation = useNavigation();

  return (
    <html lang="en">
      {/* 既存の要素 */}
      <body>
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
      </body>
    </html>
  );
}
```

検索後にページを更新すると、入力フィールドにクエリが表示されるようになりました。

次に、問題 (1) 、戻るボタンをクリックして入力を更新します。 React の `useEffect` を使用して、 DOM で直接入力の値を操作できます。

👉 **入力値を `URLSearchParams` と同期する**

```tsx filename=app/root.tsx lines=[2,10-15]
// 既存のインポート
import { useEffect } from "react";

// 既存のインポートとエクスポート

export default function App() {
  const { contacts, q } = useLoaderData<typeof loader>();
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

> 🤔 これにコントロールドコンポーネントと React State を使用するべきではありませんか？

これをコントロールドコンポーネントとして実装することは確かにできます。同期ポイントは増えますが、あなた次第です。

<details>

<summary>どのように見えるかを見るには、これを展開してください</summary>

```tsx filename=app/root.tsx lines=[2,9-10,12-16,30-33,36-37]
// 既存のインポート
import { useEffect, useState } from "react";

// 既存のインポートとエクスポート

export default function App() {
  const { contacts, q } = useLoaderData<typeof loader>();
  const navigation = useNavigation();
  // クエリは状態に保持する必要があります
  const [query, setQuery] = useState(q || "");

  // 戻る/進むボタンのクリック時にクエリをコンポーネントの状態に
  // 同期するための `useEffect` はまだあります
  useEffect(() => {
    setQuery(q || "");
  }, [q]);

  return (
    <html lang="en">
      {/* 既存の要素 */}
      <body>
        <div id="sidebar">
          {/* 既存の要素 */}
          <div>
            <Form id="search-form" role="search">
              <input
                aria-label="Search contacts"
                id="q"
                name="q"
                // ユーザーの入力をコンポーネントの状態に同期する
                onChange={(event) =>
                  setQuery(event.currentTarget.value)
                }
                placeholder="Search"
                type="search"
                // `defaultValue` から `value` に切り替えた
                value={query}
              />
              {/* 既存の要素 */}
            </Form>
            {/* 既存の要素 */}
          </div>
          {/* 既存の要素 */}
        </div>
        {/* 既存の要素 */}
      </body>
    </html>
  );
}
```

</details>

さて、戻る/進む/更新ボタンをクリックすると、入力の値が URL と結果に同期されるはずです。

## `onChange` で `Form` を送信する

ここで製品の決定を下す必要があります。結果をフィルタリングするために、ユーザーにフォームを送信してもらう場合もあれば、ユーザーが入力しているときにフィルタリングする場合もあります。最初のものはすでに実装されているので、2番目のものがどのようなものかを見てみましょう。

すでに `useNavigate` を見てきました。これにはいとこの [`useSubmit`][use-submit] を使用します。

```tsx filename=app/root.tsx lines=[12,19,32-34]
// 既存のインポート
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
// 既存のインポートとエクスポート

export default function App() {
  const { contacts, q } = useLoaderData<typeof loader>();
  const navigation = useNavigation();
  const submit = useSubmit();

  // 既存のコード

  return (
    <html lang="en">
      {/* 既存の要素 */}
      <body>
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
      </body>
    </html>
  );
}
```

入力すると、 `form` が自動的に送信されるようになりました！

[`submit`][use-submit] への引数に注目してください。 `submit` 関数は、渡されたフォームをシリアル化して送信します。 `event.currentTarget` を渡しています。 `currentTarget` は、イベントがアタッチされている DOM ノード (`form`) です。

## 検索スピナーの追加

運用環境のアプリでは、この検索は、一度にすべて送信してクライアント側でフィルタリングするには大きすぎるデータベースのレコードを検索している可能性があります。そのため、このデモには偽のネットワークレイテンシーがあります。

読み込みインジケーターがないと、検索がちょっと遅く感じられます。データベースを高速化できたとしても、常にユーザーのネットワークレイテンシーが妨げになり、コントロールできなくなります。

より良いユーザーエクスペリエンスのために、検索のためのいくつかの即時の UI フィードバックを追加しましょう。再び [`useNavigation`][use-navigation] を使用します。

👉 **検索中かどうかを知るための変数を追加する**

```tsx filename=app/root.tsx lines=[7-11]
// 既存のインポートとエクスポート

export default function App() {
  const { contacts, q } = useLoaderData<typeof loader>();
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

何も起こっていない場合、 `navigation.location` は `undefined` になりますが、ユーザーがナビゲートすると、データの読み込み中に次の場所で設定されます。次に、 `location.search` で検索しているかどうかを確認します。

👉 **新しい `searching` 状態を使用して検索フォームの要素にクラスを追加する**

```tsx filename=app/root.tsx lines=[22,31]
// 既存のインポートとエクスポート

export default function App() {
  // 既存のコード

  return (
    <html lang="en">
      {/* 既存の要素 */}
      <body>
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
      </body>
    </html>
  );
}
```

ボーナスポイント。検索時にメイン画面がフェードアウトしないようにします。

```tsx filename=app/root.tsx lines=[13]
// 既存のインポートとエクスポート

export default function App() {
  // 既存のコード

  return (
    <html lang="en">
      {/* 既存の要素 */}
      <body>
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
      </body>
    </html>
  );
}
```

これで、検索入力の左側にスピナーが表示されるはずです。

<img class="tutorial" loading="lazy" src="/docs-images/contacts/20.webp" />

## 履歴スタックの管理

フォームがキーストロークごとに送信されるため、 "alex" という文字を入力してから backspace で削除すると、履歴スタックが大量になります 😂。確かにこれは望んでいません。

<img class="tutorial" loading="lazy" src="/docs-images/contacts/21.webp" />

履歴スタックに新しいエントリを追加するのではなく、次のページで現在のエントリを _置き換える_ ことでこれを回避できます。

👉 **`submit` で `replace` を使用する**

```tsx filename=app/root.tsx lines=[16-19]
// 既存のインポートとエクスポート

export default function App() {
  // 既存のコード

  return (
    <html lang="en">
      {/* 既存の要素 */}
      <body>
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
      </body>
    </html>
  );
}
```

これが最初の検索かどうかをすばやくチェックした後、置き換えるかどうかを決定します。これで、最初の検索では新しいエントリが追加されますが、その後のキーストロークではすべて現在のエントリが置き換えられます。検索を削除するために7回戻るのではなく、ユーザーは1回だけ戻る必要があります。

## ナビゲーションなしの `Form`

これまでのフォームはすべて URL を変更してきました。これらのユーザーフローは一般的ですが、ナビゲーションを伴わずにフォームを送信したい場合も同様に一般的です。

このような場合、 [`useFetcher`][use-fetcher] があります。これにより、ナビゲーションを引き起こすことなく、 `action` や `loader` と通信できます。

連絡先ページの ★ ボタンはこれに適しています。新しいレコードを作成または削除しているわけではなく、ページを変更したくありません。見ているページ上のデータを変更するだけです。

👉 **`<Favorite>` フォームをフェッチャーフォームに変更する**

```tsx filename=app/routes/contacts.$contactId.tsx lines=[4,14,18,30]
// 既存のインポート
import {
  Form,
  useFetcher,
  useLoaderData,
} from "@remix-run/react";
// 既存のインポートとエクスポート

// 既存のコード

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

このフォームはもはやナビゲーションを引き起こしませんが、単に `action` にフェッチするだけです。といっても... `action` を作成するまで、これは機能しません。

👉 **`action` を作成する**

```tsx filename=app/routes/contacts.$contactId.tsx lines=[2,7,10-19]
import type {
  ActionFunctionArgs,
  LoaderFunctionArgs,
} from "@remix-run/node";
// 既存のインポート

import { getContact, updateContact } from "../data";
// 既存のインポート

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

// 既存のコード
```

さあ、ユーザー名の横にある星をクリックする準備ができました！

<img class="tutorial" loading="lazy" src="/docs-images/contacts/22.webp" />

見てください。両方の星が自動的に更新されます。新しい `<fetcher.Form method="post">` は、これまで使用してきた `<Form>` とほとんど同じように機能します。アクションを呼び出し、すべてのデータが自動的に再検証されます。エラーも同じように捕捉されます。

ただし、1つの重要な違いがあります。ナビゲーションではないので、 URL は変更されず、履歴スタックには影響しません。

## 楽観的 UI

前のセクションからお気に入りボタンをクリックしたとき、アプリの反応が少し鈍く感じられたことに気づいたかもしれません。実際の世界ではネットワークのレイテンシーがあるので、もう一度レイテンシーを追加しました。

ユーザーにフィードバックを与えるために、 [`fetcher.state`][fetcher-state] を使用して星を読み込み状態にすることもできます (以前の `navigation.state` とよく似ています)。ただし、今回はそれよりも優れたことができます。 "楽観的 UI" と呼ばれる戦略を使用できます。

フェッチャーは、 `action` に送信される [`FormData`][form-data] を知っているので、 `fetcher.formData` で使用できます。ネットワークがまだ完了していなくても、それを使用して星の状態をすぐに更新します。更新が最終的に失敗した場合、 UI は実際のデータに戻ります。

👉 **`fetcher.formData` から楽観的な値を読み取る**

```tsx filename=app/routes/contacts.$contactId.tsx lines=[7-9]
// 既存のコード

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

これで、星をクリックすると、_すぐに_ 新しい状態に変わります。

---

以上です！ Remix を試してくれてありがとうございます。このチュートリアルが素晴らしいユーザーエクスペリエンスを構築するための確実な出発点になることを願っています。できることはまだまだたくさんあるので、すべての API をチェックしてください 😀

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