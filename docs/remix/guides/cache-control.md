---
title: Cache-Control
hidden: true
---

# キャッシュ制御

## ルートモジュール内

各ルートは、HTTPヘッダーを定義することもできます。これは主にHTTPキャッシュにとって重要です。Remixは、パフォーマンスのためにウェブサイトを静的ファイルにビルドしてCDNにアップロードすることに依存するのではなく、キャッシュヘッダーに依存します。どちらのアプローチの結果も同じです。CDN上の静的ドキュメントです。[詳細については、このビデオをご覧ください][check-out-this-video-for-more-information-on-that]。

通常、キャッシュヘッダーの設定は難しいものです。Remixでは、それが簡単になりました。ルートから`headers`関数をエクスポートするだけです。

```tsx
export function headers() {
  return {
    "Cache-Control": "public, max-age=300, s-maxage=3600",
  };
}

export function meta() {
  /* ... */
}

export default function Gists() {
  /* ... */
}
```

max-ageは、ユーザーのブラウザに300秒、つまり5分間キャッシュするように指示します。つまり、5分以内に戻るボタンをクリックしたり、同じページへのリンクをクリックしたりした場合、ブラウザはページのリクエストを送信せず、キャッシュを使用します。

s-maxageは、CDNに1時間キャッシュするように指示します。最初の人がウェブサイトにアクセスしたときの様子は次のとおりです。

1. リクエストがウェブサイト（実際にはCDN）に届きます。
2. CDNはドキュメントをキャッシュしていないため、サーバー（「オリジンサーバー」）にリクエストを送信します。
3. サーバーはページを構築し、CDNに送信します。
4. CDNはそれをキャッシュし、訪問者に送信します。

次に、次の人がページにアクセスすると、次のようになります。

1. リクエストがCDNに届きます。
2. CDNはすでにドキュメントをキャッシュしており、オリジンサーバーに触れることなくすぐに送信します。

[CDNキャッシュ][cdn-caching]ガイドでキャッシュについてさらに詳しく説明しますので、ぜひお読みください。

## ローダー内

ルートがキャッシュ制御を定義できることはわかりましたが、ローダーにとってなぜ重要なのでしょうか？それには2つの理由があります。

まず、データは通常、マークアップよりも頻繁に変更されるため、キャッシュ制御がどうあるべきかをルートよりもよく知っています。このため、ローダーのヘッダーはルートのヘッダー関数に渡されます。

`app/routes/gists.ts`を開き、ヘッダー関数を次のように更新します。

```tsx
export function headers({
  loaderHeaders,
}: {
  loaderHeaders: Headers;
}) {
  return {
    "Cache-Control": loaderHeaders.get("Cache-Control"),
  };
}
```

`loaderHeaders`オブジェクトは、[Web Fetch API Headersコンストラクター][web-fetch-api-headers-constructor]のインスタンスです。

これで、ブラウザまたはCDNがページをキャッシュしようとすると、通常は必要なデータソースからヘッダーを取得します。この場合、実際にはGitHubがfetchのレスポンスで送信したヘッダーを使用しているだけです。

これが重要な2番目の理由は、Remixがクライアント側のトランジションでブラウザの`fetch`を介してローダーを呼び出すためです。ここで適切なキャッシュヘッダーを返すことで、ユーザーが戻る/進むボタンをクリックしたり、同じページに複数回アクセスしたりした場合、ブラウザは実際にはデータの別のリクエストを送信せず、代わりにキャッシュされたバージョンを使用します。これにより、CDNでキャッシュできないページでも、ウェブサイトのパフォーマンスが大幅に向上します。多くのReactアプリはJavaScriptキャッシュに依存していますが、ブラウザキャッシュはすでに非常にうまく機能しています。

[check-out-this-video-for-more-information-on-that]: https://youtu.be/bfLFHp7Sbkg
[cdn-caching]: ../guides/caching
[web-fetch-api-headers-constructor]: https://developer.mozilla.org/en-US/docs/Web/API/Headers

