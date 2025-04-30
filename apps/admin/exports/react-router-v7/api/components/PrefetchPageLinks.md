---
title: PrefetchPageLinks
---

# PrefetchPageLinks

[MODES: framework]

## 概要

[リファレンスドキュメント ↗](https://api.reactrouter.com/v7/functions/react_router.PrefetchPageLinks.html)

別のページのモジュールとデータに対して `<link rel=prefetch|modulepreload>` タグをレンダリングし、そのページへの即時ナビゲーションを可能にします。 `<Link prefetch>` は内部でこれを使用しますが、他の理由でページをプリフェッチするためにレンダリングすることもできます。

```tsx
import { PrefetchPageLinks } from "react-router";

<PrefetchPageLinks page="/absolute/path" />;
```

たとえば、ユーザーが検索フィールドに入力するときに、検索結果をクリックする前にプリフェッチするために、これのいずれかをレンダリングできます。

## Props

### crossOrigin

[modes: framework]

要素がクロスオリジンリクエストをどのように処理するか

### disabled

[modes: framework]

リンクが無効になっているかどうか

### hrefLang

[modes: framework]

リンクされたリソースの言語

### integrity

[modes: framework]

Subresource Integrity チェックで使用される Integrity メタデータ

### media

[modes: framework]

適用可能なメディア: "screen", "print", "(max-width: 764px)"

### page

[modes: framework]

プリフェッチするページの絶対パス。

### referrerPolicy

[modes: framework]

要素によって開始されたフェッチのリファラーポリシー

