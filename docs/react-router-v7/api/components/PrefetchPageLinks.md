---
title: PrefetchPageLinks
---

# PrefetchPageLinks

<!--
⚠️ ⚠️ IMPORTANT ⚠️ ⚠️ 

Thank you for helping improve our documentation!

This file is auto-generated from the JSDoc comments in the source
code, so please edit the JSDoc comments in the file below and this
file will be re-generated once those changes are merged.

https://github.com/remix-run/react-router/blob/main/packages/react-router/lib/dom/ssr/components.tsx
-->

[MODES: framework]

## Summary

[Reference Documentation ↗](https://api.reactrouter.com/v7/functions/react_router.PrefetchPageLinks.html)

別のページのモジュールとデータに対して [`<link rel=prefetch|modulepreload>`](https://developer.mozilla.org/en-US/docs/Web/API/HTMLLinkElement/rel) タグをレンダリングし、そのページへの即時ナビゲーションを可能にします。 [`<Link prefetch>`](./Link#prefetch) は内部でこれを使用しますが、他の理由でページをプリフェッチするためにレンダリングすることもできます。

たとえば、ユーザーが検索フィールドに入力するときに、検索結果をクリックする前にプリフェッチするために、これのいずれかをレンダリングできます。

```tsx
import { PrefetchPageLinks } from "react-router";

<PrefetchPageLinks page="/absolute/path" />
```

## Signature

```tsx
function PrefetchPageLinks({ page, ...linkProps }: PageLinkDescriptor)
```

## Props

### page

プリフェッチするページの絶対パス。例: `/absolute/path`。

### linkProps

[`<link>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/link) タグにスプレッドされる追加の props。例: [`crossOrigin`](https://developer.mozilla.org/en-US/docs/Web/API/HTMLLinkElement/crossOrigin)、[`integrity`](https://developer.mozilla.org/en-US/docs/Web/API/HTMLLinkElement/integrity)、[`rel`](https://developer.mozilla.org/en-US/docs/Web/API/HTMLLinkElement/rel) など。