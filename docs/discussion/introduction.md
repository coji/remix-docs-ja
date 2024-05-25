---
title: はじめに、技術的な説明
order: 1
---

# はじめに、技術的な説明

[React Router][react_router]の上に構築されたRemixは、次の4つのものです。

1. コンパイラ
2. サーバーサイドHTTPハンドラー
3. サーバーフレームワーク
4. ブラウザフレームワーク

## コンパイラ

Remixのすべては、コンパイラから始まります: `remix vite:build`。[Vite]を使用して、次のものが作成されます。

1. サーバーHTTPハンドラー。通常は`build/server/index.js`にあります（構成可能です）。これには、すべてのルートとモジュールが含まれており、サーバーでレンダリングし、リソースに対する他のサーバーサイドリクエストを処理できます。
2. ブラウザビルド。通常は`build/client/*`にあります。これには、ルートによる自動コード分割、フィンガープリントされたアセットインポート（CSSや画像など）などが含まれます。アプリケーションをブラウザで実行するために必要なものすべてが含まれます。
3. アセットマニフェスト。クライアントとサーバーの両方で、このマニフェストを使用して、依存関係グラフ全体を認識します。これは、初期サーバーレンダリングでリソースをプリロードしたり、クライアントサイドの遷移のためにリソースをプリフェッチしたりするのに役立ちます。これは、Remixが今日のウェブアプリケーションで一般的なレンダリング+フェッチのウォーターフォールを排除できる方法です。

これらのビルドアーティファクトを使用して、アプリケーションをJavaScriptを実行する任意のホスティングサービスにデプロイできます。

## HTTPハンドラーとアダプター

Remixはサーバー上で実行されますが、実際にはサーバーではありません。単に実際のJavaScriptサーバーに渡されるハンドラーです。

[Web Fetch API][fetch]をベースに構築されており、Node.jsではありません。これにより、Remixは[Vercel][vercel]、[Netlify][netlify]、[Architect][arc]などのNode.jsサーバーだけでなく、[Cloudflare Workers][cf]や[Deno Deploy][deno]などの非Node.js環境でも実行できます。

これが、Expressアプリで実行されているときのRemixの例です。

```ts lines=[2,6-9]
const remix = require("@remix-run/express");
const express = require("express");

const app = express();

app.all(
  "*",
  remix.createRequestHandler({
    build: require("./build/server"),
  })
);
```

Express（またはNode.js）が実際のサーバーであり、Remixは単にそのサーバー上のハンドラーです。`"@remix-run/express"`パッケージは、アダプターと呼ばれます。Remixハンドラーは、サーバーに依存しません。アダプターは、サーバーの要求/応答APIを、入力時のFetch APIに変換し、RemixからのFetch応答を、サーバーの応答APIに変換することで、特定のサーバーで動作するようにします。アダプターが実行する処理の擬似コードを以下に示します。

```ts
export function createRequestHandler({ build }) {
  // サーバービルドからFetch API要求ハンドラーを作成します
  const handleRequest = createRemixRequestHandler(build);

  // express.jsサーバー用のexpress.js固有のハンドラーを返します
  return async (req, res) => {
    // express.reqをFetch API要求に適合させます
    const request = createRemixRequest(req);

    // アプリハンドラーを呼び出し、Fetch API応答を受け取ります
    const response = await handleRequest(request);

    // Fetch API応答をexpress.resに適合させます
    sendRemixResponse(res, response);
  };
}
```

実際のアダプターは、それ以上のことを行いますが、これが要点です。これにより、Remixをどこでもデプロイできるだけでなく、既存のJavaScriptサーバーで段階的に導入することもできます。なぜなら、サーバーが引き続き処理するRemix以外のルートを持つことができるからです。

さらに、Remixにまだサーバーのアダプターがない場合は、アダプターのソースを見て、独自のアダプターを作成することができます。

## サーバーフレームワーク

RailsやLaravelなどのサーバーサイドMVCウェブフレームワークに精通しているなら、Remixはビューとコントローラーですが、モデルはユーザーに任されます。JavaScriptエコシステムには、そのスペースを埋めるための優れたデータベース、ORM、メーラーなどがたくさんあります。Remixには、Cookieやセッション管理のためのFetch APIのヘルパーもあります。

ビューとコントローラーを分離するのではなく、Remixルートモジュールは両方の責任を負います。

ほとんどのサーバーサイドフレームワークは「モデル中心」です。コントローラーは、単一のモデルに対して_複数のURL_を管理します。

Remixは_UI中心_です。ルートは、URL全体またはURLのセグメントのみを処理できます。ルートがセグメントにのみマッピングされている場合、ネストされたURLセグメントはUI内のネストされたレイアウトになります。このように、各レイアウト（ビュー）は独自のコンローラーになり、Remixはデータとコンポーネントをアグリゲートして、完全なUIを構築します。

ほとんどの場合、RemixルートモジュールにはUIとモデルとのインタラクションの両方が同じファイルに含まれており、開発者の使いやすさと生産性に優れています。

ルートモジュールには、`loader`、`action`、`default`（コンポーネント）の3つの主要なエクスポートがあります。

```tsx
// ローダーはサーバーでのみ実行され、GETリクエストでコンポーネントにデータを提供します
export async function loader() {
  return json(await db.projects.findAll());
}

// デフォルトのエクスポートは、ルートがURLに一致したときにレンダリングされるコンポーネントです。これはサーバーとクライアントの両方で実行されます
export default function Projects() {
  const projects = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();

  return (
    <div>
      {projects.map((project) => (
        <Link key={project.slug} to={project.slug}>
          {project.title}
        </Link>
      ))}

      <Form method="post">
        <input name="title" />
        <button type="submit">新規プロジェクトを作成</button>
      </Form>
      {actionData?.errors ? (
        <ErrorMessages errors={actionData.errors} />
      ) : null}

      {/* アウトレットは、このルートよりも深いURLに一致するネストされた子ルートをレンダリングします。これにより、各レイアウトはUIとコントローラーのコードを同じファイルに共存させることができます */}
      <Outlet />
    </div>
  );
}

// アクションはサーバーでのみ実行され、POST、PUT、PATCH、DELETEを処理します。また、コンポーネントにデータを提供することもできます
export async function action({
  request,
}: ActionFunctionArgs) {
  const form = await request.formData();
  const errors = validate(form);
  if (errors) {
    return json({ errors });
  }
  await createProject({ title: form.get("title") });
  return json({ ok: true });
}
```

実際には、ブラウザのJavaScriptを一切使用せずに、サーバーサイドフレームワークとしてのみRemixを使用することができます。`loader`を使ったデータ読み込み、`action`を使った更新処理、HTMLフォーム、URLでレンダリングされるコンポーネントというルートの慣習は、多くのウェブプロジェクトの主要な機能を提供することができます。

このように、**Remixはスケールダウンします**。アプリケーションのすべてのページにブラウザに大量のJavaScriptが必要なわけではなく、すべてのユーザーインタラクションにブラウザのデフォルトの動作以外の特別な要素が必要なわけではありません。Remixでは、最初にシンプルな方法で構築し、その後、基本的なモデルを変更せずにスケールアップすることができます。さらに、アプリケーションの大部分は、ブラウザでJavaScriptが読み込まれる前に動作するため、Remixアプリケーションは設計上、不安定なネットワーク状況に強くなります。

従来のバックエンドウェブフレームワークに精通していない場合、Remixルートを、すでに独自のAPIルートであり、サーバーでのデータの読み込みと送信方法をすでに知っているReactコンポーネントと考えることができます。

## ブラウザフレームワーク

Remixがブラウザにドキュメントを提供すると、ブラウザビルドのJavaScriptモジュールでページを「ハイドレート」します。ここで、Remixが「ブラウザをエミュレートする」という話をよく耳にするでしょう。

ユーザーがリンクをクリックすると、ドキュメント全体とすべてのアセットをサーバーに送り返すのではなく、Remixは次のページのデータを取得して、UIを更新するだけです。

さらに、ユーザーが`<Form>`を送信してデータを更新する場合、通常のHTMLドキュメント要求を行うのではなく、ブラウザランタイムはサーバーにフェッチを実行し、ページ上のすべてのデータを自動的に再検証して、Reactで更新します。

これは、フルドキュメント要求を行うよりも、多くのパフォーマンス上の利点があります。

1. アセットを再ダウンロードする必要がありません（またはキャッシュから取得する必要がありません）
2. アセットをブラウザで再解析する必要がありません
3. フェッチされるデータは、ドキュメント全体よりもはるかに小さいです（場合によっては桁違いに小さいです）
4. RemixはHTML API（`<a>`と`<form>`）を拡張するため、アプリケーションはJavaScriptが読み込まれる前に動作する傾向があります。

Remixには、クライアントサイドのナビゲーションのための組み込みの最適化もいくつかあります。2つのURL間でどのレイアウトが保持されるかを認識するため、変更されるレイアウトのデータのみを取得します。フルドキュメント要求では、すべてのデータをサーバーで取得する必要があり、バックエンドのリソースを無駄にし、アプリケーションの速度を遅くします。

このアプローチは、サイドバーナビゲーションのスクロール位置をリセットしない、ドキュメントの先頭よりも意味のある場所にフォーカスを移動できるなど、UX上の利点も持ち合わせています。

Remixは、ユーザーがリンクをクリックしようとしたときに、ページのすべてのリソースをプリフェッチすることもできます。ブラウザフレームワークは、コンパイラの資産マニフェストについて知っています。リンクのURLとマニフェストを照合し、次のページのすべてのデータ、JavaScriptモジュール、さらにはCSSリソースをプリフェッチすることができます。これは、Remixアプリケーションがネットワークが遅くても高速に感じる理由です。

その後、RemixはクライアントサイドのAPIを提供するため、HTMLとブラウザの基本的なモデルを変更せずに、リッチなユーザーエクスペリエンスを作成することができます。

前のルートモジュールを例に、以下は、ブラウザのJavaScriptでしかできない、小さなながらも便利なUXの改善をいくつか紹介します。

1. フォームを送信中はボタンを無効にする
2. サーバーサイドのフォーム検証に失敗した場合、入力にフォーカスを当てる
3. エラーメッセージをアニメーションで表示する

```tsx lines=[4-6,8-12,23-26,30-32] nocopy
export default function Projects() {
  const projects = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const { state } = useNavigation();
  const busy = state === "submitting";
  const inputRef = React.useRef();

  React.useEffect(() => {
    if (actionData.errors) {
      inputRef.current.focus();
    }
  }, [actionData]);

  return (
    <div>
      {projects.map((project) => (
        <Link key={project.slug} to={project.slug}>
          {project.title}
        </Link>
      ))}

      <Form method="post">
        <input ref={inputRef} name="title" />
        <button type="submit" disabled={busy}>
          {busy ? "作成中..." : "新規プロジェクトを作成"}
        </button>
      </Form>

      {actionData?.errors ? (
        <FadeIn>
          <ErrorMessages errors={actionData.errors} />
        </FadeIn>
      ) : null}

      <Outlet />
    </div>
  );
}
```

このコードサンプルで最も興味深い点は、**追加的**であることです。インタラクション全体は本質的に同じであり、JavaScriptが読み込まれる前に基本的なレベルで動作します。唯一の違いは、ユーザーフィードバックがアプリケーション（`useNavigation().state`）ではなく、ブラウザ（スピニングファビコンなど）によって提供されることです。

Remixはバックエンドのコントローラーレベルに到達するため、シームレスに行うことができます。

そして、RailsやLaravelなどのサーバーサイドフレームワークほどスタックの奥深くには到達しませんが、スタックのずっと上にあるブラウザに到達し、バックエンドからフロントエンドへの移行をシームレスにします。

例えば、プレーンなHTMLフォームとサーバーサイドハンドラーをバックエンド重視のウェブフレームワークで構築することは、Remixで行うのと同じくらい簡単です。しかし、アニメーション化されたバリデーションメッセージ、フォーカス管理、保留中のUIを持つエクスペリエンスに移行すると、コードに根本的な変更が必要になります。通常、APIルートを構築し、クライアントサイドのJavaScriptを少し追加して、両方を接続します。Remixでは、既存の「サーバーサイドビュー」の周りにコードを追加するだけで、本質的な動作を変更せずに済むのです。ブラウザランタイムは、サーバーとの通信を引き継ぎ、ブラウザのデフォルトの動作を超えた、強化されたユーザーエクスペリエンスを提供します。

古い用語を借りて、Remixではこれをプログレッシブエンハンスメントと呼びます。プレーンなHTMLフォームで小さく始め（Remixはスケールダウンします）、時間と意欲があればUIをスケールアップします。

[vite]: https://vitejs.dev
[cf]: https://workers.cloudflare.com/
[deno]: https://deno.com/deploy/docs
[fetch]: https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API
[vercel]: https://vercel.com
[netlify]: https://netlify.com
[arc]: https://arc.codes
[react_router]: https://reactrouter.com


