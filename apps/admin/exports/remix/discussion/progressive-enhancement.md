---
title: プログレッシブエンハンスメント
order: 7
---

# プログレッシブエンハンスメント

> プログレッシブエンハンスメントとは、Webデザインにおける戦略であり、Webコンテンツを最優先に考え、すべての人がWebページの基本的なコンテンツと機能にアクセスできるようにし、追加のブラウザ機能や高速なインターネットアクセスを持つユーザーは、代わりに強化されたバージョンを受け取れるようにするものです。

<cite>- [Wikipedia][wikipedia]</cite>

2003年にSteven ChampeonとNick Finckによって作られたこのフレーズは、さまざまなブラウザでCSSとJavaScriptのサポートが異なり、多くのユーザーが実際にJavaScriptを無効にしてWebを閲覧していた時代に登場しました。

今日、私たちはより一貫性のあるWebを開発することができ、ほとんどのユーザーがJavaScriptを有効にしているという幸運に恵まれています。

しかし、私たちは依然としてRemixにおけるプログレッシブエンハンスメントの基本原則を信じています。それは、シンプルで開発ワークフローが簡単な、高速で回復力のあるアプリにつながります。

**パフォーマンス**: ユーザーの5%だけが低速な接続を使用していると考えがちですが、実際には、ユーザーの100%が5%の時間で低速な接続を使用しています。

**回復力**: JavaScriptが読み込まれるまで、誰もがJavaScriptを無効にしています。

**シンプルさ**: Remixでプログレッシブエンハンスされた方法でアプリを構築することは、従来のSPAを構築するよりも実際には簡単です。

## パフォーマンス

サーバーからHTMLを送信することで、アプリは一般的なシングルページアプリ（SPA）よりも多くのことを並行して実行できるようになり、初期ロードエクスペリエンスとそれに続くナビゲーションが高速になります。

一般的なSPAは、空白のドキュメントを送信し、JavaScriptがロードされたときにのみ作業を開始します。

```
HTML        |---|
JavaScript      |---------|
Data                      |---------------|
                            ページがレンダリングされました 👆
```

Remixアプリは、リクエストがサーバーに到達した瞬間に作業を開始し、レスポンスをストリーミングできるため、ブラウザはJavaScript、その他のアセット、およびデータを並行してダウンロードを開始できます。

```
               👇 最初のバイト
HTML        |---|-----------|
JavaScript      |---------|
Data        |---------------|
              ページがレンダリングされました 👆
```

## 回復力とアクセシビリティ

ユーザーはJavaScriptを無効にしてWebを閲覧することはないかもしれませんが、JavaScriptがロードを完了するまで、誰もがJavaScriptを無効にしています。UIのサーバーレンダリングを開始するとすぐに、JavaScriptがロードされる前にアプリを操作しようとしたときに何が起こるかを考慮する必要があります。

Remixは、HTMLの上に抽象化を構築することで、プログレッシブエンハンスメントを採用しています。これは、JavaScriptなしで動作する方法でアプリを構築し、JavaScriptを重ねてエクスペリエンスを向上させることができることを意味します。

最も簡単な例は、`<Link to="/account">`です。これらは、JavaScriptなしで動作する`<a href="/account">`タグをレンダリングします。JavaScriptがロードされると、Remixはクリックをインターセプトし、クライアント側のルーティングでナビゲーションを処理します。これにより、ブラウザタブでファビコンを回転させるだけでなく、UXをより細かく制御できますが、どちらの方法でも機能します。

次に、シンプルなカートに追加ボタンを考えてみましょう。

```tsx
export function AddToCart({ id }) {
  return (
    <Form method="post" action="/add-to-cart">
      <input type="hidden" name="id" value={id} />
      <button type="submit">カートに追加</button>
    </Form>
  );
}
```

JavaScriptがロードされているかどうかは関係なく、このボタンは商品をカートに追加します。

JavaScriptがロードされると、Remixはフォームの送信をインターセプトし、クライアント側で処理します。これにより、独自の保留中のUIやその他のクライアント側の動作を追加できます。

## シンプルさ

HTMLやURLなどのWebの基本機能に依存し始めると、クライアント側の状態や状態管理に頼ることがはるかに少なくなることがわかります。

以前のボタンを考えてみましょう。コードに根本的な変更を加えることなく、クライアント側の動作をいくつか追加できます。

```tsx lines=[1,4,7,10-12,14]
import { useFetcher } from "@remix-run/react";

export function AddToCart({ id }) {
  const fetcher = useFetcher();

  return (
    <fetcher.Form method="post" action="/add-to-cart">
      <input name="id" value={id} />
      <button type="submit">
        {fetcher.state === "submitting"
          ? "追加中..."
          : "カートに追加"}
      </button>
    </fetcher.Form>
  );
}
```

この機能は、JavaScriptのロード中も以前とまったく同じように機能し続けますが、JavaScriptがロードされると次のようになります。

- `useFetcher`は、`<Form>`のようにナビゲーションを引き起こさなくなったため、ユーザーは同じページにとどまり、買い物を続けることができます。
- アプリコードは、ブラウザでファビコンを回転させるのではなく、保留中のUIを決定します。

JavaScript用とJavaScriptなし用の2つの異なる方法で構築するのではなく、反復的に構築することです。機能の最もシンプルなバージョンから始めて出荷し、次にユーザーエクスペリエンスを向上させるために反復します。

ユーザーはプログレッシブに強化されたエクスペリエンスを得るだけでなく、アプリ開発者は機能の基本的な設計を変更することなく、UIを「プログレッシブに強化」することができます。

プログレッシブエンハンスメントがシンプルさにつながるもう1つの例は、URLです。URLから始めると、クライアント側の状態管理について心配する必要はありません。UIの信頼できる情報源としてURLを使用するだけで済みます。

```tsx
export function SearchBox() {
  return (
    <Form method="get" action="/search">
      <input type="search" name="query" />
      <SearchIcon />
    </Form>
  );
}
```

このコンポーネントは、状態管理を必要としません。`/search`に送信するフォームをレンダリングするだけです。JavaScriptがロードされると、Remixはフォームの送信をインターセプトし、クライアント側で処理します。これにより、独自の保留中のUIやその他のクライアント側の動作を追加できます。次に示すのは、次の反復です。

```tsx lines=[1,4-6,11]
import { useNavigation } from "@remix-run/react";

export function SearchBox() {
  const navigation = useNavigation();
  const isSearching =
    navigation.location.pathname === "/search";

  return (
    <Form method="get" action="/search">
      <input type="search" name="query" />
      {isSearching ? <Spinner /> : <SearchIcon />}
    </Form>
  );
}
```

アーキテクチャに根本的な変更はなく、ユーザーとコードの両方にとってプログレッシブな強化です。

こちらも参照してください: [状態管理][state_management]

[wikipedia]: https://en.wikipedia.org/wiki/Progressive_enhancement
[state_management]: ./state-management

