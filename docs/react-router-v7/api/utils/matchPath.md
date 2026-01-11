---
title: matchPath
---

# matchPath

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

URL パス名と照合するパターンです。これは文字列または [`PathPattern`](https://api.reactrouter.com/v7/interfaces/react_router.PathPattern.html) オブジェクトのいずれかです。文字列が提供された場合、`caseSensitive` が `false`、`end` が `true` に設定されたパターンとして扱われます。

### pathname

パターンと照合する URL パス名です。

## 戻り値

パターンがパス名にマッチした場合、パスのマッチオブジェクトを返します。マッチしない場合は `null` を返します。