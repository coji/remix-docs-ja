---
title: ビュー遷移
---

# ビュー遷移

[View Transitions API][view-transitions-api] を使用して、React Router アプリケーションでのページ遷移間のスムーズなアニメーションを有効にします。この機能により、クライアント側のナビゲーション中にシームレスな視覚的な遷移を作成できます。

## 基本的なビュー遷移

### 1. ナビゲーションでのビュー遷移の有効化

ビュー遷移を有効にする最も簡単な方法は、`Link`、`NavLink`、または`Form`コンポーネントに`viewTransition`プロップを追加することです。これにより、ナビゲーション更新が`document.startViewTransition()`で自動的にラップされます。

```tsx
<Link to="/about" viewTransition>
  About
</Link>
```

追加のCSSがなくても、これによりページ間の基本的なクロスフェードアニメーションが提供されます。

View Transitions API の使用方法の詳細については、Google Chrome チームの[「View Transition API を使用したスムーズな遷移」ガイド][view-transitions-guide]を参照してください。

## 画像ギャラリーの例

ビュー遷移のトリガーと使用方法を示す画像ギャラリーを作成してみましょう。詳細ビューにスムーズなアニメーションで展開される画像のリストを作成します。

### 2. 画像ギャラリールートの作成

```tsx filename=routes/image-gallery.tsx
import { NavLink } from "react-router";

export const images = [
  "https://remix.run/blog-images/headers/the-future-is-now.jpg",
  "https://remix.run/blog-images/headers/waterfall.jpg",
  "https://remix.run/blog-images/headers/webpack.png",
  // ... more images ...
];

export default function ImageGalleryRoute() {
  return (
    <div className="image-list">
      <h1>Image List</h1>
      <div>
        {images.map((src, idx) => (
          <NavLink
            key={src}
            to={`/image/${idx}`}
            viewTransition // このリンクでビュー遷移を有効にする
          >
            <p>Image Number {idx}</p>
            <img
              className="max-w-full contain-layout"
              src={src}
            />
          </NavLink>
        ))}
      </div>
    </div>
  );
}
```

### 3. 遷移スタイルの追加

ルート間でスムーズに遷移する必要がある要素のビュー遷移名とアニメーションを定義します。

```css filename=app.css
/* 画像グリッドのレイアウトスタイル */
.image-list > div {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  column-gap: 10px;
}

.image-list h1 {
  font-size: 2rem;
  font-weight: 600;
}

.image-list img {
  max-width: 100%;
  contain: layout;
}

.image-list p {
  width: fit-content;
}

/* ナビゲーション中の要素に遷移名を割り当てる */
.image-list a.transitioning img {
  view-transition-name: image-expand;
}

.image-list a.transitioning p {
  view-transition-name: image-title;
}
```

### 4. 画像詳細ルートの作成

詳細ビューでは、シームレスなアニメーションを作成するために、同じビュー遷移名を使用する必要があります。

```tsx filename=routes/image-details.tsx
import { Link } from "react-router";
import { images } from "./home";
import type { Route } from "./+types/image-details";

export default function ImageDetailsRoute({
  params,
}: Route.ComponentProps) {
  return (
    <div className="image-detail">
      <Link to="/" viewTransition>
        Back
      </Link>
      <h1>Image Number {params.id}</h1>
      <img src={images[Number(params.id)]} />
    </div>
  );
}
```

### 5. 詳細ビューに対する一致する遷移スタイルの追加

```css filename=app.css
/* リストビューからの遷移名と一致させる */
.image-detail h1 {
  font-size: 2rem;
  font-weight: 600;
  width: fit-content;
  view-transition-name: image-title;
}

.image-detail img {
  max-width: 100%;
  contain: layout;
  view-transition-name: image-expand;
}
```

## 高度な使用方法

レンダープロップまたは`useViewTransitionState`フックを使用して、ビュー遷移をより正確に制御できます。

### 1. レンダープロップの使用

```tsx filename=routes/image-gallery.tsx
<NavLink to={`/image/${idx}`} viewTransition>
  {({ isTransitioning }) => (
    <>
      <p
        style={{
          viewTransitionName: isTransitioning
            ? "image-title"
            : "none",
        }}
      >
        Image Number {idx}
      </p>
      <img
        src={src}
        style={{
          viewTransitionName: isTransitioning
            ? "image-expand"
            : "none",
        }}
      />
    </>
  )}
</NavLink>
```

### 2. `useViewTransitionState`フックの使用

```tsx filename=routes/image-gallery.tsx
function NavImage(props: { src: string; idx: number }) {
  const href = `/image/${props.idx}`;
  // フックは特定のルートの遷移状態を提供します
  const isTransitioning = useViewTransitionState(href);

  return (
    <Link to={href} viewTransition>
      <p
        style={{
          viewTransitionName: isTransitioning
            ? "image-title"
            : "none",
        }}
      >
        Image Number {props.idx}
      </p>
      <img
        src={props.src}
        style={{
          viewTransitionName: isTransitioning
            ? "image-expand"
            : "none",
        }}
      />
    </Link>
  );
}
```

[view-transitions-api]: https://developer.mozilla.org/en-US/docs/Web/API/ViewTransition
[view-transitions-guide]: https://developer.chrome.com/docs/web-platform/view-transitions


