---
title: チュートリアル (30分)
order: 2
--- 

# Remix チュートリアル

小さくても機能豊富な、連絡先を管理できるアプリを構築します。データベースやその他の「本番環境対応」の機能は含まれませんので、Remix に集中できます。手順に従えば約 30 分で完了します。そうでなければ、さっと読める内容です。

<img class="tutorial" src="/docs-images/contacts/01.webp" />

👉 **このマークが表示されたら、アプリで何か操作する必要があることを意味します！**

残りの部分は、情報提供と理解を深めるためのものです。始めましょう。

## セットアップ

👉 **基本テンプレートの生成**

```shellscript nonumber
npx create-remix@latest --template remix-run/remix/templates/remix-tutorial
```

これは非常にシンプルなテンプレートを使用しますが、CSSとデータモデルが含まれているため、Remixに集中できます。 [クイックスタート][quickstart]では、Remixプロジェクトの基本設定について詳しく知ることができます。

👉 **アプリの起動**

```shellscript nonumber
# アプリディレクトリに移動
cd {アプリを置いた場所}

# まだインストールしていない場合は、依存関係をインストールします
npm install

# サーバーを起動します
npm run dev
```

[http://localhost:5173][http-localhost-5173]を開くと、次のようなスタイルが適用されていない画面が表示されます。

<img class="tutorial" src="/docs-images/contacts/03.webp" />

## ルートルート

`app/root.tsx` のファイルに注目してください。これは「ルートルート」と呼ばれるものです。これはUIで最初にレンダリングされるコンポーネントなので、通常はページのグローバルレイアウトを含みます。

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

Remix アプリにスタイルを適用する方法には複数ありますが、ここでは Remix に焦点を当てるために、すでに記述されたプレーンなスタイルシートを使用します。

CSS ファイルは JavaScript モジュールに直接インポートできます。Vite はアセットにフィンガープリントを付与し、ビルドのクライアントディレクトリに保存し、モジュールに公開可能な href を提供します。

👉 **アプリスタイルのインポート**

```tsx filename=app/root.tsx lines=[1,4,6-8]
import type { LinksFunction } from "@remix-run/node";
// 既存のインポート

import appStylesHref from "./app.css?url";

export const links: LinksFunction = () => [
  { rel: "stylesheet", href: appStylesHref },
];
```

すべてのルートは [`links`][links] 関数をエクスポートできます。これらは収集されて、`app/root.tsx` でレンダリングした `<Links />` コンポーネントにレンダリングされます。

アプリは、これでこのような見た目になるはずです。デザイナーが CSS も書けるのは本当に良いですね（ありがとう、[Jim][jim] 🙏）。

<img class="tutorial" loading="lazy" src="/docs-images/contacts/04.webp" />

## コンタクトルートUI

サイドバーのアイテムをクリックすると、デフォルトの404ページが表示されます。`/contacts/1`と一致するルートを作成しましょう。

👉 **`app/routes`ディレクトリとコンタクトルートモジュールを作成する**

```shellscript nonumber
mkdir app/routes
touch app/routes/contacts.\$contactId.tsx
```

Remixの[ルートファイルの規約][routes-file-conventions]では、`.`はURLに`/`を作成し、`$`はセグメントを動的にします。これで、次のようなURLと一致するルートが作成されました。

* `/contacts/123`
* `/contacts/abc`

👉 **コンタクトコンポーネントUIを追加する**

これは、一連の要素です。コピーして貼り付けることができます。

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

これで、リンクをクリックするか、`/contacts/1`にアクセスすると…何も新しいものは表示されませんか？

<img class="tutorial" loading="lazy" alt="空白のメインコンテンツを持つコンタクトルート" src="/docs-images/contacts/05.webp" />

## ネストされたルートとアウトレット

RemixはReact Router上に構築されているため、ネストされたルーティングをサポートしています。子ルートを親レイアウト内にレンダリングするには、親に[`Outlet`][outlet-component]をレンダリングする必要があります。修正しましょう。`app/root.tsx`を開いて、アウトレットをレンダリングします。

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

これで、子ルートはアウトレットを通じてレンダリングされるはずです。

<img class="tutorial" loading="lazy" alt="メインコンテンツを持つ連絡先ルート" src="/docs-images/contacts/06.webp" />

## クライアントサイドルーティング

サイドバーのリンクをクリックした際に、ブラウザがクライアントサイドルーティングではなく、次の URL のフルドキュメントリクエストを行っていることに気づいたかもしれません。

クライアントサイドルーティングにより、アプリはサーバーから別のドキュメントを要求せずに URL を更新できます。代わりに、アプリはすぐに新しい UI をレンダリングできます。[`<Link>`][link-component] を使って実現しましょう。

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

ブラウザの開発者ツールでネットワークタブを開くと、ドキュメントがもはや要求されていないことがわかります。

## データの読み込み

URL セグメント、レイアウト、データは、ほとんどの場合、互いに関連付けられています（3つとも関連している？）。このアプリでもすでに確認できます。

| URL セグメント         | コンポーネント   | データ               |
| ------------------- | ----------- | ------------------ |
| /                   | `<Root>`    | 連絡先リスト          |
| contacts/:contactId | `<Contact>` | 個別の連絡先       |

この自然な関連付けのため、Remix には、ルートコンポーネントに簡単にデータを読み込むためのデータ規則があります。

[`loader`][loader] と [`useLoaderData`][use-loader-data] の 2 つの API を使用してデータをロードします。まず、ルートルートに `loader` 関数を定義してエクスポートし、データをレンダリングします。

👉 **`app/root.tsx` から `loader` 関数をエクスポートして、データをレンダリングします。**

<docs-info>次のコードにはタイプエラーが含まれています。これは次のセクションで修正します。</docs-info>

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
        {/* 他の要素 */}
      </body>
    </html>
  );
}
```

以上です！Remix は、このデータを UI と自動的に同期化します。サイドバーは次のようになります。

<img class="tutorial" loading="lazy" src="/docs-images/contacts/07.webp" />

## 型推論

マップ内の `contact` 型について、TypeScript が警告を出していることに気づかれたかもしれません。`typeof loader` を使用してデータの型推論を行うために、簡単な注釈を追加することができます。

```tsx filename=app/root.tsx lines=[4]
// 既存のインポートとエクスポート

export default function App() {
  const { contacts } = useLoaderData<typeof loader>();

  // 既存のコード
}
```

## ローダーにおけるURLパラメータ

👉 **サイドバーのいずれかのリンクをクリックしてください**

古い静的コンタクトページが再び表示されますが、1つの違いがあります。URLにはレコードの実際のIDが含まれるようになりました。

<img class="tutorial" loading="lazy" src="/docs-images/contacts/08.webp" />

`app/routes/contacts.$contactId.tsx`のファイル名の`$contactId`の部分を覚えていますか？これらの動的セグメントは、URLのその位置にある動的（変化する）値と一致します。これらの値をURLの「URLパラメータ」、または簡単に「パラメータ」と呼びます。

これらの[`params`][params]は、動的セグメントと一致するキーを使用してローダーに渡されます。たとえば、私たちのセグメントは`$contactId`という名前なので、値は`params.contactId`として渡されます。

これらのパラメータは、ほとんどの場合、IDでレコードを見つけるために使用されます。試してみましょう。

👉 **コンタクトページに`loader`関数を追加し、`useLoaderData`でデータにアクセスします**

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

TypeScript が私たちに怒っているので、それをなだめて、何が考えられるか見てみましょう。

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

まず、このコードが強調している問題は、ファイル名とコードの間でパラメータ名が間違っている可能性があることです（ファイル名を変更したのかもしれません）。Invariant は、コードの潜在的な問題を予期したときに、カスタムメッセージでエラーを投げるための便利な関数です。

次に、`useLoaderData<typeof loader>()` は、コンタクトを取得したか、または `null` であることを認識するようになりました（その ID のコンタクトが存在しない可能性があります）。この潜在的な `null` は、コンポーネントコードにとって厄介で、TS エラーが飛び回っています。

コンポーネントコードでコンタクトが見つからない可能性を考慮することもできますが、Web での一般的なやり方は、適切な 404 を返すことです。これは、ローダーで実行することができ、すべての問題を一度に解決できます。

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

これで、ユーザーが見つからない場合、このパスでのコード実行が停止し、Remix は代わりにエラーパスをレンダリングします。Remix のコンポーネントは、ハッピーパスにのみ集中できます 😁

## データの変更

最初のコンタクトを作成する前に、HTMLについて説明します。

Remixは、JavaScript カンブリア爆発以前に唯一の方法であった、HTMLフォームナビゲーションをデータ変更のプリミティブとしてエミュレートします。シンプルさにだまされてはいけません！Remixのフォームは、クライアントレンダリングアプリケーションのUX機能を、従来のウェブモデルのシンプルさで提供します。

一部のWeb開発者には馴染みがないかもしれませんが、HTMLの`form`は実際には、リンクをクリックするのと同じように、ブラウザでナビゲーションを引き起こします。唯一の違いはリクエストにあります。リンクはURLのみを変更できますが、`form`はリクエストメソッド（`GET`対`POST`）とリクエストボディ（`POST`フォームデータ）も変更できます。

クライアントサイドルーティングがない場合、ブラウザは`form`のデータを自動的にシリアル化し、`POST`の場合にはリクエストボディとして、`GET`の場合には[`URLSearchParams`][url-search-params]としてサーバーに送信します。Remixも同じことを行いますが、サーバーにリクエストを送信する代わりに、クライアントサイドルーティングを使用して、ルートの[`action`][action]関数に送信します。

これは、アプリの「新規」ボタンをクリックすることで確認できます。

<img class="tutorial" loading="lazy" src="/docs-images/contacts/09.webp" />

Remixは、このフォームナビゲーションを処理するサーバー側のコードがないため、405を送信します。

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

以上です！「新規」ボタンをクリックしてみてください。リストに新しいレコードが追加されたはずです 🥳

<img class="tutorial" loading="lazy" src="/docs-images/contacts/11.webp" />

`createEmptyContact` メソッドは、名前やデータなど何もない空の連絡先を作成するだけです。しかし、レコードを作成することは約束します！

> 🧐ちょっと待ってください... サイドバーはどうやって更新されたのでしょうか？ どこで `action` 関数を呼び出したのでしょうか？ データを再取得するコードはどこにあるのでしょうか？ `useState`、`onSubmit`、`useEffect` はどこにあるのでしょうか？

これは、"old school web" のプログラミングモデルが登場するところです。[`<Form>`][form-component] は、ブラウザがサーバーにリクエストを送信することを防ぎ、代わりに [`fetch`][fetch] を使用してルートの `action` 関数に送信します。

Web セマンティクスでは、`POST` は通常、データが変更されていることを意味します。慣習的に、Remix はこれをヒントとして使用し、`action` が完了した後にページ上のデータを自動的に再検証します。

実際、すべてが HTML と HTTP であるため、JavaScript を無効にしても、すべてが正常に動作します。Remix がフォームをシリアル化してサーバーに [`fetch`][fetch] リクエストを行う代わりに、ブラウザがフォームをシリアル化してドキュメントリクエストを行います。そこから、Remix はサーバーサイドでページをレンダリングして送信します。最終的に UI は同じです。

しかし、スピニングファビコンや静的なドキュメントよりも優れたユーザーエクスペリエンスを実現するために、JavaScript を維持します。

## データの更新

新しいレコードの情報を入力できるようにしましょう。

データの作成と同様に、[`<Form>`][form-component]を使用してデータを更新します。`app/routes/contacts.$contactId_.edit.tsx`に新しいルートを作成しましょう。

👉 **編集コンポーネントの作成**

```shellscript nonumber
touch app/routes/contacts.\$contactId_.edit.tsx
```

`$contactId_`内の奇妙な`_`に注目してください。デフォルトでは、ルートは同じプレフィックスを持つルート内に自動的にネストされます。末尾に`_`を追加すると、ルートは`app/routes/contacts.$contactId.tsx`内に**ネストされません**。詳細については、[Route File Naming][routes-file-conventions]ガイドを参照してください。

👉 **編集ページUIの追加**

これまで見たことのないものはありません。コピー＆ペーストで大丈夫です。

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
          defaultValue={contact.first}
          aria-label="ファーストネーム"
          name="first"
          type="text"
          placeholder="First"
        />
        <input
          aria-label="ラストネーム"
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

新しいレコードをクリックしてから、「編集」ボタンをクリックします。新しいルートが表示されるはずです。

<img class="tutorial" loading="lazy" src="/docs-images/contacts/12.webp" />

## `FormData`を使った連絡先情報の更新

作成した編集ルートはすでに`form`をレンダリングしています。必要なのは`action`関数の追加だけです。Remixは`form`をシリアライズし、[`fetch`][fetch]を使って`POST`し、すべてのデータを自動的に再検証します。

👉 **編集ルートに`action`関数を追加する**

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

フォームに記入して保存をクリックすると、このような画面が表示されます！<small>(見やすく、もじゃもじゃしていないでしょう。) </small>

<img class="tutorial" loading="lazy" src="/docs-images/contacts/13.webp" />

## 変異に関する議論

> 😑 動いたけど、何が起こっているのかさっぱりわからない…

もう少し詳しく見ていきましょう。

`contacts.$contactId_.edit.tsx` を開いて `form` 要素を見てください。それぞれの要素に `name` が付いていることに注目してください。

```tsx filename=app/routes/contacts.$contactId_.edit.tsx lines=[4]
<input
  defaultValue={contact.first}
  aria-label="First name"
  name="first"
  type="text"
  placeholder="First"
/>
```

JavaScript を使わない場合、フォームが送信されると、ブラウザは [`FormData`][form-data] を作成し、それをサーバーに送信する際の要求の本文として設定します。前述のように、Remix はそれを防ぎ、ブラウザをエミュレートして、[`FormData`][form-data] を含め、[`fetch`][fetch] を使用して `action` 関数に要求を送信します。

`form` 内の各フィールドは、`formData.get(name)` でアクセスできます。たとえば、上記の入力フィールドの場合、次のようにして名前を取得できます。

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

フォームフィールドがいくつかあるので、[`Object.fromEntries`][object-from-entries] を使用してすべてをオブジェクトに収集しました。これは、`updateContact` 関数が必要とするものです。

```tsx filename=app/routes/contacts.$contactId_.edit.tsx nocopy
const updates = Object.fromEntries(formData);
updates.first; // "Some"
updates.last; // "Name"
```

`action` 関数以外では、ここで議論している API のどれも Remix によって提供されていません。[`request`][request]、[`request.formData`][request-form-data]、[`Object.fromEntries`][object-from-entries] はすべて Web プラットフォームによって提供されています。

`action` 関数の後、最後にある [`redirect`][redirect] に注目してください。

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

`action` と `loader` の関数はどちらも [ [`Response`][returning-response-instances] を返すことができます ] ( [`Request`][request] を受け取るため、理にかなっています！)。[`redirect`][redirect] ヘルパーは、アプリに場所の変更を指示する [`Response`][response] を返すための簡単な方法です。

クライアントサイドルーティングがなければ、`POST` リクエスト後にサーバーがリダイレクトした場合、新しいページは最新のデータをフェッチしてレンダリングします。前述のように、Remix はこのモデルをエミュレートし、`action` の呼び出し後にページのデータを自動的に再検証します。これが、フォームを保存するとサイドバーが自動的に更新される理由です。クライアントサイドルーティングがないと、余分な再検証コードは存在しないため、Remix ではクライアントサイドルーティングがあれば、存在する必要はありません！

最後の点です。JavaScript がなければ、[`redirect`][redirect] は通常のリダイレクトになります。しかし、JavaScript を使用すると、それはクライアントサイドのリダイレクトになり、ユーザーはスクロール位置やコンポーネントの状態などのクライアントの状態を失いません。

## 新しいレコードを編集ページにリダイレクトする

リダイレクトの方法が分かったので、新しい連絡先を作成するアクションを編集ページにリダイレクトするように更新してみましょう。

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

これで、「新規」をクリックすると、編集ページに移動するはずです。

<img class="tutorial" loading="lazy" src="/docs-images/contacts/14.webp" />

## アクティブなリンクのスタイリング

さて、たくさんのレコードがあるようになりましたが、サイドバーでどのレコードを見ているのか分かりません。これを修正するために [`NavLink`][nav-link] を使用できます。

👉 **サイドバーで `<Link>` を `<NavLink>` に置き換えてください**

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

`className` に関数を渡していることに注意してください。ユーザーが `<NavLink to>` と一致する URL にいる場合、`isActive` は true になります。アクティブになる *前* （データがまだロードされていない）の場合、`isPending` は true になります。これにより、ユーザーがどこにいるかを簡単に示し、リンクがクリックされたがデータがロードされる必要がある場合にすぐにフィードバックを提供できます。

<img class="tutorial" loading="lazy" src="/docs-images/contacts/15.webp"/>

## グローバル保留UI

ユーザーがアプリを操作すると、Remix は次のページのデータが読み込まれる間、*前のページをそのままにしておきます*。リスト間をクリックすると、アプリが少し反応しなくなるように感じるかもしれません。アプリが反応していないように感じさせないために、ユーザーにフィードバックを提供しましょう。

Remix は、バックグラウンドで状態をすべて管理し、動的なウェブアプリを作成するために必要な部分を明らかにします。この場合、[`useNavigation`][use-navigation]フックを使用します。

👉 **`useNavigation` を使用してグローバル保留UIを追加する**

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

[`useNavigation`][use-navigation] は、現在のナビゲーション状態を返します。これは `"idle"`、`"loading"`、または `"submitting"` のいずれかになります。

ここでは、アイドル状態ではない場合、アプリのメイン部分に `"loading"` クラスを追加します。CSS は、短い遅延の後、素敵なフェードを追加します（高速なロードでのUIのちらつきを防ぐため）。ただし、スピナーやトップのローディングバーを表示するなど、何でも実行できます。

<img class="tutorial" loading="lazy" src="/docs-images/contacts/16.webp" />

## レコードの削除

連絡先ルートのコードを確認すると、削除ボタンは次のようになっています。

```tsx filename=app/routes/contact.$contactId.tsx lines=[2]
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

`action` が `"destroy"` を指していることに注目してください。`<Link to>` と同様に、`<Form action>` は*相対*値を取ることができます。フォームは `contacts.$contactId.tsx` でレンダリングされているため、`destroy` で相対的なアクションを実行すると、クリック時にフォームが `contacts.$contactId.destroy` に送信されます。

この時点で、削除ボタンを機能させるために必要なことはすべてわかっているはずです。先に進む前に、試してみてはどうでしょうか？次のものが必要になります。

1. 新しいルート
2. そのルートのアクション
3. `app/data.ts` からの `deleteContact`
4. どこかにリダイレクトする

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
  invariant(params.contactId, "contactId パラメータがありません");
  await deleteContact(params.contactId);
  return redirect("/");
};
```

さて、レコードに移動して "削除" ボタンをクリックしてください。動作します！

> 😅 これがなぜ機能するのか、まだよくわかりません

ユーザーが送信ボタンをクリックすると、次のようになります。

1. `<Form>` は、サーバーに新しいドキュメント `POST` リクエストを送信するというブラウザのデフォルトの動作を防ぎますが、代わりにクライアントサイドルーティングと [`fetch`][fetch] を使用して `POST` リクエストを作成することにより、ブラウザをエミュレートします。
2. `<Form action="destroy">` は `"contacts.$contactId.destroy"` の新しいルートと一致し、リクエストを送信します。
3. `action` がリダイレクトした後、Remix はページ上のデータに対するすべての `loader` を呼び出して、最新の値を取得します（これは "再検証" です）。`useLoaderData` は新しい値を返し、コンポーネントが更新されます！

`Form` を追加し、`action` を追加すると、Remix が残りを処理します。

## インデックスルート

アプリを起動すると、リストの右側には大きな空白ページが表示されることに気付くでしょう。

<img class="tutorial" loading="lazy" src="/docs-images/contacts/17.webp" />

ルートに子ルートが存在し、親ルートのパスにいる場合、`<Outlet>` にはレンダリングするものがありません。なぜなら、一致する子ルートがないからです。インデックスルートは、その空白を埋めるデフォルトの子ルートとして考えることができます。

👉 **ルートルートのインデックスルートを作成する**

```shellscript nonumber
touch app/routes/_index.tsx
```

👉 **インデックスコンポーネントの要素を埋める**

コピー＆ペーストで構いません。特別なことは何もありません。

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

ルート名 `_index` は特殊です。ユーザーが親ルートの正確なパスにいる場合、`<Outlet />` にレンダリングする他の子ルートがないため、Remix はこのルートを一致させ、レンダリングするように指示します。

<img class="tutorial" loading="lazy" src="/docs-images/contacts/18.webp" />

ほら！空白がなくなりました。インデックスルートには、ダッシュボード、統計情報、フィードなどを配置することが一般的です。インデックスルートは、データの読み込みにも参加できます。

## キャンセルボタン

編集ページには、まだ何も機能していないキャンセルボタンがあります。ブラウザの戻るボタンと同じように機能させたいと思います。

ボタンのクリックハンドラーと[`useNavigate`][use-navigate]が必要です。

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

これで、ユーザーが「キャンセル」をクリックすると、ブラウザの履歴で1つ前に戻ります。

> 🧐 なぜボタンに `event.preventDefault()` がないのですか？

`<button type="button">` は、一見冗長ですが、ボタンがフォームを送信しないようにする HTML の方法です。

あと2つの機能を残すのみです。ゴールは目前です！

## `URLSearchParams` と `GET` サブミット

これまで見てきたインタラクティブなUIは、URLを変更するリンクか、データを`action`関数に送信する`form`のいずれかでした。検索フィールドは興味深いもので、この両方の要素を兼ね備えています。`form`ではありますが、データの変更ではなく、URLのみを変更します。

検索フォームを送信したときに何が起こるかを見てみましょう。

👉 **検索フィールドに名前を入力してEnterキーを押します**

ブラウザのURLが、[`URLSearchParams`][url-search-params]としてURLにクエリを含んでいることに注目してください。

```
http://localhost:5173/?q=ryan
```

`<Form method="post">`ではないため、Remixはブラウザをエミュレートし、[`FormData`][form-data]をリクエストボディではなく[`URLSearchParams`][url-search-params]にシリアル化します。

`loader`関数は、`request`から検索パラメータにアクセスできます。これを使用してリストをフィルターしましょう。

👉 **`URLSearchParams`があればリストをフィルターします**

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

これは`POST`ではなく`GET`であるため、Remixは`action`関数を呼び出しません。`GET`の`form`を送信することは、リンクをクリックすることと同じです。URLだけが変更されます。

これは、通常のページナビゲーションであることも意味します。戻るボタンをクリックして前の場所に戻ることができます。

## URLとフォーム状態の同期

ここで、すぐに対応できるUX上の問題がいくつかあります。

1. 検索後に「戻る」をクリックした場合、リストはフィルタリングされなくなりますが、フォームフィールドには入力した値が残っています。
2. 検索後にページを更新した場合、フォームフィールドには値が入らなくなりますが、リストはフィルタリングされています。

つまり、URLと入力のステータスが同期していません。

まず、(2)を解決し、URLの値を入力として開始しましょう。

👉 **`loader`から`q`を返し、それを入力のデフォルト値として設定します。**

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

これで、検索後にページを更新すると、入力フィールドにクエリが表示されます。

次に、問題(1)の「戻る」ボタンのクリックと入力の更新についてです。Reactの`useEffect`を使用することで、DOM内の入力値を直接操作できます。

👉 **入力値を`URLSearchParams`と同期させる**

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

> 🤔 コントロールされたコンポーネントとReactステートを使用すべきではありませんか？

確かに、コントロールされたコンポーネントとしてこれを行うことができます。同期ポイントが増えますが、それはあなた次第です。

<details>

<summary>展開して表示</summary>

```tsx filename=app/root.tsx lines=[2,9-10,12-16,30-33,36-37]
// 既存のインポート
import { useEffect, useState } from "react";

// 既存のインポートとエクスポート

export default function App() {
  const { contacts, q } = useLoaderData<typeof loader>();
  const navigation = useNavigation();
  // クエリはステートに保持する必要があります
  const [query, setQuery] = useState(q || "");

  // `useEffect`を使用して、クエリをバック/フォワードボタンクリック時にコンポーネントステートと同期します
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
                // ユーザーの入力をコンポーネントステートと同期します
                onChange={(event) =>
                  setQuery(event.currentTarget.value)
                }
                placeholder="Search"
                type="search"
                // `defaultValue`から`value`に変更しました
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

これで、バック/フォワード/更新ボタンをクリックしても、入力値がURLと結果と同期されるようになりました。

## フォームの`onChange`の送信

ここでは、製品に関する意思決定を行う必要があります。ユーザーに`form`を送信させて結果をフィルターさせたい場合と、ユーザーが入力する際にフィルターさせたい場合があります。前者はすでに実装済みなので、後者の実装方法を見てみましょう。

`useNavigate`はすでに見たことがあると思いますが、今回はその仲間である[`useSubmit`][use-submit]を使用します。

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

入力するたびに`form`が自動的に送信されるようになりました！

[`submit`][use-submit]への引数に注目してください。`submit`関数は、渡されたフォームをシリアライズして送信します。ここでは`event.currentTarget`を渡しています。`currentTarget`は、イベントがアタッチされているDOMノード（`form`）です。

## 検索スピナーの追加

本番環境のアプリでは、この検索は、一度にすべて送信してクライアント側でフィルター処理するには大きすぎるデータベースのレコードを検索している可能性があります。そのため、このデモでは、ネットワーク待ち時間が模倣されています。

読み込みインジケーターがないと、検索は少し遅く感じます。データベースを高速化できたとしても、ユーザーのネットワーク待ち時間は常に存在し、私たちのコントロールの範囲外です。

より良いユーザーエクスペリエンスのために、検索に対してすぐにUIフィードバックを追加しましょう。[`useNavigation`][use-navigation] を再び使用します。

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

何も起こっていない場合、`navigation.location` は `undefined` になりますが、ユーザーがナビゲートすると、データが読み込まれる間に次の場所に設定されます。その後、`location.search` を使用して検索しているかどうかを確認します。

👉 **新しい `searching` 状態を使用して検索フォーム要素にクラスを追加する**

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

追加ポイントとして、検索中にメイン画面がフェードアウトしないようにしましょう。

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

これで、検索入力の左側には素敵なスピナーが表示されるはずです。

<img class="tutorial" loading="lazy" src="/docs-images/contacts/20.webp" />

## 履歴スタックの管理

フォームはキーストロークごとに送信されるため、「alex」と入力してからバックスペースで削除すると、巨大な履歴スタックが作成されます 😂。 これは明らかに避けたいことです。

<img class="tutorial" loading="lazy" src="/docs-images/contacts/21.webp" />

これを避けるために、履歴スタックの現在のエントリを次のページで*置き換える*代わりに、履歴スタックにプッシュします。

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

これが最初の検索かどうかをすばやく確認した後、置き換えることを決定します。 これにより、最初の検索は新しいエントリを追加しますが、それ以降のキーストロークは現在のエントリを置き換えます。 検索を削除するために 7 回戻る代わりに、ユーザーは 1 回戻るだけで済みます。

## ナビゲーションなしの `Form`

これまで、フォームはすべてURLを変更していました。これらのユーザーフローは一般的ですが、ナビゲーションを起こさずにフォームを送信したいケースも同様に一般的です。

このようなケースのために、[`useFetcher`][use-fetcher] が用意されています。これにより、ナビゲーションを起こさずに `action` と `loader` と通信できます。

連絡先ページの ★ ボタンは、このケースに適しています。新しいレコードを作成したり削除したりするのではなく、見ているページのデータだけを変更したいのです。

👉 **`<Favorite>` フォームをフェッチャフォームに変更する**

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
            ? "お気に入りに登録解除"
            : "お気に入りに登録"
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

このフォームは、ナビゲーションを起こさなくなり、`action` に単にフェッチするだけです。ところで、`action` を作成するまでは動作しません。

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

見てください、両方の星が自動的に更新されます。新しい `<fetcher.Form method="post">` は、これまで使用していた `<Form>` とほぼ同じように動作します。`action` を呼び出し、その後すべてのデータが自動的に再検証されます。エラーも同様にキャッチされます。

しかし、1つの重要な違いがあります。これはナビゲーションではなく、URLは変更されず、履歴スタックも影響を受けません。

## 楽観的UI

前回のセクションのいいねボタンをクリックした時に、アプリが少し反応が鈍いと感じたかもしれません。これは、現実世界でも発生する可能性のあるネットワーク遅延を意図的に追加したためです。

ユーザーにフィードバックを提供するために、[`fetcher.state`][fetcher-state]（以前の`navigation.state`によく似ています）を使って星をローディング状態にすることもできますが、今回はもっと良い方法があります。「楽観的UI」という戦略を使うことができます。

フェッチャーは、`action`に送信される[`FormData`][form-data]を知っているので、`fetcher.formData`で利用できます。これを利用して、ネットワークが完了する前に星の状態をすぐに更新します。更新が最終的に失敗した場合、UIは実際のデータに戻ります。

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

これで、星をクリックすると*すぐに*新しい状態に変わります。

***

以上です！Remixを試していただきありがとうございます。このチュートリアルが、優れたユーザーエクスペリエンスを構築するための良いスタートになることを願っています。もっとできることはたくさんあるので、すべてのAPIを確認してください😀

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
[links]: ../route/links
[routes-file-conventions]: ../file-conventions/routes
[quickstart]: ./quickstart
[http-localhost-5173]: http://localhost:5173
[fetch]: https://developer.mozilla.org/en-US/docs/Web/API/fetch
