---
title: JavaScript の無効化
toc: false
---

# JavaScript の無効化

サイトのページを見て、「なぜこんなに JavaScript を読み込んでいるんだ？ このページにはリンクしかないのに！」と思ったことはありませんか？ JavaScript フレームワークとしては少し奇妙に思えるかもしれませんが、ブール値を使って JavaScript を簡単にオフにすることができます。データの読み込み、リンク、さらにはフォームも引き続き機能します。

私たちがどのように行うかをご紹介します。

JavaScript を含めるルートモジュールを開き、「ハンドル」を追加します。これは、親ルートにルートに関するメタ情報を提供する方法です（後ほど説明します）。

```tsx
export const handle = { hydrate: true };
```

次に、`root.tsx` を開き、`useMatches` を読み込み、以下を追加します。

```tsx filename=app/root.tsx lines=[6,10,13-15,27]
import {
  Meta,
  Links,
  Scripts,
  Outlet,
  useMatches,
} from "@remix-run/react";

export default function App() {
  const matches = useMatches();

  // 少なくとも 1 つのルートがハイドレートする必要がある場合、これは true を返します
  const includeScripts = matches.some(
    (match) => match.handle?.hydrate
  );

  // フラグを使ってスクリプトをレンダリングするか、レンダリングしないか
  return (
    <html lang="en">
      <head>
        <Meta />
        <Links />
      </head>
      <body>
        <Outlet />
        {/* スクリプトを含めるか、含めないか！ */}
        {includeScripts ? <Scripts /> : null}
      </body>
    </html>
  );
}
```

データの読み込みはすべてサーバー側のレンダリングで動作し、`<Link>` はすべて `<a>` に変換されてレンダリングされるため、引き続き機能します。

どのページでも、いつでも、プレーン HTML と完全なクライアント側の遷移を切り替えることができます。

ほんの少しのインタラクティブ機能が必要な場合は、`<script dangerouslySetInnerHTML>` を使用します。

```tsx
return (
  <>
    <select id="qty">
      <option>1</option>
      <option>2</option>
      <option value="contact">
        お問い合わせ
      </option>
    </select>

    <script
      dangerouslySetInnerHTML={{
        __html: `
          document.addEventListener('DOMContentLoaded', () => {
            document.getElementById('qty').onchange = (event) => {
              if (event.target.value === "contact") {
                window.location.assign("/contact")
              }
            }
          });
        `,
      }}
    />
  </>
);
```


