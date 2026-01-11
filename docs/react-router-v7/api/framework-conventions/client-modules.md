---
title: .client モジュール
---

# `.client` モジュール

[MODES: framework]

## 概要

ブラウザでモジュールの副作用を使用するファイルや依存関係がある場合があります。ファイル名に `*.client.ts` を使用するか、ファイルを `.client` ディレクトリ内にネストすることで、それらをサーバーバンドルから強制的に除外できます。

```ts filename=feature-check.client.ts
// this would break the server
export const supportsVibrationAPI =
  "vibrate" in window.navigator;
```

このモジュールからエクスポートされる値はすべてサーバー上では `undefined` になるため、それらを使用できるのは [`useEffect`][use_effect] やクリックハンドラーのようなユーザーイベントのみであることに注意してください。

```ts
import { supportsVibrationAPI } from "./feature-check.client.ts";

console.log(supportsVibrationAPI);
// server: undefined
// client: true | false
```

<docs-info>

クライアント/サーバーバンドルに含まれるものをより高度に制御する必要がある場合は、[`vite-env-only` プラグイン](https://github.com/pcattori/vite-env-only)を確認してください。

</docs-info>

## 使用パターン

### 個々のファイル

ファイル名に `.client` を追加することで、個々のファイルをクライアント専用としてマークします。

```txt
app/
├── utils.client.ts        👈 クライアント専用ファイル
├── feature-detection.client.ts
└── root.tsx
```

### クライアントディレクトリ

ディレクトリ名に `.client` を使用することで、ディレクトリ全体をクライアント専用としてマークします。

```txt
app/
├── .client/               👈 ディレクトリ全体がクライアント専用
│   ├── analytics.ts
│   ├── feature-detection.ts
│   └── browser-utils.ts
├── components/
└── root.tsx
```

## 例

### ブラウザの機能検出

```ts filename=app/utils/browser.client.ts
export const canUseDOM = typeof window !== "undefined";

export const hasWebGL = !!window.WebGLRenderingContext;

export const supportsVibrationAPI =
  "vibrate" in window.navigator;
```

### クライアント専用ライブラリ

```ts filename=app/analytics.client.ts
// これはサーバー上で動作しません
import { track } from "some-browser-only-analytics-lib";

export function trackEvent(eventName: string, data: any) {
  track(eventName, data);
}
```

### クライアントモジュールの使用

```tsx filename=app/routes/dashboard.tsx
import { useEffect } from "react";
import {
  canUseDOM,
  supportsLocalStorage,
  supportsVibrationAPI,
} from "../utils/browser.client.ts";
import { trackEvent } from "../analytics.client.ts";

export default function Dashboard() {
  useEffect(() => {
    // これらの値はサーバー上では undefined です
    if (canUseDOM && supportsVibrationAPI) {
      console.log("Device supports vibration");
    }

    // 安全な localStorage の使用
    const savedTheme =
      supportsLocalStorage.getItem("theme");
    if (savedTheme) {
      document.body.className = savedTheme;
    }

    trackEvent("dashboard_viewed", {
      timestamp: Date.now(),
    });
  }, []);

  return <div>Dashboard</div>;
}
```

[use_effect]: https://react.dev/reference/react/useEffect