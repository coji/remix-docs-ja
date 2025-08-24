---
title: useBeforeUnload
toc: false
---

# `useBeforeUnload`

このフックは、[`window.beforeunload`][window_before_unload] のヘルパーにすぎません。

ユーザーがまだ訪れていないページへのリンクをクリックすると、Remix はそのページのコード分割されたモジュールをロードします。ユーザーのセッション中にデプロイし、あなたまたはホストがサーバーから古いファイルを削除した場合（多くのホストがそうします😭）、Remix のそれらのモジュールへのリクエストは失敗します。Remix は、新しい URL でブラウザを自動的にリロードすることで回復します。これにより、最新バージョンのアプリケーションでサーバーから再開されるはずです。ほとんどの場合、これはうまくいき、ユーザーは何も起こったことに気づきません。

この状況では、自動ページリロードによって失われる可能性のあるページ上の重要なアプリケーションの状態を（ブラウザのローカルストレージのようなものに）保存する必要がある場合があります。

Remix を使用するかどうかにかかわらず、これは良い習慣です。ユーザーは URL を変更したり、誤ってブラウザウィンドウを閉じたりする可能性があります。

```tsx lines=[1,7-11]
import { useBeforeUnload } from "@remix-run/react";

function SomeForm() {
  const [state, setState] = React.useState(null);

  // 自動ページリロードの前に保存
  useBeforeUnload(
    React.useCallback(() => {
      localStorage.stuff = state;
    }, [state])
  );

  // 戻ってきたときに読み込む
  React.useEffect(() => {
    if (state === null && localStorage.stuff != null) {
      setState(localStorage.stuff);
    }
  }, [state]);

  return <>{/*... */}</>;
}
```

[window_before_unload]: https://developer.mozilla.org/en-US/docs/Web/API/Window/beforeunload_event
