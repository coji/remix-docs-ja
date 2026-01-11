---
title: React Transitions
unstable: true
---

# React Transitions

[MODES: framework, data, declarative]

<br/>
<br/>

<docs-warning>`unstable_useTransitions` prop は実験的なものであり、マイナー/パッチリリースで破壊的変更が加えられる可能性があります。注意して使用し、関連する変更についてはリリースノートに**非常に**注意してください。</docs-warning>

[React 18][react-18] では、「トランジション（transitions）」の概念が導入されました。これにより、緊急性の高い UI 更新とそうでない UI 更新を区別できるようになります。React Transitions と「コンカレントレンダリング（concurrent rendering）」の詳細については、React の公式ドキュメントを参照してください。

- [What is Concurrent React][concurrent]
- [Transitions][transitions]
- [`React.useTransition`][use-transition]
- [`React.startTransition`][start-transition]

[React 19][react-19] は、[Actions][actions] と Transitions で非同期関数を使用するサポートを導入することで、非同期/コンカレントな状況を強化します。非同期 Transitions のサポートにより、Transition 中に state の更新を表示してユーザーに即座のフィードバックを示すことを可能にする新しい[`React.useOptimistic`][use-optimistic-blog] [hook][use-optimistic]も導入されました。

## Transitions in React Router

React に Transitions が導入されたことで、React Router がナビゲーションと router state を管理する方法のストーリーは少し複雑になります。これらは強力な API ですが、いくつかのニュアンスと複雑さも伴います。私たちは React Router が新しい React の機能とシームレスに連携することを目指していますが、場合によっては、新しい React のやり方と、React Router アプリで既に利用しているパターン（例：保留中の state、optimistic UI）との間にいくらかの緊張が生じる可能性があります。

スムーズな採用を確実にするため、Transitions に関連する変更はオプトインの `unstable_useTransitions` フラグの背後に導入されており、破壊的変更なしにアップグレードできるようになっています。

### 現在の動作

私たちは、`future.v7_startTransition` フラグを介して、React Router [6.13.0][rr-6-13-0] で React Router を Suspense により親和的にするために、まず `React.startTransition` を活用しました。v7 では、それがデフォルトの動作となり、すべての router state の更新は現在 `React.startTransition` でラップされています。

このデフォルトの動作には、`unstable_useTransitions` が解決するために設計された2つの潜在的な問題があります。

- `startTransition` で更新をラップしたくない正当なユースケースがいくつかあります。
  - 1つの具体的な問題は、`React.useSyncExternalStore` の更新が Transitions になり得ないことです（[^1][uses-transition-issue]、[^2][uses-transition-tweet]）。`useSyncExternalStore` は同期更新を強制するため、本来フォールバックの表示を避けるはずの更新トランジションでフォールバックが表示されてしまう可能性があります。
  - React Router には、state の更新に [`React.flushSync`][flush-sync] を使用するための `flushSync` オプションがナビゲーションにありますが、それが常に適切な解決策とは限りません。
- React 19 は、新しい `startTransition(() => Promise))` API と、Transitions 中に更新を表示するための新しい `useOptimistic` hook を追加しました。
  - React Router にいくつかの更新がないと、`startTransition(() => navigate(path))` は期待通りに動作しません。これは、内部で `useOptimistic` を使用していないため、ナビゲーション中に router state の更新が表示されず、`useNavigation` のような hook が機能しなくなるためです。

上記の両方の問題に対する解決策を提供するために、router component に新しい `unstable_useTransitions` prop を導入します。これにより、router state の更新に `startTransition` を使用しないようにオプトアウト（最初の問題を解決）するか、`startTransition` + `useOptimistic` のより強化された使用法にオプトイン（2番目の問題を解決）することができます。現在の動作は新しい React 19 API とは少し不完全であるため、React Router v8 ではオプトインの動作をデフォルトにする予定ですが、`useSyncExternalStore` のようなユースケースのためにオプトアウトフラグは維持する可能性が高いです。

### `unstable_useTransitions=false` によるオプトアウト

`useSyncExternalStore` の使用（またはその他の理由）により、アプリケーションが「Transition に対応していない」場合、prop を介してオプトアウトできます。

```tsx
// Framework Mode (entry.client.tsx)
<HydratedRouter unstable_useTransitions={false} />

// Data Mode
<RouterProvider unstable_useTransitions={false} />

// Declarative Mode
<BrowserRouter unstable_useTransitions={false} />
```

これにより、router は内部の state 更新を `startTransition` でラップしなくなります。

### `unstable_useTransitions=true` によるオプトイン

<docs-info>Framework モードまたは Data モードでこの機能にオプトインするには、[`React.useOptimistic`][use-optimistic] へのアクセスが必要なため、React 19 を使用している必要があります。</docs-info>

コンカレントモードと Transitions に依存するすべての新しい React 19 の機能とアプリケーションをうまく連携させたい場合は、新しい prop を介してオプトインできます。

```tsx
// Framework Mode (entry.client.tsx)
<HydratedRouter unstable_useTransitions />

// Data Mode
<RouterProvider unstable_useTransitions />

// Declarative Mode
<BrowserRouter unstable_useTransitions />
```

このフラグが有効な場合：

- すべての内部 state の更新は `React.startTransition` でラップされます（フラグなしの現在の動作）。
- すべての `<Link>`/`<Form>` ナビゲーションは `React.startTransition` でラップされ、`useNavigate`/`useSubmit` が返す Promise を使用して、Transition がナビゲーションの期間中続くようにします。
  - `useNavigate`/`useSubmit` は自動的に `React.startTransition` でラップしないため、これらを直接使用することで Transition が有効なナビゲーションからオプトアウトできます。
- Framework/Data モードでは、ナビゲーション中の router state 更新の一部が `useOptimistic` を介して UI に表示されます。
  - _進行中の_ナビゲーションおよびすべての fetcher 情報に関連する state が表示されます。
    - `useNavigation()` の `state.navigation`
    - `useRevalidator()` の `state.revalidation`
    - `useActionData()` の `state.actionData`
    - `useFetcher()` および `useFetchers()` の `state.fetchers`
  - _現在の_ location に関連する state は表示されません。
    - `useLocation` の `state.location`
    - `useMatches()` の `state.matches`
    - `useLoaderData()` の `state.loaderData`
    - `useRouteError()` の `state.errors`
    - など

このフラグを有効にすることで、アプリケーションの他の進行中の Transition が有効な側面とうまく連携する、完全に Transition が有効なナビゲーションが可能になります。

非同期 Transition で自動的にラップされる API は `<Link>` と `<Form>` だけです。それ以外のすべてについては、操作を自分で `startTransition` でラップする必要があります。

```tsx
// 自動的に Transition が有効
<Link to="/path" />
<Form method="post" action="/path" />

// 手動で Transition が有効
startTransition(() => navigate("/path"));
startTransition(() => submit(data, { method: 'post', action: "/path" }));
startTransition(() => fetcher.load("/path"));
startTransition(() => fetcher.submit(data, { method: "post", action: "/path" }));

// Transition が無効
navigate("/path");
submit(data, { method: 'post', action: "/path" });
fetcher.load("/path");
fetcher.submit(data, { method: "post", action: "/path" });
```

**重要:** `startTransition` の内部では、`navigate` Promise を常に `return` または `await` する必要があります。そうすることで、Transition がナビゲーションの全期間を網羅します。Promise を `return` または `await` するのを忘れると、Transition が途中で終了し、期待通りに動作しません。

```tsx
// ✅ Promise を return
startTransition(() => navigate("/path"));
startTransition(() => {
  setOptimistic(something);
  return navigate("/path"));
});

// ✅ Promise を await
startTransition(async () => {
  setOptimistic(something);
  await navigate("/path"));
});

// ❌ Promise を return しない
startTransition(() => {
  setOptimistic(something);
  navigate("/path"));
});

// ❌ Promise を await しない
startTransition(async () => {
  setOptimistic(something);
  navigate("/path"));
});
```

#### `popstate` ナビゲーション

現在、optimistic state と `popstate` にバグがあります。バックナビゲーション中に現在の route を読み取る必要があり、それが同期的に完了できない場合（例：キャッシュされていないデータで Suspends する場合）、バックナビゲーションする前に optimistic state を設定するか、タイマーまたはマイクロタスクで optimistic update を遅延させることができます。

[react-18]: https://react.dev/blog/2022/03/29/react-v18
[concurrent]: https://react.dev/blog/2022/03/29/react-v18#what-is-concurrent-react
[transitions]: https://react.dev/blog/2022/03/29/react-v18#new-feature-transitions
[use-transition]: https://react.dev/reference/react/useTransition#reference
[start-transition]: https://react.dev/reference/react/startTransition
[react-19]: https://react.dev/blog/2024/12/05/react-19
[actions]: https://react.dev/blog/2024/12/05/react-19#actions
[use-optimistic-blog]: https://react.dev/blog/2024/12/05/react-19#new-hook-optimistic-updates
[use-optimistic]: https://react.dev/reference/react/useOptimistic
[flush-sync]: https://react.dev/reference/react-dom/flushSync
[rr-6-13-0]: https://github.com/remix-run/react-router/blob/main/CHANGELOG.md#v6130
[uses-transition-issue]: https://github.com/facebook/react/issues/26382
[uses-transition-tweet]: https://x.com/rickhanlonii/status/1683636856808775682