---
title: useBeforeUnload
toc: false
---

# `useBeforeUnload`

このフックは、[`window.beforeunload`][window_before_unload] のラッパーです。

ユーザーがまだ訪問していないページへのリンクをクリックすると、Remix はそのページのコード分割モジュールをロードします。ユーザーセッションの途中にデプロイし、ホストまたは自分自身でサーバーから古いファイルを削除した場合（多くの人がそうします 😭）、Remix のこれらのモジュールに対するリクエストは失敗します。Remix は、新しい URL でブラウザを自動的にリロードすることで回復します。これにより、アプリケーションの最新バージョンでサーバーからやり直します。ほとんどの場合、これはうまく機能し、ユーザーは何も起こらなかったことに気付かずに済みます。

このような状況では、自動ページリロードによって失われる可能性のあるページ上の重要なアプリケーション状態を（ブラウザのローカルストレージなど）に保存する必要がある場合があります。

Remix であってもなくても、これは良い習慣です。ユーザーは URL を変更したり、誤ってブラウザウィンドウを閉じたりすることもできます。

```tsx lines=[1,7-11]
import { useBeforeUnload } from "@remix-run/react";

function SomeForm() {
  const [state, setState] = React.useState(null);

  // 自動ページリロード前に保存します
  useBeforeUnload(
    React.useCallback(() => {
      localStorage.stuff = state;
    }, [state])
  );

  // 彼らが戻ってきたときに読み込みます
  React.useEffect(() => {
    if (state === null && localStorage.stuff != null) {
      setState(localStorage.stuff);
    }
  }, [state]);

  return <>{/*... */}</>;
}
```

[window_before_unload]: https://developer.mozilla.org/en-US/docs/Web/API/Window/beforeunload_event


