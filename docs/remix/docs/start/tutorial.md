---
title: チュートリアル (30分)
order: 2
---

# Remix チュートリアル

連絡先を管理できる、小さくても機能豊富なアプリを構築します。データベースやその他の「本番環境対応」のものは使用しないので、Remix に集中できます。一緒に作業すれば約30分、そうでなければ素早く読めるはずです。

<img class="tutorial" src="/docs-images/contacts/01.webp" />

👉 **これが表示されたら、アプリで何か操作する必要があります！**

残りは、情報提供とより深い理解のためのものです。始めましょう。

## セットアップ

👉 **基本テンプレートの生成**

```shellscript nonumber
npx create-remix@latest --template remix-run/remix/templates/remix-tutorial
```

これは非常にシンプルなテンプレートを使用しますが、CSSとデータモデルが含まれているため、Remixに集中できます。より詳しく学習したい場合は、[クイックスタート][quickstart]でRemixプロジェクトの基本的なセットアップを理解することができます。

👉 **アプリの起動**

```shellscript nonumber
# アプリディレクトリに移動
cd {アプリを配置した場所}

# まだインストールしていない場合は、依存関係をインストールします
npm install

# サーバーを起動します
npm run dev
```

[http://localhost:5173][http-localhost-5173] を開くと、次のようなスタイルのない画面が表示されるはずです。

<img class="tutorial" src="/docs-images/contacts/03.webp" />


[quickstart]: [クイックスタートへのリンクをここに挿入]
[http-localhost-5173]: http://localhost:5173

## ルートルート

`app/root.tsx` のファイルに注目してください。これは「ルートルート」と呼んでいます。UIで最初にレンダリングされるコンポーネントであり、通常はページのグローバルレイアウトを含みます。

<details>

<summary>ルートコンポーネントのコードを見るにはここをクリック</summary>

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

## `links` を使用したスタイルシートの追加

Remix アプリをスタイリングするには複数の方法がありますが、Remix に焦点を当てるために、既に記述済みのプレーンなスタイルシートを使用します。

CSS ファイルを JavaScript モジュールに直接インポートできます。Vite はアセットのフィンガープリントを作成し、ビルドのクライアントディレクトリに保存し、公開アクセス可能な href をモジュールに提供します。

👉 **アプリスタイルのインポート**

```tsx filename=app/root.tsx lines=[1,4,6-8]
import type { LinksFunction } from "@remix-run/node";
// 既存のインポート

import appStylesHref from "./app.css?url";

export const links: LinksFunction = () => [
  { rel: "stylesheet", href: appStylesHref },
];
```

すべてのルートは [`links`][links] 関数をエクスポートできます。それらは収集され、`app/root.tsx` でレンダリングした `<Links />` コンポーネントにレンダリングされます。

アプリは現在、このような見た目になるはずです。CSSも書けるデザイナーがいるのは素晴らしいですね！（ありがとう、[Jim][jim] 🙏）。

<img class="tutorial" loading="lazy" src="/docs-images/contacts/04.webp" />


[links]: <リンクの説明をここに挿入>
[jim]: <Jimへのリンクをここに挿入>

## コンタクトルートUI

サイドバーのアイテムをクリックすると、デフォルトの404ページが表示されます。`/contacts/1`というURLに一致するルートを作成しましょう。

👉 **`app/routes`ディレクトリとコンタクトルートモジュールの作成**

```shellscript nonumber
mkdir app/routes
touch app/routes/contacts.\$contactId.tsx
```

Remixの[ルートファイルの命名規則][routes-file-conventions]では、`.`はURLに`/`を作成し、`$`はセグメントを動的にします。これで、次のようなURLに一致するルートが作成されました。

* `/contacts/123`
* `/contacts/abc`

👉 **コンタクトコンポーネントUIの追加**

いくつかの要素を組み合わせたものです。コピー＆ペーストして自由に使用してください。

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

リンクをクリックするか`/contacts/1`にアクセスしても、何も変化がありません。

<img class="tutorial" loading="lazy" alt="contact route with blank main content" src="/docs-images/contacts/05.webp" />


[routes-file-conventions]:  (ルートファイルの命名規則へのリンクをここに挿入してください。原文にはリンクがありませんでした。)

## ネストされたルートとアウトレット

RemixはReact Router上に構築されているため、ネストされたルーティングをサポートしています。子ルートを親レイアウト内にレンダリングするには、親に[`Outlet`][outlet-component]をレンダリングする必要があります。これを修正するために、`app/root.tsx`を開いて、アウトレットをレンダリングしましょう。

👉 **[`<Outlet />`][outlet-component]をレンダリングする**

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

これで、子ルートがアウトレットを通してレンダリングされるはずです。

<img class="tutorial" loading="lazy" alt="メインコンテンツを含む連絡先ルート" src="/docs-images/contacts/06.webp" />

## クライアントサイドルーティング

気づかれたかもしれませんが、サイドバーのリンクをクリックすると、ブラウザはクライアントサイドルーティングではなく、次のURLに対して完全なドキュメントリクエストを行っています。

クライアントサイドルーティングにより、アプリはサーバーから別のドキュメントをリクエストすることなく、URLを更新できます。代わりに、アプリはすぐに新しいUIをレンダリングできます。 [`<Link>`][link-component] を使用して実現しましょう。

👉 **サイドバーの `<a href>` を `<Link to>` に変更してください**

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

ブラウザの開発ツールでネットワークタブを開くと、ドキュメントがリクエストされなくなっていることが確認できます。

## データの読み込み

URL セグメント、レイアウト、データは、ほとんどの場合、互いに関連付けられています（3つ組？）。このアプリでもすでに確認できます。

| URL セグメント         | コンポーネント   | データ               |
| ------------------- | ----------- | ------------------ |
| /                   | `<Root>`    | 連絡先のリスト   |
| contacts/:contactId | `<Contact>` | 個々の連絡先 |

この自然な結合のため、Remix には、データを経路コンポーネントに簡単に取得するためのデータ規則があります。

データを読み込むために使用する API は 2 つあります。[`loader`][loader] と [`useLoaderData`][use-loader-data] です。まず、ルートルートに `loader` 関数を生成してエクスポートし、その後データをレンダリングします。

👉 **`app/root.tsx` から `loader` 関数をエクスポートし、データをレンダリングする**

<docs-info>次のコードには型エラーが含まれています。これは次のセクションで修正します。</docs-info>

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
                        <i>名前なし</i>
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
                <i>連絡先がありません</i>
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

以上です！Remix はこれで、データを UI と自動的に同期状態に保ちます。サイドバーは次のようになります。

<img class="tutorial" loading="lazy" src="/docs-images/contacts/07.webp" />

## 型推論

`map` 内の `contact` 型について、TypeScript が警告を出していることに気づかれたかもしれません。`typeof loader` を使用してデータに関する型推論を行うための簡単な注釈を追加できます。

```tsx filename=app/root.tsx lines=[4]
// 既存のインポートとエクスポート

export default function App() {
  const { contacts } = useLoaderData<typeof loader>();

  // 既存のコード
}
```

## ローダーにおけるURLパラメータ

👉 **サイドバーのリンクのいずれかをクリックしてください**

以前の静的なコンタクトページが表示されるはずです。ただし、1点異なります。URLにレコードの実際のIDが含まれるようになりました。

<img class="tutorial" loading="lazy" src="/docs-images/contacts/08.webp" />

`app/routes/contacts.$contactId.tsx`のファイル名にある`$contactId`の部分を覚えていますか？これらの動的なセグメントは、URLのその位置にある動的な（変化する）値と一致します。URL内のこれらの値を「URLパラメータ」、または簡単に「パラメータ」と呼びます。

これらの[`params`][params]は、動的なセグメントと一致するキーを使用してローダーに渡されます。例えば、セグメントの名前が`$contactId`なので、値は`params.contactId`として渡されます。

これらのパラメータは、多くの場合、IDでレコードを見つけるために使用されます。試してみましょう。

👉 **コンタクトページに`loader`関数を追加し、`useLoaderData`でデータにアクセスする**

<docs-info>以下のコードには型エラーが含まれています。次のセクションで修正します。</docs-info>

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

## パラメータの検証とレスポンスの送出

TypeScript が怒っています。TypeScript をハッピーにして、それがどのような考慮事項を強制するか見てみましょう。

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

まず、このコードが強調している最初の問題は、ファイル名とコード間でパラメータの名前が間違っている可能性があることです（ファイル名を変更したかもしれません！）。`invariant` は、コードの潜在的な問題を予測した際に、カスタムメッセージ付きのエラーをスローするのに便利な関数です。

次に、`useLoaderData<typeof loader>()` は、コンタクトを取得したか、`null` を取得したかを知っています（その ID のコンタクトが存在しない可能性があります）。この潜在的な `null` は、コンポーネントコードにとって面倒であり、TypeScript のエラーが依然として飛び回っています。

コンポーネントコードでコンタクトが見つからない可能性に対処できますが、Web 的なやり方としては、適切な 404 を送信することです。ローダーでこれを行うことで、すべての問題を一度に解決できます。

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

これで、ユーザーが見つからない場合、このパスでのコード実行は停止し、Remix は代わりにエラーパスをレンダリングします。Remix のコンポーネントは、ハッピーパスにのみ集中できます 😁

## データの変更

最初の連絡先をすぐに作成しますが、まずはHTMLについてお話しましょう。

Remixは、データ変更のプリミティブとしてHTMLフォームのナビゲーションをエミュレートします。これは、JavaScriptのカンブリアン爆発以前は唯一の方法でした。そのシンプルさに惑わされないでください！Remixのフォームは、クライアントサイドでレンダリングされるアプリのUX機能を、「旧式の」Webモデルのシンプルさで実現します。

一部のWeb開発者には馴染みがありませんが、HTMLの`form`は、リンクをクリックするのと同様に、ブラウザ内でナビゲーションを引き起こします。唯一の違いはリクエストにあります。リンクはURLのみを変更できますが、`form`はリクエストメソッド（`GET`と`POST`）とリクエストボディ（`POST`フォームデータ）も変更できます。

クライアントサイドルーティングがない場合、ブラウザは`form`のデータを自動的にシリアライズし、`POST`のリクエストボディとして、そして`GET`の場合は[`URLSearchParams`][url-search-params]としてサーバーに送信します。Remixも同じことを行いますが、サーバーにリクエストを送信する代わりに、クライアントサイドルーティングを使用して、ルートの[`action`][action]関数に送信します。

アプリの「新規」ボタンをクリックして、これを試すことができます。

<img class="tutorial" loading="lazy" src="/docs-images/contacts/09.webp" />

Remixは、このフォームナビゲーションを処理するサーバー側のコードがないため、405エラーを送信します。


[url-search-params]:  (URLSearchParamsの説明へのリンクをここに挿入)
[action]: (action関数の説明へのリンクをここに挿入)

## 連絡先の作成

ルートルートから`action`関数をエクスポートすることで、新しい連絡先を作成します。ユーザーが「新規」ボタンをクリックすると、フォームがルートルートアクションに`POST`されます。

👉 **`app/root.tsx`から`action`関数をエクスポートする**

```tsx filename=app/root.tsx lines=[3,5-8]
// 既存のインポート

import { createEmptyContact, getContacts } from "./data";

export const action = async () => {
  const contact = await createEmptyContact();
  return json({ contact });
};

// 既存のコード
```

以上です！「新規」ボタンをクリックしてみてください。新しいレコードがリストに追加されるはずです🥳

<img class="tutorial" loading="lazy" src="/docs-images/contacts/11.webp" />

`createEmptyContact`メソッドは、名前やデータのない空の連絡先を作成するだけです。しかし、レコードは確実に作成されます！

> 🧐ちょっと待ってください…サイドバーはどうやって更新されたのですか？`action`関数をどこで呼び出しましたか？データを再取得するコードはどこにありますか？`useState`、`onSubmit`、`useEffect`はどこにありますか？！

ここで「旧来のウェブ」プログラミングモデルが登場します。[`<Form>`][form-component]は、ブラウザがサーバーへのリクエストを送信するのを防ぎ、代わりに[`fetch`][fetch]を使用してルートの`action`関数に送信します。

ウェブのセマンティクスでは、`POST`は通常、データが変更されていることを意味します。慣例により、Remixはこのヒントを使用して、`action`が完了した後にページのデータを自動的に再検証します。

実際、すべてがHTMLとHTTPであるため、JavaScriptを無効にしても、すべて正常に機能します。Remixがフォームをシリアル化してサーバーに[`fetch`][fetch]リクエストを行う代わりに、ブラウザがフォームをシリアル化してドキュメントリクエストを行います。そこからRemixはサーバーサイドでページをレンダリングし、送信します。最終的には同じUIになります。

しかし、ファビコンの回転や静的なドキュメントよりも優れたユーザーエクスペリエンスを作成するため、JavaScriptは保持します。


[form-component]: <必要なリンクを挿入>
[fetch]: <必要なリンクを挿入>

## データの更新

新しいレコードの情報を入力する方法を追加しましょう。

データの作成と同様に、[`<Form>`][form-component] を使用してデータを更新します。`app/routes/contacts.$contactId_.edit.tsx` に新しいルートを作成しましょう。

👉 **編集コンポーネントの作成**

```shellscript nonumber
touch app/routes/contacts.\$contactId_.edit.tsx
```

`$contactId_` の奇妙な `_` に注目してください。デフォルトでは、ルートは同じプレフィックス名のルート内に自動的にネストされます。末尾に `_` を追加すると、ルートは `app/routes/contacts.$contactId.tsx` 内に**ネストされません**。詳細は[ルートファイルの命名規則][routes-file-conventions]ガイドを参照してください。

👉 **編集ページUIの追加**

これまでに見たことのないものはありません。自由にコピー＆ペーストしてください。

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

<img class="tutorial" loading="lazy" src="/docs-images/contacts/12.webp" />

## `FormData` を使用した連絡先の更新

作成したばかりの編集ルートにはすでに `form` がレンダリングされています。必要なのは `action` 関数の追加だけです。Remix は `form` をシリアライズし、[`fetch`][fetch] を使用して `POST` し、すべてのデータを自動的に再検証します。

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

フォームに記入して保存すると、このような表示になります！<small>(ただし、見やすく、毛深い部分は少ないかもしれません。)</small>

<img class="tutorial" loading="lazy" src="/docs-images/contacts/13.webp" />

## ミューテーションに関する議論

> 😑 動いたけど、何が起きているのか全くわからない…

少し詳しく見ていきましょう。

`contacts.$contactId_.edit.tsx`を開き、「form」要素を見てください。それぞれに`name`属性が付いていることに注目してください。

```tsx filename=app/routes/contacts.$contactId_.edit.tsx lines=[4]
<input
  aria-label="First name"
  defaultValue={contact.first}
  name="first"
  placeholder="First"
  type="text"
/>
```

JavaScriptがない場合、フォームが送信されると、ブラウザは[`FormData`][form-data]を作成し、それをサーバーに送信する際の要求の本文として設定します。前に述べたように、Remixはそれを防ぎ、代わりに[`fetch`][fetch]を使用して`action`関数に要求を送信することでブラウザをエミュレートし、[`FormData`][form-data]を含めます。

`form`内の各フィールドは`formData.get(name)`でアクセスできます。例えば、上記の入力フィールドの場合、名と姓にはこのようにアクセスできます。

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

フォームフィールドがいくつかあるため、[`Object.fromEntries`][object-from-entries]を使用してそれらをすべてオブジェクトに収集しました。これはまさに`updateContact`関数が求めているものです。

```tsx filename=app/routes/contacts.$contactId_.edit.tsx nocopy
const updates = Object.fromEntries(formData);
updates.first; // "Some"
updates.last; // "Name"
```

`action`関数以外では、ここで説明しているAPIはRemixによって提供されているものではありません。[`request`][request]、[`request.formData`][request-form-data]、[`Object.fromEntries`][object-from-entries]はすべてWebプラットフォームによって提供されています。

`action`関数が完了した後、最後にある[`redirect`][redirect]に注目してください。

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

`action`関数と`loader`関数はどちらも[`Response`][returning-response-instances]を返すことができます（[`Request`][request]を受け取るので当然です！）。[`redirect`][redirect]ヘルパーは、アプリに場所の変更を指示する[`Response`][response]を返すことをより簡単にします。

クライアントサイドルーティングがない場合、`POST`リクエスト後にサーバーがリダイレクトすると、新しいページは最新のデータを取得してレンダリングします。前に学んだように、Remixはこのモデルをエミュレートし、`action`呼び出し後にページのデータを自動的に再検証します。そのため、フォームを保存するとサイドバーが自動的に更新されます。クライアントサイドルーティングがないと、余分な再検証コードは存在しないため、Remixではクライアントサイドルーティングがあっても存在する必要はありません！

最後に1つ。JavaScriptがない場合、[`redirect`][redirect]は通常のredirectになります。しかし、JavaScriptを使用すると、クライアント側のリダイレクトになるため、スクロール位置やコンポーネントの状態などのクライアントの状態が失われることはありません。


[form-data]: https://developer.mozilla.org/en-US/docs/Web/API/FormData
[fetch]: https://developer.mozilla.org/en-US/docs/Web/API/fetch
[object-from-entries]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/fromEntries
[request]: https://developer.mozilla.org/en-US/docs/Web/API/Request
[request-form-data]: https://developer.mozilla.org/en-US/docs/Web/API/Request/formData
[redirect]: https://remix.run/docs/en/v1/api/remix#redirect
[returning-response-instances]: https://remix.run/docs/en/v1/api/remix#loaders-and-actions-can-return-response-instances
[response]: https://developer.mozilla.org/en-US/docs/Web/API/Response


## 新規レコードを編集ページにリダイレクトする

リダイレクトの方法が分かったところで、新規連絡先を作成するアクションを編集ページにリダイレクトするように更新しましょう。

👉 **新規レコードの編集ページにリダイレクトする**

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

これで、「新規」をクリックすると、編集ページが表示されるようになります。

<img class="tutorial" loading="lazy" src="/docs-images/contacts/14.webp" />

## アクティブリンクのスタイル設定

多くのレコードがあるため、サイドバーで現在見ているレコードが分かりにくくなっています。これを修正するために[`NavLink`][nav-link]を使用できます。

👉 **サイドバーで`<Link>`を`<NavLink>`に置き換えてください**

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

`className`に関数を渡していることに注意してください。ユーザーが`<NavLink to>`と一致するURLにいる場合、`isActive`はtrueになります。アクティブになる*直前*（データの読み込み中）の場合、`isPending`はtrueになります。これにより、ユーザーの現在位置を簡単に示し、リンクをクリックしてもデータの読み込みが必要な場合にすぐにフィードバックを提供できます。

<img class="tutorial" loading="lazy" src="/docs-images/contacts/15.webp"/>

## グローバルなPending UI

ユーザーがアプリを操作する際、Remixは次のページのデータ読み込み中は*古いページを表示したままにします*。リスト間をクリックすると、アプリが少し反応が鈍く感じることがあるかもしれません。アプリが反応が鈍いと感じられないように、ユーザーにフィードバックを提供しましょう。

Remixはバックグラウンドで全ての状態を管理しており、動的なウェブアプリを構築するために必要な要素を提供します。このケースでは、[`useNavigation`][use-navigation]フックを使用します。

👉 **`useNavigation`を使ってグローバルなPending UIを追加する**

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

[`useNavigation`][use-navigation]は現在のナビゲーションの状態を返します。状態は`"idle"`、`"loading"`、`"submitting"`のいずれかになります。

この場合、アイドル状態でない場合はアプリの主要部分に`"loading"`クラスを追加します。CSSはその後、短い遅延の後でスムーズなフェードを追加します（高速な読み込み時のUIのちらつきを防ぐため）。ただし、上部にスピナーやローディングバーを表示するなど、何でも行うことができます。

<img class="tutorial" loading="lazy" src="/docs-images/contacts/16.webp" />

## レコードの削除

contact ルートのコードを確認すると、削除ボタンは次のようになっています。

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

`action` が `"destroy"` を指していることに注目してください。`<Link to>` と同様に、`<Form action>` は*相対パス*を取ることができます。フォームは `contacts.$contactId.tsx` でレンダリングされるため、`destroy` という相対的な action を使用すると、クリック時にフォームは `contacts.$contactId.destroy` に送信されます。

この時点で、削除ボタンを動作させるために必要な情報はすべて揃っているはずです。先に進む前に、試してみてはいかがでしょうか？必要なものは次のとおりです。

1. 新しいルート
2. そのルートの `action`
3. `app/data.ts` からの `deleteContact`
4. リダイレクト先

👉 **"destroy" ルートモジュールの作成**

```shellscript nonumber
touch app/routes/contacts.\$contactId_.destroy.tsx
```

👉 **destroy action の追加**

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

さて、レコードに移動して「削除」ボタンをクリックしてください。動作します！

> 😅 まだなぜこれが機能するのかよく分かりません

ユーザーが送信ボタンをクリックすると：

1. `<Form>` は、サーバーに新しいドキュメント `POST` リクエストを送信するというデフォルトのブラウザの動作を阻止しますが、代わりにクライアントサイドルーティングと[`fetch`][fetch]を使用してブラウザをエミュレートし、`POST`リクエストを作成します。
2. `<Form action="destroy">` は、`contacts.$contactId_.destroy.tsx` の新しいルートと一致し、リクエストを送信します。
3. `action` がリダイレクトした後、Remix はページのデータのすべての `loader` を呼び出して最新の値を取得します（これは「再検証」です）。`useLoaderData` は新しい値を返し、コンポーネントが更新されます！

`Form` を追加し、`action` を追加すると、Remix が残りを処理します。

## インデックスルート

アプリをロードすると、リストの右側には大きな空白ページが表示されることに気付くでしょう。

<img class="tutorial" loading="lazy" src="/docs-images/contacts/17.webp" />

ルートに子ルートがあり、親ルートのパスにいる場合、`<Outlet>` は一致する子ルートがないため、何もレンダリングしません。インデックスルートは、そのスペースを埋めるデフォルトの子ルートとして考えることができます。

👉 **ルートルートのインデックスルートを作成する**

```shellscript nonumber
touch app/routes/_index.tsx
```

👉 **インデックスコンポーネントの要素を入力する**

自由にコピー＆ペーストしてください。特別なことは何もありません。

```tsx filename=app/routes/_index.tsx
export default function Index() {
  return (
    <p id="index-page">
      これはRemixのデモです。
      <br />
      <a href="https://remix.run">remix.runのドキュメント</a>をご覧ください。
    </p>
  );
}
```

ルート名`_index`は特別なものです。これはRemixに、ユーザーが親ルートの正確なパスにいる場合、このルートに一致してレンダリングするよう指示します。そのため、`<Outlet />`内にレンダリングする他の子ルートはありません。

<img class="tutorial" loading="lazy" src="/docs-images/contacts/18.webp" />

できました！空白はもうありません。ダッシュボード、統計、フィードなどをインデックスルートに配置することが一般的です。これらはデータの読み込みにも参加できます。

## キャンセルボタン

編集ページには、まだ何も機能していないキャンセルボタンがあります。ブラウザの戻るボタンと同じ動作をするようにしたいです。

ボタンのクリックハンドラーと[`useNavigate`][use-navigate]が必要です。

👉 **`useNavigate`を使ってキャンセルボタンのクリックハンドラーを追加する**

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

あと2つの機能が残っています。ゴールはもうすぐです！

## `URLSearchParams`と`GET`送信

これまでのインタラクティブなUIは、URLを変更するリンクか、`action`関数にデータを送信する`form`のいずれかでした。検索フィールドは、両方の組み合わせであるため興味深いものです。`form`ですが、データは変更せず、URLのみを変更します。

検索フォームを送信すると何が起こるか見てみましょう。

👉 **検索フィールドに名前を入力してEnterキーを押してください**

ブラウザのURLに、クエリが[`URLSearchParams`][url-search-params]として含まれていることに注目してください。

```
http://localhost:5173/?q=ryan
```

`<Form method="post">`ではないため、Remixはブラウザをエミュレートし、リクエストボディではなく[`FormData`][form-data]を[`URLSearchParams`][url-search-params]にシリアル化します。

`loader`関数は、`request`から検索パラメータにアクセスできます。リストのフィルタリングに使用してみましょう。

👉 **`URLSearchParams`があればリストをフィルタリングする**

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

これは`GET`ではなく`POST`であるため、Remixは`action`関数を呼び出しません。`GET`の`form`を送信することは、リンクをクリックすることと同じです。URLだけが変化します。

これは、通常のページナビゲーションであることも意味します。戻るボタンをクリックして、前の状態に戻ることができます。


[url-search-params]: <URLSearchParamsの説明へのリンク>
[form-data]: <FormDataの説明へのリンク>

## URLとフォーム状態の同期化

いくつかのUX上の問題を迅速に解決しましょう。

1. 検索後、戻るボタンをクリックしても、リストはフィルタリングされなくなっているのに、フォームフィールドには入力した値が残っている。
2. 検索後にページを更新すると、リストはフィルタリングされているのに、フォームフィールドには値が入っていない。

つまり、URLと入力の状態が同期していません。

(2)を先に解決し、URLからの値で入力を開始しましょう。

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

これで、検索後にページを更新しても、入力フィールドにクエリが表示されるようになります。

次に、問題(1)、戻るボタンをクリックして入力を更新する方法です。DOM内の入力値を直接操作するために、Reactの`useEffect`を使用できます。

👉 **`URLSearchParams`と入力値を同期させる**

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

> 🤔 コントロールされたコンポーネントとReactの状態を使うべきではないですか？

コントロールされたコンポーネントとして行うこともできます。同期ポイントは増えますが、それはあなた次第です。

<details>

<summary>展開して、それがどうなるか見てください</summary>

```tsx filename=app/root.tsx lines=[2,9-10,12-16,30-33,36-37]
// 既存のインポート
import { useEffect, useState } from "react";

// 既存のインポートとエクスポート

export default function App() {
  const { contacts, q } = useLoaderData<typeof loader>();
  const navigation = useNavigation();
  // クエリは状態に保持する必要があります
  const [query, setQuery] = useState(q || "");

  // 戻る/進むボタンをクリックしたときにクエリをコンポーネント状態に同期させる`useEffect`も残っています
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
                // ユーザーの入力をコンポーネント状態に同期させる
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
      </body>
    </html>
  );
}
```

</details>

これで、戻る/進む/更新ボタンをクリックしても、入力値がURLと結果と同期するようになります。

## `Form`の`onChange`の送信

ここで製品に関する意思決定を行う必要があります。ユーザーに検索結果を絞り込むために`form`を送信させたい場合と、ユーザーが入力するたびに絞り込みたい場合があります。前者は既に実装されているので、後者を見てみましょう。

`useNavigate`は既に見てきましたが、ここではその兄弟である[`useSubmit`][use-submit]を使用します。

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

入力するたびに、`form`が自動的に送信されるようになりました！

[`submit`][use-submit]への引数に注意してください。`submit`関数は、渡されたフォームをシリアル化して送信します。ここでは`event.currentTarget`を渡しています。`currentTarget`は、イベントがアタッチされているDOMノード（`form`）です。


[use-submit]: <a href="https://reactrouter.com/docs/en/v6/hooks/use-submit">https://reactrouter.com/docs/en/v6/hooks/use-submit</a>

## 検索スピナーの追加

本番アプリでは、この検索は、一度にすべてを送信してクライアント側でフィルタリングするには大きすぎるデータベース内のレコードを検索している可能性があります。そのため、このデモでは、ネットワーク遅延を模倣しています。

ローディングインジケーターがないと、検索は少し遅く感じられます。データベースを高速化できたとしても、ユーザーのネットワーク遅延は常に存在し、制御できません。

より良いユーザーエクスペリエンスのために、検索に対する即時のUIフィードバックを追加しましょう。[`useNavigation`][use-navigation]を再び使用します。

👉 **検索中かどうかを知るための変数を追加**

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

何も起こっていない場合、`navigation.location`は`undefined`になりますが、ユーザーがナビゲートすると、データの読み込み中に次の場所が設定されます。その後、`location.search`を使用して、ユーザーが検索しているかどうかを確認します。


👉 **新しい`searching`状態を使用して、検索フォーム要素にクラスを追加**

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

ボーナスとして、検索時にメイン画面をフェードアウトしないようにしましょう。

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

これで、検索入力の左側にスピナーが表示されるようになりました。

<img class="tutorial" loading="lazy" src="/docs-images/contacts/20.webp" />

## ヒストリスタックの管理

フォームはキーストロークごとに送信されるため、「alex」と入力してからバックスペースで削除すると、膨大なヒストリスタックが作成されます😂。これは明らかに避けたいところです。

<img class="tutorial" loading="lazy" src="/docs-images/contacts/21.webp" />

これを回避するには、ヒストリスタックにプッシュするのではなく、現在のエントリを次のページで*置き換える*ことができます。

👉 **`submit`で`replace`を使用する**

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

これが最初の検索かどうかを簡単に確認した後、置き換えるかどうかを決定します。最初の検索では新しいエントリが追加されますが、それ以降のキーストロークはすべて現在のエントリを置き換えます。検索を削除するために7回戻るボタンをクリックする代わりに、ユーザーは1回戻るボタンをクリックするだけで済みます。

## ナビゲーションのない`Form`

これまでのフォームはすべてURLを変更していました。これらのユーザーフローは一般的ですが、ナビゲーションを起こさずにフォームを送信したい場合も同様に一般的です。

このような場合、[`useFetcher`][use-fetcher]を使用します。これにより、ナビゲーションを起こさずに`action`と`loader`と通信できます。

連絡先ページの★ボタンはこれに適しています。新しいレコードを作成または削除しておらず、ページを変更する必要もありません。単に見ているページのデータを変更したいだけです。

👉 **`<Favorite>`フォームをfetcherフォームに変更する**

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

このフォームは、ナビゲーションを引き起こさなくなります。代わりに`action`にフェッチします。ところで…`action`を作成するまでこれは機能しません。

👉 **`action`を作成する**

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

準備完了です。ユーザー名の横にある星をクリックしてみましょう！

<img class="tutorial" loading="lazy" src="/docs-images/contacts/22.webp" />

ご覧のとおり、両方の星が自動的に更新されます。新しい`<fetcher.Form method="post">`は、これまで使用してきた`<Form>`とほぼ同じように機能します。actionを呼び出し、その後すべてのデータが自動的に再検証されます。エラーも同様にキャッチされます。

ただし、重要な違いが1つあります。ナビゲーションではないため、URLは変更されず、履歴スタックも影響を受けません。

## 楽観的UI

前のセクションのお気に入りボタンをクリックした際、アプリが少し反応が鈍く感じたことに気づかれたかもしれません。現実世界でも起こりうるため、ネットワーク遅延を追加しました。

ユーザーにフィードバックを与えるために、[`fetcher.state`][fetcher-state]（以前の`navigation.state`とよく似ています）を使って星をローディング状態にすることもできますが、今回はもっと良い方法があります。「楽観的UI」という戦略を使用できます。

fetcherは`action`に送信されている[`FormData`][form-data]を知っているので、`fetcher.formData`で利用できます。ネットワークが完了する前でも、これを使用して星の状態をすぐに更新します。更新が最終的に失敗した場合、UIは実際のデータに戻ります。

👉 **`fetcher.formData`から楽観的な値を読み取る**

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
};
```

これで、星はクリックしたときに*すぐに*新しい状態に変わります。

***

以上です！Remixを試していただきありがとうございます。このチュートリアルが、素晴らしいユーザーエクスペリエンスを構築するための堅実なスタートになることを願っています。他にも多くのことができるので、ぜひすべてのAPIをチェックしてください😀

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

