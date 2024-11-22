---
title: URL値
---

# URL値

## ルートパラメータ

ルートパラメータは、動的なセグメントから解析された値です。

```tsx
<Route path="/concerts/:city" element={<City />} />
```

この場合、`:city` は動的なセグメントです。その都市の解析された値は、`useParams`から利用できます。

```tsx
import { useParams } from "react-router";

function City() {
  let { city } = useParams();
  let data = useFakeDataLibrary(`/api/v2/cities/${city}`);
  // ...
}
```

## URL検索パラメータ

検索パラメータは、URLの`?`の後の値です。それらは`useSearchParams`からアクセスできます。これは[`URLSearchParams`](https://developer.mozilla.org/en-US/docs/Web/API/URLSearchParams)のインスタンスを返します。

```tsx
function SearchResults() {
  let [searchParams] = useSearchParams();
  return (
    <div>
      <p>
        You searched for <i>{searchParams.get("q")}</i>
      </p>
      <FakeSearchResults />
    </div>
  );
}
```

## Locationオブジェクト

React Routerは、`useLocation`でアクセスできるいくつかの便利な情報を含むカスタム`location`オブジェクトを作成します。

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

