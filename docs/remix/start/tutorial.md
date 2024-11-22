---
title: チュートリアル (30分)
order: 2
--- 

# Remix チュートリアル

小さくても機能豊富な連絡先管理アプリを作成します。データベースやその他の「本番環境対応」なものは使用しないので、Remix に集中できます。一緒に進めていれば約 30 分で完了しますが、そうでなければ素早く読める内容です。

<img class="tutorial" src="/docs-images/contacts/01.webp" />

👉 **これが表示される場合は、アプリで何か操作する必要があります！**

残りは情報提供と理解を深めるためのものです。早速始めましょう。 

## セットアップ

👉 **基本テンプレートを生成する**

```shellscript nonumber
npx create-remix@latest --template remix-run/remix/templates/remix-tutorial
```

これは非常にシンプルなテンプレートを使用しますが、CSSとデータモデルが含まれているため、Remixに集中できます。詳細を知りたい場合は、[クイックスタート][quickstart]でRemixプロジェクトの基本的なセットアップについて知ることができます。

👉 **アプリを起動する**

```shellscript nonumber
# アプリディレクトリに移動します。
cd {アプリの場所}

# まだインストールしていない場合は依存関係をインストールします。
npm install

# サーバーを起動します。
npm run dev
```

[http://localhost:5173][http-localhost-5173]を開くと、次のようなスタイルのない画面が表示されます。

<img class="tutorial" src="/docs-images/contacts/03.webp" />

[quickstart]: https://remix.run/docs/en/v1/guides/quick-start
## ルートルート

`app/root.tsx` のファイルに注目してください。これは「ルートルート」と呼ばれるものです。これは UI で最初にレンダリングされるコンポーネントなので、通常はページのグローバルレイアウトが含まれています。

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

## `links` を使ったスタイルシートの追加

Remix アプリのスタイル設定には複数の方法がありますが、ここでは、Remix に焦点を当てるために、事前に記述されたプレーンなスタイルシートを使用します。

CSS ファイルは JavaScript モジュールに直接インポートできます。Vite はアセットのフィンガープリントを作成し、ビルドのクライアントディレクトリに保存し、モジュールに公開可能な href を提供します。

👉 **アプリスタイルをインポートする**

```tsx filename=app/root.tsx lines=[1,4,6-8]
import type { LinksFunction } from "@remix-run/node";
// 既存のインポート

import appStylesHref from "./app.css?url";

export const links: LinksFunction = () => [
  { rel: "stylesheet", href: appStylesHref },
];
```

すべてのルートは [`links`][links] 関数をエクスポートできます。これらは収集され、`app/root.tsx` でレンダリングした `<Links />` コンポーネントにレンダリングされます。

アプリは、このようになっているはずです。デザイナーが CSS も書けるのは素晴らしいですね。([ジム][jim] さん、ありがとうございます 🙏)。

<img class="tutorial" loading="lazy" src="/docs-images/contacts/04.webp" />

[links]: https://remix.run/docs/en/v1/api/links
[jim]: https://twitter.com/jim_nielsen

## 連絡先ルート UI

サイドバーの項目をクリックすると、デフォルトの 404 ページが表示されます。 `/contacts/1` に一致するルートを作成しましょう。

👉 **`app/routes` ディレクトリと連絡先ルートモジュールを作成する**

```shellscript nonumber
mkdir app/routes
touch app/routes/contacts.\$contactId.tsx
```

Remix の [ルートファイル規則][routes-file-conventions] において、`.` は URL に `/` を作成し、`$` はセグメントを動的にします。 これにより、次のような URL に一致するルートが作成されました。

* `/contacts/123`
* `/contacts/abc`

👉 **連絡先コンポーネント UI を追加する**

これは単なる要素の集まりです。 コピーして貼り付けることができます。

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
            <button type="submit">編集</button>
          </Form>

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
            ? "お気に入りから削除"
            : "お気に入りに追加"
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

リンクをクリックしたり、`/contacts/1` にアクセスしたりしても、...何も変わりませんか？

<img class="tutorial" loading="lazy" alt="メインコンテンツが空白の連絡先ルート" src="/docs-images/contacts/05.webp" />

[routes-file-conventions]: https://remix.run/docs/en/v1/guides/routing#file-conventions
## ネストされたルートとアウトレット

Remix は React Router をベースに構築されているため、ネストされたルーティングをサポートしています。子ルートを親レイアウト内にレンダリングするには、親に [`Outlet`][outlet-component] をレンダリングする必要があります。修正してみましょう。`app/root.tsx` を開き、アウトレットをレンダリングします。

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

これで、子ルートはアウトレットを通じてレンダリングされるはずです。

<img class="tutorial" loading="lazy" alt="メインコンテンツを含む連絡先ルート" src="/docs-images/contacts/06.webp" /> 

## クライアントサイドルーティング

気づいている方もいるかもしれませんが、サイドバーのリンクをクリックすると、ブラウザはクライアントサイドルーティングではなく、次のURLの完全なドキュメントリクエストを行っています。

クライアントサイドルーティングを使用すると、アプリケーションはサーバーから別のドキュメントをリクエストせずにURLを更新できます。代わりに、アプリはすぐに新しいUIをレンダリングできます。[`<Link>`][link-component] を使って実現しましょう。

👉 **サイドバーの `<a href>` を `<Link to>` に変更**

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

ブラウザの開発者ツールのネットワークタブを開くと、もはやドキュメントをリクエストしていないことが確認できます。

## データの読み込み

URL セグメント、レイアウト、データは、ほとんどの場合、互いに結合されています（3つ組み？）。このアプリでもすでに確認できます。

| URL セグメント         | コンポーネント   | データ               |
| ------------------- | ----------- | ------------------ |
| /                   | `<Root>`    | 連絡先のリスト   |
| contacts/:contactId | `<Contact>` | 個々の連絡先 |

この自然な結合により、Remix はデータの慣習を採用し、ルートコンポーネントに簡単にデータを取得できるようにしています。

データを読み込むには、[`loader`][loader] と [`useLoaderData`][use-loader-data] の 2 つの API を使用します。 まず、ルートルートに `loader` 関数を定義してエクスポートし、データをレンダリングします。

👉 **`app/root.tsx` から `loader` 関数をエクスポートし、データをレンダリングする**

<docs-info>次のコードには型エラーが含まれています。次のセクションで修正します。</docs-info>

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

これで完了です！ Remix は、このデータを UI と自動的に同期させます。サイドバーは次のようになります。

<img class="tutorial" loading="lazy" src="/docs-images/contacts/07.webp" />


## 型推論

TypeScript がマップ内の `contact` 型について文句を言っていることに気づいたかもしれません。`typeof loader` を使って、データに関する型推論を得るために、簡単な注釈を追加することができます。

```tsx filename=app/root.tsx lines=[4]
// 既存のインポートとエクスポート

export default function App() {
  const { contacts } = useLoaderData<typeof loader>();

  // 既存のコード
}
```
## ローダーにおける URL パラメータ

👉 **サイドバーのいずれかのリンクをクリックしてください**

以前の静的な連絡先ページが再び表示されますが、1つ違いがあります。URL には、レコードの実際の ID が含まれるようになりました。

<img class="tutorial" loading="lazy" src="/docs-images/contacts/08.webp" />

`app/routes/contacts.$contactId.tsx` のファイル名の `$contactId` 部分を覚えていますか？これらの動的セグメントは、URL 内のその位置にある動的な（変化する）値と一致します。URL 内のこれらの値を「URL パラメータ」または簡単に「パラメータ」と呼びます。

これらの [`params`][params] は、動的セグメントと一致するキーを使用してローダーに渡されます。たとえば、セグメントの名前が `$contactId` の場合、値は `params.contactId` として渡されます。

これらのパラメータは、ほとんどの場合、ID でレコードを見つけるために使用されます。試してみましょう。

👉 **連絡先ページに `loader` 関数を追加し、`useLoaderData` を使用してデータにアクセスします**

<docs-info>次のコードには型エラーが含まれています。次のセクションで修正します</docs-info>

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

TypeScript は私たちにとても不満を持っています。TypeScript を満足させ、それが私たちに何を考えさせるのか見てみましょう。

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

このコードで最初に明らかになる問題は、ファイル名とコードの間でパラメータ名が間違っている可能性があることです（ファイル名を変更したのかもしれません！）。Invariant は、コードで潜在的な問題が発生した場合にカスタムメッセージ付きでエラーをスローするのに便利な関数です。

次に、`useLoaderData<typeof loader>()` は、連絡先を取得したか、`null` を取得したかを認識するようになりました（その ID の連絡先が存在しない可能性があります）。この潜在的な `null` は、コンポーネントコードにとっては面倒で、TypeScript のエラーはまだたくさん発生しています。

コンポーネントコードで連絡先が見つからない可能性に対処できますが、ウェブらしいやり方は適切な 404 を返すことです。これはローダーで実行でき、すべての問題を一度に解決できます。

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

これで、ユーザーが見つからない場合、このパスでのコード実行は停止し、代わりに Remix はエラーパスをレンダリングします。Remix のコンポーネントは、ハッピーパスだけに集中できます 😁
## データの変更

最初の連絡先を作成する前に、まず HTML について説明しましょう。

Remix は、HTML フォームのナビゲーションをデータ変更のプリミティブとしてエミュレートします。これは、JavaScript のカンブリア爆発以前に、唯一の方法でした。シンプルさに騙されないでください！Remix のフォームは、クライアント側でレンダリングされたアプリの UX 機能を、従来の Web モデルのシンプルさで実現します。

一部の Web 開発者にとってはなじみのないことですが、HTML の `form` は、実際にはリンクをクリックするのと同じように、ブラウザでナビゲーションを引き起こします。唯一の違いはリクエストです。リンクは URL を変更するだけですが、`form` はリクエストメソッド (`GET` vs. `POST`) とリクエストボディ (`POST` フォームデータ) も変更できます。

クライアントサイドのルーティングがない場合、ブラウザは自動的に `form` のデータをシリアライズし、`POST` のリクエストボディとして、`GET` の場合は [`URLSearchParams`][url-search-params] としてサーバーに送信します。Remix は同じことを行いますが、サーバーにリクエストを送信する代わりに、クライアントサイドのルーティングを使用して、ルートの [`action`][action] 関数に送信します。

これは、アプリの「新規」ボタンをクリックすることで確認できます。

<img class="tutorial" loading="lazy" src="/docs-images/contacts/09.webp" />

Remix は、このフォームナビゲーションを処理するコードがサーバーにないため、405 を返します。 

## 連絡先の作成

ルートルートに `action` 関数をエクスポートすることで、新しい連絡先を作成します。ユーザーが「新規」ボタンをクリックすると、フォームはルートルートアクションに `POST` します。

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

以上です！「新規」ボタンをクリックすると、リストに新しいレコードが追加されます 🥳

<img class="tutorial" loading="lazy" src="/docs-images/contacts/11.webp" />

`createEmptyContact` メソッドは、名前やデータなど何もない空の連絡先を作成するだけです。しかし、レコードを作成することは約束します！

> 🧐 えっ、ちょっと待って… サイドバーはどうやって更新されたの？ どこで `action` 関数を呼び出したの？ データを再取得するコードはどこにあるの？ `useState`、`onSubmit`、`useEffect` はどこにあるの？

これは、「従来の Web」プログラミングモデルが登場するところです。 [`<Form>`][form-component] は、ブラウザがサーバーへのリクエストを送信するのを防ぎ、代わりに [`fetch`][fetch] を使用してルートの `action` 関数に送信します。

Web のセマンティクスでは、`POST` は通常、データが変更されることを意味します。慣例として、Remix はこれをヒントとして使用し、`action` が完了した後、ページのデータを自動的に再検証します。

実際、すべてが HTML と HTTP であるため、JavaScript を無効にしても、すべて正常に機能します。Remix がフォームをシリアル化してサーバーに [`fetch`][fetch] リクエストを行うのではなく、ブラウザがフォームをシリアル化してドキュメントリクエストを行います。そこから、Remix はページをサーバー側でレンダリングして送信します。結局、UI は同じです。

しかし、ファビコンの回転や静的なドキュメントよりも優れたユーザーエクスペリエンスを実現するため、JavaScript は使い続けます。

## データの更新

新しいレコードの情報を埋める方法を追加しましょう。

データの作成と同様に、[`<Form>`][form-component] を使用してデータを更新します。`app/routes/contacts.$contactId_.edit.tsx` に新しいルートを作成しましょう。

👉 **編集コンポーネントを作成する**

```shellscript nonumber
touch app/routes/contacts.\$contactId_.edit.tsx
```

`$contactId_` の奇妙な `_` に注目してください。デフォルトでは、ルートは同じプレフィックスを持つルートの中に自動的にネストされます。末尾に `_` を追加することで、ルートが `app/routes/contacts.$contactId.tsx` に**ネストされない**ように指示します。詳細については、[ルートファイルの名前付け][routes-file-conventions] ガイドを参照してください。

👉 **編集ページのUIを追加する**

これまでに見たことがないものはありません。コピーして貼り付けることができます。

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
        <span>名前</span>
        <input
          aria-label="名"
          defaultValue={contact.first}
          name="first"
          placeholder="名"
          type="text"
        />
        <input
          aria-label="姓"
          defaultValue={contact.last}
          name="last"
          placeholder="姓"
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
        <span>アバターURL</span>
        <input
          aria-label="アバターURL"
          defaultValue={contact.avatar}
          name="avatar"
          placeholder="https://example.com/avatar.jpg"
          type="text"
        />
      </label>
      <label>
        <span>メモ</span>
        <textarea
          defaultValue={contact.notes}
          name="notes"
          rows={6}
        />
      </label>
      <p>
        <button type="submit">保存</button>
        <button type="button">キャンセル</button>
      </p>
    </Form>
  );
}
```

これで、新しいレコードをクリックし、"編集" ボタンをクリックしてください。新しいルートが表示されるはずです。

<img class="tutorial" loading="lazy" src="/docs-images/contacts/12.webp" />
## `FormData` を使用して連絡先を更新する

作成した編集ルートはすでに `form` をレンダリングしています。必要なのは `action` 関数を追加することだけです。Remix は `form` をシリアライズし、[`fetch`][fetch] で `POST` し、自動的にすべてのデータを再検証します。

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

フォームに記入して保存ボタンを押すと、このような画面が表示されます！ <small>(見やすく、毛深い感じは少ないです。)</small>

<img class="tutorial" loading="lazy" src="/docs-images/contacts/13.webp" /> 

## 変異に関する議論

> 😑 動いたけど、何が起こっているのか全くわからない…

少し詳しく見ていきましょう…

`contacts.$contactId_.edit.tsx`を開いて、`form`要素を見てください。各要素に名前が付いていることに注目してください。

```tsx filename=app/routes/contacts.$contactId_.edit.tsx lines=[4]
<input
  aria-label="First name"
  defaultValue={contact.first}
  name="first"
  placeholder="First"
  type="text"
/>
```

JavaScriptがない場合、フォームが送信されると、ブラウザは[`FormData`][form-data]を作成し、サーバーに送信する際にリクエストの本文として設定します。前述のように、Remixはこの処理を阻止し、[`fetch`][fetch]を使用してリクエストを`action`関数に送信することでブラウザをエミュレートします。これには[`FormData`][form-data]も含まれます。

`form`内の各フィールドは`formData.get(name)`でアクセスできます。たとえば、上記の入力フィールドの場合、次のようにして名前を取得できます。

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

フォームフィールドがいくつかあるため、[`Object.fromEntries`][object-from-entries]を使用してすべてのフィールドをオブジェクトに収集しました。これは、`updateContact`関数が期待するものです。

```tsx filename=app/routes/contacts.$contactId_.edit.tsx nocopy
const updates = Object.fromEntries(formData);
updates.first; // "Some"
updates.last; // "Name"
```

`action`関数以外に、ここで説明するAPIはRemixによって提供されていません。[`request`][request]、[`request.formData`][request-form-data]、[`Object.fromEntries`][object-from-entries]はすべてウェブプラットフォームによって提供されています。

`action`関数が完了したら、最後に[`redirect`][redirect]があることに注意してください。

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

`action`関数と`loader`関数は両方とも[ `Response`を返せる][returning-response-instances]（[`Request`][request]を受け取るので当然です！）。[`redirect`][redirect]ヘルパーは、アプリケーションに場所を変更するよう指示する[`Response`][response]を返す際に便利です。

クライアントサイドルーティングがない場合、`POST`リクエスト後にサーバーがリダイレクトすると、新しいページは最新のデータを取得してレンダリングします。前に学んだように、Remixはこのモデルをエミュレートし、`action`呼び出し後にページ上のデータを自動的に再検証します。これが、フォームを保存するとサイドバーが自動的に更新される理由です。追加の再検証コードは、クライアントサイドルーティングがない場合に存在せず、Remixではクライアントサイドルーティングがあるため存在する必要はありません。

最後にもう一点。JavaScriptがない場合、[`redirect`][redirect]は通常の転送になります。ただし、JavaScriptを使用すると、クライアントサイドの転送になるため、スクロール位置やコンポーネントの状態などのクライアントの状態が失われることはありません。

[form-data]: https://developer.mozilla.org/en-US/docs/Web/API/FormData
[fetch]: https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API
[object-from-entries]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/fromEntries
[request]: https://developer.mozilla.org/en-US/docs/Web/API/Request
[request-form-data]: https://developer.mozilla.org/en-US/docs/Web/API/Request/formData
[returning-response-instances]: https://remix.run/docs/en/v1/api/remix#returning-response-instances
[response]: https://developer.mozilla.org/en-US/docs/Web/API/Response
[redirect]: https://remix.run/docs/en/v1/api/remix#redirect
## 新規レコードを編集ページにリダイレクトする

リダイレクトの方法がわかったところで、新しい連絡先を作成するアクションを更新して、編集ページにリダイレクトするようにしましょう。

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

これで、「新規」をクリックすると、編集ページに移動します。

<img class="tutorial" loading="lazy" src="/docs-images/contacts/14.webp" /> 

## アクティブリンクのスタイリング

これでたくさんのレコードが表示されるようになりましたが、サイドバーでどのレコードを見ているのか分かりません。これを解決するために [`NavLink`][nav-link] を使用できます。

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

`className` に関数を渡していることに注意してください。ユーザーが `<NavLink to>` に一致する URL にいる場合、`isActive` は true になります。アクティブになる *直前* の場合（データがまだロード中）、`isPending` は true になります。これにより、ユーザーがどこにいて、リンクをクリックしたときにデータがロードされるのを待つ必要があり、すぐにフィードバックを提供することができます。

<img class="tutorial" loading="lazy" src="/docs-images/contacts/15.webp"/> 

## グローバル保留UI

ユーザーがアプリ内を移動すると、Remixは次のページのデータが読み込まれる間、*古いページを表示したままにします*。リスト間をクリックすると、アプリが少し反応しないように感じるかもしれません。アプリが反応していないように感じさせないように、ユーザーにフィードバックを提供しましょう。

Remixは、すべてを舞台裏で管理し、動的なWebアプリを構築するために必要な部分を明らかにします。この場合、[`useNavigation`][use-navigation]フックを使用します。

👉 **`useNavigation`を使ってグローバル保留UIを追加しましょう**

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

[`useNavigation`][use-navigation]は、現在のナビゲーションの状態を返します。これは、`"idle"`、`"loading"`、または`"submitting"`のいずれかです。

この場合、アイドル状態でない場合は、アプリのメイン部分に`"loading"`クラスを追加します。CSSは、短い遅延後に素敵なフェードを追加して、（高速読み込みのためにUIがちらつくのを避けるためです）。スピナーを表示したり、上部にローディングバーを表示したりするなど、好きなことを何でもできます。

<img class="tutorial" loading="lazy" src="/docs-images/contacts/16.webp" />

[use-navigation]: https://remix.run/docs/en/v1/api/remix#usenavigation
## レコードの削除

コンタクトルートのコードを確認すると、削除ボタンは次のようになっていることがわかります。

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

`action` が `"destroy"` を指していることに注目してください。`<Link to>` と同様に、`<Form action>` は*相対的な*値を取ることができます。フォームは `contacts.$contactId.tsx` でレンダリングされるため、`destroy` を使った相対的なアクションは、クリック時にフォームを `contacts.$contactId.destroy` に送信します。

この時点で、削除ボタンを動作させるために必要な情報はすべて揃っているはずです。先に進む前に、試してみてはいかがでしょうか？次のものが必要です。

1. 新しいルート
2. そのルートのアクション
3. `app/data.ts` から `deleteContact`
4. リダイレクト先

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

さて、レコードに移動して "Delete" ボタンをクリックしてください。動作します！

> 😅 まだよくわかりません

ユーザーが送信ボタンをクリックすると、次のようになります。

1. `<Form>` はサーバーへの新しいドキュメント `POST` リクエストを送信するというデフォルトのブラウザの動作を阻止しますが、代わりにクライアントサイドルーティングと [`fetch`][fetch] を使用して、ブラウザをエミュレートし、`POST` リクエストを作成します。
2. `<Form action="destroy">` は `"contacts.$contactId.destroy"` の新しいルートに一致し、リクエストを送信します。
3. `action` がリダイレクトした後、Remix はページのデータのすべての `loader` を呼び出して最新の値を取得します（これは "再検証" です）。`useLoaderData` は新しい値を返し、コンポーネントを更新します！

`Form` を追加し、`action` を追加すれば、Remix が残りを処理します。


## インデックスルート

アプリを起動すると、リストの右側には大きな空白ページが表示されます。

<img class="tutorial" loading="lazy" src="/docs-images/contacts/17.webp" />

ルートに子ルートがある場合、親ルートのパスにいるときは、 `<Outlet>` にはレンダリングする子ルートが一致しないため、何もレンダリングされません。インデックスルートは、そのスペースを埋めるためのデフォルトの子ルートとして考えることができます。

👉 **ルートルートのインデックスルートを作成する**

```shellscript nonumber
touch app/routes/_index.tsx
```

👉 **インデックスコンポーネントの要素を埋める**

コピー＆ペーストして構いません。特別なことは何もありません。

```tsx filename=app/routes/_index.tsx
export default function Index() {
  return (
    <p id="index-page">
      これは Remix のデモです。
      <br />
      <a href="https://remix.run">remix.run のドキュメント</a> を確認してください。
    </p>
  );
}
```

ルート名 `_index` は特別です。ユーザーが親ルートの正確なパスにいる場合、 `<Outlet />` でレンダリングする他の子ルートがないため、このルートを一致させてレンダリングするように Remix に指示します。

<img class="tutorial" loading="lazy" src="/docs-images/contacts/18.webp" />

できました！空白がなくなりました。インデックスルートには、ダッシュボード、統計情報、フィードなどを置くのが一般的です。インデックスルートは、データの読み込みにも参加できます。 

## キャンセルボタン

編集ページには、まだ何も動作しないキャンセルボタンがあります。ブラウザの戻るボタンと同じ動作にする必要があります。

ボタンのクリックハンドラと [`useNavigate`][use-navigate] が必要になります。

👉 **`useNavigate` を使用してキャンセルボタンのクリックハンドラを追加**

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

これで、ユーザーが「キャンセル」をクリックすると、ブラウザの履歴で 1 つ前のエントリに戻されます。

> 🧐 なぜボタンに `event.preventDefault()` がないのですか？

`<button type="button">` は、一見冗長ですが、ボタンがフォームを送信しないようにするための HTML の方法です。

あと 2 つの機能です。ゴールは目前です！

## `URLSearchParams`と`GET`送信

これまで見てきたインタラクティブなUIは、URLを変更するリンクか、`action`関数にデータを送信する`form`でした。検索フィールドは、この両方の組み合わせで興味深いものです。`form`ですが、データは変更せず、URLのみを変更します。

検索フォームを送信すると何が起こるか見てみましょう。

👉 **検索フィールドに名前を入力してEnterキーを押してください**

ブラウザのURLにクエリが[`URLSearchParams`][url-search-params]として含まれているのがわかるはずです。

```
http://localhost:5173/?q=ryan
```

`<Form method="post">`ではないので、Remixはブラウザをエミュレートし、[`FormData`][form-data]をリクエストボディではなく[`URLSearchParams`][url-search-params]にシリアライズします。

`loader`関数は、`request`から検索パラメータにアクセスできます。これを利用してリストをフィルターしてみましょう。

👉 **`URLSearchParams`があればリストをフィルターする**

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

これは`POST`ではなく`GET`なので、Remixは`action`関数を呼び出しません。`GET`の`form`を送信することは、リンクをクリックすることと同じです。URLだけが変更されます。

これは、通常のページナビゲーションであることも意味します。戻るボタンをクリックすると、元の場所に戻ることができます。

[url-search-params]: https://developer.mozilla.org/en-US/docs/Web/API/URLSearchParams
[form-data]: https://developer.mozilla.org/en-US/docs/Web/API/FormData
## URL とフォームの状態を同期する

いくつかの UX の問題点があり、すぐに対応できます。

1. 検索後に戻るボタンをクリックしても、フォームフィールドには入力した値が残っているのに、リストはフィルターされなくなります。
2. 検索後にページを更新すると、フォームフィールドには値が入らなくなりますが、リストはフィルターされます。

つまり、URL と入力の状態が同期していません。

まずは (2) を解決し、入力に URL からの値を設定しましょう。

👉 **`loader` から `q` を返して、入力のデフォルト値に設定します。**

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

これで、検索後にページを更新した場合、入力フィールドにクエリが表示されます。

次に、問題 (1) について、戻るボタンをクリックして入力を更新する問題に対処します。React の `useEffect` を使用して、DOM の入力値を直接操作できます。

👉 **入力値を `URLSearchParams` と同期させる**

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

> 🤔 コントロールされたコンポーネントと React のステートを使うべきではないでしょうか？

もちろん、コントロールされたコンポーネントとして実装することもできます。同期ポイントが増えますが、どちらでも構いません。

<details>

<summary>展開して詳細を確認する</summary>

```tsx filename=app/root.tsx lines=[2,9-10,12-16,30-33,36-37]
// 既存のインポート
import { useEffect, useState } from "react";

// 既存のインポートとエクスポート

export default function App() {
  const { contacts, q } = useLoaderData<typeof loader>();
  const navigation = useNavigation();
  // クエリはステートに保持する必要があります
  const [query, setQuery] = useState(q || "");

  // 戻る/進むボタンをクリックしたときにクエリを
  // コンポーネントステートと同期させる `useEffect` があります
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
                // ユーザーの入力をコンポーネントステートと同期させる
                onChange={(event) =>
                  setQuery(event.currentTarget.value)
                }
                placeholder="検索"
                type="search"
                // `defaultValue` から `value` に変更されました
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

これで、戻る/進む/更新ボタンをクリックしても、入力の値が URL と結果と同期するようになります。


## フォームの`onChange`を提出する

ここには製品に関する意思決定が必要です。ユーザーに`form`を提出して結果をフィルタリングさせたい場合もあれば、ユーザーがタイプするたびにフィルタリングしたい場合もあります。前者はすでに実装済みなので、後者について見ていきましょう。

すでに`useNavigate`を見てきましたが、今回はその仲間である[`useSubmit`][use-submit]を使用します。

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

このようにタイプすると、`form`が自動的に送信されます！

[`submit`][use-submit]への引数に注目してください。`submit`関数は、渡されたフォームをシリアライズして送信します。ここでは`event.currentTarget`を渡しています。`currentTarget`は、イベントがアタッチされているDOMノード（`form`）です。 

## 検索スピナーの追加

本番環境のアプリでは、検索は通常、一度にすべてを送信してクライアント側でフィルター処理するには大きすぎるデータベース内のレコードを検索するため、このデモではネットワーク遅延を模倣しています。

ローディングインジケーターがないと、検索は少し遅く感じられます。データベースを高速化できたとしても、ユーザーのネットワーク遅延は常に発生し、コントロールできません。

より良いユーザーエクスペリエンスのために、検索の直感的なUIフィードバックを追加しましょう。[`useNavigation`][use-navigation]を再び使用します。

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

何も起こっていない場合、`navigation.location`は`undefined`になりますが、ユーザーがナビゲートすると、データが読み込まれる間、次の場所に設定されます。その後、`location.search`を使用して検索しているかどうかを確認します。

👉 **新しい`searching`状態を使用して、検索フォーム要素にクラスを追加する**

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

ボーナス：検索中はメイン画面がフェードアウトしないようにする:

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

これで、検索入力の左側には素敵なスピナーが表示されます。

<img class="tutorial" loading="lazy" src="/docs-images/contacts/20.webp" />

## 履歴スタックの管理

フォームはキーストロークごとに送信されるため、「alex」と入力してからバックスペースで削除すると、膨大な履歴スタックが生成されます 😂。これは明らかに避けたいことです。

<img class="tutorial" loading="lazy" src="/docs-images/contacts/21.webp" />

これを回避するには、履歴スタックにプッシュするのではなく、現在のエントリを次のページに *置き換える* ことができます。

👉 **`submit` で `replace` を使用**

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

これが最初の検索かどうかを簡単に確認した後、置き換えを実行します。これで、最初の検索は新しいエントリを追加しますが、それ以降のキーストロークは現在のエントリを置き換えます。検索を削除するために7回戻る代わりに、ユーザーは1回戻るだけで済みます。 

## ナビゲーションなしの `Form`

これまで、フォームはすべてURLを変更していました。これらのユーザーフローは一般的ですが、*ナビゲーションなしで*フォームを送信したい場合も同様に一般的です。

このような場合、[`useFetcher`][use-fetcher] が役立ちます。これにより、ナビゲーションなしで `action` と `loader` と通信できます。

連絡先ページの ★ ボタンは、これに対して理にかなっています。新しいレコードを作成したり削除したりするのではなく、見ているページのデータを変更したいだけです。

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
            : "お気に入りから削除する"
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

このフォームは、ナビゲーションを引き起こすことはなく、単に `action` にフェッチします。さて... `action` を作成するまでは機能しません。

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

さて、ユーザー名の横にある星をクリックする準備ができました！

<img class="tutorial" loading="lazy" src="/docs-images/contacts/22.webp" />

確認してみてください。両方の星が自動的に更新されます。新しい `<fetcher.Form method="post">` は、これまで使ってきた `<Form>` とほぼ同じように機能します。アクションを呼び出し、すべてのデータが自動的に再検証されます。エラーも同様にキャッチされます。

ただし、重要な違いが1つあります。ナビゲーションではないため、URLは変更されず、履歴スタックも影響を受けません。
## 楽観的UI

前回のセクションで「お気に入り」ボタンをクリックしたときに、アプリが少し反応しにくかったことに気づいたかもしれません。再び、ネットワークレイテンシを追加しました。なぜなら、それは現実世界では必ず発生するからです。

ユーザーにフィードバックを与えるために、[`fetcher.state`][fetcher-state]（以前の `navigation.state` とよく似ています）を使用して、星をローディング状態にすることができますが、今回はさらに良い方法があります。「楽観的UI」と呼ばれる戦略を使用できます。

フェッチャーは `action` に送信される [`FormData`][form-data] を認識しているので、`fetcher.formData` で利用できます。これを使用して、ネットワークが完了していない場合でも、すぐに星の状態を更新します。更新が最終的に失敗した場合、UIは実際データに戻ります。

👉 **`fetcher.formData` から楽観的値を読み取る**

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

これで、星はクリックすると*すぐに*新しい状態に変わります。

***

以上です！Remix を試していただきありがとうございます。このチュートリアルが、優れたユーザーエクスペリエンスを構築するための堅実なスタートになることを願っています。さらに多くのことができますので、すべての API を必ずチェックしてください 😀

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

