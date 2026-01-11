---
title: PrefetchPageLinks
---

# PrefetchPageLinks

[MODES: framework]

## 概要

[リファレンスドキュメント ↗](https://api.reactrouter.com/v7/functions/react_router.PrefetchPageLinks.html)

別のページのモジュールとデータに対して [`<link rel=prefetch|modulepreload>`](https://developer.mozilla.org/en-US/docs/Web/API/HTMLLinkElement/rel) タグをレンダリングし、そのページへの即時ナビゲーションを可能にします。 [`<Link prefetch>`](./Link#prefetch) は内部でこれを使用しますが、他の理由でページをプリフェッチするためにレンダリングすることもできます。

たとえば、ユーザーが検索フィールドに入力するときに、検索結果をクリックする前にプリフェッチするために、これのいずれかをレンダリングできます。

```tsx
import { PrefetchPageLinks } from "react-router";

<PrefetchPageLinks page="/absolute/path" />
```

## シグネチャ

```tsx
function PrefetchPageLinks({ page, ...linkProps }: PageLinkDescriptor)
```

## Props

### page

プリフェッチするページの絶対パスです（例: `/absolute/path`）。

### linkProps

[`<link>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/link) タグにスプレッドされる追加の props (例: [`crossOrigin`](https://developer.mozilla.org/en-US/docs/Web/API/HTMLLinkElement/crossOrigin)、[`integrity`](https://developer.mozilla.org/en-US/docs/Web/API/HTMLLinkElement/integrity)、[`rel`](https://developer.mozilla.org/en-US/docs/Web/API/HTMLLinkElement/rel) など)。