---
title: matchPath
---

# matchPath

<!--
⚠️ ⚠️ IMPORTANT ⚠️ ⚠️ 

Thank you for helping improve our documentation!

This file is auto-generated from the JSDoc comments in the source
code, so please edit the JSDoc comments in the file below and this
file will be re-generated once those changes are merged.

https://github.com/remix-run/react-router/blob/main/packages/react-router/lib/router/utils.ts
-->

[MODES: framework, data, declarative]

## 概要

[リファレンスドキュメント ↗](https://api.reactrouter.com/v7/functions/react_router.matchPath.html)

URL パス名に対してパターンマッチングを実行し、マッチに関する情報を返します。

## シグネチャ

```tsx
function matchPath<ParamKey extends ParamParseKey<Path>, Path extends string>(
  pattern: PathPattern<Path> | Path,
  pathname: string,
): PathMatch<ParamKey> | null
```

## パラメータ

### pattern

URLパス名とマッチさせるパターンです。これは文字列または[`PathPattern`](https://api.reactrouter.com/v7/interfaces/react_router.PathPattern.html)オブジェクトのいずれかです。文字列が指定された場合、`caseSensitive`が`false`、`end`が`true`に設定されたパターンとして扱われます。

### pathname

パターンとマッチさせるURLパス名です。

## 戻り値

パターンがパス名とマッチした場合、パスのマッチオブジェクトを返します。マッチしない場合は`null`を返します。