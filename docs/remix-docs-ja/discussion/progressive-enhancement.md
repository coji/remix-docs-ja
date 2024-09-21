---
title: プログレッシブエンハンスメント
order: 7
---

# プログレッシブエンハンスメント

> プログレッシブエンハンスメントは、ウェブデザインにおける戦略であり、ウェブコンテンツを最初に重視することで、誰もがウェブページの基本的なコンテンツと機能にアクセスできるようにすると同時に、追加のブラウザ機能や高速なインターネットアクセスを持つユーザーには、強化されたバージョンを提供します。

<cite>- [Wikipedia][wikipedia]</cite>

2003年にスティーブン・チャンペオンとニック・フィンックによって提唱されたこの言葉は、さまざまなブラウザ間でCSSとJavaScriptのサポートが異なる時代、多くのユーザーが実際にJavaScriptを無効にしてウェブを閲覧していた時代に生まれたものです。

今日、私たちは、より一貫性のあるウェブのために開発することができ、大多数のユーザーがJavaScriptを有効にしています。

しかし、Remixでは、プログレッシブエンハンスメントのコア原則を今でも信じています。これは、シンプルで開発ワークフローが簡単な、高速で回復力のあるアプリにつながります。

**パフォーマンス**: 接続が遅いユーザーはわずか5%だけだと考えがちですが、実際には、ユーザーの100%が時間の5%は遅い接続に悩まされています。

**回復力**: JavaScriptがロードされるまでは、誰もがJavaScriptを無効にしています。

**シンプルさ**: Remixでプログレッシブエンハンスメントされた方法でアプリを構築することは、従来のSPAを構築するよりも実際には簡単です。

## パフォーマンス

サーバーからHTMLを送信することで、典型的なシングルページアプリケーション（SPA）よりも並列に多くのことを行うことができ、初期の読み込み体験と以降のナビゲーションを高速化できます。

典型的なSPAは、空のドキュメントを送信し、JavaScriptがロードされて初めて処理を開始します。

```
HTML        |---|
JavaScript      |---------|
Data                      |---------------|
                            ページがレンダリングされました👆
```

Remixアプリは、リクエストがサーバーにヒットした瞬間に処理を開始し、レスポンスをストリーミングすることができます。そのため、ブラウザはJavaScript、その他の資産、データを並行してダウンロードを開始することができます。

```
               👇 最初のバイト
HTML        |---|-----------|
JavaScript      |---------|
Data        |---------------|
              ページがレンダリングされました👆
```

## 回復力とアクセシビリティ

ユーザーがJavaScriptを無効にしてウェブを閲覧することはほとんどないかもしれませんが、JavaScriptがロードされるまでは、誰もがJavaScriptを無効にしています。UIのサーバーサイドレンダリングを開始したら、JavaScriptがロードされる前にユーザーがアプリとやり取りしようとするとどうなるかを考慮する必要があります。

Remixは、HTMLの上に抽象化層を構築することで、プログレッシブエンハンスメントを採用しています。つまり、JavaScriptなしで動作するアプリを構築し、JavaScriptを重ねてエクスペリエンスを強化することができます。

最も簡単な例は、`<Link to="/account">`です。これは、JavaScriptなしで動作する`<a href="/account">`タグをレンダリングします。JavaScriptがロードされると、Remixはクリックをインターセプトし、クライアントサイドルーティングでナビゲーションを処理します。これは、ブラウザのタブ内でfaviconをスピンさせるだけではありません。しかし、どちらにしても動作します。

今度は、シンプルなカートに追加ボタンを考えてみましょう。

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

JavaScriptがロードされているかどうかに関係なく、このボタンはカートに製品を追加します。

JavaScriptがロードされると、Remixはフォーム送信をインターセプトし、クライアントサイドで処理します。これにより、独自の保留中のUIやその他のクライアントサイドの動作を追加することができます。

## シンプルさ

HTMLやURLなどのウェブの基本的な機能に依存し始めると、クライアントサイドの状態と状態管理をあまり必要としなくなることに気が付くでしょう。

前のボタンを例に挙げると、コードを根本的に変更することなく、クライアントサイドの動作を追加することができます。

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

この機能は、JavaScriptがロードされているときと同じように動作し続けますが、JavaScriptがロードされると、次のようになります。

- `<Form>`のように、`useFetcher`はナビゲーションを起こさないので、ユーザーは同じページに留まり、買い物を続けることができます。
- アプリのコードは、ブラウザ内でfaviconをスピンさせるのではなく、保留中のUIを決定します。

重要なのは、JavaScript用とJavaScriptなし用に2つの異なる方法で構築することではなく、段階的に構築することです。機能の最もシンプルなバージョンから始めて、配信し、その後、強化されたユーザーエクスペリエンスへと段階的に改善していくのです。

ユーザーはプログレッシブに強化されたエクスペリエンスを得るだけでなく、アプリ開発者は機能の基本設計を変更することなく、UIを「段階的に強化」することができます。

プログレッシブエンハンスメントがシンプルさに繋がるもう一つの例として、URLがあります。URLから始めると、クライアントサイドの状態管理を心配する必要はありません。UIの真実の源として、URLを使用することができます。

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

このコンポーネントは、状態管理を必要としません。単に`/search`に送信されるフォームをレンダリングするだけです。JavaScriptがロードされると、Remixはフォーム送信をインターセプトし、クライアントサイドで処理します。これにより、独自の保留中のUIやその他のクライアントサイドの動作を追加することができます。次の段階は以下のようになります。

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

アーキテクチャの根本的な変更ではなく、ユーザーとコードの両方にプログレッシブな強化を加えているだけです。

参考: [状態管理][state_management]

[wikipedia]: https://en.wikipedia.org/wiki/Progressive_enhancement
[state_management]: ./state-management


