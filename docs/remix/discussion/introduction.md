---
title: はじめに、技術的な説明
order: 1
---

# はじめに、技術的な説明

[React Router][react_router] をベースに構築された Remix は、次の 4 つの要素で構成されています。

1. コンパイラ
2. サーバーサイド HTTP ハンドラー
3. サーバーフレームワーク
4. ブラウザフレームワーク

## コンパイラ

Remixのすべてはコンパイラから始まります: `remix vite:build`。[Vite] を使用して、これはいくつかのものを生成します。

1. サーバーHTTPハンドラー。通常は `build/server/index.js` にあります（設定可能です）。これには、サーバー上でレンダリングしたり、リソースに対する他のサーバーサイドリクエストを処理したりできるように、すべてのルートとモジュールが含まれています。
2. ブラウザビルド。通常は `build/client/*` にあります。これには、ルートごとの自動コード分割、フィンガープリントされたアセットインポート（CSSや画像など）などが含まれています。ブラウザでアプリケーションを実行するために必要なものがすべて含まれています。
3. アセットマニフェスト。クライアントとサーバーの両方が、このマニフェストを使用して依存関係グラフ全体を把握します。これは、初期サーバーレンダリングでリソースをプリロードしたり、クライアントサイドのトランジションのためにプリフェッチしたりするのに役立ちます。これが、Remixが今日のWebアプリでよく見られるレンダリング+フェッチのウォーターフォールを排除できる理由です。

これらのビルド成果物を使用すると、JavaScriptを実行する任意のホスティングサービスにアプリケーションをデプロイできます。

## HTTPハンドラーとアダプター

Remixはサーバー上で動作しますが、実際にはサーバーではありません。それは、実際のJavaScriptサーバーに与えられるハンドラーにすぎません。

Node.jsの代わりに[Web Fetch API][fetch]上に構築されています。これにより、Remixは[Vercel][vercel]、[Netlify][netlify]、[Architect][arc]などのNode.jsサーバーだけでなく、[Cloudflare Workers][cf]や[Deno Deploy][deno]などの非Node.js環境でも実行できます。

以下は、expressアプリでRemixを実行する場合の例です。

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

Express（またはNode.js）が実際のサーバーであり、Remixはそのサーバー上の単なるハンドラーです。`"@remix-run/express"`パッケージはアダプターと呼ばれます。Remixハンドラーはサーバーに依存しません。アダプターは、サーバーのrequest/response APIをFetch APIに変換し、RemixからのFetch Responseをサーバーのresponse APIに適合させることで、特定のサーバーで動作するようにします。以下は、アダプターが行うことの擬似コードです。

```ts
export function createRequestHandler({ build }) {
  // サーバービルドからFetch APIリクエストハンドラーを作成します
  const handleRequest = createRemixRequestHandler(build);

  // express.jsサーバー用のexpress.js固有のハンドラーを返します
  return async (req, res) => {
    // express.reqをFetch APIリクエストに適合させます
    const request = createRemixRequest(req);

    // アプリハンドラーを呼び出し、Fetch APIレスポンスを受け取ります
    const response = await handleRequest(request);

    // Fetch APIレスポンスをexpress.resに適合させます
    sendRemixResponse(res, response);
  };
}
```

実際のアダプターはもう少し多くのことを行いますが、それが要点です。これにより、Remixをどこにでもデプロイできるだけでなく、既存のJavaScriptサーバーに段階的に採用することもできます。Remixの外部に、サーバーがRemixに到達する前に処理を続けるルートを持つことができるからです。

さらに、Remixにサーバー用のアダプターがまだない場合は、いずれかのアダプターのソースを見て、独自のアダプターを構築できます。

[fetch]: https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API
[vercel]: https://vercel.com
[netlify]: https://netlify.com
[arc]: https://arc.codes
[cf]: https://workers.cloudflare.com/
[deno]: https://deno.com/deploy/docs

## サーバーフレームワーク

RailsやLaravelのようなサーバーサイドのMVCウェブフレームワークに馴染みがあるなら、RemixはViewとControllerに相当しますが、Modelはあなたに任されています。JavaScriptのエコシステムには、その役割を果たすための優れたデータベース、ORM、メーラーなどがたくさんあります。Remixには、Cookieとセッション管理のためのFetch APIに関するヘルパーも用意されています。

ViewとControllerが分離している代わりに、Remixのルートモジュールは両方の役割を担います。

ほとんどのサーバーサイドフレームワークは「モデル中心」です。コントローラーは、単一のモデルに対して*複数のURL*を管理します。

Remixは*UI中心*です。ルートは、URL全体またはURLの一部だけを処理できます。ルートが一部だけをマッピングする場合、ネストされたURLセグメントはUI内のネストされたレイアウトになります。このように、各レイアウト（ビュー）は独自のコントローラーになることができ、Remixはデータとコンポーネントを集約して完全なUIを構築します。

多くの場合、Remixのルートモジュールには、UIとモデルとのインタラクションの両方を同じファイルに含めることができ、これにより、非常に優れた開発者のエルゴノミクスと生産性が実現します。

ルートモジュールには、主に3つのエクスポートがあります。`loader`、`action`、および`default`（コンポーネント）。

```tsx
// ローダーはサーバーでのみ実行され、GETリクエストで
// コンポーネントにデータを提供します
export async function loader() {
  return json(await db.projects.findAll());
}

// デフォルトのエクスポートは、ルートがURLに一致したときに
// レンダリングされるコンポーネントです。これはサーバーと
// クライアントの両方で実行されます
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
        <button type="submit">Create New Project</button>
      </Form>
      {actionData?.errors ? (
        <ErrorMessages errors={actionData.errors} />
      ) : null}

      {/* outletsは、このルートよりも深いURLに一致する
          ネストされた子ルートをレンダリングし、各レイアウトが
          UIとコントローラーのコードを同じファイルに
          共存させることができます */}
      <Outlet />
    </div>
  );
}

// アクションはサーバーでのみ実行され、POST、
// PUT、PATCH、およびDELETEを処理します。また、
// コンポーネントにデータを提供することもできます
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

実際には、ブラウザのJavaScriptをまったく使用せずに、Remixをサーバーサイドフレームワークとしてのみ使用できます。`loader`を使用したデータロード、`action`を使用した変更、HTMLフォーム、およびURLでレンダリングされるコンポーネントのルート規約は、多くのWebプロジェクトのコア機能セットを提供できます。

このように、**Remixはスケールダウンします**。アプリケーションのすべてのページにブラウザで大量のJavaScriptが必要なわけではなく、すべてのユーザーインタラクションにブラウザのデフォルトの動作以上の特別な機能が必要なわけではありません。Remixでは、最初にシンプルな方法で構築し、基本的なモデルを変更せずにスケールアップできます。さらに、アプリの大部分はブラウザでJavaScriptがロードされる前に動作するため、Remixアプリは設計上、不安定なネットワーク状態に対して回復力があります。

従来のバックエンドWebフレームワークに馴染みがない場合は、Remixのルートを、すでに独自のAPIルートであり、サーバー上でデータをロードおよび送信する方法をすでに知っているReactコンポーネントと考えることができます。

## ブラウザフレームワーク

Remix がドキュメントをブラウザに配信すると、ブラウザビルドの JavaScript モジュールでページを「ハイドレート」します。ここで、Remix が「ブラウザをエミュレートする」ことについて多く語られます。

ユーザーがリンクをクリックすると、ドキュメント全体とすべてのアセットのためにサーバーへの往復を行う代わりに、Remix は次のページのデータをフェッチして UI を更新するだけです。

さらに、ユーザーがデータを更新するために `<Form>` を送信すると、通常の HTML ドキュメントリクエストを行う代わりに、ブラウザランタイムは代わりにサーバーへのフェッチを行い、ページ上のすべてのデータを自動的に再検証し、React で更新します。

これにより、フルドキュメントリクエストを行うよりも多くのパフォーマンス上の利点があります。

1. アセットを再ダウンロードする必要がない（またはキャッシュから取得する必要がない）
2. アセットをブラウザで再度解析する必要がない
3. フェッチされるデータはドキュメント全体よりもはるかに小さい（場合によっては桁違いに小さい）
4. Remix は HTML API (`<a>` および `<form>`) を拡張するため、アプリはページで JavaScript がロードされる前でも動作する傾向がある

Remix には、クライアント側のナビゲーション用にいくつかの組み込み最適化も含まれています。2 つの URL 間でどのレイアウトが永続化されるかを認識しているため、変更されているレイアウトのデータのみをフェッチします。フルドキュメントリクエストでは、すべてのデータをサーバーでフェッチする必要があり、バックエンドのリソースを浪費し、アプリの速度を低下させます。

このアプローチには、サイドバーナビゲーションのスクロール位置をリセットしない、ドキュメントの先頭よりも理にかなった場所にフォーカスを移動できるなど、UX の利点もあります。

Remix は、ユーザーがリンクをクリックしようとしているときに、ページのすべてのリソースをプリフェッチすることもできます。ブラウザフレームワークは、コンパイラのアセットマニフェストについて認識しています。リンクの URL を照合し、マニフェストを読み取り、次のページのすべてのデータ、JavaScript モジュール、さらには CSS リソースをプリフェッチできます。これが、ネットワークが遅い場合でも Remix アプリが高速に感じられる理由です。

Remix は、クライアント側の API も提供するため、HTML とブラウザの基本的なモデルを変更することなく、豊富なユーザーエクスペリエンスを作成できます。

以前のルートモジュールを使用すると、ブラウザで JavaScript を使用してのみ実行できる、フォームに対するいくつかの小さくても便利な UX の改善を次に示します。

1. フォームが送信されているときにボタンを無効にする
2. サーバー側のフォーム検証が失敗した場合に入力をフォーカスする
3. エラーメッセージをアニメーション表示する

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
          {busy ? "Creating..." : "Create New Project"}
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

このコードサンプルで最も興味深いのは、**追加のみ**であるということです。インタラクション全体は依然として基本的に同じものであり、JavaScript がロードされる前でも基本的なレベルで動作します。唯一の違いは、ユーザーフィードバックがアプリ (`useNavigation().state`) ではなくブラウザ（回転するファビコンなど）によって提供されることです。

Remix はバックエンドのコントローラーレベルに到達するため、これをシームレスに行うことができます。

また、Rails や Laravel などのサーバーサイドフレームワークほどスタックの奥深くまで到達しませんが、バックエンドからフロントエンドへの移行をシームレスにするために、スタックのはるか上にあるブラウザに到達します。

たとえば、バックエンド重視の Web フレームワークでプレーンな HTML フォームとサーバーサイドハンドラーを構築することは、Remix で行うのと同じくらい簡単です。しかし、アニメーション化された検証メッセージ、フォーカスの管理、保留中の UI を備えたエクスペリエンスに移行したい場合は、コードの根本的な変更が必要になります。通常、人々は API ルートを構築し、クライアント側の JavaScript を少し導入して 2 つを接続します。Remix では、既存の「サーバーサイドビュー」の周りにコードを追加するだけで、その動作を根本的に変更することはありません。ブラウザランタイムはサーバー通信を引き継ぎ、デフォルトのブラウザの動作を超えた強化されたユーザーエクスペリエンスを提供します。

私たちは古い用語を借りて、これを Remix のプログレッシブエンハンスメントと呼びました。プレーンな HTML フォームから小さく始め（Remix はスケールダウンします）、時間と意欲があるときに UI をスケールアップします。

[vite]: https://vitejs.dev
[cf]: https://workers.cloudflare.com/
[deno]: https://deno.com/deploy/docs
[fetch]: https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API
[vercel]: https://vercel.com
[netlify]: https://netlify.com
[arc]: https://arc.codes
[react_router]: https://reactrouter.com