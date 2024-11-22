---
title: replace
toc: false
---

# `replace`

これは、[`redirect`][redirect] の小さなラッパーで、`history.pushState` ではなく `history.replaceState` を使用して、新しい場所にクライアント側のリダイレクトをトリガーします。

JavaScript がロードされていない場合、これは標準のドキュメントレベルのリダイレクトとして動作し、履歴スタックに新しいエントリを追加します。

[`redirect`][redirect] と同様に、2 番目のパラメーターとしてステータスコードまたは `ResponseInit` を受け取ります。

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

