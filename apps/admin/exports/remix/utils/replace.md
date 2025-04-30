---
title: replace
toc: false
---

# `replace`

これは、[`redirect`][redirect] の小さなラッパーで、`history.pushState` の代わりに `history.replaceState` を使用して、新しい場所にクライアントサイドのリダイレクトをトリガーします。

JavaScript がロードされていない場合、これは標準のドキュメントレベルのリダイレクトとして動作し、履歴スタックに新しいエントリを追加します。

[`redirect`][redirect] と同様に、2番目のパラメータとしてステータスコードまたは `ResponseInit` を受け入れます。

```ts
replace(path, 301);
replace(path, 303);
```

```ts
replace(path, {
  headers: {
    "Set-Cookie": await commitSession(session),
  },
});
```

[redirect]: ./redirect

