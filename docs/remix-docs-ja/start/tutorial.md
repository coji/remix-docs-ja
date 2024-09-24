---
title: チュートリアル (30分)
order: 2
--- 

# Remix チュートリアル

小さいながらも機能豊富なアプリを構築し、連絡先を管理できるようにします。データベースやその他の「本番環境対応」なものは使用しません。そのため、Remix に集中できます。一緒に作業すれば約30分かかります。そうでなければ、簡単に読めるはずです。

<img class="tutorial" src="/docs-images/contacts/01.webp" />

👉 **このマークが表示されたら、アプリで何か操作を行う必要があることを意味します！**

それ以外は、情報提供と理解を深めるためです。始めましょう。 

## セットアップ

👉 **基本テンプレートを生成する**

```shellscript nonumber
npx create-remix@latest --template remix-run/remix/templates/remix-tutorial
```

これは非常にシンプルなテンプレートを使用しますが、CSSとデータモデルが含まれているため、Remix に集中できます。 [クイックスタート][quickstart] では、Remix プロジェクトの基本的なセットアップについて詳しく知ることができます。

👉 **アプリを起動する**

```shellscript nonumber
# アプリのディレクトリに移動する
cd {アプリを置いた場所}

# まだインストールしていない場合は、依存関係をインストールする
npm install

# サーバーを起動する
npm run dev
```

[http://localhost:5173][http-localhost-5173] を開くと、次のようないずれのスタイルも適用されていない画面が表示されるはずです。

<img class="tutorial" src="/docs-images/contacts/03.webp" />

[quickstart]: https://remix.run/docs/en/v1/guides/quick-start
[http-localhost-5173]: http://localhost:5173
## ルートルート

`app/root.tsx` のファイルに注目してください。これは「ルートルート」と呼ばれるものです。UI で最初にレンダリングされるコンポーネントであり、通常はページのグローバルレイアウトが含まれています。

<details>

<summary>ルートコンポーネントコードを見るにはここをクリック</summary>

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

Remix アプリをスタイリングする方法はいくつかありますが、ここでは Remix に焦点を当てて、すでに記述されているプレーンなスタイルシートを使用します。

CSS ファイルを JavaScript モジュールに直接インポートできます。Vite はアセットにフィンガープリントを付け、ビルドのクライアントディレクトリに保存し、モジュールに公開可能な href を提供します。

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

これで、アプリは次のようになります。デザイナーが CSS も書けるのは本当にいいですね。 (ありがとう、[ジム][jim] 🙏)。

<img class="tutorial" loading="lazy" src="/docs-images/contacts/04.webp" />

[links]: https://remix.run/docs/en/v1/api/remix#links-function
[jim]: https://twitter.com/jmeas

## 連絡先ルートUI

サイドバーの項目をクリックすると、デフォルトの404ページが表示されます。 `/contacts/1`に一致するルートを作成しましょう。

👉 **`app/routes`ディレクトリと連絡先ルートモジュールを作成する**

```shellscript nonumber
mkdir app/routes
touch app/routes/contacts.\$contactId.tsx
```

Remixの[ルートファイル規則][routes-file-conventions]では、`.`はURLに`/`を作成し、`$`はセグメントを動的にします。これで、次のようなURLに一致するルートが作成されました。

* `/contacts/123`
* `/contacts/abc`

👉 **連絡先コンポーネントUIを追加する**

これは単なる要素の集まりなので、コピー＆ペーストして構いません。

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
            <button type="submit">編集</button>
          </Form>

          <Form
            action="destroy"
            method="post"
            onSubmit={(event) => {
              const response = confirm(
                "このレコードを削除してもよろしいですか。"
              );
              if (!response) {
                event.preventDefault();
              }
            }}
          >
            <button type="submit">削除</button>
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
            ? "お気に入りから削除する"
            : "お気に入りに追加する"
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

これで、リンクをクリックするか `/contacts/1` にアクセスしても... 新しいものは何も表示されないでしょう？

<img class="tutorial" loading="lazy" alt="空白のメインコンテンツを持つ連絡先ルート" src="/docs-images/contacts/05.webp" />

## ネストされたルートとアウトレット

Remix は React Router をベースに構築されているため、ネストされたルーティングをサポートしています。子ルートを親レイアウト内にレンダリングするには、親内に [`Outlet`][outlet-component] をレンダリングする必要があります。修正するために、`app/root.tsx` を開き、アウトレットをレンダリングしましょう。

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

これで、子ルートがアウトレットを通じてレンダリングされるはずです。

<img class="tutorial" loading="lazy" alt="メインコンテンツを含む連絡先ルート" src="/docs-images/contacts/06.webp" /> 

## クライアントサイドルーティング

サイドバーのリンクをクリックすると、ブラウザはクライアントサイドルーティングではなく、次のURLのフルドキュメントリクエストを実行していることに気づいているかもしれません。

クライアントサイドルーティングを使用すると、アプリケーションはサーバーから別のドキュメントを要求せずに、URLを更新できます。代わりに、アプリはすぐに新しいUIをレンダリングできます。 [`<Link>`][link-component] を使用して、実現してみましょう。

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

ブラウザの開発者ツールでネットワークタブを開くと、もはやドキュメントをリクエストしていないことがわかります。

## データの読み込み

URL セグメント、レイアウト、データは、ほとんどの場合、密接に関連しています（三重に？）。このアプリでもそれがわかります。

| URL セグメント         | コンポーネント   | データ               |
| ------------------- | ----------- | ------------------ |
| /                   | `<Root>`    | 連絡先のリスト   |
| contacts/:contactId | `<Contact>` | 個別の連絡先 |

この自然な結合のために、Remix には、ルートコンポーネントに簡単にデータを取り込むためのデータ規約があります。

データの読み込みには、[`loader`][loader] と [`useLoaderData`][use-loader-data] の 2 つの API を使用します。最初にルートルートに `loader` 関数を定義してエクスポートし、そのデータをレンダリングします。

👉 **`app/root.tsx` から `loader` 関数をエクスポートして、データをレンダリングします**

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

以上です！Remix は、このデータを UI と同期させ続けます。サイドバーは次のようになります。

<img class="tutorial" loading="lazy" src="/docs-images/contacts/07.webp" />

## 型推論

マップ内の `contact` 型について、TypeScript が警告を出していることに気づいたかもしれません。`typeof loader` を使用してデータについて型推論を行うために、簡単な注釈を追加できます。

```tsx filename=app/root.tsx lines=[4]
// 既存のインポートとエクスポート

export default function App() {
  const { contacts } = useLoaderData<typeof loader>();

  // 既存のコード
}
```
## ローダーにおけるURLパラメータ

👉 **サイドバーのリンクをクリックしてください**

以前の静的なコンタクトページが表示されますが、1つだけ違いがあります。URLにレコードの実際のIDが含まれるようになりました。

<img class="tutorial" loading="lazy" src="/docs-images/contacts/08.webp" />

`app/routes/contacts.$contactId.tsx`にあるファイル名の`$contactId`部分を覚えていますか？これらの動的なセグメントは、URLのその位置にある動的な（変化する）値と一致します。これらのURLの値を「URLパラメータ」または単に「パラメータ」と呼びます。

これらの [`params`][params] は、動的なセグメントと一致するキーでローダーに渡されます。たとえば、セグメントの名前は`$contactId`なので、値は`params.contactId`として渡されます。

これらのパラメータは、ほとんどの場合、IDでレコードを見つけるために使用されます。試してみましょう。

👉 **コンタクトページに`loader`関数を追加し、`useLoaderData`でデータにアクセスする**

<docs-info>次のコードには型エラーが含まれています。次のセクションで修正します。</docs-info>

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

## パラメータの検証とレスポンスの投げ方

TypeScript が私たちに怒っています。TypeScript を満足させ、それが私たちにどのような検討を迫るのか見てみましょう。

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

ここで最初に明らかになる問題は、ファイル名とコード間でパラメータの名前が間違っている可能性があることです（ファイル名を変更したのかもしれません！）。Invariant は、コードで潜在的な問題が発生する可能性を予測している場合に、カスタムメッセージと共にエラーをスローする便利な関数です。

次に、`useLoaderData<typeof loader>()` は、コンタクトを取得したか、または `null` を取得したかを認識するようになりました（その ID のコンタクトが存在しない可能性があります）。この潜在的な `null` は、コンポーネントコードにとって煩わしく、TS エラーが飛び交っています。

コンポーネントコードでコンタクトが見つからない可能性に対処することもできますが、ウェブらしいやり方は、適切な 404 を送信することです。これはローダーで実行でき、すべての問題を一度に解決できます。

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

これで、ユーザーが見つからない場合、このパスでのコードの実行は停止し、Remix は代わりにエラーパスをレンダリングします。Remix のコンポーネントは、ハッピーパスにのみ焦点を当てることができます 😁

## データの変更

最初のコンタクトは後で作成しますが、まずはHTMLについて説明します。

Remixは、データ変更のプリミティブとして、HTMLフォームナビゲーションをエミュレートします。これは、JavaScriptのカンブリア爆発以前は唯一の方法でした。シンプルさに騙されてはいけません！Remixのフォームは、クライアント側のレンダリングアプリケーションのUX機能と、「旧式の」Webモデルのシンプルさを兼ね備えています。

一部のWeb開発者には馴染みが薄いかもしれませんが、HTMLの`form`は実際には、リンクをクリックするのと同じように、ブラウザ内でナビゲーションを引き起こします。唯一の違いはリクエストにあります。リンクはURLのみを変更できますが、`form`はリクエストメソッド（`GET` vs. `POST`）とリクエストボディ（`POST`フォームデータ）も変更できます。

クライアント側のルーティングがない場合、ブラウザは`form`のデータを自動的にシリアル化し、`POST`のリクエストボディとして、`GET`のリクエストボディとして[`URLSearchParams`][url-search-params]としてサーバーに送信します。Remixは同じことを行いますが、サーバーにリクエストを送信する代わりに、クライアント側のルーティングを使用して、ルートの[`action`][action]関数に送信します。

これは、アプリケーションの「新規」ボタンをクリックすることで確認できます。

<img class="tutorial" loading="lazy" src="/docs-images/contacts/09.webp" />

Remixは、このフォームナビゲーションを処理するサーバー側のコードがないため、405を返します。

[url-search-params]: https://developer.mozilla.org/en-US/docs/Web/API/URLSearchParams
[action]: https://remix.run/docs/en/v1/api/conventions#actions
## 連絡先の作成

ルートルートに `action` 関数をエクスポートして、新しい連絡先を作成します。ユーザーが「新規」ボタンをクリックすると、フォームはルートルートアクションに `POST` します。

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

以上です！「新規」ボタンをクリックすると、リストに新しいレコードが追加されます🥳

<img class="tutorial" loading="lazy" src="/docs-images/contacts/11.webp" />

`createEmptyContact` メソッドは、名前やデータを持たない空の連絡先を作成するだけです。しかし、それでもレコードは作成されます！

> 🧐 えっと、サイドバーはどうやって更新されたのでしょうか？どこで `action` 関数を呼び出したのでしょうか？データを再取得するコードはどこにあるのでしょうか？`useState`、`onSubmit`、`useEffect`はどこにあるのでしょうか？

ここで、"古いウェブ" プログラミングモデルが登場します。 [`<Form>`][form-component] は、ブラウザがサーバーにリクエストを送信するのを阻止し、代わりに [`fetch`][fetch] を使用してルートの `action` 関数に送信します。

ウェブのセマンティクスでは、`POST` は通常、データが変更されていることを意味します。慣習的に、Remix はこれをヒントとして使用し、`action` が完了した後にページのデータを自動的に再検証します。

実際、すべてが HTML と HTTP であるため、JavaScript を無効にしても、すべてが動作します。Remix がフォームをシリアライズしてサーバーに [`fetch`][fetch] リクエストを行う代わりに、ブラウザがフォームをシリアライズしてドキュメントリクエストを行います。そこから、Remix はページをサーバー側でレンダリングして送信します。最終的には、どちらの場合も UI は同じです。

しかし、回転するファビコンや静的なドキュメントよりも優れたユーザーエクスペリエンスを提供するため、JavaScript を使い続けましょう。 

## データの更新

新しいレコードの情報を入力できるようにしましょう。

データの作成と同様に、[`<Form>`][form-component] を使用してデータを更新します。 `app/routes/contacts.$contactId_.edit.tsx` に新しいルートを作成しましょう。

👉 **編集コンポーネントの作成**

```shellscript nonumber
touch app/routes/contacts.\$contactId_.edit.tsx
```

`$contactId_` の奇妙な `_` に注目してください。デフォルトでは、ルートは同じプレフィックス名を持つルート内に自動的にネストされます。末尾に `_` を追加すると、ルートは `app/routes/contacts.$contactId.tsx` 内に **ネストされません**。[ルートファイルの命名規則][routes-file-conventions] ガイドで詳しく説明されています。

👉 **編集ページ UI の追加**

これまで見たことのないものはありません。コピー＆ペーストして構いません。

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

これで、新しいレコードをクリックして「Edit」ボタンをクリックすると、新しいルートが表示されます。

<img class="tutorial" loading="lazy" src="/docs-images/contacts/12.webp" />

[form-component]: https://remix.run/docs/en/v1/api/remix#form
[routes-file-conventions]: https://remix.run/docs/en/v1/guides/routing#route-file-naming

## `FormData` を使用して連絡先を更新する

作成した編集ルートは既に `form` をレンダリングしています。必要なのは `action` 関数 を追加することだけです。Remix は `form` をシリアライズし、 [`fetch`][fetch] を使用して `POST` し、自動的にすべてのデータを再検証します。

👉 **編集ルートに `action` 関数を追加します**

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

フォームに情報を入力して保存ボタンを押すと、以下のような画面が表示されます！<small>(見やすくて、それほど複雑ではありません。)</small>

<img class="tutorial" loading="lazy" src="/docs-images/contacts/13.webp" /> 

## 変異に関する議論

> 😑 動いたけど、何が起きているのか全くわからない…

ちょっと詳しく見てみましょう。

`contacts.$contactId_.edit.tsx` を開いて、`form` 要素を見てください。各要素には名前が付けられていることに注目してください。

```tsx filename=app/routes/contacts.$contactId_.edit.tsx lines=[4]
<input
  defaultValue={contact.first}
  aria-label="First name"
  name="first"
  type="text"
  placeholder="First"
/>
```

JavaScript がなければ、フォームが送信されると、ブラウザは [`FormData`][form-data] を作成し、サーバーに送信する際にリクエストのボディとして設定します。前述のように、Remix はこれを防ぎ、ブラウザをエミュレートして [`fetch`][fetch] を使用して [`FormData`][form-data] を含めて `action` 関数にリクエストを送信します。

`form` 内の各フィールドは、`formData.get(name)` でアクセスできます。たとえば、上記の入力フィールドの場合、次のようにして姓と名をアクセスできます。

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

フォームフィールドがいくつかあるので、[`Object.fromEntries`][object-from-entries] を使用してそれらをすべてオブジェクトにまとめました。これは、`updateContact` 関数が必要とするものです。

```tsx filename=app/routes/contacts.$contactId_.edit.tsx nocopy
const updates = Object.fromEntries(formData);
updates.first; // "Some"
updates.last; // "Name"
```

`action` 関数以外では、これらの API は Remix で提供されていません。[`request`][request]、[`request.formData`][request-form-data]、[`Object.fromEntries`][object-from-entries] はすべて Web プラットフォームで提供されています。

`action` 関数が完了したら、最後に [`redirect`][redirect] に注目してください。

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

`action` 関数と `loader` 関数は両方とも [Response を返す][returning-response-instances] ことができます（`Request`[request] を受け取るため、理にかなっています！）。[`redirect`][redirect] ヘルパーは、アプリに場所を変更するように指示する [`Response`][response] を返すことを簡単にするだけです。

クライアントサイドのルーティングがなければ、`POST` リクエスト後にサーバーがリダイレクトした場合、新しいページは最新のデータをフェッチしてレンダリングします。前に学んだように、Remix はこのモデルをエミュレートし、`action` 呼び出しの後、ページ上のデータを自動的に再検証します。これが、フォームを保存するとサイドバーが自動的に更新される理由です。クライアントサイドのルーティングがなければ、追加の再検証コードは存在しません。したがって、Remix のクライアントサイドのルーティングでは存在する必要はありません！

最後に、JavaScript がなければ、[`redirect`][redirect] は通常の redirect になります。しかし、JavaScript があれば、それはクライアントサイドの redirect になります。そのため、スクロール位置やコンポーネントの状態など、クライアントの状態が失われることはありません。

[form-data]: https://developer.mozilla.org/en-US/docs/Web/API/FormData
[fetch]: https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API
[object-from-entries]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/fromEntries
[request]: https://developer.mozilla.org/en-US/docs/Web/API/Request
[request-form-data]: https://developer.mozilla.org/en-US/docs/Web/API/Request/formData
[returning-response-instances]: https://remix.run/docs/en/v1/api/conventions#returning-response-instances
[redirect]: https://remix.run/docs/en/v1/api/utils#redirect
[response]: https://developer.mozilla.org/en-US/docs/Web/API/Response

## 新規レコードを編集ページにリダイレクトする

リダイレクトする方法がわかったところで、新規連絡先を作成するアクションを更新して、編集ページにリダイレクトするようにしましょう。

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

これで、「新規」をクリックすると、編集ページが表示されるはずです。

<img class="tutorial" loading="lazy" src="/docs-images/contacts/14.webp" /> 

## アクティブリンクのスタイリング

これでレコードがたくさんできましたが、サイドバーでどのレコードを見ているのか分かりません。これを修正するために、[`NavLink`][nav-link] を使用できます。

👉 **サイドバーの `<Link>` を `<NavLink>` に置き換えてください**

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

`className` に関数を渡していることに注目してください。ユーザーが `<NavLink to>` に一致する URL にいる場合、`isActive` は true になります。アクティブになろうとしている時（データがまだ読み込まれている時）は、`isPending` が true になります。これにより、ユーザーがどこにいるかを簡単に示し、リンクをクリックしてもデータが読み込まれる必要がある場合にすぐにフィードバックを提供できます。

<img class="tutorial" loading="lazy" src="/docs-images/contacts/15.webp"/> 

## グローバル保留中のUI

ユーザーがアプリ内を移動する際、Remix は次のページのデータが読み込まれる間、*古いページを表示したままにします*。リスト間をクリックする際にアプリが少し反応していないように感じるかもしれません。アプリが反応していないように感じないように、ユーザーにフィードバックを提供しましょう。

Remixは、ダイナミックなWebアプリを構築するために必要な部分を明らかにし、バックグラウンドですべての状態を管理しています。この場合、[`useNavigation`][use-navigation]フックを使用します。

👉 **`useNavigation`を使ってグローバル保留中のUIを追加する**

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

// 既存のインポート＆エクスポート

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

[`useNavigation`][use-navigation]は、現在のナビゲーション状態を返します。状態は`"idle"`、`"loading"`、`"submitting"`のいずれかになります。

この場合、アイドル状態ではない場合は、アプリのメイン部分に`"loading"`クラスを追加します。CSSはその後、短い遅延後にフェードを追加します（高速読み込み時のUIのちらつきを防ぐため）。スピナーを表示したり、トップにロードバーを表示したりなど、好きなようにすることができます。

<img class="tutorial" loading="lazy" src="/docs-images/contacts/16.webp" />

[use-navigation]: https://remix.run/docs/en/v1/api/remix#usenavigation
## レコードの削除

連絡先ルートのコードを確認すると、削除ボタンは次のようになっていることがわかります。

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

`action`が`"destroy"`を指していることに注目してください。 `<Link to>`と同様に、 `<Form action>`は*相対*値を取ることができます。 フォームは`contacts.$contactId.tsx`でレンダリングされるため、`destroy`という相対的なアクションは、クリックされると`contacts.$contactId.destroy`にフォームを送信します。

この時点で、削除ボタンを動作させるために必要なことはすべてわかっているはずです。 次に進める前に、自分で試してみてはいかがでしょうか？ 次のようなものが必要です。

1. 新しいルート
2. そのルートの`action`
3. `app/data.ts`から`deleteContact`
4. どこかに`redirect`する

👉 **"destroy"ルートモジュールを作成する**

```shellscript nonumber
touch app/routes/contacts.\$contactId.destroy.tsx
```

👉 **destroyアクションを追加する**

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

これで、レコードに移動して「削除」ボタンをクリックできます。 動作します！

> 😅 どうしてこれが機能するのかまだわかりません

ユーザーが送信ボタンをクリックすると、次のようになります。

1. `<Form>`は、サーバーに新しいドキュメント`POST`リクエストを送信するというブラウザのデフォルトの動作を阻止しますが、代わりにクライアントサイドルーティングと[`fetch`][fetch]を使用してブラウザをエミュレートし、`POST`リクエストを作成します
2. `<Form action="destroy">`は`"contacts.$contactId.destroy"`の新しいルートと一致し、リクエストを送信します
3. `action`がリダイレクトされた後、Remixはページ上のデータのすべての`loader`を呼び出して最新値を取得します（これは「再検証」です）。 `useLoaderData`は新しい値を返し、コンポーネントを更新します！

`Form`を追加し、`action`を追加すると、Remixが処理します。

[fetch]: https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API

## インデックスルート

アプリを起動すると、リストの右側には何も表示されない大きな空白ページが表示されます。

<img class="tutorial" loading="lazy" src="/docs-images/contacts/17.webp" />

ルートに子ルートがある場合、親ルートのパスにいるときは、 `<Outlet>` は一致する子ルートがないため、レンダリングするものが何もありません。インデックスルートは、その空白を埋めるためのデフォルトの子ルートと考えることができます。

👉 **ルートルートのインデックスルートを作成します**

```shellscript nonumber
touch app/routes/_index.tsx
```

👉 **インデックスコンポーネントの要素を埋めます**

コピーして貼り付けてください。特別なことは何もありません。

```tsx filename=app/routes/_index.tsx
export default function Index() {
  return (
    <p id="index-page">
      これは Remix のデモです。
      <br />
      <a href="https://remix.run">remix.run のドキュメント</a> を見てください。
    </p>
  );
}
```

ルート名 `_index` は特別です。Remix に、ユーザーが親ルートの正確なパスにいる場合、 `<Outlet />` でレンダリングする他の子ルートがないため、このルートを一致させてレンダリングするように指示します。

<img class="tutorial" loading="lazy" src="/docs-images/contacts/18.webp" />

ほら、空白がなくなりましたね！インデックスルートには、ダッシュボード、統計、フィードなどを配置するのが一般的です。インデックスルートは、データの読み込みにも参加できます。

## キャンセルボタン

編集ページには、まだ何も機能していないキャンセルボタンがあります。ブラウザの戻るボタンと同じように動作させたいです。

ボタンにはクリックハンドラーと、[`useNavigate`][use-navigate] が必要になります。

👉 **`useNavigate` を使用してキャンセルボタンのクリックハンドラーを追加**

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

これで、ユーザーが「キャンセル」をクリックすると、ブラウザの履歴で1つ前のエントリに戻ります。

> 🧐 なぜボタンに `event.preventDefault()` がないのですか？

`<button type="button">` は、一見冗長ですが、ボタンがフォームを送信するのを防ぐ HTML の方法です。

あと2つの機能が残っています。ゴールはもうすぐです！ 

## `URLSearchParams` と `GET` 提出

これまでのインタラクティブな UI は、URL を変更するリンクか、`action` 関数にデータを送信する `form` のいずれかでした。検索フィールドは、両方の組み合わせという点で興味深いものです。`form` である一方で、データは変更せず、URL を変更するだけです。

検索フォームを送信すると何が起こるか見てみましょう。

👉 **検索フィールドに名前を入力して Enter キーを押します**

ブラウザの URL に、クエリが [`URLSearchParams`][url-search-params] として含まれていることに注目してください。

```
http://localhost:5173/?q=ryan
```

`<Form method="post">` ではないため、Remix はブラウザをエミュレートし、[`FormData`][form-data] をリクエストボディではなく [`URLSearchParams`][url-search-params] にシリアル化します。

`loader` 関数は、`request` から検索パラメータにアクセスできます。これを利用してリストをフィルタリングしてみましょう。

👉 **`URLSearchParams` があればリストをフィルタリングする**

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

これは `POST` ではなく `GET` なので、Remix は `action` 関数を呼び出しません。`GET` `form` を送信することは、リンクをクリックするのと同じです。URL が変わるだけです。

これは、通常のページナビゲーションでもあることを意味します。戻るボタンをクリックすると、元の場所に戻ることができます。
## URL とフォームステートの同期化

ここに、すぐに対応できる UX 上の問題点がいくつかあります。

1. 検索後に「戻る」をクリックすると、リストがフィルタリングされなくなっても、フォームフィールドには入力した値が残ります。
2. 検索後にページをリフレッシュすると、リストがフィルタリングされているにもかかわらず、フォームフィールドには値が入らなくなります。

つまり、URL と入力のステートが同期していません。

まず (2) を解決し、URL から値を取得して入力のデフォルト値として設定してみましょう。

👉 **`loader` から `q` を返し、入力のデフォルト値として設定する**

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
                aria-label="検索"
                defaultValue={q || ""}
                id="q"
                name="q"
                placeholder="検索"
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

これで、検索後にページをリフレッシュしても、入力フィールドにクエリが表示されるようになりました。

次に、問題 (1) である「戻る」ボタンをクリックして入力値を更新する方法についてです。React の `useEffect` を使用して、DOM の入力値を直接操作することができます。

👉 **`URLSearchParams` と入力値を同期化する**

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

> 🤔 コントロールされたコンポーネントと React ステートを使用すべきではないでしょうか？

コントロールされたコンポーネントとして実装することもできます。同期ポイントは増えますが、どちらの方法を選ぶかはあなた次第です。

<details>

<summary>展開して、どのように見えるか確認してください</summary>

```tsx filename=app/root.tsx lines=[2,9-10,12-16,30-33,36-37]
// 既存のインポート
import { useEffect, useState } from "react";

// 既存のインポートとエクスポート

export default function App() {
  const { contacts, q } = useLoaderData<typeof loader>();
  const navigation = useNavigation();
  // クエリはステートに保持する必要があります
  const [query, setQuery] = useState(q || "");

  // `useEffect` を使用して、バック/フォワードボタンクリック時にクエリをコンポーネントステートに同期します。
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
                aria-label="検索"
                id="q"
                name="q"
                // ユーザーの入力をコンポーネントステートに同期
                onChange={(event) =>
                  setQuery(event.currentTarget.value)
                }
                placeholder="検索"
                type="search"
                // `defaultValue` から `value` に変更
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

これで、バック/フォワード/リフレッシュボタンをクリックしても、入力値が URL と結果と同期されるようになりました。

## `Form` の `onChange` の提出

ここでは、製品に関する意思決定を行う必要があります。ユーザーに `form` を送信して結果をフィルタリングさせたい場合と、ユーザーが入力するたびにフィルタリングさせたい場合があります。前者はすでに実装しているので、後者について見てみましょう。

すでに `useNavigate` を見てきましたが、ここではその兄弟である [`useSubmit`][use-submit] を使用します。

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

入力するたびに、`form` が自動的に送信されます！

[`submit`][use-submit] への引数に注意してください。`submit` 関数は、渡されたフォームをシリアル化して送信します。ここでは、`event.currentTarget` を渡しています。`currentTarget` は、イベントがアタッチされている DOM ノード（`form`）です。 

## 検索スピナーの追加

本番環境のアプリでは、検索はデータベース内のレコードを検索することになり、データベースが大きすぎて一度にすべてを送信してクライアント側でフィルターすることはできません。そのため、このデモでは、疑似的なネットワーク遅延を導入しています。

ローディングインジケーターがない場合、検索は少し遅く感じられます。データベースを高速化できたとしても、ユーザーのネットワーク遅延は常に発生し、制御できません。

より良いユーザーエクスペリエンスのために、検索にすぐにUIフィードバックを追加しましょう。[`useNavigation`][use-navigation] を再び使用します。

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

何も起こっていない場合、`navigation.location` は `undefined` になります。しかし、ユーザーがナビゲートすると、データがロードされている間、次の場所に情報が入ります。その後、`location.search` を使用して、ユーザーが検索しているかどうかを確認します。

👉 **新しい `searching` ステートを使用して、検索フォーム要素にクラスを追加する**

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

さらに、検索中にメイン画面がフェードアウトしないようにしましょう。

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

これで、検索入力の左側にある素敵なスピナーが表示されるはずです。

<img class="tutorial" loading="lazy" src="/docs-images/contacts/20.webp" />

## ヒストリースタックの管理

フォームはキーストロークごとに送信されるため、"alex"と入力してからバックスペースで削除すると、巨大なヒストリースタックが作成されます😂。 これは明らかに望ましくありません。

<img class="tutorial" loading="lazy" src="/docs-images/contacts/21.webp" />

これを回避するために、ヒストリースタックにプッシュするのではなく、現在のエントリを次のページで*置き換える*ことができます。

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

これは最初の検索かどうかをすばやく確認した後、置き換えるかどうかを決定します。 最初の検索では新しいエントリが追加されますが、それ以降のキーストロークでは現在のエントリが置き換えられます。 検索を削除するために7回戻る代わりに、ユーザーは1回戻るだけで済みます。 

## ナビゲーションを行わない `Form`

これまでのフォームはすべて URL を変更していました。これらのユーザーフローは一般的ですが、ナビゲーションを起こさずにフォームを送信したい場合も同様に一般的です。

このような場合、[`useFetcher`][use-fetcher] を使用できます。これにより、ナビゲーションを起こすことなく `action` と `loader` と通信することができます。

連絡先ページの ★ ボタンは、この場合に適しています。新しいレコードを作成したり削除したりするわけではなく、ページを変更する必要もありません。単に見ているページのデータを変更するだけです。

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
            ? "お気に入りに追加"
            : "お気に入りから削除"
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

このフォームは、ナビゲーションを起こすことはなく、単に `action` にフェッチします。ところで… `action` を作成するまでこれは動作しません。

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
  invariant(params.contactId, "contactId パラメータがありません");
  const formData = await request.formData();
  return updateContact(params.contactId, {
    favorite: formData.get("favorite") === "true",
  });
};

// 既存のコード
```

これで、ユーザー名の横の星をクリックする準備ができました！

<img class="tutorial" loading="lazy" src="/docs-images/contacts/22.webp" />

見てください、両方の星が自動的に更新されます。新しい `<fetcher.Form method="post">` は、これまで使ってきた `<Form>` とほぼ同じように動作します。 `action` を呼び出し、すべてのデータが自動的に再検証されます — エラーも同様にキャッチされます。

ただし、1 つの重要な違いがあります。これはナビゲーションではないため、URL は変更されず、履歴スタックも影響を受けません。

## 楽観的 UI

前のセクションで「お気に入り」ボタンをクリックしたとき、アプリが少し反応が鈍かったことに気づいたかもしれません。もう一度、ネットワークの遅延を追加しました。なぜなら、それは現実世界では必ず発生するからです。

ユーザーにフィードバックを与えるために、[`fetcher.state`][fetcher-state]（前の`navigation.state`とよく似ています）を使用して、星をロード状態にすることもできますが、今回はもっと良い方法があります。「楽観的 UI」と呼ばれる戦略を使用できます。

fetcherは、`action`に送信される[`FormData`][form-data]を知っているので、`fetcher.formData`で利用できます。これを利用して、ネットワークが完了する前に、星の状態をすぐに更新します。更新が最終的に失敗した場合、UIは実際のデータに戻ります。

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

これで、星はクリックするとすぐに新しい状態に*すぐに*変わります。

***

以上です！Remixを試してくれてありがとうございます。このチュートリアルが、素晴らしいユーザーエクスペリエンスを構築するための堅実なスタートとなることを願っています。もっと多くのことができるので、すべてのAPIを必ず確認してください 😀

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

