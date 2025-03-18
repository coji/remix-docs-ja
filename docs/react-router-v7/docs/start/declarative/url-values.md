---
title: URLの値
---

# URLの値

## ルートパラメータ

ルートパラメータは、動的セグメントから解析された値です。

```tsx
<Route path="/concerts/:city" element={<City />} />
```

この場合、`:city` が動的セグメントです。その都市に対して解析された値は、`useParams` から利用できます。

```tsx
import { useParams } from "react-router";

function City() {
  let { city } = useParams();
  let data = useFakeDataLibrary(`/api/v2/cities/${city}`);
  // ...
}
```

## URL検索パラメータ

検索パラメータは、URLの `?` の後の値です。これらは `useSearchParams` からアクセスでき、[`URLSearchParams`](https://developer.mozilla.org/en-US/docs/Web/API/URLSearchParams) のインスタンスを返します。

```tsx
function SearchResults() {
  let [searchParams] = useSearchParams();
  return (
    <div>
      <p>
        検索ワードは <i>{searchParams.get("q")}</i> です
      </p>
      <FakeSearchResults />
    </div>
  );
}
```

## Locationオブジェクト

React Routerは、`useLocation` でアクセスできる便利な情報を持つカスタムの `location` オブジェクトを作成します。

```tsx
function useAnalytics() {
  let location = useLocation();
  useEffect(() => {
    sendFakeAnalytics(location.pathname);
  }, [location]);
}

function useScrollRestoration() {
  let location = useLocation();
  useEffect(() => {
    fakeRestoreScroll(location.key);
  }, [location]);
}
```
