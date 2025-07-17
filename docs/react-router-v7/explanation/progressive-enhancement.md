---
title: プログレッシブエンハンスメント
---

# プログレッシブエンハンスメント

[モード: フレームワーク]

<br/>
<br/>

> プログレッシブエンハンスメントとは、ウェブデザインにおける戦略の一つで、ウェブコンテンツを最優先に考え、すべての人がウェブページの基本的なコンテンツと機能にアクセスできるようにし、追加のブラウザ機能や高速なインターネットアクセスを持つユーザーには、代わりに強化されたバージョンを提供するものです。
>
> <cite>- [Wikipedia][wikipedia]</cite>

React Routerをサーバーサイドレンダリング（フレームワークモードではデフォルト）で使用すると、プログレッシブエンハンスメントのメリットを自動的に活用できます。

## プログレッシブエンハンスメントが重要な理由

2003年にSteven ChampeonとNick Finckによって提唱されたこのフレーズは、さまざまなブラウザでCSSとJavaScriptのサポートが異なり、多くのユーザーが実際にJavaScriptを無効にしてウェブを閲覧していた時代に生まれました。

今日、私たちはより一貫性のあるウェブを開発でき、ほとんどのユーザーがJavaScriptを有効にしていることを幸運に思っています。

しかし、私たちはReact Routerにおけるプログレッシブエンハンスメントの中核となる原則を今でも信じています。それは、シンプルで開発ワークフローが簡単な、高速で回復力のあるアプリにつながります。

**パフォーマンス**: ユーザーの5%だけが遅い接続を持っていると考えがちですが、実際には、ユーザーの100%が時間の5%は遅い接続を持っています。

**回復力**: JavaScriptがロードされるまで、誰もがJavaScriptを無効にしています。

**シンプルさ**: React Routerを使用してプログレッシブエンハンスメントされた方法でアプリを構築することは、従来のSPAを構築するよりも実際には簡単です。

## パフォーマンス

サーバーレンダリングを使用すると、アプリは典型的な[シングルページアプリ（SPA）][spa]よりも多くのことを並行して実行できるため、初期ロードエクスペリエンスと後続のナビゲーションが高速になります。

典型的なSPAは空白のドキュメントを送信し、JavaScriptがロードされたときにのみ作業を開始します。

```
HTML        |---|
JavaScript      |---------|
Data                      |---------------|
                            ページがレンダリングされました 👆
```

React Routerアプリは、リクエストがサーバーに到達した瞬間に作業を開始し、ブラウザがJavaScript、その他のアセット、およびデータを並行してダウンロードできるように、レスポンスをストリーミングできます。

```
               👇 最初のバイト
HTML        |---|-----------|
JavaScript      |---------|
Data        |---------------|
              ページがレンダリングされました 👆
```

## 回復力とアクセシビリティ

ユーザーはJavaScriptを無効にしてウェブを閲覧することはないかもしれませんが、JavaScriptのロードが完了する前に、誰もがJavaScriptなしでウェブサイトを使用します。React Routerは、HTMLの上に構築することでプログレッシブエンハンスメントを採用し、JavaScriptなしで動作する方法でアプリを構築し、JavaScriptを重ねてエクスペリエンスを向上させることができます。

最も簡単なケースは、`<Link to="/account">`です。これらは、JavaScriptなしで動作する`<a href="/account">`タグをレンダリングします。JavaScriptがロードされると、React Routerはクリックをインターセプトし、クライアント側のルーティングでナビゲーションを処理します。これにより、ブラウザタブでfaviconを回転させるだけでなく、UXをより細かく制御できますが、どちらの方法でも動作します。

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

JavaScriptがロードされているかどうかは関係ありません。このボタンは商品をカートに追加します。

JavaScriptがロードされると、React Routerはフォームの送信をインターセプトし、クライアント側で処理します。これにより、独自の保留中のUIやその他のクライアント側の動作を追加できます。

## シンプルさ

HTMLやURLなどのウェブの基本的な機能に依存し始めると、クライアント側の状態や状態管理に頼ることがはるかに少なくなることがわかります。

以前のボタンを考えてみましょう。コードに根本的な変更を加えることなく、クライアント側の動作をいくつか追加できます。

```tsx lines=[1,4,7,10-12,14]
import { useFetcher } from "react-router";

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

この機能は、JavaScriptのロード中に以前と同じように動作し続けますが、JavaScriptがロードされると：

- `useFetcher`は、`<Form>`のようにナビゲーションを引き起こさなくなったため、ユーザーは同じページにとどまり、買い物を続けることができます。
- アプリコードは、ブラウザでfaviconを回転させる代わりに、保留中のUIを決定します。

JavaScript用とJavaScriptなしの2つの異なる方法で構築するのではなく、反復的に構築することです。機能の最も単純なバージョンから始めて出荷し、次に反復してユーザーエクスペリエンスを向上させます。

ユーザーはプログレッシブエンハンスメントされたエクスペリエンスを得るだけでなく、アプリ開発者は機能の基本的な設計を変更せずにUIを「プログレッシブエンハンスメント」できます。

プログレッシブエンハンスメントがシンプルさにつながるもう1つの例は、URLです。URLから始めると、クライアント側の状態管理について心配する必要はありません。URLをUIの信頼できる情報源として使用できます。

```tsx
export function SearchBox() {
  return (
    <Form method="get" action="/search">
      <input type="search" name="query" />
      {isSearching ? <Spinner /> : <SearchIcon />}
    </Form>
  );
}
```

このコンポーネントは状態管理を必要としません。`/search`に送信するフォームをレンダリングするだけです。JavaScriptがロードされると、React Routerはフォームの送信をインターセプトし、クライアント側で処理します。次に反復処理を示します。

```tsx lines=[1,4-6,11]
import { useNavigation } from "react-router";

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

アーキテクチャに根本的な変更はなく、ユーザーとコードの両方に対するプログレッシブエンハンスメントです。

こちらもご覧ください：[状態管理][state_management]

[wikipedia]: https://en.wikipedia.org/wiki/Progressive_enhancement
[spa]: ../how-to/spa
[state_management]: ./state-management
