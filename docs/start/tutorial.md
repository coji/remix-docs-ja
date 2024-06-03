---
title: チュートリアル (30分)
order: 2
---

# Remix チュートリアル

ここでは、連絡先を管理できる、小さくても機能豊富なアプリを作成します。データベースやその他の「本番環境対応」な要素は含めないため、Remix に集中できます。このチュートリアルを実際に試しながら進める場合は約 30 分かかりますが、そうでなければ、さっと読める内容です。

<img class="tutorial" src="/docs-images/contacts/01.webp" />

👉 **このマークが表示されたら、アプリで何か操作する必要があるということです！**

それ以外は、すべて情報提供と理解を深めるためのものです。早速始めましょう。

## セットアップ

👉 **基本的なテンプレートを生成する**

```shellscript nonumber
npx create-remix@latest --template remix-run/remix/templates/remix-tutorial
```

これはかなりシンプルなテンプレートを使用していますが、CSS とデータモデルが含まれているため、Remix に集中できます。[クイックスタート][quickstart] では、Remix プロジェクトの基本的なセットアップについて詳しく知ることができます。

👉 **アプリを起動する**

```shellscript nonumber
# アプリのディレクトリに移動する
cd {アプリを配置した場所}

# まだインストールしていない場合は、依存関係をインストールする
npm install

# サーバーを起動する
npm run dev
```

[http://localhost:5173][http-localhost-5173] を開くと、スタイルが適用されていない、このような画面が表示されるはずです。

<img class="tutorial" src="/docs-images/contacts/03.webp" />

## ルートルート

`app/root.tsx` のファイルに注目してください。これは「ルートルート」と呼ばれるものです。UI で最初にレンダリングされるコンポーネントであるため、通常はページのグローバルレイアウトが含まれています。

<details>

<summary>ルートコンポーネントのコードを見るにはここをクリックして展開してください</summary>

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

Remix アプリのスタイル設定には、さまざまな方法がありますが、ここでは、Remix に焦点を当てるため、既に記述されているプレーンなスタイルシートを使用します。

CSS ファイルは、JavaScript モジュールに直接インポートできます。Vite はアセットのフィンガープリントを作成し、ビルドのクライアントディレクトリに保存し、公開可能な href をモジュールに提供します。

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

これで、アプリは次のようになります。デザイナーが CSS も書けるって、本当に素晴らしいですよね？（[ジム][jim] さん、ありがとうございます 🙏）。

<img class="tutorial" loading="lazy" src="/docs-images/contacts/04.webp" />

## 連絡先ルートの UI

サイドバーの項目をクリックすると、デフォルトの 404 ページが表示されます。`app/routes` ディレクトリを作成し、`/contacts/1` の URL に一致するルートのモジュールを作成しましょう。

👉 **`app/routes` ディレクトリと連絡先ルートのモジュールを作成する**

```shellscript nonumber
mkdir app/routes
touch app/routes/contacts.\$contactId.tsx
```

Remix の[ルートファイルの命名規則][routes-file-conventions] では、`.` は URL に `/` を作成し、`$` はセグメントを動的にします。これで、次のような URL に一致するルートが作成されました。

- `/contacts/123`
- `/contacts/abc`

👉 **連絡先コンポーネントの UI を追加する**

ただの要素の集まりなので、コピー＆ペーストしてください。

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

サイドバーのリンクをクリックしても、`/contacts/1` にアクセスしても、何も表示されないことに気付くかもしれません。

<img class="tutorial" loading="lazy" alt="メインコンテンツが空の連絡先ルート" src="/docs-images/contacts/05.webp" />

## ネストされたルートとアウトレット

Remix は React Router をベースに構築されているため、ネストされたルーティングをサポートしています。子ルートを親レイアウト内にレンダリングするには、親に [`Outlet`][outlet-component] をレンダリングする必要があります。`app/root.tsx` を開き、アウトレットをレンダリングしてみましょう。

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

<img class="tutorial" loading="lazy" alt="メインコンテンツが表示された連絡先ルート" src="/docs-images/contacts/06.webp" />

## クライアントサイドルーティング

気付いているかもしれませんが、サイドバーのリンクをクリックすると、ブラウザは、クライアントサイドルーティングではなく、次の URL の完全なドキュメント要求を行います。

クライアントサイドルーティングにより、アプリはサーバーから別のドキュメントを要求することなく、URL を更新できます。代わりに、アプリはすぐに新しい UI をレンダリングできます。[`<Link>`][link-component] を使って実現しましょう。

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

ブラウザの開発ツールでネットワークタブを開くと、ドキュメントを要求していないことがわかります。

## データの読み込み

URL セグメント、レイアウト、データは、多くの場合、互いに密接に関連しています。このアプリでもすでに確認できます。

| URL セグメント         | コンポーネント   | データ               |
| ------------------- | ----------- | ------------------ |
| /                   | `<Root>`    | 連絡先のリスト   |
| contacts/:contactId | `<Contact>` | 個々の連絡先 |

この自然な関連性から、Remix には、データを読み込んでルートコンポーネントに簡単に渡せるデータの慣例があります。

[`loader`][loader] と [`useLoaderData`][use-loader-data] の 2 つの API を使用します。まず、ルートルートに `loader` 関数を定義してエクスポートし、データをレンダリングします。

👉 **`app/root.tsx` から `loader` 関数をエクスポートし、データをレンダリングする**

<docs-info>次のコードには、型エラーがあります。これは、次のセクションで修正します。</docs-info>

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

これで完了です！Remix は、このデータを UI と自動的に同期します。サイドバーは次のようになります。

<img class="tutorial" loading="lazy" src="/docs-images/contacts/07.webp" />

## 型推論

`map` 内の `contact` 型について、TypeScript が警告を出していることに気付いたかもしれません。`typeof loader` を使用して、データに関する型推論を追加することができます。

```tsx filename=app/root.tsx lines=[4]
// 既存のインポートとエクスポート

export default function App() {
  const { contacts } = useLoaderData<typeof loader>();

  // 既存のコード
}
```

## ローダー内の URL パラメータ

👉 **サイドバーのリンクのいずれかをクリックする**

以前の静的な連絡先ページが表示されますが、URL にレコードの実際の ID が追加されている点が異なります。

<img class="tutorial" loading="lazy" src="/docs-images/contacts/08.webp" />

`app/routes/contacts.$contactId.tsx` のファイル名にある `$contactId` 部分を覚えていますか？これらの動的なセグメントは、URL のその位置にある動的な（変化する）値と一致します。これらの値は、URL の「URL パラメータ」または単に「パラメータ」と呼ばれます。

これらの [`params`][params] は、動的なセグメントと一致するキーでローダーに渡されます。たとえば、セグメント名は `$contactId` なので、値は `params.contactId` として渡されます。

これらのパラメータは、多くの場合、ID でレコードを見つけるために使用されます。実際に試してみましょう。

👉 **連絡先ページに `loader` 関数を追加し、`useLoaderData` でデータにアクセスする**

<docs-info>次のコードには、型エラーがあります。これは、次のセクションで修正します。</docs-info>

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

TypeScript がエラーを出しています。TypeScript を満足させ、その結果として何を考慮する必要があるのかを見てみましょう。

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

最初に明らかになる問題点は、ファイル名とコード間でパラメータの名前が間違っていた可能性があることです（ファイル名を変更したかもしれません！）。Invariant は、コードに潜在的な問題がある場合に、カスタムメッセージ付きでエラーを送出するための便利な関数です。

次に、`useLoaderData<typeof loader>()` は、連絡先を取得したか、`null` を取得したか（その ID の連絡先が存在しない可能性があります）を認識できるようになりました。この `null` は、コンポーネントコードでは扱いにくく、TS エラーが発生します。

コンポーネントコードで連絡先が見つからなかった場合に対処することもできますが、ウェブらしい方法は、適切な 404 を送出することです。ローダーで 404 を送出することで、すべての問題を一度に解決できます。

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

これで、ユーザーが見つからなかった場合、このパスでのコードの実行は停止し、代わりに Remix はエラーパスをレンダリングします。Remix のコンポーネントは、正常なパスにのみ集中できます 😁

## データの変更

新しい連絡先は、後で作成しますが、まずは HTML について説明します。

Remix は、HTML フォームナビゲーションを、データの変更のプリミティブとしてエミュレートしています。これは、JavaScript が台頭する以前は、唯一の方法でした。シンプルさに騙されないでください！Remix のフォームは、クライアント側でレンダリングされたアプリの UX 機能と、「昔ながらの」ウェブモデルのシンプルさを兼ね備えています。

一部のウェブ開発者にとってはなじみのないかもしれませんが、HTML の `form` は、実際には、リンクをクリックするのと同じように、ブラウザでナビゲーションを行います。唯一の違いは、要求にあります。リンクは URL を変更することしかできませんが、`form` は、要求メソッド (`GET` 対 `POST`) と要求ボディ (`POST` フォームデータ) も変更できます。

クライアントサイドルーティングがない場合、ブラウザは `form` のデータを自動的にシリアル化し、`POST` の要求ボディとして、そして `GET` の[`URLSearchParams`][url-search-params] としてサーバーに送信します。Remix も同じことを行いますが、サーバーに要求を送信する代わりに、クライアントサイドルーティングを使用して、ルートの [`action`][action] 関数に送信します。

アプリの「New」ボタンをクリックして確認してみましょう。

<img class="tutorial" loading="lazy" src="/docs-images/contacts/09.webp" />

Remix は、このフォームナビゲーションを処理するサーバー側のコードがないため、405 を送出します。

## 連絡先を作成する

ルートルートに `action` 関数をエクスポートすることで、新しい連絡先を作成します。ユーザーが「New」ボタンをクリックすると、フォームはルートルートの action に `POST` します。

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

これで完了です！「New」ボタンをクリックすると、リストに新しいレコードが追加されます 🥳

<img class="tutorial" loading="lazy" src="/docs-images/contacts/11.webp" />

`createEmptyContact` メソッドは、名前やデータなど何もない空の連絡先を作成します。ただし、レコードは確実に作成されます。

> 🧐 えーっと、どうやってサイドバーが更新されたのですか？どこで `action` 関数を呼び出したのでしょうか？データを再取得するコードはどこにあるのでしょうか？`useState`、`onSubmit`、`useEffect` はどこにあるのでしょうか？

これが「昔ながらのウェブ」プログラミングモデルが表れているところです。[`<Form>`][form-component] は、ブラウザがサーバーに要求を送信するのを防ぎ、代わりに [`fetch`][fetch] を使用して、要求をルートの `action` 関数に送信します。

ウェブセマンティクスでは、`POST` は通常、データが変更されていることを意味します。慣例として、Remix はこれをヒントとして使用し、`action` が完了したら、ページのデータを自動的に再検証します。

実際、すべてが HTML と HTTP であるため、JavaScript を無効にしても、すべて正常に動作します。Remix がフォームをシリアル化してサーバーに [`fetch`][fetch] 要求を送信するのではなく、ブラウザがフォームをシリアル化してドキュメント要求を送信します。そこから、Remix はページをサーバー側でレンダリングし、送信します。最終的には、同じ UI になります。

しかし、JavaScript は、ファビコンをスピンさせたり、静的なドキュメントを表示するよりも、より良いユーザーエクスペリエンスを実現するため、そのままにしておきます。

## データを更新する

新しいレコードの情報を追加する方法を作成しましょう。

データの作成と同様に、[`<Form>`][form-component] を使用してデータを更新します。`app/routes/contacts.$contactId_.edit.tsx` に新しいルートを作成しましょう。

👉 **編集コンポーネントを作成する**

```shellscript nonumber
touch app/routes/contacts.\$contactId_.edit.tsx
```

`$contactId_` の `_` に注目してください。デフォルトでは、ルートは、同じプレフィックスを持つルートの中に自動的にネストされます。末尾に `_` を追加すると、ルートが `app/routes/contacts.$contactId.tsx` 内にネストされ **ない** ように指定されます。詳細については、[ルートファイルの命名][routes-file-conventions] ガイドを参照してください。

👉 **編集ページの UI を追加する**

これまでと同じなので、コピー＆ペーストしてください。

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

新しいレコードをクリックし、「Edit」ボタンをクリックすると、新しいルートが表示されるはずです。

<img class="tutorial" loading="lazy" src="/docs-images/contacts/12.webp" />

## `FormData` を使った連絡先の更新

作成したばかりの編集ルートには、すでに `form` がレンダリングされています。必要なのは、`action` 関数を追加することだけです。Remix は `form` をシリアル化し、[`fetch`][fetch] を使用して `POST` し、すべてのデータを自動的に再検証します。

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

フォームに入力して「Save」をクリックすると、このような画面が表示されるはずです！（視覚的に見やすく、毛並みが少なくなっているはずです）

<img class="tutorial" loading="lazy" src="/docs-images/contacts/13.webp" />

## 変更に関する議論

> 😑 動作したけど、何が起こっているのか全く理解できない...

もう少し掘り下げてみましょう...

`contacts.$contactId_.edit.tsx` を開き、`form` 要素を見てください。それぞれに `name` があることに注目してください。

```tsx filename=app/routes/contacts.$contactId_.edit.tsx lines=[4]
<input
  defaultValue={contact.first}
  aria-label="First name"
  name="first"
  type="text"
  placeholder="First"
/>
```

JavaScript がなければ、フォームが送信されると、ブラウザは [`FormData`][form-data] を作成し、サーバーに送信する要求のボディとして設定します。前述のように、Remix はこれを防ぎ、ブラウザをエミュレートして、[`FormData`][form-data] を含めて、[`fetch`][fetch] を使用して要求を `action` 関数に送信します。

`form` の各フィールドは、`formData.get(name)` でアクセスできます。たとえば、上記の入力フィールドの場合、次のようにして姓と名をアクセスできます。

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

フォームフィールドがいくつかあるため、[`Object.fromEntries`][object-from-entries] を使用して、すべてのフィールドをオブジェクトにまとめました。これは、`updateContact` 関数が必要とするものです。

```tsx filename=app/routes/contacts.$contactId_.edit.tsx nocopy
const updates = Object.fromEntries(formData);
updates.first; // "Some"
updates.last; // "Name"
```

`action` 関数以外に、ここで説明する API は、Remix によって提供されているものではありません。[`request`][request]、[`request.formData`][request-form-data]、[`Object.fromEntries`][object-from-entries] はすべて、ウェブプラットフォームによって提供されています。

`action` 関数が完了した後、最後に [`redirect`][redirect] があることに注目してください。

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

`action` 関数と `loader` 関数の両方は、[「Response」を返すことができます][returning-response-instances]（`Request`][request] を受け取っていることから、理にかなっています！）。[`redirect`][redirect] ヘルパーは、アプリに場所を変更するよう指示する [`Response`][response] を返すだけです。

クライアントサイドルーティングがない場合、サーバーが `POST` 要求後にリダイレクトすると、新しいページは最新のデータをフェッチしてレンダリングします。前述のように、Remix はこのモデルをエミュレートし、`action` の呼び出し後にページのデータを自動的に再検証します。そのため、フォームを保存すると、サイドバーが自動的に更新されます。クライアントサイドルーティングがないと、追加の再検証コードは存在しないため、Remix でも存在する必要はありません！

最後の注意点です。JavaScript がなければ、[`redirect`][redirect] は通常の redirect になります。しかし、JavaScript があれば、クライアントサイドの redirect になるため、スクロール位置やコンポーネントの状態など、クライアント側の状態が失われません。

## 新しいレコードを編集ページにリダイレクトする

これでリダイレクトする方法がわかったため、新しい連絡先を作成する action を更新して、編集ページにリダイレクトするようにしましょう。

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

これでレコードが複数あるため、サイドバーでどのレコードを見ているのかわかりにくくなっています。[`NavLink`][nav-link] を使用して解決しましょう。

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

`className` に関数を渡していることに注目してください。ユーザーが `<NavLink to>` と一致する URL にいる場合、`isActive` は true になります。アクティブになる _直前_ （データがまだ読み込まれている間）、`isPending` は true になります。これにより、ユーザーがどこにいるかを簡単に示すことができ、リンクをクリックしてもデータの読み込みが必要な場合に、すぐにフィードバックを提供できます。

<img class="tutorial" loading="lazy" src="/docs-images/contacts/15.webp"/>

## グローバルな Pending UI

ユーザーがアプリ内を移動すると、Remix は、次のページのデータが読み込まれる間、前のページを表示したままにします。リスト間をクリックすると、アプリが少し反応しないように感じるかもしれません。アプリが反応していないように感じないように、ユーザーにフィードバックを提供しましょう。

Remix は、すべての状態を裏側で管理し、動的なウェブアプリを構築するために必要な部分を明らかにしてくれます。この場合、[`useNavigation`][use-navigation] フックを使用します。

👉 **`useNavigation` を使用して、グローバルな Pending UI を追加する**

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
