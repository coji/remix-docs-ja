---
title: URLの値
---

# URLの値

## ルートパラメータ

ルートパラメータは、動的なセグメントから解析された値です。

```tsx
<Route path="/concerts/:city" element={<City />} />
```

この場合、`:city` が動的なセグメントです。その都市に対して解析された値は、`useParams` から利用できます。

```tsx
import { useParams } from "react-router";

function City() {
  let { city } = useParams();
  let data = useFakeDataLibrary(`/api/v2/cities/${city}`);
  // ...
}
```

## URL検索パラメータ

検索パラメータは、URL内の `?` の後の値です。これらは `useSearchParams` からアクセスでき、[`URLSearchParams`](https://developer.mozilla.org/en-US/docs/Web/API/URLSearchParams) のインスタンスを返します。

```tsx
function SearchResults() {
  let [searchParams] = useSearchParams();
  return (
    <div>
      <p>
        <i>{searchParams.get("q")}</i> で検索しました
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

