---
title: チュートリアル (30 分)
order: 2
---

# Remix チュートリアル

今回は、連絡先を管理できる、小さくても機能豊富なアプリを構築します。データベースやその他の「本番環境対応」なものは使用しないので、Remix に集中できます。手順通りに進めれば約 30 分で完了するはずです。そうでなければ、さっと読める内容です。

<img class="tutorial" src="/docs-images/contacts/01.webp" />

👉 **このマークが表示されたら、アプリで何か操作をする必要があります！**

残りの部分は、情報提供とより深い理解のために記載されています。始めましょう。

## セットアップ

👉 **基本的なテンプレートを生成する**

```shellscript nonumber
npx create-remix@latest --template remix-run/remix/templates/remix-tutorial
```

これは非常にシンプルなテンプレートを使用しますが、CSS とデータモデルが含まれているので、Remix に集中できます。[クイックスタート][quickstart]では、Remix プロジェクトの基本的なセットアップについて詳しく知ることができます。

👉 **アプリを起動する**

```shellscript nonumber
# アプリのディレクトリに cd する
cd {アプリを置いた場所}

# まだインストールしていない場合は、依存関係をインストールする
npm install

# サーバーを起動する
npm run dev
```

[http://localhost:5173][http-localhost-5173] を開くと、このようなスタイルのない画面が表示されるはずです。

<img class="tutorial" src="/docs-images/contacts/03.webp" />

## ルートルート

`app/root.tsx` のファイルに注目してください。これは「ルートルート」と呼ばれます。UI で最初にレンダリングされるコンポーネントなので、通常はページのグローバルレイアウトが含まれています。

<details>

<summary>ルートコンポーネントのコードを見るには、ここをクリックして展開してください</summary>

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

## `links` を使用してスタイルシートを追加する

Remix アプリをスタイル設定する方法はいくつかありますが、Remix に集中できるように、すでに記述されているプレーンなスタイルシートを使用します。

CSS ファイルを JavaScript モジュールに直接インポートできます。Vite はアセットのフィンガープリントを作成し、ビルドのクライアントディレクトリに保存し、モジュールに公開可能な href を提供します。

👉 **アプリのスタイルをインポートする**

```tsx filename=app/root.tsx lines=[1,4,6-8]
import type { LinksFunction } from "@remix-run/node";
// 既存のインポート

import appStylesHref from "./app.css?url";

export const links: LinksFunction = () => [
  { rel: "stylesheet", href: appStylesHref },
];
```

すべてのルートは [`links`][links] 関数をエクスポートできます。それらは収集され、`app/root.tsx` でレンダリングした `<Links />` コンポーネントにレンダリングされます。

これで、アプリは次のようになります。デザイナーが CSS も書けるのは本当にいいですね、そう思いませんか？([ジム][jim] さん、ありがとうございます🙏)。

<img class="tutorial" loading="lazy" src="/docs-images/contacts/04.webp" />

## 連絡先ルートの UI

サイドバーの項目をクリックすると、デフォルトの 404 ページが表示されます。`contacts/1` のような URL と一致するルートを作成しましょう。

👉 **`app/routes` ディレクトリと連絡先ルートのモジュールを作成する**

```shellscript nonumber
mkdir app/routes
touch app/routes/contacts.\$contactId.tsx
```

Remix の[ルートファイルの命名規則][routes-file-conventions]では、`.` は URL に `/` を作成し、`$` はセグメントを動的にします。これで、次のような URL と一致するルートを作成しました。

- `/contacts/123`
- `/contacts/abc`

👉 **連絡先コンポーネントの UI を追加する**

これは単なる要素の集まりなので、コピーして貼り付けても問題ありません。

```tsx filename=app/routes/contacts.$contactId.tsx
import { Form } from "@remix-run/react";
import type { FunctionComponent } from "react";

import type { ContactRecord } from "../data";

export default function Contact() {
  const contact = {
    first: "Your",
    last: "Name",
    avatar: "https://placekitten.com/g/200/200",
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

サイドバーのいずれかのリンクをクリックするか、`/contacts/1` にアクセスすると、... 新しいものは何も表示されませんか？

<img class="tutorial" loading="lazy" alt="contact route with blank main content" src="/docs-images/contacts/05.webp" />

## ネストされたルートとアウトレット

Remix は React Router を基に構築されているため、ネストされたルーティングをサポートしています。子ルートを親レイアウト内でレンダリングするには、親に [`Outlet`][outlet-component] をレンダリングする必要があります。`app/root.tsx` を開き、アウトレットをその中にレンダリングしましょう。

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
      {/* その他の要素 */}
      <body>
        <div id="sidebar">{/* その他の要素 */}</div>
        <div id="detail">
          <Outlet />
        </div>
        {/* その他の要素 */}
      </body>
    </html>
  );
}
```

これで、子ルートはアウトレットを通してレンダリングされるはずです。

<img class="tutorial" loading="lazy" alt="contact route with the main content" src="/docs-images/contacts/06.webp" />

## クライアントサイドルーティング

気づいているかもしれませんが、サイドバーのリンクをクリックすると、ブラウザはクライアントサイドルーティングではなく、次の URL のフルドキュメントリクエストを実行しています。

クライアントサイドルーティングを使用すると、アプリはサーバーから別のドキュメントをリクエストせずに、URL を更新できます。代わりに、アプリはすぐに新しい UI をレンダリングできます。[`<Link>`][link-component] を使用して実現しましょう。

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
      {/* その他の要素 */}
      <body>
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
      </body>
    </html>
  );
}
```

ブラウザの開発ツールでネットワークタブを開くと、ドキュメントをリクエストしていないことがわかります。

## データの読み込み

URL セグメント、レイアウト、データは、多くの場合、互いに関連しています（3 つが一体化？）。このアプリでもすでに確認できます。

| URL セグメント         | コンポーネント   | データ               |
| ------------------- | ----------- | ------------------ |
| /                   | `<Root>`    | 連絡先のリスト   |
| contacts/:contactId | `<Contact>` | 個別の連絡先 |

この自然な関連性があるため、Remix はデータをルートコンポーネントに簡単に取得できるデータの規約を備えています。

データを読み込むために使用する API は 2 つあります。[`loader`][loader] と [`useLoaderData`][use-loader-data] です。まず、ルートルートに `loader` 関数をエクスポートし、データをレンダリングします。

👉 **`app/root.tsx` から `loader` 関数をエクスポートし、データをレンダリングする**

<docs-info>次のコードには、型エラーが含まれています。次のセクションで修正します。</docs-info>

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
      {/* その他の要素 */}
      <body>
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
        {/* その他の要素 */}
      </body>
    </html>
  );
}
```

これで完了です！Remix は、このデータを UI と自動的に同期させます。サイドバーは次のようになります。

<img class="tutorial" loading="lazy" src="/docs-images/contacts/07.webp" />

## 型推論

`map` 内の `contact` 型について、TypeScript が文句を言っていることに気づいたかもしれません。`typeof loader` を使用して、データに関する型推論を追加できます。

```tsx filename=app/root.tsx lines=[4]
// 既存のインポートとエクスポート

export default function App() {
  const { contacts } = useLoaderData<typeof loader>();

  // 既存のコード
}
```

## ローダーでの URL パラメーター

👉 **サイドバーのいずれかのリンクをクリックする**

古い静的な連絡先ページが表示されるはずです。違いは、URL にレコードの実際の ID が含まれるようになったことです。

<img class="tutorial" loading="lazy" src="/docs-images/contacts/08.webp" />

`app/routes/contacts.$contactId.tsx` のファイル名の `$contactId` 部分を覚えていますか？これらの動的セグメントは、URL のその位置にある動的（変更可能な）値と一致します。これらの値は URL の「URL パラメーター」、または単に「パラメーター」と呼ばれます。

これらの [`params`][params] は、動的セグメントと一致するキーを使用して、ローダーに渡されます。たとえば、セグメントの名前は `$contactId` なので、値は `params.contactId` として渡されます。

これらのパラメーターは、多くの場合、ID でレコードを見つけるために使用されます。試してみましょう。

👉 **連絡先ページに `loader` 関数を追加し、`useLoaderData` を使用してデータにアクセスする**

<docs-info>次のコードには、型エラーが含まれています。次のセクションで修正します。</docs-info>

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

## パラメーターの検証とレスポンスのスロー

TypeScript が非常に怒っています。修正して、何が強制されるか見てみましょう。

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

まず、ファイル名とコードの間でパラメーターの名前を間違えている可能性があります（ファイル名を変更したかもしれません）。Invariant は、コードで潜在的な問題が発生した可能性がある場合に、カスタムメッセージ付きのエラーをスローする便利な関数です。

次に、`useLoaderData<typeof loader>()` は、`contact` または `null` を取得したことを認識しています（その ID を持つ連絡先が存在しない可能性があります）。この潜在的な `null` は、コンポーネントコードでは厄介で、TS エラーも発生しています。

コンポーネントコードで、連絡先が見つからない可能性を考慮することもできますが、Web 的には、適切な 404 を送信することです。ローダーでこれを行い、すべての問題を一度に解決できます。

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

これで、ユーザーが見つからない場合、このパスでのコードの実行は停止し、代わりに Remix がエラーパスをレンダリングします。Remix のコンポーネントは、正常なパスにのみ集中できます😁

## データの変更

新しい連絡先を 1 つ作成しますが、その前に HTML について話しましょう。

Remix は、HTML フォームのナビゲーションをデータの変更のプリミティブとしてエミュレートします。これは、JavaScript のカンブリア爆発以前は、唯一の方法でした。シンプルさに騙されないでください！Remix のフォームを使用すると、クライアントでレンダリングされたアプリの UX 機能を、従来の Web モデルのシンプルさで実現できます。

一部の Web 開発者には馴染みがないかもしれませんが、HTML の `form` は実際にはブラウザでナビゲーションを引き起こします。リンクをクリックするのと同じです。違いは、リクエストにあります。リンクは URL を変更できますが、`form` はリクエストメソッド（`GET` と `POST`）とリクエストボディ（`POST` フォームデータ）も変更できます。

クライアントサイドルーティングがない場合、ブラウザは `form` のデータを自動的にシリアル化して、`POST` の場合はリクエストボディとして、`GET` の場合は [`URLSearchParams`][url-search-params] としてサーバーに送信します。Remix は同じことを行いますが、サーバーにリクエストを送信するのではなく、クライアントサイドルーティングを使用して、ルートの [`action`][action] 関数に送信します。

アプリの「New」ボタンをクリックして、テストしてみましょう。

<img class="tutorial" loading="lazy" src="/docs-images/contacts/09.webp" />

Remix は、このフォームのナビゲーションを処理するコードがサーバーにないため、405 を送信します。

## 連絡先の作成

ルートルートに `action` 関数をエクスポートして、新しい連絡先を作成します。ユーザーが「New」ボタンをクリックすると、フォームはルートルートのアクションに `POST` します。

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

これで完了です！「New」ボタンをクリックすると、リストに新しいレコードが追加されます🥳

<img class="tutorial" loading="lazy" src="/docs-images/contacts/11.webp" />

`createEmptyContact` メソッドは、名前やデータなど何も含まない空の連絡先を作成します。しかし、レコードは作成されます。約束します！

> 🧐 えっ... どうやってサイドバーが更新されたのでしょうか？どこで `action` 関数を呼び出したのでしょうか？データの再取得を行うコードはどこにあるのでしょうか？`useState`、`onSubmit`、`useEffect` はどこにあるのでしょうか？

ここで、従来の Web プログラミングモデルが登場します。[`<Form>`][form-component] は、ブラウザがサーバーにリクエストを送信するのを防ぎ、[`fetch`][fetch] を使用して、ルートの `action` 関数にリクエストを送信します。

Web のセマンティクスでは、`POST` は通常、データが変更されていることを意味します。規約により、Remix はこれをヒントとして使用し、`action` が完了した後にページのデータを自動的に再検証します。

実際、すべてが HTML と HTTP であるため、JavaScript を無効にしても、すべてが正常に動作します。Remix がフォームをシリアル化してサーバーに [`fetch`][fetch] リクエストを送信するのではなく、ブラウザがフォームをシリアル化して、ドキュメントリクエストを送信します。その後、Remix はページをサーバーサイドでレンダリングして、送信します。最終的には、同じ UI になります。

しかし、JavaScript はそのままにしておきましょう。なぜなら、ファビコンを回転させたり、静的なドキュメントを表示するよりも、優れたユーザーエクスペリエンスを実現しようとしているからです。

## データの更新

新しいレコードの情報を入力する方法を追加しましょう。

データの作成と同様に、[`<Form>`][form-component] を使用してデータを更新します。`app/routes/contacts.$contactId_.edit.tsx` に新しいルートを作成しましょう。

👉 **編集コンポーネントを作成する**

```shellscript nonumber
touch app/routes/contacts.\$contactId_.edit.tsx
```

`$contactId_` の変な `_` に注目してください。デフォルトでは、ルートは、同じ接頭辞の名前を持つルート内に自動的にネストされます。末尾に `_` を追加すると、ルートは `app/routes/contacts.$contactId.tsx` 内にネストされ**ません**。[ルートファイルの命名][routes-file-conventions]ガイドで詳しく説明されています。

👉 **編集ページの UI を追加する**

これまで見たことのないものはありません。コピーして貼り付けても問題ありません。

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

新しいレコードをクリックして、「Edit」ボタンをクリックします。新しいルートが表示されるはずです。

<img class="tutorial" loading="lazy" src="/docs-images/contacts/12.webp" />

## `FormData` を使用して連絡先を更新する

作成した編集ルートにはすでに `form` がレンダリングされています。必要なのは、`action` 関数を追加することだけです。Remix は `form` をシリアル化して、[`fetch`][fetch] で `POST` し、すべてのデータを自動的に再検証します。

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

フォームに入力して、「Save」をクリックすると、このような画面が表示されます！<small>(見た目も美しく、毛も生えていません)</small>

<img class="tutorial" loading="lazy" src="/docs-images/contacts/13.webp" />

## 変更の議論

> 😑 動作しました。でも、何が起こっているのかさっぱりわかりません...

詳しく見ていきましょう...

`contacts.$contactId_.edit.tsx` を開き、`form` 要素を見てください。各要素には `name` があることに注目してください。

```tsx filename=app/routes/contacts.$contactId_.edit.tsx lines=[4]
<input
  defaultValue={contact.first}
  aria-label="First name"
  name="first"
  type="text"
  placeholder="First"
/>
```

JavaScript がない場合、フォームが送信されると、ブラウザは [`FormData`][form-data] を作成し、サーバーに送信するリクエストのボディとして設定します。前述したように、Remix はこれを実行せず、ブラウザをエミュレートして、[`FormData`][form-data] を含む [`fetch`][fetch] を使用して、リクエストを `action` 関数に送信します。

`form` の各フィールドは、`formData.get(name)` でアクセスできます。たとえば、上記の入力フィールドの場合、次のようにしてファーストネームとラストネームにアクセスできます。

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

フォームフィールドがいくつかあるため、[`Object.fromEntries`][object-from-entries] を使用して、すべてをオブジェクトに収集しました。これは、`updateContact` 関数が期待しているものです。

```tsx filename=app/routes/contacts.$contactId_.edit.tsx nocopy
const updates = Object.fromEntries(formData);
updates.first; // "Some"
updates.last; // "Name"
```

`action` 関数以外、ここで説明する API は、Remix によって提供されるものではありません。[`request`][request]、[`request.formData`][request-form-data]、[`Object.fromEntries`][object-from-entries] は、すべて Web プラットフォームによって提供されます。

`action` 関数が完了したら、末尾の [`redirect`][redirect] に注目してください。

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

`action` 関数と `loader` 関数はどちらも [ `Response` を返す][returning-response-instances] ことができます（`Request` を受信したので、理にかなっています）。[`redirect`][redirect] ヘルパーは、アプリに場所を変更するように指示する [`Response`][response] を返す際に、より簡単に操作できるようにします。

クライアントサイドルーティングがない場合、`POST` リクエスト後にサーバーがリダイレクトすると、新しいページは最新のデータを取得してレンダリングします。前述したように、Remix はこのモデルをエミュレートし、`action` 呼び出し後にページのデータを自動的に再検証します。これが、フォームを保存するとサイドバーが自動的に更新される理由です。追加の再検証コードは、クライアントサイドルーティングがない場合は存在しません。そのため、Remix では、クライアントサイドルーティングで存在する必要がありません！

もう 1 つ。JavaScript がない場合、[`redirect`][redirect] は通常の転送になります。ただし、JavaScript がある場合は、クライアントサイド転送となるため、ユーザーはスクロール位置やコンポーネントの状態などのクライアントの状態を失うことはありません。

## 新しいレコードを編集ページにリダイレクトする

これで、リダイレクトの方法がわかったため、新しい連絡先を作成するアクションを編集ページにリダイレクトするように更新しましょう。

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

これで、「New」をクリックすると、編集ページに移動するはずです。

<img class="tutorial" loading="lazy" src="/docs-images/contacts/14.webp" />

## アクティブなリンクのスタイル設定

レコードがいくつかあるため、サイドバーでどのレコードを見ているのかわかりません。[`NavLink`][nav-link] を使用して、これを修正できます。

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

`className` に関数を渡していることに注目してください。ユーザーが `<NavLink to>` と一致する URL にいる場合、`isActive` は true になります。アクティブになり**かけている**場合（データがまだ読み込まれている）、`isPending` は true になります。これにより、ユーザーがどこにいるのかを簡単に示し、リンクをクリックしてもデータを読み込む必要がある場合は、すぐにフィードバックを提供できます。

<img class="tutorial" loading="lazy" src="/docs-images/contacts/15.webp"/>

## グローバルな保留中の UI

ユーザーがアプリを移動すると、Remix は次のページのデータが読み込まれる間、古いページを表示し続けます。リスト間をクリックすると、アプリが少し反応しにくいことに気づいたかもしれません。アプリが反応しにくいと感じさせないように、ユーザーにフィードバックを提供しましょう。

Remix は、バックグラウンドですべての状態を管理し、動的な Web アプリを構築するために必要な部分を公開しています。今回は、[`useNavigation`][use-navigation] フックを使用します。

👉 **`useNavigation` を使用して、グローバルな保留中の UI を追加する**

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
      