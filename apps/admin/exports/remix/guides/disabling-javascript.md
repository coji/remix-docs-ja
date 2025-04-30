---
title: JavaScript の無効化
toc: false
---

# JavaScript の無効化

サイトのページを見て、「なぜこのページにこんなに JavaScript を読み込んでいるんだ？リンクしかないじゃないか！」と思ったことはありませんか？JavaScript フレームワークとしては少し奇妙に思えるかもしれませんが、ブール値で JavaScript を簡単にオフにすることができ、データ読み込み、リンク、さらにはフォームも引き続き機能します。

ここでは、私たちのやり方を紹介します。

JavaScript を含めたい各ルートモジュールを開き、「handle」を追加します。これは、ルートに関するあらゆる種類のメタ情報を親ルートに提供する方法です（後で説明します）。

```tsx
export const handle = { hydrate: true };
```

次に、`root.tsx` を開き、`useMatches` をインポートして、以下を追加します。

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

  // 少なくとも1つのルートが hydrate を必要とする場合、これは true を返します
  const includeScripts = matches.some(
    (match) => match.handle?.hydrate
  );

  // 次に、フラグを使用してスクリプトをレンダリングするかどうかを決定します
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

すべてのデータ読み込みはサーバーレンダリングで引き続き機能し、すべての `<Link>` は下で通常の `<a>` をレンダリングするため、引き続き機能します。

どのページでも、いつでもプレーンな HTML と完全なクライアントサイドトランジションを切り替えることができます。

少しだけインタラクティブ性が必要な場合は、`<script dangerouslySetInnerHTML>` を使用します。

```tsx
return (
  <>
    <select id="qty">
      <option>1</option>
      <option>2</option>
      <option value="contact">
        詳細については営業にお問い合わせください
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

