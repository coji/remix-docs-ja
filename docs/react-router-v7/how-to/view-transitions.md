---
title: ビュートランジション
---

# ビュートランジション

[MODES: framework, data]

<br/>
<br/>

[View Transitions API][view-transitions-api] を使用して、React Router アプリケーションでのページ遷移間のスムーズなアニメーションを有効にします。この機能により、クライアントサイドのナビゲーション中にシームレスな視覚的トランジションを作成できます。

## 基本的なビュートランジション

### 1. ナビゲーションでビュートランジションを有効にする

ビュートランジションを有効にする最も簡単な方法は、`Link`、`NavLink`、または `Form` コンポーネントに `viewTransition` プロパティを追加することです。これにより、ナビゲーションの更新が `document.startViewTransition()` で自動的にラップされます。

```tsx
<Link to="/about" viewTransition>
  About
</Link>
```

追加の CSS なしで、これによりページ間の基本的なクロスフェードアニメーションが提供されます。

### 2. プログラムによるナビゲーションでビュートランジションを有効にする

`useNavigate` hook を使用してプログラムによるナビゲーションを行う場合、`viewTransition: true` オプションを渡すことでビュートランジションを有効にできます。

```tsx
import { useNavigate } from "react-router";

function NavigationButton() {
  const navigate = useNavigate();

  return (
    <button
      onClick={() =>
        navigate("/about", { viewTransition: true })
      }
    >
      About
    </button>
  );
}
```

これにより、Link コンポーネントで `viewTransition` プロパティを使用した場合と同じクロスフェードアニメーションが提供されます。

View Transitions API の使用に関する詳細については、Google Chrome チームの ["View Transition API を使用したスムーズなトランジション" ガイド][view-transitions-guide] を参照してください。

## 画像ギャラリーの例

ビュートランジションをトリガーして使用する方法を示す画像ギャラリーを作成しましょう。スムーズなアニメーションで詳細ビューに展開する画像のリストを作成します。

### 1. 画像ギャラリーのルートを作成する

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
            viewTransition // Enable view transitions for this link
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

### 2. トランジションスタイルを追加する

ルート間でスムーズにトランジションする必要がある要素のビュートランジション名とアニメーションを定義します。

```css filename=app.css
/* Layout styles for the image grid */
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

/* Assign transition names to elements during navigation */
.image-list a.transitioning img {
  view-transition-name: image-expand;
}

.image-list a.transitioning p {
  view-transition-name: image-title;
}
```

### 3. 画像詳細ルートを作成する

詳細ビューでは、シームレスなアニメーションを作成するために同じビュートランジション名を使用する必要があります。

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

### 4. 詳細ビューに一致するトランジションスタイルを追加する

```css filename=app.css
/* Match transition names from the list view */
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

## 高度な使用法

レンダープロパティまたは `useViewTransitionState` hook を使用して、ビュートランジションをより正確に制御できます。

### 1. レンダープロパティの使用

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

### 2. `useViewTransitionState` hook の使用

```tsx filename=routes/image-gallery.tsx
function NavImage(props: { src: string; idx: number }) {
  const href = `/image/${props.idx}`;
  // Hook provides transition state for specific route
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